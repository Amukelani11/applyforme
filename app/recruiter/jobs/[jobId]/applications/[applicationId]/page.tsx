'use client'
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  MessageSquare, 
  Search,
  Settings,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  User,
  Briefcase,
  ChevronDown,
  ExternalLink,
  Menu,
  Loader2,
  LayoutDashboard,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Award,
  FileText,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/animated-counter";

// Dynamically import PDF components to avoid SSR issues
const DocumentComponent = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading PDF viewer...</p>
        </div>
      </div>
    )
  }
);
const PageComponent = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50 animate-pulse"></div>
  }
);

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface ApplicationData {
  application: any;
  candidate: any;
  job: any;
  ai_analysis: any;
  type: string;
}

interface AIAnalysis {
  overall_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  key_insights: string[];
  strengths: string[];
  concerns: string[];
  skills_match: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
  };
  experience_analysis: {
    total_years: number;
    relevance_score: number;
    progression: string;
    gaps: string[];
  };
  education_assessment: {
    relevance: string;
    level: string;
    notes: string;
  };
  recommendation: 'hire' | 'interview' | 'consider' | 'reject';
  next_steps: string[];
}

const PDFViewer = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error): void {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="w-8 h-8 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 absolute top-2 left-2 animate-reverse-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center space-y-4">
          <div className="relative">
            <FileText className="w-12 h-12 text-red-400 mx-auto" />
            <XCircle className="w-6 h-6 text-red-600 absolute -top-1 -right-1 bg-white rounded-full" />
          </div>
          <div>
            <p className="text-red-800 font-semibold">Document Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => window.open(url, '_blank')}
            >
              Open in new tab
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Document Preview</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(page => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(page => Math.min(numPages || 1, page + 1))}
            disabled={pageNumber >= (numPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <DocumentComponent
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
        >
          <PageComponent 
            pageNumber={pageNumber} 
            width={800}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </DocumentComponent>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex h-screen bg-gray-50">
    {/* Left Sidebar Skeleton */}
    <aside className="w-80 bg-gray-900 text-white flex flex-col items-center p-6 space-y-6">
      <Skeleton className="w-48 h-48 rounded-full bg-gray-700" />
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-40 bg-gray-700" />
        <Skeleton className="h-4 w-48 bg-gray-700" />
      </div>
      <div className="w-full space-y-2 px-4">
        <Skeleton className="h-12 w-full bg-gray-700 rounded-lg" />
        <Skeleton className="h-12 w-full bg-gray-700 rounded-lg" />
        <Skeleton className="h-12 w-full bg-gray-700 rounded-lg" />
      </div>
    </aside>
    {/* Main Content Skeleton */}
    <main className="flex-1 p-8">
      <Skeleton className="h-12 w-1/3 mb-8 bg-gray-200" />
      <div className="space-y-8">
        <Skeleton className="h-24 w-full bg-gray-200 rounded-lg" />
        <Skeleton className="h-12 w-full bg-gray-200 rounded-lg" />
        <Skeleton className="h-96 w-full bg-gray-200 rounded-lg" />
      </div>
    </main>
  </div>
);

const ApplicationReviewPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const jobId = params.jobId as string;
  const applicationId = params.applicationId as string;
  const type = searchParams.get('type') || 'candidate';

  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentTab, setCurrentTab] = useState('resume');
  const [activeTab, setActiveTab] = useState('resume');
  const [note, setNote] = useState('');
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);

  // Fetch application data
  useEffect(() => {
    async function fetchApplicationData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/recruiter/jobs/${jobId}/applications/${applicationId}?type=${type}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch application: ${response.status}`);
        }
        
        const data = await response.json();
        setApplicationData(data);
        setNotes(data.application.recruiter_notes || '');
      } catch (err) {
        console.error('Error fetching application:', err);
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setLoading(false);
      }
    }

    if (jobId && applicationId) {
      fetchApplicationData();
    }
  }, [jobId, applicationId, type]);

  // Handle status updates
  const handleStatusUpdate = async (newStatus: 'shortlisted' | 'rejected') => {
    if (!applicationData) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/recruiter/jobs/${jobId}/applications/${applicationId}?type=${type}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      const result = await response.json();
      
      // Update local state
      setApplicationData(prev => prev ? {
        ...prev,
        application: { ...prev.application, status: newStatus, recruiter_notes: notes }
      } : null);

      toast({
        title: 'Success',
        description: `Application ${newStatus === 'shortlisted' ? 'shortlisted' : 'rejected'} successfully`,
      });
    } catch (err) {
      console.error('Error updating application:', err);
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle notes update
  const handleNotesUpdate = async () => {
    if (!applicationData) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/recruiter/jobs/${jobId}/applications/${applicationId}?type=${type}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      setApplicationData(prev => prev ? {
        ...prev,
        application: { ...prev.application, recruiter_notes: notes }
      } : null);

      toast({
        title: 'Success',
        description: 'Notes updated successfully',
      });
    } catch (err) {
      console.error('Error updating notes:', err);
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <div>Error: {error}</div>;

  const { application, candidate, job, ai_analysis, type: applicationType } = applicationData!;
  
  const overallScore = ai_analysis?.overall_score || 0;
  const scoreColor = overallScore > 80 ? 'text-emerald-500' : overallScore > 60 ? 'text-yellow-500' : 'text-red-500';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'interview': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consider': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ActionButton = ({ icon: Icon, children, className, onClick, disabled }: { icon: React.ElementType, children: React.ReactNode, className?: string, onClick?: () => void, disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        className
      )}
    >
      <Icon className="w-4 h-4 mr-2" />
      {children}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-80 bg-gray-900 text-white flex flex-col items-center p-6 space-y-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-48 h-48"
        >
          <svg className="w-full h-full" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              className="text-gray-700"
              fill="none"
              strokeWidth="2"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="2"
              strokeDasharray={`${overallScore}, 100`}
              className="text-theme-500"
              initial={{ strokeDasharray: `0, 100` }}
              animate={{ strokeDasharray: `${overallScore}, 100` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold text-white`}>
              <AnimatedCounter value={overallScore} />
            </span>
            <span className="text-sm text-gray-400">AI Score</span>
          </div>
        </motion.div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">{application.full_name || 'Candidate'}</h2>
          <p className="text-gray-300">{application.email}</p>
        </div>
        <div className="w-full space-y-2 px-4">
          <ActionButton
            icon={Check}
            className="text-white border border-theme-500 bg-theme-500/20 hover:bg-theme-500/30 hover:border-theme-400"
            onClick={() => handleStatusUpdate('shortlisted')}
          >
            Shortlist
          </ActionButton>
          <ActionButton
            icon={X}
            className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
            onClick={() => handleStatusUpdate('rejected')}
          >
            Reject
          </ActionButton>
          <ActionButton
            icon={MessageSquare}
            className="bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:bg-gray-500/20 hover:border-gray-500/30"
            onClick={() => setIsNoteSheetOpen(true)}
          >
            Add Note
          </ActionButton>
        </div>
        <div className="w-full border-t border-gray-700 my-4" />
        {/* ... Quick Stats with themed icons ... */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* ... Header ... */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">AI Insights</h2>
            <div className="bg-theme-50 border border-theme-200 rounded-lg p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-theme-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-800">Overall Recommendation: {ai_analysis?.recommendation}</h3>
                  <p className="text-sm text-theme-700">
                    {ai_analysis?.summary}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <div className="relative">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <TabButton name="Resume" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton name="Qualifications" activeTab={activeTab} setActiveTab={setActiveTab} />
              </nav>
            </div>
          </div>

          {activeTab === 'resume' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PDFViewer url={application.cv_url || (candidate.documents && candidate.documents[0]?.file_url)} />
            </motion.div>
          )}
          {activeTab === 'qualifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* ... Qualifications Content ... */}
            </motion.div>
          )}

          {/* ... other sections ... */}
        </div>
      </main>
    </div>
  );
};

const TabButton = ({ name, activeTab, setActiveTab }: { name: string, activeTab: string, setActiveTab: (name: string) => void }) => {
  const isActive = activeTab === name.toLowerCase();
  return (
    <button
      onClick={() => setActiveTab(name.toLowerCase())}
      className={cn(
        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
        isActive
          ? 'border-theme-500 text-theme-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
    >
      {name}
    </button>
  );
};

export default ApplicationReviewPage; 