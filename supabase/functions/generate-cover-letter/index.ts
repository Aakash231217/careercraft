import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      recipientName, 
      companyName, 
      position, 
      yourName, 
      yourEmail, 
      yourPhone, 
      yourAddress,
      jobDescription, 
      tone, 
      experience, 
      motivation 
    } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build dynamic contact information
    let contactInfo = yourName ? `${yourName}\n` : '';
    if (yourAddress) contactInfo += `${yourAddress}\n`;
    if (yourEmail) contactInfo += `${yourEmail}\n`;
    if (yourPhone) contactInfo += `${yourPhone}\n`;
    
    // Build available information for the prompt
    let availableInfo = `APPLICANT: ${yourName}\n`;
    availableInfo += `COMPANY: ${companyName}\n`;
    availableInfo += `POSITION: ${position}\n`;
    availableInfo += `TONE: ${tone}\n`;
    
    if (yourAddress) availableInfo += `APPLICANT ADDRESS: ${yourAddress}\n`;
    if (yourEmail) availableInfo += `APPLICANT EMAIL: ${yourEmail}\n`;
    if (yourPhone) availableInfo += `APPLICANT PHONE: ${yourPhone}\n`;
    if (jobDescription) availableInfo += `JOB DESCRIPTION: ${jobDescription}\n`;
    if (experience) availableInfo += `APPLICANT'S EXPERIENCE: ${experience}\n`;
    if (motivation) availableInfo += `MOTIVATION: ${motivation}\n`;

    // Create a comprehensive prompt for cover letter generation
    const prompt = `Generate a professional cover letter with the following details:

${availableInfo}

IMPORTANT INSTRUCTIONS:
1. DO NOT use placeholder brackets like [Your Address], [Date], [Company Address], etc.
2. DO NOT include any information that was not provided above
3. Only use the contact information that is actually available
4. Start directly with the applicant's name if provided, otherwise start with the salutation
5. Use a clean, professional format without placeholder text
6. Address the letter to "${recipientName || 'Hiring Manager'}"
7. Use a ${tone} tone throughout

Please generate a compelling, personalized cover letter that:
- Opens with a strong hook related to the specific company and position
- Highlights relevant experience and achievements (only if provided)
- Shows genuine interest in the company and role
- Uses specific examples of accomplishments (only if provided)
- Ends with a confident call to action
- Is professional yet engaging
- Is approximately 3-4 paragraphs long
- Contains NO placeholder text or brackets

Format the letter as a clean business letter using only the information provided.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional career counselor and expert cover letter writer. Generate personalized, compelling cover letters that help candidates stand out while maintaining professionalism.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('OpenAI API error:', data)
      throw new Error(data.error?.message || 'Failed to generate cover letter')
    }

    const generatedLetter = data.choices[0]?.message?.content
    if (!generatedLetter) {
      throw new Error('No cover letter content generated')
    }

    return new Response(
      JSON.stringify({ coverLetter: generatedLetter }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-cover-letter function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
