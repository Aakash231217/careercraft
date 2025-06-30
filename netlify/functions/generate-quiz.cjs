// Import OpenAI for Netlify Functions
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

exports.handler = async (event, context) => {
  console.log('Simple test function called');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Environment variables check:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasViteOpenAIKey: !!process.env.VITE_OPENAI_API_KEY,
    nodeVersion: process.version
  });
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('Failed to parse request body:', event.body);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    const { topic, numQuestions, batch = 1, totalQuestions = numQuestions } = requestBody;

    if (!topic || !numQuestions) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Topic and number of questions are required' })
      };
    }

    // For progressive loading, generate max 10 questions per batch to avoid timeout
    const limitedQuestions = Math.min(numQuestions, 10);
    console.log('Generating quiz batch', batch, 'for topic:', topic, 'with', limitedQuestions, 'questions (limited from', numQuestions, ') - Total target:', totalQuestions);

    // Calculate starting ID based on batch number
    const startingId = (batch - 1) * 10 + 1;
    
    const prompt = `Generate exactly ${limitedQuestions} multiple choice questions about "${topic}".
This is batch ${batch} of a larger quiz (questions ${startingId}-${startingId + limitedQuestions - 1}).

RETURN ONLY VALID JSON - NO OTHER TEXT OR FORMATTING.

Format:
[
  {
    "id": ${startingId},
    "question": "What is the time complexity of binary search?",
    "options": ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
    "correctAnswers": [1],
    "multipleChoice": false,
    "difficulty": "medium",
    "explanation": "Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration.",
    "category": "${topic}"
  }
]

Rules:
- Each question has exactly 4 options
- correctAnswers array contains indices (0,1,2,3) of correct options
- multipleChoice: false for single correct answer, true for multiple
- difficulty: "easy", "medium", or "hard"
- Keep explanations under 100 characters
- Make questions practical and relevant
- Start question IDs from ${startingId}
- Ensure variety in difficulty and question types for batch ${batch}

Generate ${limitedQuestions} questions now:`;

    let completion;
    try {
      console.log('Making OpenAI API call with model: gpt-4o');
      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: "You are a quiz generator. Return only valid JSON arrays with no markdown formatting or extra text. Never add ```json``` or any other formatting around the JSON."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: Math.min(limitedQuestions * 200, 2000),
        temperature: 0.3
      });
      console.log('OpenAI API call successful');
    } catch (apiError) {
      console.error('OpenAI API Error:', {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
        type: apiError.type
      });
      
      // Return a more specific error
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'OpenAI API request failed',
          details: apiError.message,
          apiStatus: apiError.status || 'unknown'
        })
      };
    }

    let response = completion.choices[0].message.content.trim();
    console.log('Raw OpenAI response:', response.substring(0, 200) + '...');
    
    // Clean up the response - remove any markdown formatting
    if (response.startsWith('```json')) {
      response = response.replace(/```json\n?/, '').replace(/\n?```$/, '');
      console.log('Cleaned json markdown formatting');
    }
    if (response.startsWith('```')) {
      response = response.replace(/```\n?/, '').replace(/\n?```$/, '');
      console.log('Cleaned generic markdown formatting');
    }
    
    console.log('Cleaned response:', response.substring(0, 200) + '...');
    
    // Try to parse the JSON response
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', response);
      console.error('Parse error:', parseError.message);
      
      // Fallback: generate a simple question if parsing fails
      questions = [{
        id: 1,
        question: `What is a key concept in ${topic}?`,
        options: [
          "Basic understanding",
          "Advanced application", 
          "Practical implementation",
          "Theoretical foundation"
        ],
        correctAnswers: [0],
        multipleChoice: false,
        difficulty: "medium",
        explanation: "This is a fundamental concept that requires understanding.",
        category: topic
      }];
    }

    // Validate the response structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid question format received');
    }

    // Validate each question has required fields and correct IDs
    const validatedQuestions = questions.map((q, index) => ({
      id: q.id || (startingId + index),
      question: q.question || '',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [0],
      multipleChoice: q.multipleChoice || false,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || '',
      category: q.category || topic
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        questions: validatedQuestions,
        topic: topic,
        batch: batch,
        questionsInBatch: validatedQuestions.length,
        totalQuestions: totalQuestions,
        hasMoreBatches: (batch * 10) < totalQuestions
      })
    };

  } catch (error) {
    console.error('Error generating quiz questions:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: typeof error
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate quiz questions',
        details: error.message,
        errorType: error.name || 'Unknown',
        timestamp: new Date().toISOString()
      })
    };
  }
}
