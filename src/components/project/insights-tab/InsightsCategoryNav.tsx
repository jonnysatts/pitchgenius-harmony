
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
    <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap">
      <TabsTrigger value="all" className="whitespace-nowrap">
        All Categories
      </TabsTrigger>
      {categoriesWithInsights.map(category => (
        <TabsTrigger 
          key={category} 
          value={category}
          className="whitespace-nowrap"
        >
          {getCategoryName(category)}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default InsightsCategoryNav;
