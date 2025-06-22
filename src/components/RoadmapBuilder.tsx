
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
  skills: string[];
}

interface CareerGoal {
  title: string;
  description: string;
  timeline: string;
  industry: string;
}

const RoadmapBuilder = () => {
  const [careerGoal, setCareerGoal] = useState<CareerGoal>({
    title: '',
    description: '',
    timeline: '',
    industry: ''
  });

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Omit<Milestone, 'id'>>({
    title: '',
    description: '',
    category: '',
    targetDate: '',
    status: 'not-started',
    skills: []
  });

  const categories = [
    'Education & Certification',
    'Skill Development',
    'Experience & Projects',
    'Networking',
    'Personal Branding',
    'Career Milestone'
  ];

  const addMilestone = () => {
    if (newMilestone.title.trim()) {
      const milestone: Milestone = {
        ...newMilestone,
        id: Date.now().toString()
      };
      setMilestones([...milestones, milestone]);
      setNewMilestone({
        title: '',
        description: '',
        category: '',
        targetDate: '',
        status: 'not-started',
        skills: []
      });
      setShowAddMilestone(false);
    }
  };

  const updateMilestoneStatus = (id: string, status: Milestone['status']) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, status } : m
    ));
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateSampleRoadmap = () => {
    const sampleGoal: CareerGoal = {
      title: 'Senior Software Engineer',
      description: 'Advance to a senior software engineering role with leadership responsibilities',
      timeline: '18 months',
      industry: 'Technology'
    };

    const sampleMilestones: Milestone[] = [
      {
        id: '1',
        title: 'Complete Advanced React Course',
        description: 'Master React hooks, context, and performance optimization',
        category: 'Education & Certification',
        targetDate: '2024-03-15',
        status: 'in-progress',
        skills: ['React', 'JavaScript', 'Web Development']
      },
      {
        id: '2',
        title: 'Build Portfolio Project',
        description: 'Create a full-stack application using modern technologies',
        category: 'Experience & Projects',
        targetDate: '2024-05-01',
        status: 'not-started',
        skills: ['Full-Stack Development', 'Project Management']
      },
      {
        id: '3',
        title: 'Obtain AWS Certification',
        description: 'Get AWS Developer Associate certification',
        category: 'Education & Certification',
        targetDate: '2024-06-30',
        status: 'not-started',
        skills: ['AWS', 'Cloud Computing', 'DevOps']
      },
      {
        id: '4',
        title: 'Lead a Team Project',
        description: 'Take leadership role in a significant project at work',
        category: 'Career Milestone',
        targetDate: '2024-08-15',
        status: 'not-started',
        skills: ['Leadership', 'Project Management', 'Communication']
      }
    ];

    setCareerGoal(sampleGoal);
    setMilestones(sampleMilestones);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Career Roadmap Builder</h2>
          <p className="text-muted-foreground">Plan your career journey with clear milestones and goals</p>
        </div>
        <Button onClick={generateSampleRoadmap} variant="outline">
          Load Sample Roadmap
        </Button>
      </div>

      {/* Career Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Career Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                value={careerGoal.title}
                onChange={(e) => setCareerGoal({...careerGoal, title: e.target.value})}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={careerGoal.industry} onValueChange={(value) => setCareerGoal({...careerGoal, industry: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="goal-description">Description</Label>
            <Textarea
              id="goal-description"
              value={careerGoal.description}
              onChange={(e) => setCareerGoal({...careerGoal, description: e.target.value})}
              placeholder="Describe your career goal and what you want to achieve..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              value={careerGoal.timeline}
              onChange={(e) => setCareerGoal({...careerGoal, timeline: e.target.value})}
              placeholder="e.g., 12 months, 2 years"
            />
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Milestones ({milestones.length})
            </span>
            <Button onClick={() => setShowAddMilestone(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Milestone
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No milestones yet. Add your first milestone to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {/* Timeline line */}
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(milestone.status)}
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{milestone.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{milestone.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
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
                            <Button
                              onClick={() => removeMilestone(milestone.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{milestone.category}</Badge>
                          {milestone.targetDate && (
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(milestone.targetDate).toLocaleDateString()}
                            </Badge>
                          )}
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        {milestone.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {milestone.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Milestone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="milestone-title">Title</Label>
                <Input
                  id="milestone-title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                  placeholder="Milestone title"
                />
              </div>
              <div>
                <Label htmlFor="milestone-description">Description</Label>
                <Textarea
                  id="milestone-description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                  placeholder="Describe this milestone..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="milestone-category">Category</Label>
                <Select value={newMilestone.category} onValueChange={(value) => setNewMilestone({...newMilestone, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="milestone-date">Target Date</Label>
                <Input
                  id="milestone-date"
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddMilestone(false)}>
                  Cancel
                </Button>
                <Button onClick={addMilestone}>
                  Add Milestone
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Summary */}
      {milestones.length > 0 && (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoadmapBuilder;
