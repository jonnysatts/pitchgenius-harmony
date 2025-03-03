
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StrategicInsight, InsightCategory } from "@/lib/types";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";
import { AlertTriangle, CheckCircle, Clock, ChartPie, ChartBar, Activity } from "lucide-react";
import { formatCategoryTitle } from "@/utils/insightUtils";

interface InsightsDashboardProps {
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ 
  insights, 
  reviewedInsights 
}) => {
  // Calculate insights by category for pie chart
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    insights.forEach(insight => {
      const category = insight.category || 'other';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name: formatCategoryTitle(name),
      value
    }));
  }, [insights]);

  // Calculate confidence distribution for bar chart
  const confidenceData = useMemo(() => {
    const ranges = {
      'Very High (90-100%)': 0,
      'High (80-89%)': 0,
      'Medium (70-79%)': 0,
      'Low (60-69%)': 0,
      'Very Low (<60%)': 0
    };
    
    insights.forEach(insight => {
      const confidence = insight.confidence;
      if (confidence >= 90) ranges['Very High (90-100%)']++;
      else if (confidence >= 80) ranges['High (80-89%)']++;
      else if (confidence >= 70) ranges['Medium (70-79%)']++;
      else if (confidence >= 60) ranges['Low (60-69%)']++;
      else ranges['Very Low (<60%)']++;
    });
    
    return Object.entries(ranges).map(([name, value]) => ({
      name,
      value
    }));
  }, [insights]);

  // Calculate review status data
  const reviewData = useMemo(() => {
    const statuses = {
      Accepted: 0,
      Rejected: 0,
      Pending: 0
    };
    
    Object.values(reviewedInsights).forEach(status => {
      if (status === 'accepted') statuses.Accepted++;
      else if (status === 'rejected') statuses.Rejected++;
      else statuses.Pending++;
    });
    
    return Object.entries(statuses).map(([name, value]) => ({
      name,
      value
    }));
  }, [reviewedInsights]);

  // Calculate priority levels for radar chart
  const priorityData = useMemo(() => {
    const priorities: Record<string, Record<string, number>> = {
      'high': { count: 0 },
      'medium': { count: 0 },
      'low': { count: 0 },
      'undefined': { count: 0 }
    };
    
    insights.forEach(insight => {
      const priority = insight.priorityLevel || 'undefined';
      priorities[priority].count = (priorities[priority].count || 0) + 1;
    });
    
    return [
      { subject: 'High Priority', A: priorities.high.count },
      { subject: 'Medium Priority', A: priorities.medium.count },
      { subject: 'Low Priority', A: priorities.low.count },
      { subject: 'Unspecified', A: priorities.undefined.count }
    ];
  }, [insights]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Colors for review status
  const STATUS_COLORS = {
    Accepted: '#10b981', // green
    Rejected: '#ef4444', // red
    Pending: '#f59e0b'   // amber
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ChartPie size={18} className="mr-2 text-purple-500" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} insights`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ChartBar size={18} className="mr-2 text-blue-500" />
              Confidence Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={confidenceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" scale="band" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(value) => [`${value} insights`, 'Count']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity size={18} className="mr-2 text-green-500" />
              Review Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {reviewData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.name}`} 
                        fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} insights`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority Levels</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={priorityData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar name="Insights" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stats Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-500 mr-2" />
                  <span>Accepted Insights</span>
                </div>
                <span className="font-bold text-xl">
                  {Object.values(reviewedInsights).filter(status => status === 'accepted').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle size={20} className="text-red-500 mr-2" />
                  <span>Rejected Insights</span>
                </div>
                <span className="font-bold text-xl">
                  {Object.values(reviewedInsights).filter(status => status === 'rejected').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock size={20} className="text-amber-500 mr-2" />
                  <span>Pending Review</span>
                </div>
                <span className="font-bold text-xl">
                  {Object.values(reviewedInsights).filter(status => status === 'pending').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle size={20} className="text-amber-500 mr-2" />
                  <span>Needs Review</span>
                </div>
                <span className="font-bold text-xl">
                  {insights.filter(insight => insight.needsReview).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsDashboard;
