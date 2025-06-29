import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswers: number[];
  multipleChoice: boolean;
  difficulty: string;
  explanation: string;
  category: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  weakAreas: string[];
  strongAreas: string[];
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimePerQuestion: number;
  difficultyBreakdown: { [key: string]: { correct: number; total: number } };
  detailedAnalysis: {
    questionsReview: {
      question: string;
      userAnswer: string[];
      correctAnswer: string[];
      isCorrect: boolean;
      explanation: string;
      difficulty: string;
      timeSpent?: number;
    }[];
    recommendations: string[];
    studyPlan: string[];
    performanceLevel: string;
    improvement: string;
  };
}

const QuizTool: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number[] }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'quiz' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), numQuestions })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response format from server');
      }

      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setTimeLeft(numQuestions * 60); // 1 minute per question
        setStep('quiz');
        setCurrentQuestion(0);
        setUserAnswers({});
        setSelectedAnswers([]);
      } else {
        throw new Error(data.error || 'No questions were generated');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Error generating quiz: ' + error.message + '. Please try again with a different topic.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const question = questions[currentQuestion];
    if (question.multipleChoice) {
      setSelectedAnswers(prev => 
        prev.includes(optionIndex) 
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex]
      );
    } else {
      setSelectedAnswers([optionIndex]);
    }
  };

  const nextQuestion = () => {
    setUserAnswers(prev => ({ ...prev, [currentQuestion]: [...selectedAnswers] }));
    setSelectedAnswers([]);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    const finalAnswers = { ...userAnswers, [currentQuestion]: [...selectedAnswers] };
    calculateResults(finalAnswers);
  };

  const calculateResults = (answers: { [key: number]: number[] }) => {
    let correct = 0;
    const categoryScores: { [key: string]: { correct: number; total: number } } = {};
    const difficultyBreakdown: { [key: string]: { correct: number; total: number } } = {};
    const questionsReview: any[] = [];
    const totalTimeSpent = (numQuestions * 60) - timeLeft;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index] || [];
      const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswers.sort());
      
      if (isCorrect) correct++;
      
      // Category analysis
      const category = question.category;
      if (!categoryScores[category]) {
        categoryScores[category] = { correct: 0, total: 0 };
      }
      categoryScores[category].total++;
      if (isCorrect) categoryScores[category].correct++;
      
      // Difficulty analysis
      const difficulty = question.difficulty;
      if (!difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty] = { correct: 0, total: 0 };
      }
      difficultyBreakdown[difficulty].total++;
      if (isCorrect) difficultyBreakdown[difficulty].correct++;
      
      // Question review
      questionsReview.push({
        question: question.question,
        userAnswer: userAnswer.map(i => question.options[i]),
        correctAnswer: question.correctAnswers.map(i => question.options[i]),
        isCorrect,
        explanation: question.explanation,
        difficulty: question.difficulty,
        timeSpent: Math.round(totalTimeSpent / questions.length)
      });
    });

    const weakAreas = Object.entries(categoryScores)
      .filter(([_, scores]) => scores.correct / scores.total < 0.7)
      .map(([category]) => category);

    const strongAreas = Object.entries(categoryScores)
      .filter(([_, scores]) => scores.correct / scores.total >= 0.8)
      .map(([category]) => category);

    // Performance analysis
    const scorePercentage = Math.round((correct / questions.length) * 100);
    let performanceLevel = '';
    let improvement = '';
    
    if (scorePercentage >= 90) {
      performanceLevel = 'Excellent';
      improvement = 'Outstanding performance! You have mastered this topic.';
    } else if (scorePercentage >= 80) {
      performanceLevel = 'Very Good';
      improvement = 'Great job! Minor improvements needed in some areas.';
    } else if (scorePercentage >= 70) {
      performanceLevel = 'Good';
      improvement = 'Good foundation. Focus on weak areas for improvement.';
    } else if (scorePercentage >= 60) {
      performanceLevel = 'Average';
      improvement = 'Decent understanding. More practice needed.';
    } else {
      performanceLevel = 'Needs Improvement';
      improvement = 'Significant study required. Focus on fundamentals.';
    }
    
    // Generate recommendations
    const recommendations = [];
    if (weakAreas.length > 0) {
      recommendations.push(`Focus on improving: ${weakAreas.join(', ')}`);
    }
    if (difficultyBreakdown.hard && difficultyBreakdown.hard.correct / difficultyBreakdown.hard.total < 0.5) {
      recommendations.push('Practice more advanced/hard questions');
    }
    if (totalTimeSpent < numQuestions * 30) {
      recommendations.push('Take more time to read questions carefully');
    }
    if (recommendations.length === 0) {
      recommendations.push('Keep up the excellent work!');
    }
    
    // Generate study plan
    const studyPlan = [
      'Review incorrect answers and understand explanations',
      'Practice similar questions in weak areas',
      'Create flashcards for key concepts',
      'Set up regular study sessions',
      'Take practice tests weekly'
    ];
    
    if (weakAreas.length > 0) {
      studyPlan.unshift(`Dedicate 60% of study time to: ${weakAreas.join(', ')}`);
    }

    setQuizResult({
      score: scorePercentage,
      totalQuestions: questions.length,
      timeSpent: totalTimeSpent,
      weakAreas,
      strongAreas,
      correctAnswers: correct,
      incorrectAnswers: questions.length - correct,
      averageTimePerQuestion: Math.round(totalTimeSpent / questions.length),
      difficultyBreakdown,
      detailedAnalysis: {
        questionsReview,
        recommendations,
        studyPlan,
        performanceLevel,
        improvement
      }
    });
    setStep('results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setStep('setup');
    setTopic('');
    setCurrentQuestion(0);
    setQuestions([]);
    setUserAnswers({});
    setSelectedAnswers([]);
    setQuizResult(null);
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📝 Quiz Generator
              </CardTitle>
              <p className="text-gray-600 mt-2">Test your knowledge on any topic</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="topic" className="text-lg font-semibold">Quiz Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., React Development, Data Structures, Python, Mathematics..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-lg font-semibold">Number of Questions</Label>
                <Select value={numQuestions.toString()} onValueChange={(v) => setNumQuestions(parseInt(v))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Questions (10 minutes)</SelectItem>
                    <SelectItem value="20">20 Questions (20 minutes)</SelectItem>
                    <SelectItem value="30">30 Questions (30 minutes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateQuiz} 
                disabled={!topic.trim() || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Generating Quiz...' : 'Start Quiz'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">Question {currentQuestion + 1} of {questions.length}</span>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex items-center space-x-2 text-red-600 font-bold">
              <Clock size={20} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">{question?.question}</CardTitle>
              {question?.multipleChoice && (
                <p className="text-sm text-blue-600 font-semibold">Select all that apply</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {question?.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswers.includes(index) ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
              
              <div className="flex justify-between pt-6">
                <div className="text-sm text-gray-500">
                  Difficulty: <span className="capitalize font-semibold">{question?.difficulty}</span>
                </div>
                <Button 
                  onClick={nextQuestion}
                  disabled={selectedAnswers.length === 0}
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'results' && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Main Results Card */}
          <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold">📊 Detailed Quiz Analysis</CardTitle>
              <div className="text-6xl font-bold mt-4">
                <span className={quizResult.score >= 70 ? 'text-green-200' : quizResult.score >= 50 ? 'text-yellow-200' : 'text-red-200'}>
                  {quizResult.score}%
                </span>
              </div>
              <p className="text-lg opacity-90 mt-2">{quizResult.detailedAnalysis.performanceLevel} Performance</p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{quizResult.score}%</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{quizResult.correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">{quizResult.incorrectAnswers}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{Math.floor(quizResult.timeSpent / 60)}m {quizResult.timeSpent % 60}s</div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">{quizResult.averageTimePerQuestion}s</div>
                  <div className="text-sm text-gray-600">Avg/Question</div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6 border">
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <BookOpen className="mr-2 text-blue-600" size={24} />
                  Performance Analysis
                </h3>
                <p className="text-gray-700 text-lg mb-4">{quizResult.detailedAnalysis.improvement}</p>
                
                {/* Difficulty Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(quizResult.difficultyBreakdown).map(([difficulty, stats]) => {
                    const percentage = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={difficulty} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold capitalize">{difficulty}</span>
                          <span className={`font-bold ${
                            percentage >= 70 ? 'text-green-600' : 
                            percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{percentage}%</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {stats.correct}/{stats.total} correct
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className={`h-2 rounded-full ${
                            percentage >= 70 ? 'bg-green-500' : 
                            percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Areas for Improvement & Strengths */}
            <div className="space-y-6">
              {quizResult.weakAreas.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="text-red-800 flex items-center">
                      <XCircle className="mr-2" size={20} />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {quizResult.weakAreas.map(area => (
                        <li key={area} className="flex items-center text-red-700">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {quizResult.strongAreas.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-green-800 flex items-center">
                      <CheckCircle className="mr-2" size={20} />
                      Strong Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {quizResult.strongAreas.map(area => (
                        <li key={area} className="flex items-center text-green-700">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recommendations & Study Plan */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800">💡 Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {quizResult.detailedAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-800">📚 Study Plan</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {quizResult.detailedAnalysis.studyPlan.map((plan, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{plan}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">🔍 Question Review</CardTitle>
              <p className="text-gray-600">Detailed breakdown of each question</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {quizResult.detailedAnalysis.questionsReview.map((review, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    review.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">Q{index + 1}: {review.question}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        review.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {review.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Your Answer:</strong> <span className={review.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {review.userAnswer.length > 0 ? review.userAnswer.join(', ') : 'No answer'}
                      </span></p>
                      <p><strong>Correct Answer:</strong> <span className="text-green-700">
                        {review.correctAnswer.join(', ')}
                      </span></p>
                      <p><strong>Explanation:</strong> <span className="text-gray-700">{review.explanation}</span></p>
                      <p><strong>Difficulty:</strong> <span className="capitalize bg-gray-200 px-2 py-1 rounded text-xs">
                        {review.difficulty}
                      </span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={resetQuiz} variant="outline" className="flex-1">
              🔄 Take Another Quiz
            </Button>
            <Button onClick={() => setStep('setup')} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
              📝 New Topic
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizTool;
