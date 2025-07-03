import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Download, Eye, Wand2, Copy, CheckCircle } from 'lucide-react';
import DownloadModal from '@/components/DownloadModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

interface CoverLetterData {
  recipientName: string;
  companyName: string;
  position: string;
  yourName: string;
  yourEmail: string;
  yourPhone: string;
  yourAddress: string;
  jobDescription: string;
  tone: string;
  experience: string;
  motivation: string;
}

const CoverLetterBuilder = () => {
  const [formData, setFormData] = useState<CoverLetterData>({
    recipientName: '',
    companyName: '',
    position: '',
    yourName: '',
    yourEmail: '',
    yourPhone: '',
    yourAddress: '',
    jobDescription: '',
    tone: 'professional',
    experience: '',
    motivation: ''
  });

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [copied, setCopied] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const { toast } = useToast();
  const { checkAndUseFeature } = useSubscription();

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'confident', label: 'Confident' },
    { value: 'creative', label: 'Creative' },
    { value: 'formal', label: 'Formal' }
  ];

  const updateField = (field: keyof CoverLetterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCoverLetter = async () => {
    // Validate required fields
    if (!formData.companyName.trim() || !formData.position.trim() || !formData.yourName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least Company Name, Position, and Your Name to generate a cover letter.",
        variant: "destructive",
      });
      return;
    }

    // Check subscription limit before generating
    const canUse = await checkAndUseFeature('coverLetters');
    if (!canUse) return;

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          recipientName: formData.recipientName,
          companyName: formData.companyName,
          position: formData.position,
          yourName: formData.yourName,
          yourEmail: formData.yourEmail,
          yourPhone: formData.yourPhone,
          yourAddress: formData.yourAddress,
          jobDescription: formData.jobDescription,
          tone: formData.tone,
          experience: formData.experience,
          motivation: formData.motivation
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate cover letter');
      }

      if (!data?.coverLetter) {
        throw new Error('No cover letter content received');
      }

      setGeneratedLetter(data.coverLetter);
      setActiveTab('preview');
      
      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter has been created using AI.",
      });

    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const loadSampleData = () => {
    setFormData({
      recipientName: "Hiring Manager",
      companyName: "Tech Innovations Inc.",
      position: "Senior Software Engineer",
      yourName: "Jane Doe",
      yourEmail: "jane.doe@email.com",
      yourPhone: "+1 (555) 123-4567",
      yourAddress: "123 Main St, San Francisco, CA 94105",
      jobDescription: "We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies...",
      tone: "professional",
      experience: "I have 6 years of experience in full-stack development, specializing in React and Node.js. I've led teams and delivered multiple enterprise-level applications.",
      motivation: "I'm excited about the opportunity to work at Tech Innovations because of your commitment to cutting-edge technology and innovative solutions."
    });
  };

  const handleDownload = () => {
    if (!generatedLetter) {
      toast({
        title: "No letter to download",
        description: "Please generate a cover letter first before downloading.",
        variant: "destructive",
      });
      return;
    }
    console.log('Opening download modal for cover letter');
    setShowDownloadModal(true);
  };

  const downloadAsTextFile = () => {
    if (!generatedLetter) return;
    
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cover-letter-${formData.companyName || 'company'}-${formData.position || 'position'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your cover letter is being downloaded as a text file.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Cover Letter Builder</h2>
          <p className="text-muted-foreground">Create personalized cover letters for any job application</p>
        </div>
        <Button onClick={loadSampleData} variant="outline">
          Load Sample Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Build Letter</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedLetter}>
            Preview & Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="your-name">Your Full Name</Label>
                <Input
                  id="your-name"
                  value={formData.yourName}
                  onChange={(e) => updateField('yourName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="your-email">Your Email</Label>
                <Input
                  id="your-email"
                  type="email"
                  value={formData.yourEmail}
                  onChange={(e) => updateField('yourEmail', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="your-phone">Your Phone</Label>
                <Input
                  id="your-phone"
                  value={formData.yourPhone}
                  onChange={(e) => updateField('yourPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="your-address">Your Address (Optional)</Label>
                <Input
                  id="your-address"
                  value={formData.yourAddress}
                  onChange={(e) => updateField('yourAddress', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Acme Corporation"
                />
              </div>
              <div>
                <Label htmlFor="position">Position Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="recipient-name">Hiring Manager Name (Optional)</Label>
                <Input
                  id="recipient-name"
                  value={formData.recipientName}
                  onChange={(e) => updateField('recipientName', e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Customization */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Letter Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tone">Writing Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => updateField('tone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience">Your Relevant Experience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    placeholder="Describe your relevant experience and skills..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="motivation">Why You're Interested</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => updateField('motivation', e.target.value)}
                    placeholder="Explain why you're interested in this role and company..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="job-description">Job Description (Optional)</Label>
                  <Textarea
                    id="job-description"
                    value={formData.jobDescription}
                    onChange={(e) => updateField('jobDescription', e.target.value)}
                    placeholder="Paste the job description here to get more tailored content..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={generateCoverLetter}
                disabled={isGenerating || !formData.yourName || !formData.companyName || !formData.position}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Letter...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedLetter && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Your Cover Letter</h3>
                <div className="space-x-2">
                  <Button onClick={copyToClipboard} variant="outline">
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Text
                      </>
                    )}
                  </Button>
                  <Button onClick={downloadAsTextFile} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Quick Download (.txt)
                  </Button>
                  <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download Options
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                      {generatedLetter}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button onClick={() => setActiveTab('form')} variant="outline">
                  Edit Letter
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Download Modal */}
      <DownloadModal 
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        documentType="Cover Letter"
        content={generatedLetter}
      />
    </div>
  );
};

export default CoverLetterBuilder;
