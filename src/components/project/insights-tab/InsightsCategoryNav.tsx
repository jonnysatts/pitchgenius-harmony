
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightCategory } from "@/lib/types";

interface InsightsCategoryNavProps {
  categoriesWithInsights: InsightCategory[];
  getCategoryName: (category: InsightCategory) => string;
}

const InsightsCategoryNav: React.FC<InsightsCategoryNavProps> = ({
  categoriesWithInsights,
  getCategoryName
}) => {
  return (
    <div className="bg-slate-50 rounded-lg mb-6 p-1">
      <TabsList className="w-full h-auto p-1 bg-transparent flex overflow-x-auto no-scrollbar">
        <TabsTrigger value="all" className="text-sm rounded-md py-2">
          All Categories
        </TabsTrigger>
        {categoriesWithInsights.map(category => (
          <TabsTrigger 
            key={category} 
            value={category}
            className="text-sm rounded-md py-2 whitespace-nowrap"
          >
            {getCategoryName(category)}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default InsightsCategoryNav;
