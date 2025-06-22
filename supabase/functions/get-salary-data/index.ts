
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('API Key available:', !!openAIApiKey);
    
    const { position, country, experience } = await req.json();
    console.log('Request received:', { position, country, experience });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Provide accurate 2024 salary data for a ${position} position in ${country} with ${experience || 'mid-level'} experience. 
    
    Requirements:
    - Return ONLY a JSON object with this exact structure
    - Use the correct currency for the country
    - Provide realistic salary ranges based on current market data and experience level
    - Experience level should significantly impact the salary ranges
    - For India, express amounts in INR and include LPA (Lakhs Per Annum) format
    - Include 5-7 specific negotiation tips for this role, location, and experience level
    - Consider experience level when providing tips (entry level vs senior vs executive)
    
    Experience Level Impact:
    - Entry Level (0-1 years): Lower end of market range
    - Junior (1-3 years): Below market average
    - Mid Level (3-5 years): Market average
    - Senior (5-8 years): Above market average
    - Lead/Principal (8-12 years): High end of market range
    - Executive/Director (12+ years): Top tier compensation
    
    JSON structure:
    {
      "min": number,
      "max": number, 
      "avg": number,
      "currency": "string",
      "symbol": "string",
      "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
    }
    
    Examples:
    - For India: currency should be "INR", symbol should be "₹"
    - For USA: currency should be "USD", symbol should be "$"
    - For UK: currency should be "GBP", symbol should be "£"
    - For Germany: currency should be "EUR", symbol should be "€"
    
    Do not include any text outside the JSON object.`;

    console.log('Making OpenAI API call...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a salary research expert with access to current market data. Always respond with valid JSON only. Consider experience levels carefully when providing salary ranges.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response data:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const salaryDataText = data.choices[0].message.content;
    console.log('Raw salary data text:', salaryDataText);
    
    // Clean up the response text to ensure it's valid JSON
    const cleanedText = salaryDataText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    // Parse the JSON response
    let salaryData;
    try {
      salaryData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Cleaned text:', cleanedText);
      throw new Error('Failed to parse salary data as JSON');
    }

    console.log('Parsed salary data:', salaryData);

    // Validate the response structure
    if (!salaryData.min || !salaryData.max || !salaryData.avg || !salaryData.currency || !salaryData.symbol) {
      throw new Error('Invalid salary data structure received');
    }

    return new Response(JSON.stringify(salaryData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-salary-data function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch salary data',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
