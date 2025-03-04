
import { useCallback } from 'react';
import { Project } from '@/lib/types';

export const useWebsiteUrlValidation = (project: Project) => {
  const isValidWebsiteUrl = useCallback(() => {
    if (!project.clientWebsite) return false;
    
    try {
      const url = project.clientWebsite.startsWith('http') 
        ? project.clientWebsite
        : `https://${project.clientWebsite}`;
        
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, [project.clientWebsite]);

  return { isValidWebsiteUrl };
};
