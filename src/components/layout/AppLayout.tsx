
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import { 
  Laptop, 
  Home, 
  Settings, 
  PanelRight, 
  Bug, 
  ChevronLeft, 
  ChevronRight, 
  Menu 
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo className="h-8 w-8" />
            </Link>
            <h1 className="text-xl font-semibold hidden sm:inline-block">
              Strategic Insights
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link to="/projects/new">
              <Button size="sm">New Project</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 relative">
        <aside className={`bg-white border-r fixed left-0 top-16 bottom-0 h-[calc(100vh-4rem)] z-10 transition-all duration-300 ${
          isExpanded ? "w-64" : "w-16"
        }`}>
          <div className="flex flex-col h-full py-4 relative">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="absolute -right-3 top-3 h-6 w-6 bg-white border shadow-sm rounded-full z-10"
            >
              {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </Button>
            
            <div className="px-3 py-2">
              <TooltipProvider>
                <nav className="flex flex-col gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/dashboard">
                        <Button
                          variant={isActive("/dashboard") ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          size="sm"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          <span className={isExpanded ? "inline" : "hidden"}>Dashboard</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {!isExpanded && <TooltipContent side="right">Dashboard</TooltipContent>}
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/diagnostics">
                        <Button
                          variant={isActive("/diagnostics") ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          size="sm"
                        >
                          <Bug className="h-4 w-4 mr-2" />
                          <span className={isExpanded ? "inline" : "hidden"}>Diagnostics</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {!isExpanded && <TooltipContent side="right">Diagnostics</TooltipContent>}
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/settings">
                        <Button
                          variant={isActive("/settings") ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          <span className={isExpanded ? "inline" : "hidden"}>Settings</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {!isExpanded && <TooltipContent side="right">Settings</TooltipContent>}
                  </Tooltip>
                </nav>
              </TooltipProvider>
            </div>
            
            {isExpanded && <Separator className="my-4" />}
            
            {isExpanded && (
              <div className="px-3 py-2">
                <h3 className="mb-2 px-4 text-xs font-semibold text-gray-500">
                  Recent Projects
                </h3>
                <nav className="flex flex-col gap-1">
                  {/* Recent projects would go here */}
                </nav>
              </div>
            )}
          </div>
        </aside>
        
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-16"
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
