"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Brain, 
  TrendingUp, 
  Users, 
  Building, 
  DollarSign, 
  Target, 
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import React from 'react';

interface DeepResearchPanelProps {
  isActive: boolean;
  isLoading?: boolean;
  activity?: Array<{
    type: 'search' | 'extract' | 'analyze' | 'reasoning' | 'synthesis' | 'thought';
    status: 'pending' | 'complete' | 'error';
    message: string;
    timestamp: string;
  }>;
  sources?: Array<{
    url: string;
    title: string;
    domain: string;
    description?: string;
  }>;
  className?: string;
}

export function DeepResearchPanel({
  isActive,
  isLoading = false,
  activity = [],
  sources = [],
  className
}: DeepResearchPanelProps) {
  if (!isActive && activity.length === 0 && sources.length === 0) {
    return null;
  }

  // Get icon and styling based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search': return Search;
      case 'extract': return Target;
      case 'analyze': return TrendingUp;
      case 'reasoning': return Brain;
      case 'synthesis': return CheckCircle;
      case 'thought': return Brain;
      default: return Globe;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === 'error') return 'text-red-600 bg-red-50';
    if (status === 'pending') return 'text-yellow-600 bg-yellow-50';
    
    switch (type) {
      case 'search': return 'text-blue-600 bg-blue-50';
      case 'extract': return 'text-purple-600 bg-purple-50';
      case 'analyze': return 'text-green-600 bg-green-50';
      case 'reasoning': return 'text-[#c084fc] bg-[#c084fc]/10';
      case 'synthesis': return 'text-indigo-600 bg-indigo-50';
      case 'thought': return 'text-[#c084fc] bg-[#c084fc]/10';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-2xl shadow-sm p-4 h-full flex flex-col",
      className
    )}>
      <Tabs defaultValue="activity" className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#121212]">Research Intelligence</h3>
          <Badge variant="outline" className="text-xs border-[#c084fc] text-[#c084fc]">
            {isLoading ? 'Researching...' : 'SA Market Focus'}
          </Badge>
        </div>

        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="activity" className="flex-1">
            <Brain className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            Sources ({sources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="flex-1 overflow-hidden mt-4">
          <div 
            className="h-full overflow-y-auto space-y-3 pr-2 scroll-smooth scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400" 
            style={{ maxHeight: 'calc(100vh - 300px)' }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {activity.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No research activity yet</p>
                </div>
              </div>
            ) : (
              [...activity].reverse().map((item, index) => {
                const Icon = getActivityIcon(item.type);
                const colorClass = getActivityColor(item.type, item.status);
                
                return (
                  <motion.div
                    key={`${item.timestamp}-${index}-${item.type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        colorClass
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#121212] leading-relaxed break-words">
                          {item.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1">
                            {item.status === 'pending' && (
                              <>
                                <Clock className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-yellow-600">Processing...</span>
                              </>
                            )}
                            {item.status === 'complete' && (
                              <>
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-green-600">Complete</span>
                              </>
                            )}
                            {item.status === 'error' && (
                              <>
                                <AlertCircle className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-red-600">Error</span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#c084fc]/5 rounded-xl p-3 border border-[#c084fc]/20"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#c084fc]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-4 h-4 text-[#c084fc] animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#121212] font-medium">Processing research analysis...</p>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div className="bg-[#c084fc] h-1 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sources" className="flex-1 overflow-hidden mt-4">
          <div 
            className="h-full overflow-y-auto space-y-3 pr-2 scroll-smooth scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400" 
            style={{ maxHeight: 'calc(100vh - 300px)' }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {sources.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No sources found yet</p>
                </div>
              </div>
            ) : (
              sources.map((source, index) => (
                <motion.div
                  key={`${source.url}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h4 className="text-sm font-medium text-[#121212] hover:text-[#c084fc] transition-colors line-clamp-2 mb-2">
                      {source.title}
                    </h4>
                    {source.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {source.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 truncate">
                        {source.domain}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </div>
                  </a>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

