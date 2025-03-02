
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: "Templates", path: "/templates" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 z-10">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="mr-8" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {menuItems.map((item) => (
                <a 
                  key={item.path}
                  href={item.path}
                  className="text-slate-600 hover:text-brand-orange transition-colors font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell size={20} className="text-slate-500" />
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 mr-2">
                      <img 
                        src={user?.avatar || "https://i.pravatar.cc/150?u=default"} 
                        alt={user?.name || "User"} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden md:inline font-medium text-slate-700 mr-1">
                      {user?.name}
                    </span>
                    <ChevronDown size={16} className="text-slate-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium text-slate-500">
                  Signed in as
                </div>
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User size={16} className="mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <Logo className="mb-6" />
                  <nav className="flex flex-col space-y-4">
                    {menuItems.map((item) => (
                      <a 
                        key={item.path}
                        href={item.path}
                        className="text-slate-600 hover:text-brand-orange transition-colors font-medium py-2"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
