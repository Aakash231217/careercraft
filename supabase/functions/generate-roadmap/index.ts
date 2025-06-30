import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Function called with method:', req.method);

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { 
      targetRole, 
      currentRole, 
      experience, 
      industry, 
      timeline, 
      skills,
      interests,
      preferredLearningStyle,
      budget
    } = requestBody;

    console.log('Parsed user profile:', { targetRole, industry, timeline });

    // Validate required fields
    if (!targetRole || !industry) {
      return new Response(
        JSON.stringify({ error: 'Target role and industry are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('OpenAI API key found, proceeding with generation...');

    // Construct comprehensive prompt for roadmap generation
    const roadmapPrompt = `Create a comprehensive career development roadmap for the following professional profile:

CURRENT SITUATION:
- Current Role: ${currentRole || 'Entry Level'}
- Years of Experience: ${experience || '0-1 years'}
- Target Role: ${targetRole}
- Industry: ${industry}
- Timeline: ${timeline || '1-2 years'}
- Current Skills: ${skills || 'None specified'}
- Interests: ${interests || 'General career growth'}
- Learning Style: ${preferredLearningStyle || 'Mixed'}
- Budget: ${budget || 'Free/Low-cost resources preferred'}

REQUIREMENTS:
Generate a detailed career roadmap with:

1. **CAREER GOAL SUMMARY**: Brief overview of the career transition/advancement

2. **MILESTONE ROADMAP**: Create 8-12 specific, actionable milestones organized by these categories:
   - Education & Certification
   - Skill Development  
   - Experience & Projects
   - Networking
   - Personal Branding
   - Career Milestone

For each milestone, provide:
- Title (concise, actionable)
- Description (2-3 sentences explaining what to do and why)
- Category (one of the 6 above)
- Estimated Duration (in weeks/months)
- Priority Level (High/Medium/Low)
- Required Skills/Prerequisites
- Success Metrics
- Resources/Tips

3. **TIMELINE STRUCTURE**: Arrange milestones logically with:
   - Quick wins (1-3 months)
   - Foundation building (3-9 months)  
   - Advanced development (9-18 months)
   - Career transition/advancement (12-24 months)

4. **SKILL DEVELOPMENT FOCUS**: Identify the top 5-7 critical skills to develop

5. **NETWORKING STRATEGY**: Specific networking activities and target connections

6. **PORTFOLIO/PROJECT RECOMMENDATIONS**: 3-4 specific project ideas to showcase skills

Format your response as JSON with this structure:
{
  "careerGoal": {
    "title": "Target role title",
    "description": "Brief career goal description",
    "timeline": "Expected timeline",
    "industry": "Industry/field"
  },
  "milestones": [
    {
      "title": "Milestone title",
      "description": "Detailed description",
      "category": "Category name",
      "estimatedDuration": "Duration in weeks/months",
      "priority": "High/Medium/Low",
      "skills": ["skill1", "skill2"],
      "successMetrics": "How to measure success",
      "resources": "Recommended resources/tips",
      "timeframe": "1-3 months"
    }
  ],
  "skillFocus": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "networkingStrategy": "Specific networking recommendations",
  "projectRecommendations": ["project1", "project2", "project3"]
}

Make this roadmap:
- Personalized to the specific career transition
- Realistic and achievable within the timeline
- Include both technical and soft skills
- Consider budget constraints
- Provide actionable next steps
- Include industry-specific advice`

    console.log('Making request to OpenAI API...');

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
            content: 'You are an expert career counselor and professional development strategist with 15+ years of experience helping professionals transition careers and advance in their fields. You create detailed, actionable career roadmaps based on individual circumstances and goals. CRITICAL: You must respond with ONLY valid JSON format - no markdown, no explanations, no additional text, just pure JSON.'
          },
          {
            role: 'user',
            content: roadmapPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('OpenAI API error:', data)
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Failed to generate roadmap' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const content = data.choices[0]?.message?.content
    if (!content) {
      console.error('No content received from OpenAI');
      return new Response(
        JSON.stringify({ error: 'No roadmap generated' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Parse the JSON response - handle potential markdown formatting
    let roadmapData;
    try {
      // Try to parse directly first
      roadmapData = JSON.parse(content);
      console.log('Successfully parsed roadmap data directly');
    } catch (parseError) {
      console.log('Direct parsing failed, trying to extract JSON from response');
      
      // Try to extract JSON from response that might have markdown or extra text
      let jsonContent = content;
      
      // Remove markdown code blocks if present
      jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          roadmapData = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted and parsed JSON from response');
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', jsonMatch[0]);
          
          // Last resort: create a basic roadmap structure
          roadmapData = {
            careerGoal: {
              title: targetRole,
              description: `Career development plan for ${targetRole} in ${industry}`,
              timeline: timeline || '1-2 years',
              industry: industry
            },
            milestones: [
              {
                title: 'Assess Current Skills',
                description: 'Evaluate your current skillset and identify gaps for your target role.',
                category: 'Skill Development',
                estimatedDuration: '1-2 weeks',
                priority: 'High',
                skills: ['Self-assessment', 'Goal setting'],
                successMetrics: 'Complete skills inventory and gap analysis',
                resources: 'Online skill assessment tools, career counseling',
                timeframe: '1-3 months'
              },
              {
                title: 'Create Learning Plan',
                description: 'Develop a structured plan to acquire the necessary skills for your target role.',
                category: 'Education & Certification',
                estimatedDuration: '2-4 weeks',
                priority: 'High',
                skills: ['Planning', 'Research'],
                successMetrics: 'Detailed learning roadmap with timelines',
                resources: 'Industry reports, job descriptions, online courses',
                timeframe: '1-3 months'
              }
            ],
            skillFocus: ['Technical skills', 'Communication', 'Leadership', 'Industry knowledge'],
            networkingStrategy: 'Connect with professionals in your target industry through LinkedIn and industry events.',
            projectRecommendations: ['Build a portfolio project', 'Contribute to open source', 'Start a blog']
          };
          console.log('Created fallback roadmap structure');
        }
      } else {
        console.error('No JSON structure found in AI response:', content.substring(0, 500));
        return new Response(
          JSON.stringify({ error: 'AI response did not contain valid roadmap data' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    console.log('Generated roadmap for:', targetRole);

    return new Response(
      JSON.stringify({ 
        ...roadmapData,
        generatedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-roadmap function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred while generating the roadmap',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
