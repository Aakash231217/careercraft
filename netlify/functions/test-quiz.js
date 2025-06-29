exports.handler = async (event, context) => {
  console.log('Test function called');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { topic, numQuestions } = JSON.parse(event.body || '{}');
    
    // Return mock data to test if function works
    const mockQuestions = [
      {
        id: 1,
        question: `What is a basic concept in ${topic || 'this subject'}?`,
        options: [
          "Fundamental principle",
          "Advanced technique", 
          "Complex theory",
          "Practical application"
        ],
        correctAnswers: [0],
        multipleChoice: false,
        difficulty: "easy",
        explanation: "This tests basic understanding of the subject.",
        category: topic || "General"
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        questions: mockQuestions,
        topic: topic || 'Test',
        totalQuestions: 1,
        message: 'Mock response - function is working!'
      })
    };

  } catch (error) {
    console.error('Error in test function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Function error',
        details: error.message 
      })
    };
  }
};
