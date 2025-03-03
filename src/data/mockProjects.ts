
import { Project } from "@/lib/types";

// Track newly created projects in session storage
const getNewProjects = (): Project[] => {
  const storedProjects = sessionStorage.getItem('newProjects');
  return storedProjects ? JSON.parse(storedProjects) : [];
};

// Base mock projects
const BASE_MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "MegaMart Gaming Strategy",
    clientName: "MegaMart Retail",
    clientIndustry: "retail",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: "1",
    collaborators: ["2"],
    status: "in_progress",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
  },
  {
    id: "2",
    title: "NextGen Bank Gaming Activation",
    clientName: "NextGen Financial",
    clientIndustry: "finance",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdBy: "1",
    collaborators: [],
    status: "draft",
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
  },
  {
    id: "3",
    title: "TechCorp Gaming Launch",
    clientName: "TechCorp Inc.",
    clientIndustry: "technology",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    createdBy: "1",
    collaborators: ["2"],
    status: "completed",
    coverImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
  }
];

// Combine base mock projects with any new projects
export const MOCK_PROJECTS: Project[] = [...getNewProjects(), ...BASE_MOCK_PROJECTS];

// Helper function to add a new project
export const addNewProject = (project: Project): void => {
  const newProjects = getNewProjects();
  newProjects.unshift(project); // Add to beginning
  sessionStorage.setItem('newProjects', JSON.stringify(newProjects));
};

// Helper to find a project by ID
export const findProjectById = (id: string): Project | undefined => {
  return MOCK_PROJECTS.find(p => p.id === id);
};
