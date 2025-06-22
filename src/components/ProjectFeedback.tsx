
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link, Star, TrendingUp, AlertCircle, CheckCircle, Globe, FileText, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectAnalysis {
  score: number;
  impression: string;
  strengths: string[];
  improvements: string[];
  marketability: number;
  technicalQuality: number;
  userExperience: number;
  documentation: number;
  overall: string;
}

const ProjectFeedback = () => {
  const [projectUrl, setProjectUrl] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleAnalyzeProject = async () => {
    if (!projectUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid project URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('Analyzing project:', { projectUrl, projectDescription });

      const { data, error } = await supabase.functions.invoke('analyze-project', {
        body: {
          projectUrl,
          projectDescription: projectDescription.trim() || undefined
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Failed to analyze project');
      }

      if (!data) {
        throw new Error('No analysis data received');
      }

      console.log('Analysis result:', data);
      setAnalysis(data);

      toast({
        title: "Analysis Complete",
        description: "Your project has been analyzed successfully!",
      });

    } catch (error) {
      console.error('Error analyzing project:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze project",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Project Feedback & Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get AI-powered feedback on your projects. Share your portfolio, GitHub repo, or live project for comprehensive analysis and improvement suggestions.
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Globe className="h-6 w-6 text-blue-600" />
              Project Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project URL *
                </label>
                <Input
                  type="url"
                  placeholder="https://your-project.com or https://github.com/username/repo"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter your portfolio, GitHub repository, or live project URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description (Optional)
                </label>
                <Textarea
                  placeholder="Describe your project, technologies used, key features, and any specific areas you'd like feedback on..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full min-h-[100px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Providing context helps get more targeted feedback
                </p>
              </div>

              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Analyzing your project...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-gray-500 text-center">
                    AI is scraping content, analyzing code, and preparing feedback
                  </p>
                </div>
              )}

              <Button
                onClick={handleAnalyzeProject}
                disabled={isAnalyzing || !projectUrl.trim()}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-medium py-3"
              >
                {isAnalyzing ? (
                  <>
                    <FileText className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Project...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Analyze My Project
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Overall Project Score</h3>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                  </div>
                  <div className="text-2xl text-gray-500">/100</div>
                </div>
                <Badge className={`text-lg px-4 py-2 ${getScoreBadgeColor(analysis.score)}`}>
                  {analysis.score >= 80 ? 'Excellent' : analysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Marketability', score: analysis.marketability, icon: TrendingUp },
                { label: 'Technical Quality', score: analysis.technicalQuality, icon: CheckCircle },
                { label: 'User Experience', score: analysis.userExperience, icon: Star },
                { label: 'Documentation', score: analysis.documentation, icon: FileText },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center p-4 hover:shadow-lg transition-all duration-300">
                    <metric.icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <h4 className="font-semibold text-gray-700 mb-2">{metric.label}</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}/100
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Interviewer Impression */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Interviewer Impression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {analysis.impression}
                </p>
              </CardContent>
            </Card>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-3 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-700">{strength}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-3 text-orange-800">
                    <Lightbulb className="h-5 w-5" />
                    Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {analysis.improvements.map((improvement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-700">{improvement}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Assessment */}
            <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <FileText className="h-5 w-5" />
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {analysis.overall}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectFeedback;
