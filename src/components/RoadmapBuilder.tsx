import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Target, Calendar, CheckCircle, Clock, Trash2, Sparkles, MapPin, Users, BookOpen, Award, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDuration: string;
  priority: 'High' | 'Medium' | 'Low';
  skills: string[];
  successMetrics: string;
  resources: string;
  timeframe: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface CareerGoal {
  title: string;
  description: string;
  timeline: string;
  industry: string;
}

interface RoadmapData {
  careerGoal: CareerGoal;
  milestones: Omit<Milestone, 'id' | 'status'>[];
  skillFocus: string[];
  networkingStrategy: string;
  projectRecommendations: string[];
}

interface UserProfile {
  targetRole: string;
  currentRole: string;
  experience: string;
  industry: string;
  timeline: string;
  skills: string;
  interests: string;
  preferredLearningStyle: string;
  budget: string;
}

const RoadmapBuilder = () => {
  const { checkAndUseFeature } = useSubscription();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    targetRole: '',
    currentRole: '',
    experience: '',
    industry: '',
    timeline: '',
    skills: '',
    interests: '',
    preferredLearningStyle: '',
    budget: ''
  });

  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const { toast } = useToast();

  const experienceLevels = [
    '0-1 years (Entry Level)',
    '1-3 years (Junior)',
    '3-5 years (Mid-Level)',
    '5-8 years (Senior)',
    '8+ years (Expert/Lead)'
  ];

  const timelines = ['6 months', '1 year', '18 months', '2 years', '3+ years'];
  const learningStyles = ['Visual (videos, diagrams)', 'Reading (books, articles)', 'Hands-on (projects, practice)', 'Interactive (courses, workshops)', 'Mixed approach'];
  const budgetOptions = ['Free resources only', 'Low budget ($0-$500)', 'Medium budget ($500-$2000)', 'Higher budget ($2000+)'];

  const generateRoadmap = async () => {
    if (!userProfile.targetRole || !userProfile.industry) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least your target role and industry.",
        variant: "destructive",
      });
      return;
    }

    // Check subscription limit before generating roadmap
    const canUse = await checkAndUseFeature('roadmapGenerator');
    if (!canUse) return;

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: userProfile
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate roadmap');
      }

      if (data) {
        setRoadmapData(data);
        const milestonesWithStatus = data.milestones.map((milestone: any, index: number) => ({
          ...milestone,
          id: `ai-${index}`,
          status: 'not-started' as const
        }));
        setMilestones(milestonesWithStatus);
        setShowProfile(false);
        
        toast({
          title: "Roadmap Generated!",
          description: `Your personalized career roadmap for ${data.careerGoal.title} has been created.`,
        });
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate roadmap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateMilestoneStatus = (id: string, status: Milestone['status']) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, status } : m
    ));
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Target className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Education & Certification': return <BookOpen className="h-4 w-4" />;
      case 'Skill Development': return <Target className="h-4 w-4" />;
      case 'Experience & Projects': return <Briefcase className="h-4 w-4" />;
      case 'Networking': return <Users className="h-4 w-4" />;
      case 'Personal Branding': return <Award className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">AI Career Roadmap Builder</h2>
        <p className="text-muted-foreground">Get a personalized career development roadmap powered by AI</p>
      </div>

      {showProfile ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
              Tell us about your career goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target-role">Target Role *</Label>
                <Input
                  id="target-role"
                  value={userProfile.targetRole}
                  onChange={(e) => setUserProfile({...userProfile, targetRole: e.target.value})}
                  placeholder="e.g., Senior Software Engineer, Product Manager"
                />
              </div>
              <div>
                <Label htmlFor="current-role">Current Role</Label>
                <Input
                  id="current-role"
                  value={userProfile.currentRole}
                  onChange={(e) => setUserProfile({...userProfile, currentRole: e.target.value})}
                  placeholder="e.g., Junior Developer, Student"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={userProfile.experience} onValueChange={(value) => setUserProfile({...userProfile, experience: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={userProfile.industry}
                  onChange={(e) => setUserProfile({...userProfile, industry: e.target.value})}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select value={userProfile.timeline} onValueChange={(value) => setUserProfile({...userProfile, timeline: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="How long to achieve goal?" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelines.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget">Learning Budget</Label>
                <Select value={userProfile.budget} onValueChange={(value) => setUserProfile({...userProfile, budget: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Budget for courses/resources" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetOptions.map((budget) => (
                      <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Current Skills</Label>
              <Textarea
                id="skills"
                value={userProfile.skills}
                onChange={(e) => setUserProfile({...userProfile, skills: e.target.value})}
                placeholder="List your current skills, technologies, tools..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="interests">Interests & Preferences</Label>
              <Textarea
                id="interests"
                value={userProfile.interests}
                onChange={(e) => setUserProfile({...userProfile, interests: e.target.value})}
                placeholder="What aspects of work do you enjoy? Any specific areas you want to focus on?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="learning-style">Preferred Learning Style</Label>
              <Select value={userProfile.preferredLearningStyle} onValueChange={(value) => setUserProfile({...userProfile, preferredLearningStyle: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="How do you learn best?" />
                </SelectTrigger>
                <SelectContent>
                  {learningStyles.map((style) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center pt-4">
              <Button 
                onClick={generateRoadmap} 
                disabled={isGenerating}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Your Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Roadmap
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {roadmapData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Target className="mr-2 h-5 w-5 text-blue-600" />
                      Career Goal: {roadmapData.careerGoal.title}
                    </span>
                    <Button onClick={() => setShowProfile(true)} variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{roadmapData.careerGoal.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge variant="secondary">Timeline: {roadmapData.careerGoal.timeline}</Badge>
                    <Badge variant="secondary">Industry: {roadmapData.careerGoal.industry}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Key Skills */}
              {roadmapData.skillFocus && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      Key Skills to Develop
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {roadmapData.skillFocus.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Your Roadmap ({milestones.length} milestones)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="relative">
                        {index < milestones.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-20 bg-gray-200"></div>
                        )}
                        
                        <div className="flex space-x-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(milestone.status)}
                          </div>
                          <Card className="flex-1">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    {getCategoryIcon(milestone.category)}
                                    <Badge variant="outline" className="text-xs">{milestone.category}</Badge>
                                    <Badge className={`text-xs ${getPriorityColor(milestone.priority)}`}>
                                      {milestone.priority}
                                    </Badge>
                                  </div>
                                  <h3 className="font-semibold text-lg">{milestone.title}</h3>
                                  <p className="text-muted-foreground text-sm mb-2">{milestone.description}</p>
                                  
                                  {milestone.skills && milestone.skills.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">Skills:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {milestone.skills.map((skill, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="grid md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div><strong>Duration:</strong> {milestone.estimatedDuration}</div>
                                    <div><strong>Timeframe:</strong> {milestone.timeframe}</div>
                                  </div>
                                  
                                  {milestone.successMetrics && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-muted-foreground">Success Metrics:</p>
                                      <p className="text-xs">{milestone.successMetrics}</p>
                                    </div>
                                  )}
                                  
                                  {milestone.resources && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-muted-foreground">Resources:</p>
                                      <p className="text-xs">{milestone.resources}</p>
                                    </div>
                                  )}
                                </div>
                                <Select
                                  value={milestone.status}
                                  onValueChange={(value) => updateMilestoneStatus(milestone.id, value as Milestone['status'])}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not-started">Not Started</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Recommendations */}
              <div className="grid md:grid-cols-2 gap-6">
                {roadmapData.networkingStrategy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Networking Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{roadmapData.networkingStrategy}</p>
                    </CardContent>
                  </Card>
                )}

                {roadmapData.projectRecommendations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Project Ideas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {roadmapData.projectRecommendations.map((project, index) => (
                          <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                            {project}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {milestones.filter(m => m.status === 'not-started').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Not Started</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {milestones.filter(m => m.status === 'in-progress').length}
                      </div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {milestones.filter(m => m.status === 'completed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress 
                      value={(milestones.filter(m => m.status === 'completed').length / milestones.length) * 100} 
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapBuilder;
