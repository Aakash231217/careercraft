// API endpoint for generating quiz questions using OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, numQuestions } = req.body;

    if (!topic || !numQuestions) {
      return res.status(400).json({ error: 'Topic and number of questions are required' });
    }

    const prompt = `Generate exactly ${numQuestions} ENTERPRISE-LEVEL multiple choice questions about "${topic}".

RETURN ONLY VALID JSON - NO OTHER TEXT OR FORMATTING.

DIFFICULTY REQUIREMENTS:
- 60% of questions MUST be "hard" difficulty
- 30% can be "medium" difficulty
- 10% "easy" questions allowed

ENTERPRISE-LEVEL QUESTION CRITERIA:
1. Complex real-world scenarios requiring multi-step reasoning
2. Edge cases, performance implications, and scalability concerns
3. Advanced concepts, design patterns, and architectural decisions
4. Integration challenges and cross-system interactions
5. Security implications and best practices
6. Production-level considerations (monitoring, debugging, optimization)
7. Tricky scenarios with subtle differences between options
8. Questions that test deep understanding, not memorization

Format Example:
[
  {
    "id": 1,
    "question": "In a distributed microservices architecture handling 10M requests/day, you notice intermittent 504 Gateway Timeout errors during peak hours. Performance metrics show CPU at 45%, memory at 60%, but network latency spikes to 800ms. What is the MOST likely root cause?",
    "options": [
      "Thread pool exhaustion in the API gateway due to synchronous blocking calls",
      "Database connection pool saturation causing request queuing", 
      "Kubernetes pod autoscaling lag during traffic bursts",
      "Service mesh circuit breaker triggering prematurely"
    ],
    "correctAnswers": [0],
    "multipleChoice": false,
    "difficulty": "hard",
    "explanation": "With low CPU/memory but high latency, blocking I/O operations are likely exhausting the thread pool, causing timeouts.",
    "category": "${topic}"
  }
]

RULES:
- Each question has exactly 4 options
- All options must be plausible to experts - no obviously wrong answers
- correctAnswers array contains indices (0,1,2,3) of correct options
- For "hard" questions: require analysis of multiple factors, trade-offs, or edge cases
- For "medium" questions: still require practical experience and deeper understanding
- Explanations should reference industry standards, best practices, or real implications
- Include specific metrics, tools, or technologies used in enterprise environments
- Questions should test decision-making skills, not just knowledge recall

Generate ${numQuestions} CHALLENGING enterprise-level questions now:`;

    console.log('Generating quiz for topic:', topic, 'with', numQuestions, 'questions');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
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

    res.status(200).json({ 
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
}
