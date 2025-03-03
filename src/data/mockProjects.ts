
import { Project } from "@/lib/types";

export const MOCK_PROJECTS: Project[] = [
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
