import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Mic, MicOff, User, Briefcase, Clock, Star, ArrowLeft, Settings, MessageSquare } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

// UI Components (reusing from Index.tsx for consistency)
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-medium text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

type ButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  disabled = false
}: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };
  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

type InputProps = {
  placeholder?: string;
  value?: any;
  onChange?: any;
  className?: string;
  type?: string;
  required?: boolean;
};

const Input = ({ placeholder, value, onChange, className = "", type = "text", required }: InputProps) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    required={required}
  />
);

const SelectItem = ({ value, children, onSelect }: { value: any; children: any; onSelect?: any }) => (
  <button
    onClick={() => onSelect?.(value)}
    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
  >
    {children}
  </button>
);

const Select = ({ value, onValueChange, children }: { value: any; onValueChange: any; children: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (selectedValue) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {value ? experienceLevels.find(level => level.value === value)?.label || value : "Select Experience Level..."}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {React.Children.map(children, child => 
            React.cloneElement(child, { onSelect: handleSelect })
          )}
        </div>
      )}
    </div>
  );
};

// Pre-made interviewer profiles
const presetInterviewers = [
  {
    id: 'john-swe',
    name: 'John',
    role: 'Software Engineer',
    avatar: '👨‍💻',
    description: 'Senior Software Engineer with 8+ years experience',
    specialties: ['Relevant Technical Skills', 'Software Proficiency', 'Tools & Technologies', 'Industry Standards'],
    difficulty: 'Senior Level',
    focusAreas: ['Technical Skills', 'Problem Solving', 'System Design']
  },
  {
    id: 'dr-priya',
    name: 'Dr. Priya',
    role: 'Medical Professional',
    avatar: '👩‍⚕️',
    description: 'Senior Doctor with 10+ years in healthcare',
    specialties: ['Patient Care', 'Medical Diagnosis', 'Clinical Experience', 'Medical Ethics'],
    difficulty: 'Senior Level',
    focusAreas: ['Clinical Knowledge', 'Patient Communication', 'Problem Solving', 'Ethics']
  },
  {
    id: 'prof-sharma',
    name: 'Prof. Sharma',
    role: 'Education Professional',
    avatar: '👨‍🏫',
    description: 'Education Expert with 12+ years teaching experience',
    specialties: ['Curriculum Design', 'Student Assessment', 'Classroom Management', 'Educational Technology'],
    difficulty: 'Senior Level',
    focusAreas: ['Teaching Methods', 'Student Engagement', 'Assessment', 'Leadership']
  },
  {
    id: 'anika-marketing',
    name: 'Anika',
    role: 'Marketing Analyst',
    avatar: '👩‍💼',
    description: 'Marketing Analytics Expert with 6+ years experience',
    specialties: ['Digital Marketing', 'Analytics', 'Campaign Strategy', 'Data Analysis'],
    difficulty: 'Mid to Senior Level',
    focusAreas: ['Strategic Thinking', 'Data Analysis', 'Campaign Management']
  },
  {
    id: 'officer-singh',
    name: 'Officer Singh',
    role: 'Civil Services',
    avatar: '👨‍💼',
    description: 'IAS Officer specialized in public administration',
    specialties: ['Public Policy', 'Administration', 'Governance', 'Social Issues'],
    difficulty: 'UPSC Level',
    focusAreas: ['Current Affairs', 'Policy Analysis', 'Leadership', 'Ethics']
  },
  {
    id: 'hr-manager',
    name: 'Sarah',
    role: 'HR Manager',
    avatar: '👩‍💼',
    description: 'HR Professional focused on behavioral assessments',
    specialties: ['Behavioral Questions', 'Cultural Fit', 'Leadership', 'Communication'],
    difficulty: 'General',
    focusAreas: ['Communication', 'Leadership', 'Cultural Fit', 'Problem Solving']
  }
];

// Generic skill categories for any profession
const skillCategories = {
  'Technical': ['Relevant Technical Skills', 'Software Proficiency', 'Tools & Technologies', 'Industry Standards'],
  'Communication': ['Public Speaking', 'Written Communication', 'Presentation Skills', 'Language Proficiency'],
  'Leadership': ['Team Management', 'Project Leadership', 'Decision Making', 'Mentoring'],
  'Analytical': ['Problem Solving', 'Data Analysis', 'Research Skills', 'Critical Thinking'],
  'Creative': ['Innovation', 'Design Thinking', 'Creative Problem Solving', 'Artistic Skills'],
  'Interpersonal': ['Teamwork', 'Customer Service', 'Conflict Resolution', 'Networking']
};

const experienceLevels = [
  { value: '0-1', label: '0-1 years (Entry Level)' },
  { value: '2-3', label: '2-3 years (Junior)' },
  { value: '4-6', label: '4-6 years (Mid Level)' },
  { value: '7-10', label: '7-10 years (Senior)' },
  { value: '10+', label: '10+ years (Lead/Principal)' }
];

// Interview states
type InterviewState = 'setup' | 'interviewing' | 'completed';

// OpenAI service
class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  async generateInterviewQuestion(context: any): Promise<string> {
    const { interviewer, isFirstQuestion, questionHistory, responseHistory, previousResponse, questionCount } = context;
    
    let prompt = '';
    
    if (isFirstQuestion) {
      prompt = `You are ${interviewer.name}, a ${interviewer.role} conducting a job interview. 
      Your specialties include: ${interviewer.specialties.join(', ')}.
      Your focus areas are: ${interviewer.focusAreas.join(', ')}.
      
      Start the interview with a warm greeting and an opening question. Keep it professional but friendly.
      Ask an introductory question about the candidate's background, experience, or motivation for applying to this field.
      
      Respond as the interviewer would, in first person.`;
    } else {
      prompt = `You are ${interviewer.name}, a ${interviewer.role} conducting a job interview.
      Your specialties include: ${interviewer.specialties.join(', ')}.
      Your focus areas are: ${interviewer.focusAreas.join(', ')}.
      
      Previous questions asked: ${questionHistory.join(' | ')}
      Previous candidate responses: ${responseHistory.join(' | ')}
      Latest response: "${previousResponse}"
      
      Question number: ${questionCount + 1}
      
      Based on the candidate's latest response, generate an appropriate follow-up question.
      
      Guidelines:
      - If this is question 2-3, ask about their background, education, or relevant experience
      - If this is question 4-6, ask subject-specific questions based on your specialties and focus areas
      - If this is question 7+, ask challenging scenario-based, problem-solving, or case study questions
      - Always build upon their previous responses
      - Keep questions relevant to the ${interviewer.role} field and position
      - Vary between knowledge-based, behavioral, and situational questions
      - Adapt your questioning style to the specific profession (technical for engineers, ethical for civil services, practical for medical, pedagogical for teaching, etc.)
      
      Generate only the next question, no additional commentary.`;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating question:', error);
      return isFirstQuestion 
        ? "Hello! Thank you for taking the time to interview with us today. Could you start by telling me a bit about yourself and what interests you about this position?"
        : "That's interesting. Can you tell me more about your experience with that?";
    }
  }

  async generateFeedback(transcript: string, context: any): Promise<any> {
    const { interviewer, duration, questionHistory, responseHistory, totalQuestions } = context;
    
    const prompt = `You are an expert interview coach analyzing a mock interview performance for a ${interviewer.role} position.

    Interview Details:
    - Interviewer: ${interviewer.name} (${interviewer.role})
    - Duration: ${Math.floor(duration / 60)} minutes
    - Questions Asked: ${totalQuestions}
    - Specialties: ${interviewer.specialties.join(', ')}
    - Focus Areas: ${interviewer.focusAreas.join(', ')}
    
    Questions: ${questionHistory.join(' | ')}
    Responses: ${responseHistory.join(' | ')}
    
    Provide comprehensive feedback in JSON format with:
    {
      "overallScore": (number 1-10),
      "scores": {
        "communication": (number 1-10),
        "subjectKnowledge": (number 1-10),
        "problemSolving": (number 1-10),
        "overall": (number 1-10)
      },
      "strengths": [array of 3-5 specific strengths],
      "improvements": [array of 3-5 specific areas for improvement],
      "detailedFeedback": "detailed paragraph feedback"
    }
    
    Base your evaluation on:
    - Clarity and structure of responses
    - Subject matter knowledge and expertise demonstrated
    - Problem-solving and analytical thinking
    - Communication skills and articulation
    - Confidence, professionalism, and field-appropriate demeanor
    - Relevance of examples and experience shared
    
    Adapt your evaluation criteria to the specific field (e.g., technical skills for engineering, patient care for medical, pedagogical skills for teaching, policy knowledge for civil services, etc.)`;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating feedback:', error);
      return {
        overallScore: 7,
        scores: {
          communication: 7,
          subjectKnowledge: 6,
          problemSolving: 7,
          overall: 7
        },
        strengths: [
          "Good communication skills",
          "Structured responses",
          "Professional demeanor"
        ],
        improvements: [
          "Provide more specific examples",
          "Elaborate on technical details",
          "Practice concise explanations"
        ],
        detailedFeedback: "You demonstrated good communication skills throughout the interview. Your responses were generally well-structured and professional. To improve, consider providing more specific examples and elaborating on technical concepts when relevant."
      };
    }
  }
}

const MockInterview = () => {
  const { checkAndUseFeature } = useSubscription();
  
  // State management
  const [currentView, setCurrentView] = useState<'selection' | 'custom' | 'interview' | 'feedback'>('selection');
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [customInterviewer, setCustomInterviewer] = useState({
    name: '',
    role: '',
    company: '',
    position: '',
    experience: '',
    specialties: [],
    focusAreas: []
  });
  
  // Interview states
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(20); // Default 20 minutes
  const [maxDuration, setMaxDuration] = useState(20 * 60); // Convert to seconds
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [responseHistory, setResponseHistory] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Services
  const openAIService = new OpenAIService();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  // Start interview
  const startInterview = async (interviewer: any) => {
    // Check subscription limit before starting interview
    const canUse = await checkAndUseFeature('mockInterviews');
    if (!canUse) return;
    
    setSelectedInterviewer(interviewer);
    setCurrentView('interview');
    setInterviewState('interviewing');
    setMaxDuration(selectedDuration * 60); // Convert minutes to seconds
    
    // Start timer
    timerRef.current = setInterval(() => {
      setInterviewDuration(prev => {
        if (prev >= maxDuration - 1) {
          endInterview();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    // Generate first question
    const firstQuestion = await openAIService.generateInterviewQuestion({
      interviewer,
      isFirstQuestion: true,
      questionHistory: [],
      responseHistory: []
    });
    setCurrentQuestion(firstQuestion);
    setQuestionHistory([firstQuestion]);
    setQuestionCount(1);
    
    // Speak the first question
    speakText(firstQuestion);
  };

  // Voice functions
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    if (isProcessingResponse) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript + ' ');
          }
        };
        
        // Handle speech recognition end
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
        };
      }

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Add delay to allow speech recognition to finish processing
        setTimeout(async () => {
          console.log('Processing response after delay...');
          await processUserResponse();
        }, 1500); // 1.5 second delay
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processUserResponse = async () => {
    setIsProcessingResponse(true);
    
    console.log('Processing response. Current transcript:', transcript);
    
    // Get the latest response from transcript
    const currentTranscript = transcript.trim();
    
    if (currentTranscript && currentTranscript.length > 10) {
      // Split by sentences or use the whole transcript as the response
      const responses = currentTranscript.includes('. ') 
        ? currentTranscript.split('. ')
        : [currentTranscript];
      
      const latestResponse = responses[responses.length - 1];
      console.log('Latest response:', latestResponse);
      
      setResponseHistory(prev => [...prev, latestResponse]);
      
      // Check if interview should continue
      const shouldContinue = interviewDuration < maxDuration - 60 && questionCount < 10; // Leave 1 minute for closing
      console.log('Should continue:', shouldContinue, 'Duration:', interviewDuration, 'Max:', maxDuration, 'Question count:', questionCount);
      
      if (shouldContinue) {
        try {
          console.log('Generating next question...');
          // Generate follow-up question
          const nextQuestion = await openAIService.generateInterviewQuestion({
            interviewer: selectedInterviewer,
            isFirstQuestion: false,
            questionHistory: questionHistory,
            responseHistory: [...responseHistory, latestResponse],
            previousResponse: latestResponse,
            questionCount: questionCount
          });
          
          console.log('Next question generated:', nextQuestion);
          setCurrentQuestion(nextQuestion);
          setQuestionHistory(prev => [...prev, nextQuestion]);
          setQuestionCount(prev => prev + 1);
          
          // Clear transcript for next response
          setTranscript('');
          
          // Small delay before speaking next question
          setTimeout(() => {
            speakText(nextQuestion);
          }, 2000);
        } catch (error) {
          console.error('Error generating next question:', error);
          // Fallback: end interview if we can't generate questions
          setTimeout(() => {
            endInterview();
          }, 3000);
        }
      } else {
        // End interview
        console.log('Ending interview...');
        setTimeout(() => {
          endInterview();
        }, 3000);
      }
    } else {
      console.log('No valid transcript found, length:', currentTranscript.length);
    }
    
    setIsProcessingResponse(false);
  };

  const endInterview = async () => {
    setIsEndingInterview(true);
    setInterviewState('completed');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      // Generate feedback
      const context = {
        interviewer: selectedInterviewer,
        duration: interviewDuration,
        questionHistory,
        responseHistory,
        totalQuestions: questionCount
      };
      
      const feedbackData = await openAIService.generateFeedback(transcript, context);
      setFeedback(feedbackData);
      setCurrentView('feedback');
    } catch (error) {
      console.error('Error generating feedback:', error);
      // Still show feedback view even if there's an error
      setCurrentView('feedback');
    } finally {
      setIsEndingInterview(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetInterview = () => {
    // Reset all states
    setCurrentView('selection');
    setSelectedInterviewer(null);
    setInterviewState('setup');
    setIsRecording(false);
    setIsProcessingResponse(false);
    setIsEndingInterview(false);
    setCurrentQuestion('');
    setTranscript('');
    setInterviewDuration(0);
    setQuestionHistory([]);
    setResponseHistory([]);
    setQuestionCount(0);
    setFeedback(null);
    
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop any ongoing recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Render selection view
  const renderSelection = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Mock Interview</h1>
          <p className="text-lg text-gray-600">Practice your interview skills with AI-powered mock interviews</p>
        </div>

        {/* Duration Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Interview Duration</CardTitle>
            <CardDescription>Choose how long you want your interview to be</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              {[10, 20, 30].map((duration) => (
                <Button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  variant={selectedDuration === duration ? "default" : "outline"}
                  className="min-w-24"
                >
                  {duration} min
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preset Interviewers */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Choose Your Interviewer</h2>
            <Button 
              onClick={() => setCurrentView('custom')}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              Create Custom Interviewer
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {presetInterviewers.map((interviewer) => (
              <Card key={interviewer.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{interviewer.avatar}</div>
                    <h3 className="text-xl font-semibold mb-2">{interviewer.name}</h3>
                    <p className="text-lg text-blue-600 mb-3">{interviewer.role}</p>
                    <p className="text-sm text-gray-600 mb-4">{interviewer.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {interviewer.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={() => startInterview(interviewer)}
                      className="w-full"
                    >
                      Start Interview ({selectedDuration} min)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render custom interviewer view
  const renderCustomInterviewer = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Custom Interviewer</h1>
          <p className="text-lg text-gray-600">Create a personalized interviewer for any field - Tech, Teaching, Medical, UPSC, Finance, etc.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interviewer Details</CardTitle>
            <CardDescription>Define your interviewer's background and expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interviewer Name</label>
                <Input 
                  placeholder="e.g., Dr. Smith, Prof. Sharma, Mr. Kumar"
                  value={customInterviewer.name}
                  onChange={(e) => setCustomInterviewer(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role/Designation</label>
                <Input 
                  placeholder="e.g., Software Engineer, Teacher, Doctor, IAS Officer"
                  value={customInterviewer.role}
                  onChange={(e) => setCustomInterviewer(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization/Company</label>
                <Input 
                  placeholder="e.g., Google, Delhi University, AIIMS, Central Government"
                  value={customInterviewer.company}
                  onChange={(e) => setCustomInterviewer(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position You're Applying For</label>
                <Input 
                  placeholder="e.g., Junior Developer, Assistant Professor, Resident Doctor"
                  value={customInterviewer.position}
                  onChange={(e) => setCustomInterviewer(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <Select 
                  value={customInterviewer.experience}
                  onValueChange={(value) => setCustomInterviewer(prev => ({ ...prev, experience: value }))}
                >
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Specialties/Skills (separate by commas)</label>
                <Input 
                  placeholder="e.g., JavaScript, React OR Patient Care, Surgery OR Curriculum Design"
                  value={customInterviewer.specialties.join(', ')}
                  onChange={(e) => setCustomInterviewer(prev => ({ ...prev, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Focus Areas (Select categories that apply)</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(skillCategories).map((category, index) => (
                  <button
                    key={index}
                    className="inline-block cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setCustomInterviewer(prev => ({ ...prev, focusAreas: prev.focusAreas.includes(category) ? prev.focusAreas.filter(f => f !== category) : [...prev.focusAreas, category] }))}
                  >
                    <Badge 
                      className={`bg-blue-100 text-blue-800 text-xs ${customInterviewer.focusAreas.includes(category) ? 'bg-blue-200' : ''}`}
                    >
                      {category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button 
                onClick={() => setCurrentView('selection')}
                variant="outline"
              >
                Back to Selection
              </Button>
              <Button 
                onClick={() => {
                  if (customInterviewer.name && customInterviewer.role) {
                    startInterview(customInterviewer);
                  } else {
                    alert('Please fill in at least the interviewer name and role.');
                  }
                }}
                disabled={!customInterviewer.name || !customInterviewer.role}
              >
                Start Custom Interview ({selectedDuration} min)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render interview view
  const renderInterview = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={resetInterview} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-gray-700">
              {formatTime(maxDuration - interviewDuration)}
            </div>
            <Button 
              onClick={endInterview} 
              variant="destructive"
              disabled={isEndingInterview}
            >
              {isEndingInterview ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Ending...
                </>
              ) : (
                "End Interview"
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((interviewDuration / maxDuration) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(interviewDuration / maxDuration) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Interviewer Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{selectedInterviewer?.avatar}</div>
              <div>
                <h3 className="text-lg font-semibold">{selectedInterviewer?.name}</h3>
                <p className="text-gray-600">{selectedInterviewer?.role}</p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-blue-100 text-blue-800">
                  Question {questionCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Current Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg leading-relaxed">{currentQuestion}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recording Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                {isRecording ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-600 font-medium">Recording...</span>
                  </div>
                ) : isProcessingResponse ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-600 font-medium">Processing your response...</span>
                  </div>
                ) : (
                  <span className="text-gray-600">Ready to record your response</span>
                )}
              </div>
              
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                disabled={isProcessingResponse}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              {/* Debug button for manual next question */}
              {transcript && !isRecording && !isProcessingResponse && (
                <Button
                  onClick={() => processUserResponse()}
                  variant="outline"
                  className="ml-4"
                >
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interview Transcript */}
        {transcript && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{transcript}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ul className="space-y-1">
                <li>• Click "Start Recording" to record your response</li>
                <li>• Speak clearly and take your time</li>
                <li>• Click "Stop Recording" when you're done</li>
                <li>• The interviewer will ask follow-up questions based on your responses</li>
                <li>• The interview will automatically end when time runs out</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render feedback view
  const renderFeedback = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Interview Feedback</h1>
        <p className="text-gray-600 mt-2">Your performance analysis and recommendations</p>
      </div>

      {feedback && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl font-bold text-blue-600">
                  {feedback.overallScore}/10
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(feedback.overallScore / 2) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{feedback.scores.communication}</div>
                  <div className="text-sm text-gray-600">Communication</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{feedback.scores.subjectKnowledge}</div>
                  <div className="text-sm text-gray-600">Subject Knowledge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{feedback.scores.problemSolving}</div>
                  <div className="text-sm text-gray-600">Problem Solving</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{feedback.scores.overall}</div>
                  <div className="text-sm text-gray-600">Overall</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{feedback.detailedFeedback}</p>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button onClick={resetInterview}>
              Try Another Interview
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Download Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'selection' && renderSelection()}
      {currentView === 'custom' && renderCustomInterviewer()}
      {currentView === 'interview' && renderInterview()}
      {currentView === 'feedback' && renderFeedback()}
    </div>
  );
};

export default MockInterview;
