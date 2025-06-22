import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Download, Eye, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface Experience {
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string;
  link: string;
}

interface CustomSection {
  title: string;
  content: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  customSections: CustomSection[];
}

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [''],
    education: [{ degree: '', school: '', year: '' }],
    experience: [{ position: '', company: '', duration: '', description: '' }],
    projects: [{ title: '', description: '', technologies: '', link: '' }],
    customSections: [{ title: '', content: '' }]
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string>('');
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const resumeContentRef = useRef<HTMLDivElement>(null); // Add this line


  const generateWithAI = async (prompt: string, field: string) => {
    setIsGenerating(true);
    setGeneratingField(field);

    try {
      const { data, error } = await supabase.functions.invoke('generate-resume-content', {
        body: { prompt, resumeData }
      });

      if (error) throw error;

      return data.content;
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
      setGeneratingField('');
    }
  };

  const generateSummary = async () => {
    const prompt = `Generate a professional summary for a resume based on the following information:
    - Name: ${resumeData.fullName}
    - Skills: ${resumeData.skills.filter(s => s.trim()).join(', ')}
    - Experience: ${resumeData.experience.map(exp => `${exp.position} at ${exp.company}`).join(', ')}
    
    Create a 2-3 sentence professional summary that highlights key strengths and career focus.`;

    const content = await generateWithAI(prompt, 'summary');
    if (content) {
      setResumeData(prev => ({ ...prev, summary: content }));
      toast({
        title: "Success",
        description: "Professional summary generated successfully!",
      });
    }
  };

  const generateJobDescription = async (index: number) => {
    const exp = resumeData.experience[index];
    const prompt = `Generate a professional job description for a resume with the following details:
    - Position: ${exp.position}
    - Company: ${exp.company}
    - Duration: ${exp.duration}
    
    Create 2-3 bullet points highlighting key responsibilities and achievements. Focus on quantifiable results and impact.`;

    const content = await generateWithAI(prompt, `experience-${index}`);
    if (content) {
      updateExperience(index, 'description', content);
      toast({
        title: "Success",
        description: "Job description generated successfully!",
      });
    }
  };

  const generateProjectDescription = async (index: number) => {
    const project = resumeData.projects[index];
    const prompt = `Generate a professional project description for a resume with the following details:
    - Project: ${project.title}
    - Technologies: ${project.technologies}
    
    Create a 2-3 sentence description highlighting the project's purpose, your role, and key achievements or technologies used.`;

    const content = await generateWithAI(prompt, `project-${index}`);
    if (content) {
      updateProject(index, 'description', content);
      toast({
        title: "Success",
        description: "Project description generated successfully!",
      });
    }
  };

  const generateSkillsSuggestions = async () => {
    const prompt = `Based on the following resume information, suggest 8-10 relevant technical and soft skills:
    - Position: ${resumeData.experience.map(exp => exp.position).join(', ')}
    - Education: ${resumeData.education.map(edu => edu.degree).join(', ')}
    - Current skills: ${resumeData.skills.filter(s => s.trim()).join(', ')}
    
    Return only the skills as a comma-separated list, focusing on both technical and professional skills relevant to the roles.`;

    const content = await generateWithAI(prompt, 'skills');
    if (content) {
      const newSkills = content.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill);
      setResumeData(prev => ({ ...prev, skills: newSkills }));
      toast({
        title: "Success",
        description: "Skills suggestions generated successfully!",
      });
    }
  };

  const updateBasicInfo = (field: keyof ResumeData, value: string) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const updateSkills = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { position: '', company: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologies: '', link: '' }]
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const updateCustomSection = (index: number, field: keyof CustomSection, value: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const addCustomSection = () => {
    setResumeData(prev => ({
      ...prev,
      customSections: [...prev.customSections, { title: '', content: '' }]
    }));
  };

  const removeCustomSection = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.filter((_, i) => i !== index)
    }));
  };

  const generatePDF = () => {
    try {
      if (!resumeContentRef.current) {
        throw new Error('Resume content not found');
      }

      toast({
        title: 'Preparing download',
        description: 'Your resume is being prepared for download...',
      });

      // Get the resume element with all its styling
      const element = resumeContentRef.current;
      
      // Configure jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });
      
      // Set the scale to fit the content nicely on the PDF
      const scale = 0.75;
      
      // Set page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Create a canvas from the resume element
      html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        allowTaint: true
      }).then(canvas => {
        // Calculate dimensions for centering
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = canvas.height * pageWidth / canvas.width;
        
        // Add image to PDF, centered
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save(`${resumeData.fullName ? resumeData.fullName.replace(/\s+/g, '_') : 'resume'}_${Date.now()}.pdf`);
        
        toast({
          title: 'Download started',
          description: 'Your resume is being downloaded as a PDF file.',
        });
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download failed',
        description: 'There was an error downloading your resume. Please try again.',
        variant: 'destructive',
      });
    }
};

  if (showPreview) {
    return (
      <div className="space-y-6" ref={resumeRef}>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Resume Preview</h2>
          <div className="space-x-2">
            <Button onClick={() => setShowPreview(false)} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8" ref={resumeContentRef}>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{resumeData.fullName || 'Your Name'}</h1>
              <div className="flex justify-center space-x-4 text-gray-600 mt-2">
                <span>{resumeData.email}</span>
                <span>{resumeData.phone}</span>
                <span>{resumeData.location}</span>
              </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                  Professional Summary
                </h2>
                <p className="text-gray-700">{resumeData.summary}</p>
              </div>
            )}

            {/* Skills */}
            {resumeData.skills.filter(skill => skill.trim()).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.filter(skill => skill.trim()).map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience.filter(exp => exp.position.trim()).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                  Experience
                </h2>
                {resumeData.experience.filter(exp => exp.position.trim()).map((exp, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{exp.position}</h3>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-gray-600 text-sm">{exp.duration}</span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {resumeData.projects.filter(project => project.title.trim()).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                  Projects
                </h2>
                {resumeData.projects.filter(project => project.title.trim()).map((project, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-800">{project.title}</h3>
                      {project.link && (
                        <a href={project.link} className="text-blue-600 text-sm hover:underline">
                          View Project
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-700 mt-2">{project.description}</p>
                    )}
                    {project.technologies && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Technologies:</strong> {project.technologies}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {resumeData.education.filter(edu => edu.degree.trim()).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                  Education
                </h2>
                {resumeData.education.filter(edu => edu.degree.trim()).map((edu, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{edu.degree}</h3>
                        <p className="text-blue-600">{edu.school}</p>
                      </div>
                      <span className="text-gray-600">{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Sections */}
            {resumeData.customSections.filter(section => section.title.trim()).length > 0 && (
              <div className="mb-6">
                {resumeData.customSections.filter(section => section.title.trim()).map((section, index) => (
                  <div key={index} className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                      {section.title}
                    </h2>
                    <p className="text-gray-700">{section.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">AI-Powered Resume Builder</h2>
        <Button onClick={() => setShowPreview(true)} className="bg-blue-600 hover:bg-blue-700">
          <Eye className="mr-2 h-4 w-4" />
          Preview Resume
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={resumeData.fullName}
                  onChange={(e) => updateBasicInfo('fullName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.email}
                  onChange={(e) => updateBasicInfo('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.phone}
                  onChange={(e) => updateBasicInfo('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={resumeData.location}
                  onChange={(e) => updateBasicInfo('location', e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Professional Summary
                <Button 
                  onClick={generateSummary} 
                  size="sm" 
                  variant="outline"
                  disabled={isGenerating || !resumeData.fullName.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                >
                  {isGenerating && generatingField === 'summary' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="ml-1">AI Generate</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="summary"
                value={resumeData.summary}
                onChange={(e) => updateBasicInfo('summary', e.target.value)}
                placeholder="A brief summary of your professional background..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Skills
                <div className="space-x-2">
                  <Button 
                    onClick={generateSkillsSuggestions} 
                    size="sm" 
                    variant="outline"
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                  >
                    {isGenerating && generatingField === 'skills' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span className="ml-1">AI Suggest</span>
                  </Button>
                  <Button onClick={addSkill} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumeData.skills.map((skill, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkills(index, e.target.value)}
                    placeholder="e.g., JavaScript, Project Management"
                  />
                  {resumeData.skills.length > 1 && (
                    <Button
                      onClick={() => removeSkill(index)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Projects
                <Button onClick={addProject} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Project {index + 1}</h4>
                    {resumeData.projects.length > 1 && (
                      <Button
                        onClick={() => removeProject(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Project Title</Label>
                    <Input
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                      placeholder="E-commerce Website"
                    />
                  </div>
                  <div>
                    <Label className="flex justify-between items-center">
                      Description
                      <Button 
                        onClick={() => generateProjectDescription(index)} 
                        size="sm" 
                        variant="outline"
                        disabled={isGenerating || !project.title.trim()}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                      >
                        {isGenerating && generatingField === `project-${index}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        <span className="ml-1">AI Generate</span>
                      </Button>
                    </Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      placeholder="Describe what you built and your role..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Technologies Used</Label>
                    <Input
                      value={project.technologies}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div>
                    <Label>Project Link</Label>
                    <Input
                      value={project.link}
                      onChange={(e) => updateProject(index, 'link', e.target.value)}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                  {index < resumeData.projects.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Work Experience
                <Button onClick={addExperience} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    {resumeData.experience.length > 1 && (
                      <Button
                        onClick={() => removeExperience(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="Tech Corp"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                  <div>
                    <Label className="flex justify-between items-center">
                      Description
                      <Button 
                        onClick={() => generateJobDescription(index)} 
                        size="sm" 
                        variant="outline"
                        disabled={isGenerating || !exp.position.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                      >
                        {isGenerating && generatingField === `experience-${index}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        <span className="ml-1">AI Generate</span>
                      </Button>
                    </Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="Describe your key responsibilities and achievements..."
                      rows={3}
                    />
                  </div>
                  {index < resumeData.experience.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Education
                <Button onClick={addEducation} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    {resumeData.education.length > 1 && (
                      <Button
                        onClick={() => removeEducation(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>School</Label>
                      <Input
                        value={edu.school}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        placeholder="2020"
                      />
                    </div>
                  </div>
                  {index < resumeData.education.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Custom Sections
                <Button onClick={addCustomSection} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.customSections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Custom Section {index + 1}</h4>
                    {resumeData.customSections.length > 1 && (
                      <Button
                        onClick={() => removeCustomSection(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateCustomSection(index, 'title', e.target.value)}
                      placeholder="e.g., Certifications, Awards, Volunteer Work"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateCustomSection(index, 'content', e.target.value)}
                      placeholder="Add the content for this section..."
                      rows={4}
                    />
                  </div>
                  {index < resumeData.customSections.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;