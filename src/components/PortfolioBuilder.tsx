
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Code, 
  Briefcase, 
  MessageSquare, 
  Phone, 
  Globe,
  Plus,
  Trash2,
  Eye,
  Share2,
  Copy,
  CheckCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PortfolioPreview from './PortfolioPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { deployPortfolio, getDeploymentStatus, downloadPortfolioZip } from '@/api/portfolio-api';
import { PortfolioData, DeploymentInfo } from '@/types/portfolio-types';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

interface Company {
  id: string;
  name: string;
  position: string;
  duration: string;
  description: string;
}

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  text: string;
  avatar?: string;
}

interface PortfolioData {
  headline: string;
  bio: string;
  languages: string[];
  projects: Project[];
  companies: Company[];
  testimonials: Testimonial[];
  contact: {
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
  };
  customUrl: string;
}

const PortfolioBuilder = () => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [deploymentId, setDeploymentId] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentInfo | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    headline: '',
    bio: '',
    languages: [],
    projects: [],
    companies: [],
    testimonials: [],
    contact: {
      email: '',
      phone: '',
      website: '',
      linkedin: '',
      github: ''
    },
    customUrl: ''
  });

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: [],
      liveUrl: '',
      githubUrl: ''
    };
    setPortfolioData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: prev.projects.map(project =>
        project.id === id ? { ...project, ...updatedProject } : project
      )
    }));
  };

  const removeProject = (id: string) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const addCompany = () => {
    const newCompany: Company = {
      id: Date.now().toString(),
      name: '',
      position: '',
      duration: '',
      description: ''
    };
    setPortfolioData(prev => ({
      ...prev,
      companies: [...prev.companies, newCompany]
    }));
  };

  const updateCompany = (id: string, updatedCompany: Partial<Company>) => {
    setPortfolioData(prev => ({
      ...prev,
      companies: prev.companies.map(company =>
        company.id === id ? { ...company, ...updatedCompany } : company
      )
    }));
  };

  const removeCompany = (id: string) => {
    setPortfolioData(prev => ({
      ...prev,
      companies: prev.companies.filter(company => company.id !== id)
    }));
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      position: '',
      company: '',
      text: ''
    };
    setPortfolioData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }));
  };

  const updateTestimonial = (id: string, updatedTestimonial: Partial<Testimonial>) => {
    setPortfolioData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(testimonial =>
        testimonial.id === id ? { ...testimonial, ...updatedTestimonial } : testimonial
      )
    }));
  };

  const removeTestimonial = (id: string) => {
    setPortfolioData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(testimonial => testimonial.id !== id)
    }));
  };

  const handlePublish = async () => {
    if (!portfolioData.customUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a custom URL for your portfolio.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    setShowDeployDialog(true);
    
    try {
      // Deploy the portfolio using our API
      const deploymentResult = await deployPortfolio(portfolioData);
      
      setDeploymentId(deploymentResult.id);
      setPublishedUrl(deploymentResult.url);
      setDeploymentStatus({
        id: deploymentResult.id,
        url: deploymentResult.url,
        status: 'deployed',
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Portfolio Published!",
        description: `Your portfolio is now live and ready to share with others.`,
      });
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "There was an error publishing your portfolio. Please try again.",
        variant: "destructive",
      });
      setShowDeployDialog(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setLinkCopied(true);
      
      toast({
        title: "Link Copied!",
        description: "The portfolio URL has been copied to your clipboard.",
      });
      
      // Reset copy indicator after 3 seconds
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  const handleOpenSite = () => {
    if (publishedUrl) {
      window.open(publishedUrl, '_blank');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Portfolio Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Create a stunning professional portfolio that showcases your skills and experience
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex space-x-4 mb-8">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            className="flex items-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          
          <Button
            onClick={handlePublish}
            className="flex items-center"
            disabled={isPublishing}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isPublishing ? 
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</> : 
              (deploymentStatus?.status === 'deployed' ? 'Update Site' : 'Publish Site')
            }
          </Button>
          
          <Button
            onClick={() => downloadPortfolioZip(portfolioData)}
            variant="secondary"
            className="flex items-center"
          >
            Download Portfolio Code
          </Button>
          
          {deploymentStatus?.status === 'deployed' && (
            <Button
              onClick={handleOpenSite}
              variant="secondary"
              className="flex items-center"
            >
              <Globe className="mr-2 h-4 w-4" />
              View Live Site
            </Button>
          )}
        </motion.div>

        {publishedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-green-800 font-medium">
                  🎉 Portfolio Published Successfully!
                </p>
                <p className="text-green-600 mt-2">
                  Visit: <span className="font-mono font-bold">{publishedUrl}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Portfolio Builder Form */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-white/50 dark:bg-gray-800/50">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="experience" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Testimonials
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      id="headline"
                      placeholder="e.g., Full Stack Developer | React Expert | Problem Solver"
                      value={portfolioData.headline}
                      onChange={(e) => setPortfolioData(prev => ({ ...prev, headline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio / About Me</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell visitors about yourself, your passion, and what makes you unique..."
                      value={portfolioData.bio}
                      onChange={(e) => setPortfolioData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customUrl">Custom Portfolio URL</Label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">lovable.dev/</span>
                      <Input
                        id="customUrl"
                        placeholder="your-name"
                        value={portfolioData.customUrl}
                        onChange={(e) => setPortfolioData(prev => ({ ...prev, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      />
                      <span className="text-sm text-gray-500 ml-2">-portfolio</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Programming Languages & Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="languages">Languages (comma-separated)</Label>
                    <Input
                      id="languages"
                      placeholder="JavaScript, TypeScript, Python, React, Node.js..."
                      value={portfolioData.languages.join(', ')}
                      onChange={(e) => setPortfolioData(prev => ({ 
                        ...prev, 
                        languages: e.target.value.split(',').map(lang => lang.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Projects</h3>
                <Button onClick={addProject} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
              
              {portfolioData.projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Project Details</CardTitle>
                      <Button
                        onClick={() => removeProject(project.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Project Title</Label>
                      <Input
                        placeholder="Project name"
                        value={project.title}
                        onChange={(e) => updateProject(project.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe what this project does and your role in it..."
                        value={project.description}
                        onChange={(e) => updateProject(project.id, { description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Technologies Used</Label>
                      <Input
                        placeholder="React, TypeScript, Node.js, MongoDB..."
                        value={project.technologies.join(', ')}
                        onChange={(e) => updateProject(project.id, { 
                          technologies: e.target.value.split(',').map(tech => tech.trim()).filter(Boolean)
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Live URL (optional)</Label>
                        <Input
                          placeholder="https://project-demo.com"
                          value={project.liveUrl || ''}
                          onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>GitHub URL (optional)</Label>
                        <Input
                          placeholder="https://github.com/username/project"
                          value={project.githubUrl || ''}
                          onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button onClick={addCompany} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
              </div>
              
              {portfolioData.companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Work Experience</CardTitle>
                      <Button
                        onClick={() => removeCompany(company.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Company Name</Label>
                        <Input
                          placeholder="Company name"
                          value={company.name}
                          onChange={(e) => updateCompany(company.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          placeholder="Your role/position"
                          value={company.position}
                          onChange={(e) => updateCompany(company.id, { position: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., Jan 2022 - Present"
                        value={company.duration}
                        onChange={(e) => updateCompany(company.id, { duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe your responsibilities and achievements..."
                        value={company.description}
                        onChange={(e) => updateCompany(company.id, { description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Testimonials (Optional)</h3>
                <Button onClick={addTestimonial} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Testimonial
                </Button>
              </div>
              
              {portfolioData.testimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Testimonial</CardTitle>
                      <Button
                        onClick={() => removeTestimonial(testimonial.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Testimonial Text</Label>
                      <Textarea
                        placeholder="What did this person say about working with you?"
                        value={testimonial.text}
                        onChange={(e) => updateTestimonial(testimonial.id, { text: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          placeholder="Full name"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(testimonial.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          placeholder="Job title"
                          value={testimonial.position}
                          onChange={(e) => updateTestimonial(testimonial.id, { position: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          placeholder="Company name"
                          value={testimonial.company}
                          onChange={(e) => updateTestimonial(testimonial.id, { company: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={portfolioData.contact.email}
                        onChange={(e) => setPortfolioData(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, email: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={portfolioData.contact.phone}
                        onChange={(e) => setPortfolioData(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, phone: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website (optional)</Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        value={portfolioData.contact.website}
                        onChange={(e) => setPortfolioData(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, website: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={portfolioData.contact.linkedin}
                        onChange={(e) => setPortfolioData(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, linkedin: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/yourusername"
                      value={portfolioData.contact.github}
                      onChange={(e) => setPortfolioData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, github: e.target.value }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Portfolio Preview</DialogTitle>
            </DialogHeader>
            <PortfolioPreview portfolioData={portfolioData} />
          </DialogContent>
        </Dialog>

        {/* Deployment Dialog */}
        <Dialog open={showDeployDialog} onOpenChange={(open) => {
          if (!isPublishing) setShowDeployDialog(open);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {deploymentStatus?.status === 'deployed' ? 'Your Portfolio is Live!' : 'Publishing Portfolio...'}
              </DialogTitle>
              <DialogDescription>
                {deploymentStatus?.status === 'deployed' 
                  ? 'Your portfolio has been successfully published. Share it with others using the link below.'
                  : 'Please wait while we deploy your portfolio site...'}
              </DialogDescription>
            </DialogHeader>

            {isPublishing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p>Deploying your portfolio...</p>
              </div>
            ) : deploymentStatus?.status === 'deployed' ? (
              <>
                <div className="flex flex-col space-y-6 py-4">
                  <Card className="border-dashed">
                    <CardContent className="pt-6 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{publishedUrl}</p>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleCopyLink}
                            className="h-8 w-8"
                          >
                            {linkCopied ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <Copy className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleOpenSite}
                            className="h-8 w-8"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex flex-col space-y-2">
                    <h4 className="text-sm font-semibold">How to share your portfolio:</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Copy the link above and share it via email or messages</li>
                      <li>Add it to your resume and job applications</li>
                      <li>Share it on your social media profiles</li>
                    </ul>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setShowDeployDialog(false)}>Close</Button>
                </DialogFooter>
              </>
            ) : null}

            {deploymentStatus?.status === 'failed' && (
              <>
                <div className="py-4 text-center">
                  <p className="text-destructive">Publishing failed. Please try again.</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeployDialog(false)}>Close</Button>
                  <Button onClick={handlePublish}>Retry</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default PortfolioBuilder;
