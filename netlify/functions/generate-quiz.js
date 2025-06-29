import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event, context) {
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
    const { topic, numQuestions } = JSON.parse(event.body);

    if (!topic || !numQuestions) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Topic and number of questions are required' })
      };
    }

    console.log('Generating quiz for topic:', topic, 'with', numQuestions, 'questions');

    const prompt = `Generate exactly ${numQuestions} multiple choice questions about "${topic}".

RETURN ONLY VALID JSON - NO OTHER TEXT OR FORMATTING.

Format:
[
  {
    "id": 1,
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

Generate ${numQuestions} questions now:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      max_tokens: 3000,
      temperature: 0.3
    });

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

    // Validate each question has required fields
    const validatedQuestions = questions.map((q, index) => ({
      id: q.id || index + 1,
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
        totalQuestions: validatedQuestions.length
      })
    };

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate quiz questions',
        details: error.message 
      })
    };
  }
}
