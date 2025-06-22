// API endpoint for generating personalized emails using OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { template, contact, userProfile } = req.body;

    const prompt = `You are an expert at writing professional cold outreach emails for job seekers. 

Generate a personalized, professional cold email based on the following information:

TEMPLATE:
Subject: ${template.subject}
Body: ${template.body}

CONTACT DETAILS:
- Name: ${contact.name}
- Company: ${contact.company}
- Position: ${contact.position}
- Email: ${contact.email}

YOUR PROFILE:
- Name: ${userProfile.name}
- Experience: ${userProfile.experience}
- Skills: ${userProfile.skills}
- Target Role: ${userProfile.targetRole}

INSTRUCTIONS:
1. Personalize the email specifically for ${contact.name} at ${contact.company}
2. Make it sound natural and human-written, not templated
3. Keep it professional but warm and engaging
4. Highlight relevant skills and experience
5. Include a clear but soft call-to-action
6. Keep it concise (under 200 words)
7. Research-based personalization when possible

Return ONLY a valid JSON object with "subject" and "body" fields. No additional text or formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional email writer who creates personalized outreach emails for job seekers. Always respond with valid JSON containing 'subject' and 'body' fields."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    
    try {
      const generatedEmail = JSON.parse(response);
      
      // Validate the response has required fields
      if (!generatedEmail.subject || !generatedEmail.body) {
        throw new Error('Invalid response format');
      }

      res.status(200).json(generatedEmail);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      
      // Fallback to template replacement
      const fallbackEmail = {
        subject: template.subject
          .replace(/{company}/g, contact.company)
          .replace(/{role}/g, userProfile.targetRole)
          .replace(/{name}/g, contact.name)
          .replace(/{yourName}/g, userProfile.name),
        body: template.body
          .replace(/{name}/g, contact.name)
          .replace(/{company}/g, contact.company)
          .replace(/{position}/g, contact.position)
          .replace(/{yourName}/g, userProfile.name)
          .replace(/{experience}/g, userProfile.experience)
          .replace(/{skills}/g, userProfile.skills)
          .replace(/{targetRole}/g, userProfile.targetRole)
      };
      
      res.status(200).json(fallbackEmail);
    }
  } catch (error) {
    console.error('Email generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate email',
      details: error.message 
    });
  }
}
