
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = "full", 
  className 
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative w-10 h-10 bg-brand-orange text-white rounded-md flex items-center justify-center overflow-hidden">
        <span className="font-display font-bold text-xl">G</span>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/80 to-transparent opacity-40"></div>
      </div>
      
      {variant === "full" && (
        <div className="ml-2 font-display font-bold text-xl">
          <span>Games</span>
          <span className="text-brand-orange">Age</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
