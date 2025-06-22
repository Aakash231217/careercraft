
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Globe, 
  Github, 
  Linkedin, 
  ExternalLink,
  MapPin,
  Calendar,
  Quote
} from 'lucide-react';

interface PortfolioData {
  headline: string;
  bio: string;
  languages: string[];
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    liveUrl?: string;
    githubUrl?: string;
  }>;
  companies: Array<{
    id: string;
    name: string;
    position: string;
    duration: string;
    description: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    position: string;
    company: string;
    text: string;
  }>;
  contact: {
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
  };
  customUrl: string;
}

interface PortfolioPreviewProps {
  portfolioData: PortfolioData;
}

const PortfolioPreview = ({ portfolioData }: PortfolioPreviewProps) => {
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
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto p-6"
      >
        {/* Hero Section */}
        <motion.section variants={itemVariants} className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
            {portfolioData.customUrl.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {portfolioData.customUrl.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Your Name'}
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            {portfolioData.headline || 'Your Professional Headline'}
          </p>
          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {portfolioData.bio || 'Your bio will appear here...'}
          </p>
        </motion.section>

        {/* Skills Section */}
        {portfolioData.languages.length > 0 && (
          <motion.section variants={itemVariants} className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Skills & Technologies</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {portfolioData.languages.map((language, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 border border-blue-200"
                >
                  {language}
                </Badge>
              ))}
            </div>
          </motion.section>
        )}

        {/* Projects Section */}
        {portfolioData.projects.length > 0 && (
          <motion.section variants={itemVariants} className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioData.projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {project.liveUrl && (
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Live Demo
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Github className="h-3 w-3" />
                          Code
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Experience Section */}
        {portfolioData.companies.length > 0 && (
          <motion.section variants={itemVariants} className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Work Experience</h2>
            <div className="space-y-8">
              {portfolioData.companies.map((company) => (
                <Card key={company.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{company.position}</h3>
                        <p className="text-lg text-blue-600 font-medium">{company.name}</p>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">{company.duration}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{company.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Testimonials Section */}
        {portfolioData.testimonials.length > 0 && (
          <motion.section variants={itemVariants} className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioData.testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="relative">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-blue-500 mb-4" />
                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                    <div className="border-t pt-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.position}</p>
                      <p className="text-sm text-blue-600">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Contact Section */}
        <motion.section variants={itemVariants} className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span>{portfolioData.contact.email}</span>
                  </div>
                )}
                {portfolioData.contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span>{portfolioData.contact.phone}</span>
                  </div>
                )}
                {portfolioData.contact.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <span>{portfolioData.contact.website}</span>
                  </div>
                )}
                {portfolioData.contact.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-blue-500" />
                    <span>LinkedIn Profile</span>
                  </div>
                )}
                {portfolioData.contact.github && (
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-blue-500" />
                    <span>GitHub Profile</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default PortfolioPreview;
