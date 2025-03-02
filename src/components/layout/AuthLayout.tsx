
import React from "react";
import { Logo } from "@/components/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 text-center max-w-sm">{subtitle}</p>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
          {children}
        </div>
      </div>
      
      <div className="mt-8 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Games Age. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
