
import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Image as ImageIcon } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

const statusColors = {
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200"
};

const industryIcons: Record<string, string> = {
  retail: "🛍️",
  finance: "💰",
  technology: "💻",
  entertainment: "🎮",
  other: "📊"
};

// Generic fallback images by industry
const fallbackImages: Record<string, string> = {
  retail: "/lovable-uploads/6d7ce806-44e1-437e-8a15-81ec129c8d0b.png", // User's uploaded image
  finance: "https://images.unsplash.com/photo-1638913662295-9630035ef770?q=80&w=2070",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  entertainment: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071",
  other: "https://images.unsplash.com/photo-1561357747-a5b8151f2b9f?q=80&w=1986"
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  className 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    console.log("Navigating to project:", project.id);
    navigate(`/project/${project.id}`);
  };

  // Determine the image to use - project cover image or fallback based on industry
  const coverImage = project.coverImage || fallbackImages[project.clientIndustry] || fallbackImages.other;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md group",
        className
      )}
    >
      <div 
        className="h-40 w-full overflow-hidden bg-gradient-to-r from-slate-200 to-slate-300 relative"
      >
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={project.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-slate-200">
            <ImageIcon className="h-12 w-12 text-slate-400" />
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          {project.status && (
            <Badge className={cn("font-normal text-xs", statusColors[project.status])}>
              {project.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          )}
          <span className="text-xl" aria-hidden="true">
            {industryIcons[project.clientIndustry]}
          </span>
        </div>
        <h3 className="text-lg font-semibold line-clamp-1">{project.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{project.clientName}</p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-2">
        <p className="text-xs text-slate-500">
          Last updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-brand-blue group-hover:text-brand-orange transition-colors"
          onClick={handleClick}
        >
          View Project
          <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
