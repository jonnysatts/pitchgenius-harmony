
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import { Laptop, Home, Settings, PanelRight, Bug } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b">
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
      
      <div className="flex flex-1">
        <aside className="w-14 md:w-64 bg-white border-r shrink-0">
          <div className="flex flex-col h-full py-4">
            <div className="px-3 py-2">
              <nav className="flex flex-col gap-1">
                <Link to="/dashboard">
                  <Button
                    variant={isActive("/dashboard") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Button>
                </Link>
                
                <Link to="/diagnostics">
                  <Button
                    variant={isActive("/diagnostics") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Diagnostics</span>
                  </Button>
                </Link>
                
                <Link to="/settings">
                  <Button
                    variant={isActive("/settings") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Settings</span>
                  </Button>
                </Link>
              </nav>
            </div>
            
            <Separator className="my-4" />
            
            <div className="px-3 py-2">
              <h3 className="mb-2 px-4 text-xs font-semibold text-gray-500 hidden md:block">
                Recent Projects
              </h3>
              <nav className="flex flex-col gap-1">
                {/* Recent projects would go here */}
              </nav>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
