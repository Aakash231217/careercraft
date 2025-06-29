import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  BookOpen,
  MessageSquare,
  Moon,
  Sun,
  Mic,
  Linkedin,
  Mail,
  Brain
} from "lucide-react";

import ResumeBuilder from "@/components/ResumeBuilder";
import ResumeAnalyzer from "@/components/ResumeAnalyzer";
import CoverLetterBuilder from "@/components/CoverLetterBuilder";
import SalaryGuide from "@/components/SalaryGuide";
import RoadmapBuilder from "@/components/RoadmapBuilder";
import ProjectFeedback from "@/components/ProjectFeedback";
import PortfolioBuilder from "@/components/PortfolioBuilder";
import MockInterview from "@/components/MockInterviewer"; // Fix the import name to match the exported component name
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";
import AuthForm from "@/components/AuthForm";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ColdEmailOutreach } from "@/components/outreach/ColdEmailOutreach";
import QuizTool from "@/components/QuizTool";

type ActiveTool = 'resume-builder' | 'resume-analyzer' | 'cover-letter' | 'salary-guide' | 'roadmap' | 'project-feedback' | 'portfolio-builder' | 'mock-interviewer' | 'cold-email-outreach' | 'quiz-tool' | null;

const Index = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pendingTool, setPendingTool] = useState<ActiveTool>(null);

  useEffect(() => {
    // Configure Supabase client for proper session handling
    const initAuth = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setShowAuthDialog(false);
        
        // If there was a pending tool, activate it
        if (pendingTool) {
          setActiveTool(pendingTool);
          setPendingTool(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pendingTool]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleToolClick = async (toolId: ActiveTool) => {
    if (!user) {
      setPendingTool(toolId);
      setShowAuthDialog(true);
      return;
    }

    // User is authenticated, activate tool directly
    setActiveTool(toolId);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setActiveTool(null);
      setPendingTool(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (activeTool) {
    const renderTool = () => {
      switch (activeTool) {
        case 'resume-builder':
          return <ResumeBuilder />;
        case 'resume-analyzer':
          return <ResumeAnalyzer />;
        case 'cover-letter':
          return <CoverLetterBuilder />;
        case 'salary-guide':
          return <SalaryGuide />;
        case 'roadmap':
          return <RoadmapBuilder />;
        case 'project-feedback':
          return <ProjectFeedback />;
        case 'portfolio-builder':
          return <PortfolioBuilder />;
        case 'mock-interviewer':
          return <MockInterview />; // Fix the import name to match the exported component name
        case 'cold-email-outreach':
          return <ColdEmailOutreach />;
        case 'quiz-tool':
          return <QuizTool />;
        default:
          return null;
      }
    };

    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="p-4 bg-background text-foreground">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={() => setActiveTool(null)}
              variant="outline"
            >
              ← Back to Tools
            </Button>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            {renderTool()}
          </div>
        </div>
      </div>
    );
  }

  const tools = [
    {
      id: 'resume-builder' as ActiveTool,
      title: "AI Resume Builder",
      description: "Create a professional resume with AI assistance",
      icon: FileText,
      gradient: "from-blue-500 via-purple-500 to-pink-500",
      hoverGradient: "hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
    },
    {
      id: 'resume-analyzer' as ActiveTool,
      title: "Resume Analyzer",
      description: "Get AI feedback on your existing resume",
      icon: TrendingUp,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      hoverGradient: "hover:from-green-600 hover:via-emerald-600 hover:to-teal-600"
    },
    {
      id: 'cover-letter' as ActiveTool,
      title: "Cover Letter Builder",
      description: "Generate personalized cover letters",
      icon: MessageSquare,
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
      hoverGradient: "hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600"
    },
    {
      id: 'salary-guide' as ActiveTool,
      title: "Salary Guide",
      description: "Research salary ranges for your target roles",
      icon: DollarSign,
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      hoverGradient: "hover:from-yellow-600 hover:via-orange-600 hover:to-red-600"
    },
    {
      id: 'roadmap' as ActiveTool,
      title: "Career Roadmap",
      description: "Get a personalized career development plan",
      icon: BookOpen,
      gradient: "from-indigo-500 via-blue-500 to-cyan-500",
      hoverGradient: "hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-600"
    },
    {
      id: 'project-feedback' as ActiveTool,
      title: "Project Feedback",
      description: "Get AI feedback on your portfolio projects",
      icon: Briefcase,
      gradient: "from-teal-500 via-cyan-500 to-blue-500",
      hoverGradient: "hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600"
    },
    
    {
      id: 'mock-interviewer' as ActiveTool,
      title: "Mock Interviewer",
      description: "Practice your interview skills with AI-powered mock interviews",
      icon: Mic,
      gradient: "from-blue-500 via-purple-500 to-pink-500",
      hoverGradient: "hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
    },
    {
      id: 'quiz-tool' as ActiveTool,
      title: "AI Quiz Generator",
      description: "Generate custom quizzes on any topic to test your knowledge",
      icon: Brain,
      gradient: "from-pink-500 via-rose-500 to-red-500",
      hoverGradient: "hover:from-pink-600 hover:via-rose-600 hover:to-red-600"
    },
   
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
        
        {/* Floating Background Elements */}
        <FloatingElements />

        {/* Header with Auth */}
        <div className="absolute top-6 right-6 z-50">
          <div className="flex items-center gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full p-3 border border-white/30 dark:border-gray-700/30">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {user.email}</span>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="bg-white/50 dark:bg-gray-800/50">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)} variant="outline" size="sm" className="bg-white/50 dark:bg-gray-800/50">
                Sign In
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              <Moon className="h-4 w-4 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-20 px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
                Adaptius Pro
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Transform your career with our comprehensive suite of AI-powered tools. 
              {user ? "Welcome back! Choose a tool to continue your career journey." : "Sign up to unlock all premium features and accelerate your professional growth."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-white/40 dark:border-gray-700/40 text-sm font-medium text-gray-700 dark:text-gray-300">
                ✨ AI-Powered
              </div>
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-white/40 dark:border-gray-700/40 text-sm font-medium text-gray-700 dark:text-gray-300">
                🚀 Career Growth
              </div>
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-white/40 dark:border-gray-700/40 text-sm font-medium text-gray-700 dark:text-gray-300">
                💼 Professional
              </div>
              {user && (
                <div className="px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/40 text-sm font-medium text-green-700 dark:text-green-300">
                  ✅ Premium Access
                </div>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* Tools Grid */}
        <section className="py-16 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4"
            >
              Choose Your Career Tool
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg"
            >
              Professional tools designed to elevate your career journey
            </motion.p>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <motion.div
                    key={tool.id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card className="h-full hover:shadow-2xl transition-all duration-500 cursor-pointer group bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/40 dark:border-gray-700/40 overflow-hidden relative"
                          onClick={() => handleToolClick(tool.id)}>
                      <div className={`h-2 bg-gradient-to-r ${tool.gradient} group-hover:h-3 transition-all duration-300`} />
                      <CardHeader className="text-center relative">
                        <motion.div 
                          className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <IconComponent className="h-10 w-10 text-white" />
                        </motion.div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                          {tool.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                          {tool.description}
                        </p>
                        <Button 
                          className={`w-full bg-gradient-to-r ${tool.gradient} ${tool.hoverGradient} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                        >
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />
        
        {/* Footer */}
        <Footer />

        {/* Authentication Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent">
            <AuthForm 
              onBack={() => setShowAuthDialog(false)}
              onEmailConfirmation={() => {
                // Close the dialog when email confirmation message is shown
                setShowAuthDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
