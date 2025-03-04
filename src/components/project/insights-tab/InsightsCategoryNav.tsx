
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
    <div className="bg-slate-50 rounded-lg mb-6 p-1.5 border border-slate-200">
      <TabsList className="w-full h-auto p-1 bg-transparent flex overflow-x-auto no-scrollbar gap-1">
        <TabsTrigger 
          value="all" 
          className="text-sm font-medium rounded-md py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          All Categories
        </TabsTrigger>
        {categoriesWithInsights.map(category => (
          <TabsTrigger 
            key={category} 
            value={category}
            className="text-sm font-medium rounded-md py-2.5 px-4 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {getCategoryName(category)}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default InsightsCategoryNav;
