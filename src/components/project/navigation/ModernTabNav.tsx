
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, Globe, PresentationIcon, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  count: number | null;
}

interface ModernTabNavProps {
  items: TabItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const ModernTabNav: React.FC<ModernTabNavProps> = ({ 
  items, 
  activeTab, 
  setActiveTab 
}) => {
  // Map tab IDs to their respective icons
  const getTabIcon = (id: string) => {
    switch(id) {
      case 'documents':
        return <FileText className="h-5 w-5" />;
      case 'insights':
        return <Lightbulb className="h-5 w-5" />;
      case 'webinsights':
        return <Globe className="h-5 w-5" />;
      case 'presentation':
        return <PresentationIcon className="h-5 w-5" />;
      case 'help':
        return <HelpCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-wrap gap-1 md:gap-0 border-b border-slate-200 pb-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg relative transition-colors",
            activeTab === item.id 
              ? "text-primary" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          {getTabIcon(item.id)}
          <span>{item.label}</span>
          
          {item.count !== null && item.count > 0 && (
            <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-700">
              {item.count}
            </span>
          )}
          
          {activeTab === item.id && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};
