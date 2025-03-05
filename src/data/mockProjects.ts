
import { Project } from "@/lib/types";

// Track newly created projects in localStorage instead of sessionStorage for better persistence
const getNewProjects = (): Project[] => {
  try {
    const storedProjects = localStorage.getItem('newProjects');
    return storedProjects ? JSON.parse(storedProjects) : [];
  } catch (e) {
    console.error("Error loading projects from localStorage:", e);
    return [];
  }
};

// Base mock projects with ISO string dates
const BASE_MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "MegaMart Gaming Strategy",
    clientName: "MegaMart Retail",
    clientIndustry: "retail",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    ownerId: "1",
    description: "Gaming strategy for MegaMart retail chain",
    status: "in_progress",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    createdBy: "1",
    collaborators: ["2"],
    clientWebsite: "megamart.example.com"
  },
  {
    id: "2",
    title: "NextGen Bank Gaming Activation",
    clientName: "NextGen Financial",
    clientIndustry: "finance",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    ownerId: "1",
    description: "Gaming activation strategy for NextGen Financial",
    status: "draft",
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    createdBy: "1",
    collaborators: [],
    clientWebsite: "nextgen.example.com"
  },
  {
    id: "3",
    title: "TechCorp Gaming Launch",
    clientName: "TechCorp Inc.",
    clientIndustry: "technology",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    ownerId: "1",
    description: "Gaming launch strategy for TechCorp",
    status: "completed",
    coverImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    createdBy: "1",
    collaborators: ["2"],
    clientWebsite: "techcorp.example.com"
  }
];

// Get all projects with guaranteed deduplication
export const getAllProjects = (): Project[] => {
  try {
    // Get new projects from localStorage
    const newProjects = getNewProjects();
    
    // Create a Map with project IDs as keys for efficient deduplication
    const projectMap = new Map<string, Project>();
    
    // Add new projects first (these take precedence over base projects)
    newProjects.forEach(project => {
      if (project && project.id) {
        projectMap.set(project.id, project);
      }
    });
    
    // Then add base projects only if they don't already exist in the map
    BASE_MOCK_PROJECTS.forEach(project => {
      if (!projectMap.has(project.id)) {
        projectMap.set(project.id, project);
      }
    });
    
    // Convert map values to array
    const allProjects = Array.from(projectMap.values());
    
    // Log project count for debugging
    console.log(`getAllProjects: Returned ${allProjects.length} unique projects from ${newProjects.length} new and ${BASE_MOCK_PROJECTS.length} base projects`);
    
    return allProjects;
  } catch (e) {
    console.error("Error in getAllProjects:", e);
    return [...BASE_MOCK_PROJECTS]; // Fallback to base projects
  }
};

// Helper function to add a new project
export const addNewProject = (project: Project): void => {
  try {
    const newProjects = getNewProjects();
    
    // Check if project with this ID already exists
    const existingIndex = newProjects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      // Update existing project
      newProjects[existingIndex] = project;
    } else {
      // Add new project to beginning
      newProjects.unshift(project);
    }
    
    localStorage.setItem('newProjects', JSON.stringify(newProjects));
    console.log(`Saved project to localStorage: ${project.id}`);
  } catch (e) {
    console.error("Error saving project to localStorage:", e);
  }
};

// Helper to find a project by ID
export const findProjectById = (id: string): Project | undefined => {
  if (!id) {
    console.error("findProjectById called with empty ID");
    return undefined;
  }
  
  // Get all projects including new ones from storage
  const allProjects = getAllProjects();
  
  // First check in all projects
  const project = allProjects.find(p => p.id === id);
  
  if (project) {
    console.log(`Found project: ${project.title} (ID: ${id})`);
    return project;
  }
  
  // If not found, log debug info
  console.error(`Project not found with ID: ${id}`);
  console.log("Available project IDs:", allProjects.map(p => p.id).join(', '));
  return undefined;
};
