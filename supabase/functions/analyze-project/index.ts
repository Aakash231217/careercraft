
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
    
    const { projectUrl, projectDescription } = await req.json();
    console.log('Request received:', { projectUrl, projectDescription });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!projectUrl) {
      throw new Error('Project URL is required');
    }

    // First, scrape the project content
    console.log('Scraping project content...');
    let scrapedContent = '';
    let isGitHub = false;
    
    try {
      // Check if it's a GitHub URL and adjust scraping strategy
      if (projectUrl.includes('github.com')) {
        isGitHub = true;
        // For GitHub, try to get the README or repository info
        const readmeUrl = projectUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/README.md';
        try {
          const readmeResponse = await fetch(readmeUrl);
          if (readmeResponse.ok) {
            scrapedContent = await readmeResponse.text();
          }
        } catch {
          // Fallback to main page
          const scrapeResponse = await fetch(projectUrl);
          if (scrapeResponse.ok) {
            scrapedContent = await scrapeResponse.text();
          }
        }
      } else {
        // For live websites
        const scrapeResponse = await fetch(projectUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (scrapeResponse.ok) {
          const htmlContent = await scrapeResponse.text();
          // Extract text content and limit size
          scrapedContent = htmlContent
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<style[^>]*>.*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 8000); // Increased limit for better analysis
        }
      }
    } catch (scrapeError) {
      console.log('Could not scrape content:', scrapeError);
      scrapedContent = 'Content could not be scraped automatically.';
    }

    const prompt = `You are a senior technical interviewer and hiring manager reviewing a software project for potential employment. Analyze this project THOROUGHLY and provide honest, realistic feedback with VARIED scores based on actual content analysis.

Project Details:
- URL: ${projectUrl}
- Type: ${isGitHub ? 'Repository/Code' : 'Live Website/Portfolio'}
- Description: ${projectDescription || 'Not provided'}
- Scraped Content: ${scrapedContent}

CRITICAL INSTRUCTIONS:
1. SCORES MUST BE REALISTIC AND VARIED - DO NOT default to 75 or any standard number
2. Base scores on ACTUAL analysis of the visible content, technology stack, and presentation
3. Consider the project type (portfolio vs demo vs full application)
4. Be honest about weaknesses - most projects have room for improvement
5. Provide SPECIFIC, ACTIONABLE feedback based on what you can observe

Scoring Guidelines:
- 90-100: Exceptional, production-ready, impressive projects
- 80-89: Very good projects with minor areas for improvement  
- 70-79: Good projects with some notable areas for improvement
- 60-69: Average projects with several areas needing work
- 50-59: Below average projects with significant issues
- Below 50: Poor projects with major problems

Analysis Areas:
- TECHNICAL QUALITY: Code organization, best practices, technology choices, architecture
- USER EXPERIENCE: Design, usability, responsiveness, accessibility, user flow
- MARKETABILITY: Business value, uniqueness, problem-solving, target audience appeal
- DOCUMENTATION: README quality, code comments, setup instructions, project explanation

Provide response in this EXACT JSON format:

{
  "score": [realistic number 0-100 based on actual analysis],
  "impression": "[2-3 sentences describing genuine first impression a hiring manager would have]",
  "strengths": ["[specific strength 1]", "[specific strength 2]", "[specific strength 3]"],
  "improvements": ["[specific improvement 1]", "[specific improvement 2]", "[specific improvement 3]"],
  "marketability": [0-100 based on business value and uniqueness],
  "technicalQuality": [0-100 based on code/architecture visible],
  "userExperience": [0-100 based on design and usability],
  "documentation": [0-100 based on README and explanations],
  "overall": "[3-4 sentences providing detailed assessment covering technical skills, presentation, and career readiness]"
}

REMEMBER: Scores should reflect REAL analysis, not placeholder values. If you see a basic portfolio with 3 projects, don't score it 85. If you see an innovative full-stack app with great UX, don't underscore it at 65.`;

    console.log('Making OpenAI API call for project analysis...');
    
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
            content: 'You are a senior technical interviewer with 10+ years of experience hiring developers. You provide honest, detailed feedback with realistic scoring based on actual project analysis. You never use placeholder or default scores.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const analysisText = data.choices[0].message.content;
    console.log('Raw analysis text:', analysisText);
    
    // Clean up the response text to ensure it's valid JSON
    const cleanedText = analysisText.trim()
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
    
    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Cleaned text:', cleanedText);
      
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysisData = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Second parse attempt failed:', secondParseError);
          throw new Error('Failed to parse analysis data as JSON');
        }
      } else {
        throw new Error('No valid JSON found in response');
      }
    }

    console.log('Parsed analysis data:', analysisData);

    // Validate the response structure and ensure realistic scoring
    const requiredFields = ['score', 'impression', 'strengths', 'improvements', 'marketability', 'technicalQuality', 'userExperience', 'documentation', 'overall'];
    for (const field of requiredFields) {
      if (!(field in analysisData)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure scores are numbers and within valid range
    const scoreFields = ['score', 'marketability', 'technicalQuality', 'userExperience', 'documentation'];
    for (const field of scoreFields) {
      if (typeof analysisData[field] !== 'number' || analysisData[field] < 0 || analysisData[field] > 100) {
        throw new Error(`Invalid score for field: ${field}`);
      }
    }

    // Ensure arrays have content
    if (!Array.isArray(analysisData.strengths) || analysisData.strengths.length === 0) {
      throw new Error('Strengths must be a non-empty array');
    }
    if (!Array.isArray(analysisData.improvements) || analysisData.improvements.length === 0) {
      throw new Error('Improvements must be a non-empty array');
    }

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-project function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze project',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
