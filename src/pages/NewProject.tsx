
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import { addNewProject } from '@/data/mockProjects';
import { Project } from '@/lib/types';

// Imports from UI components
import AppLayout from '@/components/layout/AppLayout';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const NewProject: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projectTitle, setProjectTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('retail');
  const [clientWebsite, setClientWebsite] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectTitle || !clientName || !clientIndustry) {
      // You should add better validation and user feedback
      alert('Please fill out all required fields');
      return;
    }
    
    // Create new project object
    const newProject: Project = {
      id: `new_${Date.now()}_${uuidv4().substring(0, 8)}`,
      title: projectTitle,
      clientName,
      clientIndustry,
      clientWebsite,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: user?.id || 'anonymous',
      status: 'draft',
    };
    
    // Save to mock data store
    addNewProject(newProject);
    
    // Navigate to the project detail page with state to show the new project info
    navigate(`/projects/${newProject.id}`, {
      state: {
        newProjectTitle: projectTitle,
        newProjectClient: clientName,
        newProject: true
      }
    });
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Heading className="mb-8">Create New Project</Heading>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    placeholder="E.g., Retail Brand Gaming Strategy"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="E.g., Acme Corporation"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientIndustry">Client Industry *</Label>
                  <Select
                    value={clientIndustry}
                    onValueChange={setClientIndustry}
                  >
                    <SelectTrigger id="clientIndustry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="clientWebsite">Client Website</Label>
                  <Input
                    id="clientWebsite"
                    placeholder="E.g., www.acmecorp.com"
                    value={clientWebsite}
                    onChange={(e) => setClientWebsite(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the project"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NewProject;
