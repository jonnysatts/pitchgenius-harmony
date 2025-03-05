
import * as React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  className,
  size = "md",
  ...props 
}) => {
  const sizeClasses = {
    sm: "text-xl font-bold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold", 
    xl: "text-4xl font-bold"
  };

  return (
    <h1 
      className={cn(
        "tracking-tight text-slate-900", 
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

export default Heading;
