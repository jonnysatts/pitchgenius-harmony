
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

// Base mock projects
const BASE_MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "MegaMart Gaming Strategy",
    clientName: "MegaMart Retail",
    clientIndustry: "retail",
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    ownerId: "1",
    description: "Gaming strategy for MegaMart retail chain",
    status: "in_progress",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    createdBy: "1",
    collaborators: ["2"]
  },
  {
    id: "2",
    title: "NextGen Bank Gaming Activation",
    clientName: "NextGen Financial",
    clientIndustry: "finance",
    createdAt: new Date(Date.now() - 86400000 * 14),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    ownerId: "1",
    description: "Gaming activation strategy for NextGen Financial",
    status: "draft",
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    createdBy: "1",
    collaborators: []
  },
  {
    id: "3",
    title: "TechCorp Gaming Launch",
    clientName: "TechCorp Inc.",
    clientIndustry: "technology",
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now()),
    ownerId: "1",
    description: "Gaming launch strategy for TechCorp",
    status: "completed",
    coverImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    createdBy: "1",
    collaborators: ["2"]
  }
];

// Helper function to get all projects (including new ones)
export const getAllProjects = (): Project[] => {
  return [...getNewProjects(), ...BASE_MOCK_PROJECTS];
};

// Combine base mock projects with any new projects
export const MOCK_PROJECTS: Project[] = getAllProjects();

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
    console.log("Project saved to localStorage:", project.id);
  } catch (e) {
    console.error("Error saving project to localStorage:", e);
  }
};

// Helper to find a project by ID
export const findProjectById = (id: string): Project | undefined => {
  // Get all projects including new ones from storage
  const allProjects = getAllProjects();
  const foundProject = allProjects.find(p => p.id === id);
  console.log("Finding project by ID:", id, "Found:", !!foundProject);
  return foundProject;
};
