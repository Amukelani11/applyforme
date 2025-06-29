"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, Sector
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Share2, Network } from 'lucide-react';
import { useState } from 'react';
import { motion } from "framer-motion"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// --- REUSABLE EMPTY STATE ---
interface ChartEmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLink?: string;
  ctaText?: string;
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({ icon: Icon, title, description, ctaLink, ctaText }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50 rounded-lg min-h-[300px]"
  >
    <div className="bg-gray-200/50 p-4 rounded-full mb-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h4 className="font-semibold text-lg text-gray-700">{title}</h4>
    <p className="text-gray-500 mt-1 mb-6 text-sm max-w-xs">{description}</p>
    {ctaLink && ctaText && (
      <Button asChild variant="outline" size="sm" className="border-theme-300 text-theme-700 hover:bg-theme-50 hover:text-theme-700">
        <Link href={ctaLink}>{ctaText}</Link>
      </Button>
    )}
  </motion.div>
);

// Data for Application Sources
const sourceData = [
  { name: 'Organic', value: 400, color: '#8b5cf6' },
  { name: 'LinkedIn', value: 300, color: '#a78bfa' },
  { name: 'Indeed', value: 300, color: '#c4b5fd' },
  { name: 'Referral', value: 200, color: '#ddd6fe' },
];

// Data for Job Performance
const performanceData = [
  { name: 'Software Engineer', applications: 120, views: 2500 },
  { name: 'UX Designer', applications: 80, views: 1800 },
  { name: 'Product Manager', applications: 50, views: 1200 },
  { name: 'Data Scientist', applications: 45, views: 1100 },
  { name: 'DevOps Engineer', applications: 30, views: 900 },
];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold text-lg">{payload.name}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} Candidates`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const ChartSkeleton = () => (
    <div className="flex-1 bg-gray-50 rounded-lg animate-pulse" />
);

export function ApplicationSourcesChart({ data, isLoading }: { data?: any[], isLoading?: boolean }) {
  if (isLoading) {
    return <ChartSkeleton />;
  }
  const dataIsPresent = data && data.length > 0 && data.some(item => item.value > 0);
  
  if (!dataIsPresent) {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-white" />
                </div>
                <span>Application Sources</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ChartEmptyState
                    icon={Network}
                    title="No applications received to analyze sources."
                    description="Try adjusting your date range, or wait for new applications."
                />
            </CardContent>
        </Card>
    );
  }
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </div>
          <span>Application Sources</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              fill="#c084fc"
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function JobPerformanceChart({ data, isLoading }: { data?: any[], isLoading?: boolean }) {
  if (isLoading) {
    return <ChartSkeleton />;
  }
  const dataIsPresent = data && data.length > 0 && data.some(item => item.applications > 0 || item.views > 0);

  if (!dataIsPresent) {
    return (
         <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
            <CardHeader>
                 <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <span>Job Performance</span>
                 </CardTitle>
            </CardHeader>
            <CardContent>
                <ChartEmptyState
                    icon={Briefcase}
                    title="No job performance data available."
                    description="Ensure you have active job postings receiving applications."
                    ctaLink="/recruiter/jobs"
                    ctaText="View Job Postings"
                />
            </CardContent>
        </Card>
    );
  }
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span>Job Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12}/>
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="views" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="applications" fill="#8950eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 