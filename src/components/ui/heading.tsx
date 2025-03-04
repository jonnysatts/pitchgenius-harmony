
import * as React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <h1 
      className={cn(
        "text-2xl font-bold tracking-tight", 
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};
