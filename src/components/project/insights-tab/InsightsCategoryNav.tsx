
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
    <div className="mb-6">
      <TabsList className="w-full h-auto bg-white rounded-lg border border-slate-200 p-1.5 flex overflow-x-auto no-scrollbar">
        <TabsTrigger 
          value="all" 
          className="px-5 py-2.5 rounded-md text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
        >
          All Categories
        </TabsTrigger>
        {categoriesWithInsights.map(category => (
          <TabsTrigger 
            key={category} 
            value={category}
            className="px-5 py-2.5 rounded-md text-sm font-medium whitespace-nowrap data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
          >
            {getCategoryName(category)}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default InsightsCategoryNav;
