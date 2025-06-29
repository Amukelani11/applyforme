"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { motion } from "framer-motion";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const data = [
  { name: 'Applied', value: 1250, color: '#a78bfa' },
  { name: 'Reviewed', value: 980, color: '#9370db' },
  { name: 'Assessment', value: 650, color: '#805ad5' },
  { name: 'Interview', value: 320, color: '#6b46c1' },
  { name: 'Offer', value: 80, color: '#553c9a' },
  { name: 'Hired', value: 25, color: '#44337a' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-2 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{`${label}`}</p>
        <p className="text-sm text-theme-700">{`Candidates: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

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
    className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50 rounded-lg min-h-[400px]"
  >
    <div className="bg-gray-200/50 p-4 rounded-full mb-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h4 className="font-semibold text-lg text-gray-700">{title}</h4>
    <p className="text-gray-500 mt-1 mb-6 text-sm max-w-xs">{description}</p>
    {ctaLink && ctaText && (
      <Button asChild variant="outline" size="sm" className="border-theme-300 text-theme-700 hover:bg-theme-50 hover:text-theme-700">
        <Link href={ctaLink}>{`+ ${ctaText}`}</Link>
      </Button>
    )}
  </motion.div>
);

export function ApplicationFunnelChart({ funnelData }: { funnelData?: { name: string; value: number; color: string }[] }) {
    
  const dataIsPresent = funnelData && funnelData.length > 0 && funnelData.some(item => item.value > 0);

  if (!dataIsPresent) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
            </div>
            <span>Application Pipeline</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ChartEmptyState
                icon={Users}
                title="No applications in the pipeline yet."
                description="Post a new job to start receiving candidates."
                ctaLink="/recruiter/jobs/new"
                ctaText="Post a New Job"
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
            <Users className="w-4 h-4 text-white" />
          </div>
          <span>Application Pipeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={funnelData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(192, 132, 252, 0.1)' }} />
            <Bar dataKey="value" barSize={30} radius={[0, 8, 8, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 