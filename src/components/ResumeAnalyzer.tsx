
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, XCircle, Target, Lightbulb } from 'lucide-react';

interface AnalysisResult {
  overallScore: number;
  sections: {
    formatting: { score: number; feedback: string[] };
    content: { score: number; feedback: string[] };
    keywords: { score: number; feedback: string[] };
    ats: { score: number; feedback: string[] };
  };
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const analyzeResume = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis (in real app, this would call an API)
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        overallScore: 78,
        sections: {
          formatting: {
            score: 85,
            feedback: [
              'Good use of consistent formatting',
              'Clear section headers',
              'Appropriate font choices'
            ]
          },
          content: {
            score: 72,
            feedback: [
              'Strong professional summary',
              'Quantified achievements in some areas',
              'Could use more specific metrics'
            ]
          },
          keywords: {
            score: 65,
            feedback: [
              'Some relevant keywords present',
              'Missing industry-specific terms',
              'Could optimize for ATS scanning'
            ]
          },
          ats: {
            score: 80,
            feedback: [
              'Good file format compatibility',
              'Clean structure for parsing',
              'Minimal graphics that could cause issues'
            ]
          }
        },
        suggestions: [
          'Add more quantified achievements (e.g., "Increased sales by 25%")',
          'Include more relevant keywords from the job description',
          'Optimize contact information format',
          'Add a skills section with technical competencies',
          'Use stronger action verbs in experience descriptions'
        ],
        strengths: [
          'Clear and professional layout',
          'Strong educational background',
          'Good work experience progression',
          'Appropriate length (1-2 pages)'
        ],
        improvements: [
          'Add more metrics and numbers',
          'Include more relevant keywords',
          'Enhance technical skills section',
          'Improve achievement descriptions'
        ]
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Resume Analyzer</h2>
        <p className="text-muted-foreground">
          Get AI-powered insights and improve your resume's ATS compatibility
        </p>
      </div>

      {!analysisResult ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="resume-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                    {file && (
                      <div className="mt-4 flex items-center text-sm text-blue-600">
                        <FileText className="h-4 w-4 mr-2" />
                        {file.name}
                      </div>
                    )}
                  </div>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Job Description (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="job-description">
                  Paste the job description to get tailored keyword suggestions
                </Label>
                <textarea
                  id="job-description"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                  placeholder="Paste the job description here to get more accurate analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <div className="text-center">
            <Button
              onClick={analyzeResume}
              disabled={!file || isAnalyzing}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {analysisResult.overallScore}
                </div>
                <div className="text-xl text-muted-foreground">Overall ATS Score</div>
                <Progress value={analysisResult.overallScore} className="w-full max-w-md mx-auto" />
                <div className="text-sm text-muted-foreground">
                  Your resume has good potential with room for improvement
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Scores */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analysisResult.sections).map(([section, data]) => (
              <Card key={section}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm capitalize flex items-center justify-between">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                    {getScoreIcon(data.score)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                    {data.score}%
                  </div>
                  <Progress value={data.score} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>{suggestion}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setAnalysisResult(null)} variant="outline">
              Analyze Another Resume
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Download Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
