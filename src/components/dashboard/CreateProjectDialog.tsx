import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormData {
  title: string;
  clientName: string;
  clientIndustry: "retail" | "finance" | "technology" | "entertainment" | "other";
}

interface CreateProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  projectData: ProjectFormData;
  setProjectData: (data: ProjectFormData) => void;
  onCreateProject: () => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  isOpen,
  setIsOpen,
  projectData,
  setProjectData,
  onCreateProject
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleCreateProject = () => {
    try {
      // Validate required fields
      if (!projectData.title.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter a project title",
          variant: "destructive"
        });
        return;
      }

      if (!projectData.clientName.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter a client name",
          variant: "destructive"
        });
        return;
      }

      // Show success toast
      toast({
        title: "Creating project",
        description: "Your new project is being created...",
      });
      
      // Close the dialog
      setIsOpen(false);
      
      // Navigate to the new project page with params
      navigate(`/projects/new?title=${encodeURIComponent(projectData.title)}&client=${encodeURIComponent(projectData.clientName)}&industry=${projectData.clientIndustry}`);
      
      // Call the parent function to reset the form
      onCreateProject();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: "There was a problem creating your project. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 md:mt-0 bg-brand-orange hover:opacity-90 transition-opacity">
          <PlusCircle size={18} className="mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new strategic analysis project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input 
              id="title"
              placeholder="Enter project title"
              value={projectData.title}
              onChange={(e) => setProjectData({...projectData, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Client Name</Label>
            <Input 
              id="client"
              placeholder="Enter client name"
              value={projectData.clientName}
              onChange={(e) => setProjectData({...projectData, clientName: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select 
              value={projectData.clientIndustry}
              onValueChange={(value) => setProjectData({...projectData, clientIndustry: value as any})}
            >
              <SelectTrigger id="industry">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject}
            className="bg-brand-orange hover:opacity-90 transition-opacity"
            disabled={!projectData.title || !projectData.clientName}
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
