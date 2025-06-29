import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Quiz generation endpoint
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, numQuestions } = req.body;

    if (!topic || !numQuestions) {
      return res.status(400).json({ error: 'Topic and number of questions are required' });
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

    res.json({ 
      success: true, 
      questions: validatedQuestions,
      topic: topic,
      totalQuestions: validatedQuestions.length
    });

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz questions',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Quiz API available at http://localhost:${PORT}/api/generate-quiz`);
});
