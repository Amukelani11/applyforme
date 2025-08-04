'use client'
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Sparkles,
  AlertTriangle,
  Minus,
  Send,
  Database,
  Plus,
  Building,
  Users,
  RefreshCw
} from 'lucide-react';
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
import { CustomFieldsViewer } from "@/components/recruiter/custom-fields-viewer";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { formatDistanceToNow, format } from 'date-fns';

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

// Using the new PDFViewer component from @/components/ui/pdf-viewer

const LoadingSkeleton = () => (
  <div className="flex bg-white min-h-screen">
    {/* Left Panel Skeleton */}
    <aside className="w-80 bg-white border-r border-gray-100 flex flex-col items-center p-6 space-y-6">
      <Skeleton className="w-16 h-16 rounded-full bg-gray-200" />
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-32 bg-gray-200" />
        <Skeleton className="h-4 w-40 bg-gray-200" />
      </div>
      <div className="w-full space-y-2">
        <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
        <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
        <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
      </div>
    </aside>
    {/* Main Content Skeleton */}
    <main className="flex-1 p-8 bg-white">
      <Skeleton className="h-8 w-1/3 mb-8 bg-gray-200" />
      <div className="space-y-8">
        <Skeleton className="h-20 w-full bg-gray-200 rounded-lg" />
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [isMessageSheetOpen, setIsMessageSheetOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isAddToPoolSheetOpen, setIsAddToPoolSheetOpen] = useState(false);
  const [pools, setPools] = useState<any[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState('');
  const [poolNotes, setPoolNotes] = useState('');
  const [addingToPool, setAddingToPool] = useState(false);
  const [isCreatePoolSheetOpen, setIsCreatePoolSheetOpen] = useState(false);
  const [newPool, setNewPool] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    is_public: false
  });
  const [creatingPool, setCreatingPool] = useState(false);
  const [candidatePools, setCandidatePools] = useState<any[]>([]);
  const [checkingPools, setCheckingPools] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch application data
  useEffect(() => {
    // Mock data for ad screenshots - load immediately
    setLoading(true);
    
    const mockData = {
          application: {
            id: 'app-123',
            status: 'shortlisted',
            created_at: '2024-01-15T10:30:00Z',
            full_name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+27 82 123 4567',
            location: 'Cape Town, South Africa',
            salary_expectation: 'R65,000 - R85,000',
            notice_period: '1 month',
            cover_letter: 'I am excited to apply for the Senior Software Engineer position at your company. With over 8 years of experience in full-stack development, I have successfully led multiple projects and teams. I am particularly drawn to your innovative approach to technology and believe my skills in React, Node.js, and cloud architecture would be a great fit for your team.',
            recruiter_notes: 'Strong technical background, excellent communication skills. Previous experience at top tech companies. Should move to interview stage.',
            cv_url: '/placeholder.pdf',
            work_experience: [
              {
                title: 'Senior Software Engineer',
                company: 'TechCorp Solutions',
                start_date: '2022-01',
                end_date: '2024-01',
                is_current: false,
                description: 'Led development of microservices architecture, mentored junior developers, and improved system performance by 40%.'
              },
              {
                title: 'Full Stack Developer',
                company: 'InnovateTech',
                start_date: '2019-03',
                end_date: '2022-01',
                is_current: false,
                description: 'Developed and maintained web applications using React, Node.js, and PostgreSQL. Collaborated with cross-functional teams.'
              }
            ],
            education: [
              {
                degree: 'Bachelor of Computer Science',
                institution: 'University of Cape Town',
                start_date: '2015-01',
                end_date: '2019-01',
                field_of_study: 'Computer Science'
              }
            ],
            custom_fields: {
              'What is your experience with cloud platforms?': 'Extensive experience with AWS (EC2, S3, Lambda) and Azure. Led migration of legacy systems to cloud.',
              'How do you handle technical challenges?': 'I approach problems systematically, research solutions, and collaborate with team members when needed.',
              'What is your preferred work environment?': 'I thrive in collaborative environments where I can learn from others and contribute to team success.'
            }
          },
          candidate: {
            id: 'candidate-456',
            full_name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+27 82 123 4567',
            location: 'Cape Town, South Africa',
            cv_url: '/placeholder.pdf',
            work_experience: [
              {
                title: 'Senior Software Engineer',
                company: 'TechCorp Solutions',
                start_date: '2022-01',
                end_date: '2024-01',
                is_current: false,
                description: 'Led development of microservices architecture, mentored junior developers, and improved system performance by 40%.'
              },
              {
                title: 'Full Stack Developer',
                company: 'InnovateTech',
                start_date: '2019-03',
                end_date: '2022-01',
                is_current: false,
                description: 'Developed and maintained web applications using React, Node.js, and PostgreSQL. Collaborated with cross-functional teams.'
              }
            ],
            education: [
              {
                degree: 'Bachelor of Computer Science',
                institution: 'University of Cape Town',
                start_date: '2015-01',
                end_date: '2019-01',
                field_of_study: 'Computer Science'
              }
            ]
          },
          job: {
            id: 'job-789',
            title: 'Senior Software Engineer',
            company: 'TechStartup Inc.',
            description: 'We are looking for an experienced software engineer to join our growing team.'
          },
          ai_analysis: {
            overall_score: 87,
            confidence_level: 'high',
            key_insights: [
              'Strong technical background with 8+ years of experience',
              'Excellent communication and leadership skills demonstrated',
              'Proven track record of successful project delivery',
              'Good cultural fit based on work history and responses'
            ],
            strengths: [
              'Extensive experience with modern tech stack',
              'Strong problem-solving abilities',
              'Excellent team collaboration skills',
              'Proven leadership in technical projects'
            ],
            concerns: [
              'May need to adjust to startup environment',
              'Salary expectations are at the higher end of our range'
            ],
            skills_match: {
              score: 92,
              matched_skills: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Microservices', 'Team Leadership'],
              missing_skills: ['Kubernetes', 'GraphQL']
            },
            experience_analysis: {
              total_years: 8,
              relevance_score: 95,
              progression: 'excellent',
              gaps: []
            },
            education_assessment: {
              relevance: 'high',
              level: 'bachelor',
              notes: 'Computer Science degree from reputable university'
            },
            recommendation: 'interview',
            next_steps: [
              'Schedule technical interview',
              'Prepare coding challenge',
              'Discuss salary expectations',
              'Check references'
            ]
          },
          type: 'candidate'
    };
    
    setApplicationData(mockData);
    setNotes(mockData.application.recruiter_notes || '');
    setLoading(false);
  }, []);

  // Fetch talent pools
  const fetchPools = async () => {
    try {
      // Mock talent pools data for ad screenshots
      const mockPools = [
        {
          id: 'pool-1',
          name: 'Senior Developers',
          description: 'Experienced software engineers and developers',
          color: '#6366f1',
          member_count: 24,
          is_public: false
        },
        {
          id: 'pool-2',
          name: 'Marketing Team',
          description: 'Marketing and growth specialists',
          color: '#10b981',
          member_count: 12,
          is_public: false
        },
        {
          id: 'pool-3',
          name: 'Product Managers',
          description: 'Product management professionals',
          color: '#f59e0b',
          member_count: 8,
          is_public: false
        }
      ];
      setPools(mockPools);
    } catch (error) {
      console.error('Error fetching pools:', error);
    }
  };

  // Fetch pools when component mounts
  useEffect(() => {
    // Mock talent pools data for ad screenshots
    const mockPools = [
      {
        id: 'pool-1',
        name: 'Senior Developers',
        description: 'Experienced software engineers and developers',
        color: '#6366f1',
        member_count: 24,
        is_public: false
      },
      {
        id: 'pool-2',
        name: 'Marketing Team',
        description: 'Marketing and growth specialists',
        color: '#10b981',
        member_count: 12,
        is_public: false
      },
      {
        id: 'pool-3',
        name: 'Product Managers',
        description: 'Product management professionals',
        color: '#f59e0b',
        member_count: 8,
        is_public: false
      }
    ];
    setPools(mockPools);
  }, []);

  // Check if candidate is already in any pools
  const checkCandidatePools = async () => {
    if (!applicationData?.candidate?.email && !applicationData?.application?.email) {
      setCheckingPools(false);
      return;
    }

    try {
      setCheckingPools(true);
      // Mock candidate pools data for ad screenshots
      const mockCandidatePools = [
        {
          id: 'cp-1',
          pool_id: 'pool-1',
          talent_pools: {
            name: 'Senior Developers',
            color: '#6366f1'
          },
          added_notes: 'Strong technical background, excellent fit for senior roles'
        }
      ];
      setCandidatePools(mockCandidatePools);
    } catch (error) {
      console.error('Error checking candidate pools:', error);
    } finally {
      setCheckingPools(false);
    }
  };

  // Check candidate pools when application data loads
  useEffect(() => {
    // Mock candidate pools data for ad screenshots
    const mockCandidatePools = [
      {
        id: 'cp-1',
        pool_id: 'pool-1',
        talent_pools: {
          name: 'Senior Developers',
          color: '#6366f1'
        },
        added_notes: 'Strong technical background, excellent fit for senior roles'
      }
    ];
    setCandidatePools(mockCandidatePools);
    setCheckingPools(false);
  }, []);

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
          notes: notes,
          tags: selectedTags
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      setApplicationData(prev => prev ? {
        ...prev,
        application: { ...prev.application, recruiter_notes: notes, tags: selectedTags }
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

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast({
        title: 'Empty Message',
        description: 'Please write a message before sending.',
        variant: 'destructive',
      });
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: applicationId,
          content: messageContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessageContent('');
      setIsMessageSheetOpen(false);
      toast({
        title: 'Message Sent',
        description: 'Your message has been successfully sent to the candidate.',
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle adding candidate to pool
  const handleAddToPool = async () => {
    if (!selectedPoolId) {
      toast({
        title: 'No Pool Selected',
        description: 'Please select a talent pool.',
        variant: 'destructive',
      });
      return;
    }

    setAddingToPool(true);
    try {
      const response = await fetch('/api/recruiter/talent-pools/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poolId: selectedPoolId,
          candidateName: candidate.full_name || application.full_name,
          candidateEmail: candidate.email || application.email,
          candidatePhone: candidate.phone || application.phone,
          candidateLocation: candidate.location || application.location,
          applicationId: application.id,
          applicationType: type,
          jobTitle: job?.title,
          companyName: job?.company,
          addedNotes: poolNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast({
            title: 'Already in Pool',
            description: 'This candidate is already in the selected pool.',
            variant: 'destructive',
          });
        } else {
          throw new Error(errorData.error || 'Failed to add to pool');
        }
        return;
      }

      setSelectedPoolId('');
      setPoolNotes('');
      setIsAddToPoolSheetOpen(false);
      toast({
        title: 'Added to Pool',
        description: 'Candidate has been successfully added to the talent pool.',
      });

      // Refresh candidate pools after adding
      await checkCandidatePools();

    } catch (error) {
      console.error('Error adding to pool:', error);
      toast({
        title: 'Error',
        description: 'Could not add candidate to pool. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingToPool(false);
    }
  };

  // Handle creating new pool
  const handleCreatePool = async () => {
    if (!newPool.name.trim()) {
      toast({
        title: 'Pool Name Required',
        description: 'Please enter a name for the talent pool.',
        variant: 'destructive',
      });
      return;
    }

    setCreatingPool(true);
    try {
      const response = await fetch('/api/recruiter/talent-pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPool),
      });

      if (!response.ok) {
        throw new Error('Failed to create pool');
      }

      const data = await response.json();
      setNewPool({ name: '', description: '', color: '#6366f1', is_public: false });
      setIsCreatePoolSheetOpen(false);
      
      // Refresh pools and select the new one
      await fetchPools();
      setSelectedPoolId(data.pool.id);
      
      toast({
        title: 'Pool Created',
        description: 'Talent pool created successfully. You can now add the candidate.',
      });

    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: 'Error',
        description: 'Could not create talent pool. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreatingPool(false);
    }
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Handle tab switching with animation
  const handleTabSwitch = (newTab: string) => {
    if (newTab === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  // Fetch messages for this application
  useEffect(() => {
    // Mock messages data for ad screenshots
    const mockMessages = [
      {
        id: 'msg-1',
        content: 'Sarah looks like a great fit for our team. Her experience with microservices architecture is exactly what we need.',
        created_at: '2024-01-15T14:30:00Z',
        sender: { full_name: 'John Smith', email: 'john@company.com' }
      },
      {
        id: 'msg-2',
        content: 'Agreed! Her technical skills are impressive. Should we schedule an interview for next week?',
        created_at: '2024-01-15T15:45:00Z',
        sender: { full_name: 'Lisa Chen', email: 'lisa@company.com' }
      },
      {
        id: 'msg-3',
        content: 'I\'ve added her to our "Senior Developers" talent pool. Great candidate for future opportunities too.',
        created_at: '2024-01-15T16:20:00Z',
        sender: { full_name: 'Mike Johnson', email: 'mike@company.com' }
      }
    ];
    setMessages(mockMessages);
    setLoadingMessages(false);
  }, []);

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, content: newNote })
    });
    if (res.ok) {
      setNewNote('');
      // Refresh messages
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      toast({
        title: "Note Added",
        description: "Your note has been added to the team discussion.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Add a reply to a note
  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, content: replyContent, parentId })
    });
    if (res.ok) {
      setReplyContent('');
      setReplyTo(null);
      // Refresh messages
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      toast({
        title: "Reply Added",
        description: "Your reply has been added to the discussion.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Refresh messages
  const refreshMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?applicationId=${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Helper to format work duration
  function formatWorkDuration(start: string, end: string | null) {
    if (!start) return '';
    const startDate = new Date(start + '-01');
    const endDate = end ? new Date(end + '-01') : new Date();
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    let str = '';
    if (years > 0) str += `${years} year${years > 1 ? 's' : ''}`;
    if (remMonths > 0) str += `${years > 0 ? ', ' : ''}${remMonths} month${remMonths > 1 ? 's' : ''}`;
    return str;
  }

  if (loading) return <LoadingSkeleton />;
  if (error) return <div>Error: {error}</div>;

  const { application, candidate, job, ai_analysis, type: applicationType } = applicationData!;
  
  const overallScore = ai_analysis?.overall_score || 75;
  
  // Extract AI highlights from analysis
  const getAIHighlights = () => {
    if (!ai_analysis) return [];
    
    const highlights: string[] = [];
    
    // Add matched skills as highlights
    if (ai_analysis.skills_match?.matched_skills) {
      highlights.push(...ai_analysis.skills_match.matched_skills);
    }
    
    // Add key insights as highlights
    if (ai_analysis.key_insights) {
      highlights.push(...ai_analysis.key_insights.slice(0, 3));
    }
    
    // Add strengths as highlights
    if (ai_analysis.strengths) {
      highlights.push(...ai_analysis.strengths.slice(0, 2));
    }
    
    return highlights.slice(0, 6); // Limit to 6 highlights
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSkillIcon = (skill: string, score: number = 85) => {
    if (score >= 80) return <Check className="w-4 h-4 text-emerald-600" />;
    if (score >= 60) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <X className="w-4 h-4 text-red-600" />;
  };

  // Create motion wrapper that handles SSR
  const MotionWrapper = isClient ? motion.div : 'div';
  const MotionAside = isClient ? motion.aside : 'aside';
  const MotionMain = isClient ? motion.main : 'main';

  return (
    <MotionWrapper 
      className="flex bg-white min-h-screen"
      {...(isClient && {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 }
      })}
    >
      {/* Left Panel */}
      <MotionAside 
        className="w-80 bg-white border-r border-gray-100 flex flex-col p-6 space-y-6 overflow-y-auto flex-shrink-0"
        {...(isClient && {
          initial: { x: -50, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { duration: 0.6, delay: 0.1 }
        })}
      >
        {/* Candidate Info */}
        <div className="text-center space-y-4">
          <Avatar className="w-16 h-16 mx-auto">
            <AvatarFallback className="bg-gray-100 text-gray-700 text-lg font-semibold">
              {candidate.full_name ? candidate.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'NM'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {candidate.full_name || application.full_name || 'Candidate Name'}
            </h2>
            <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
              <Mail className="w-4 h-4 mr-1" />
              {candidate.email || application.email || 'email@example.com'}
            </p>
            {(candidate.location || application.location) && (
              <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {candidate.location || application.location}
              </p>
            )}
            {(candidate.phone || application.phone) && (
              <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                <Phone className="w-4 h-4 mr-1" />
                {candidate.phone || application.phone}
              </p>
            )}
          </div>
        </div>

        {/* AI Score */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2"
                strokeDasharray={`${overallScore * 100.53 / 100}, 100.53`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{overallScore}</span>
            </div>
          </div>
          <div>
            <button className="text-sm text-purple-600 hover:text-purple-700">
              Why this score?
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant={application.status === 'shortlisted' ? "default" : "outline"}
            className={`w-full transition-all duration-200 hover:scale-105 ${
              application.status === 'shortlisted'
                ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                : "border-purple-500 text-purple-600 hover:bg-purple-50"
            }`}
            onClick={() => handleStatusUpdate('shortlisted')}
            disabled={updating}
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : application.status === 'shortlisted' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Shortlisted
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Shortlist
              </>
            )}
          </Button>
          <Button
            variant={application.status === 'rejected' ? "default" : "outline"}
            className={`w-full transition-all duration-200 hover:scale-105 ${
              application.status === 'rejected'
                ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                : "border-red-300 text-red-600 hover:bg-red-50"
            }`}
            onClick={() => handleStatusUpdate('rejected')}
            disabled={updating}
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : application.status === 'rejected' ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Rejected
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Reject
              </>
            )}
          </Button>
          {applicationType === 'candidate' && (
            <Button
              variant="default"
              className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 hover:scale-105"
              onClick={() => setIsMessageSheetOpen(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Message Candidate
            </Button>
          )}
          <Button
            variant={candidatePools.length > 0 ? "default" : "outline"}
            className={`w-full transition-all duration-200 hover:scale-105 ${
              candidatePools.length > 0 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-blue-300 text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setIsAddToPoolSheetOpen(true)}
            disabled={checkingPools}
          >
            {checkingPools ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : candidatePools.length > 0 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Pool ({candidatePools.length})
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Add to Pool
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            onClick={() => setIsNoteSheetOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Note
          </Button>
          <Button
            variant="outline"
            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
            onClick={() => setIsMessageSheetOpen(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            Message Team
          </Button>
        </div>
        
        {/* Quick Overview */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900">Quick Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="text-sm font-medium text-gray-900">
                  {ai_analysis?.experience_analysis?.total_years 
                    ? `${ai_analysis.experience_analysis.total_years} years`
                    : candidate.work_experience?.length 
                      ? `${candidate.work_experience.length}+ positions`
                      : 'Entry level'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Education</p>
                <p className="text-sm font-medium text-gray-900">
                  {candidate.education?.[0]?.degree || 
                   candidate.education?.[0]?.field_of_study || 
                   ai_analysis?.education_assessment?.level || 
                   'Not specified'}
                </p>
              </div>
            </div>
            {(application.salary_expectation || application.expected_salary) && (
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="text-sm font-medium text-gray-900">
                    {application.salary_expectation || application.expected_salary}
                  </p>
                </div>
              </div>
            )}
            {application.notice_period && (
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Notice Period</p>
                  <p className="text-sm font-medium text-gray-900">
                    {application.notice_period}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">AI Recommendation</p>
                <p className={`text-sm font-medium capitalize ${
                  ai_analysis?.recommendation === 'hire' ? 'text-green-600' :
                  ai_analysis?.recommendation === 'interview' ? 'text-purple-600' :
                  ai_analysis?.recommendation === 'consider' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {ai_analysis?.recommendation || 'Analyzing...'}
                </p>
              </div>
            </div>
          </div>
        </div>
        </MotionAside>

        {/* Main Content */}
        <MotionMain 
          className="flex-1 p-8 bg-white overflow-y-auto"
          {...(isClient && {
            initial: { x: 50, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            transition: { duration: 0.6, delay: 0.2 }
          })}
        >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job?.title || 'Job Position'}</h1>
            <p className="text-gray-600">Application 1 of 1</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-100 text-gray-700">R</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="space-y-12">
          {/* AI Insights Summary */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500" data-mcp-id="recruiter-app-review-ai-insights">
                        <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Insights Summary</h2>
              <Badge 
                variant="outline" 
                className={`text-sm font-medium ${
                  ai_analysis?.confidence_level === 'high' 
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                    : ai_analysis?.confidence_level === 'medium'
                    ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
                    : 'border-gray-200 text-gray-700 bg-gray-50'
                }`}
              >
                {ai_analysis?.confidence_level === 'high' ? 'High Confidence' :
                 ai_analysis?.confidence_level === 'medium' ? 'Medium Confidence' :
                 ai_analysis?.confidence_level === 'low' ? 'Low Confidence' :
                 'Analyzing...'}
              </Badge>
            </div>
            
            <div className="space-y-6">
              {/* Key Insights */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {ai_analysis?.key_insights?.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  )) || [
                    <li key="loading" className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-500">Analyzing candidate profile...</span>
                    </li>
                  ]}
                </ul>
              </div>

              {/* Strengths and Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {ai_analysis?.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-3 h-3 text-emerald-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    )) || [
                      <li key="loading" className="text-sm text-gray-500">Analyzing strengths...</li>
                    ]}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-orange-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                    Areas for Consideration
                  </h3>
                  <ul className="space-y-2">
                    {ai_analysis?.concerns?.map((concern: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-3 h-3 text-orange-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{concern}</span>
                      </li>
                    )) || [
                      <li key="loading" className="text-sm text-gray-500">Analyzing potential concerns...</li>
                    ]}
                  </ul>
                </div>
              </div>

              {/* Next Steps */}
              {ai_analysis?.next_steps && ai_analysis.next_steps.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-purple-600" />
                    Recommended Next Steps
                  </h3>
                  <ul className="space-y-2">
                    {ai_analysis.next_steps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Custom Fields Insights */}
              {ai_analysis?.custom_fields_insights && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Custom Fields Analysis
                  </h3>
                  <div className="space-y-4">
                    {/* Technical Skills */}
                    {ai_analysis.custom_fields_insights.technicalSkills && ai_analysis.custom_fields_insights.technicalSkills.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Technical Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {ai_analysis.custom_fields_insights.technicalSkills.map((skill: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Soft Skills */}
                    {ai_analysis.custom_fields_insights.softSkills && ai_analysis.custom_fields_insights.softSkills.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Soft Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {ai_analysis.custom_fields_insights.softSkills.map((skill: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience Level */}
                    {ai_analysis.custom_fields_insights.experienceLevel && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Experience Level</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ai_analysis.custom_fields_insights.experienceLevel === 'Senior' 
                            ? 'bg-purple-100 text-purple-800' 
                            : ai_analysis.custom_fields_insights.experienceLevel === 'Mid-Level'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ai_analysis.custom_fields_insights.experienceLevel}
                        </span>
                      </div>
                    )}

                    {/* Cultural Fit */}
                    {ai_analysis.custom_fields_insights.culturalFit && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Cultural Fit</h4>
                        <div className="flex items-center gap-2">
                          {ai_analysis.custom_fields_insights.culturalFit.includes('High') ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                          )}
                          <span className="text-xs text-gray-700">{ai_analysis.custom_fields_insights.culturalFit}</span>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {ai_analysis.custom_fields_insights.summary && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Summary</h4>
                        <p className="text-xs text-gray-600">{ai_analysis.custom_fields_insights.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents Insights */}
              {ai_analysis?.documents_insights && (
                <div>
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-600" />
                    Documents Analysis
                  </h3>
                  <div className="space-y-4">
                    {ai_analysis.documents_insights.documentsFound && ai_analysis.documents_insights.documentsFound.length > 0 ? (
                      <>
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Uploaded Documents</h4>
                          <ul className="space-y-1">
                            {ai_analysis.documents_insights.documentsFound.map((doc: string, index: number) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Document Types</h4>
                          <div className="flex flex-wrap gap-1">
                            {ai_analysis.documents_insights.documentTypes.map((type: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-2">
                        <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                        <p className="text-xs text-gray-500">No documents were uploaded</p>
                      </div>
                    )}
                    
                    {ai_analysis.documents_insights.summary && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Summary</h4>
                        <p className="text-xs text-gray-600">{ai_analysis.documents_insights.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* --- Work History --- */}
          {candidate.work_experience && candidate.work_experience.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Work History</h3>
              <ul className="space-y-2">
                {candidate.work_experience.map((exp: any, idx: number) => (
                  <li key={idx} className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <span className="font-semibold text-gray-800">{exp.company}</span>
                    <span className="text-gray-600">{exp.role}</span>
                    <span className="text-gray-500 text-xs">
                      {exp.startDate ? format(new Date(exp.startDate + '-01'), 'MMM yyyy') : ''}
                      {' – '}
                      {exp.endDate ? format(new Date(exp.endDate + '-01'), 'MMM yyyy') : (exp.currentlyWorking ? 'Present' : '')}
                      {exp.startDate && (
                        <span className="ml-2">({formatWorkDuration(exp.startDate, exp.endDate)})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* --- Team Notes & Discussion --- */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Team Notes & Discussion</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMessages}
                disabled={loadingMessages}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Textarea
                placeholder="Add a note for your team about this candidate..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                rows={3}
                className="mb-3 border-blue-300 focus:border-blue-500"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-blue-700">
                  💡 Share insights, questions, or observations with your team
                </p>
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim() || loadingMessages}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Note
                </Button>
              </div>
            </div>

            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading team notes...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.filter(m => !m.parent_id).map(note => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {note.sender?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{note.sender?.full_name || 'Unknown Team Member'}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setReplyTo(note.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Reply
                      </Button>
                    </div>
                    
                    <div className="ml-11 text-gray-700 whitespace-pre-line leading-relaxed">
                      {note.content}
                    </div>

                    {/* Replies */}
                    {messages.filter(m => m.parent_id === note.id).length > 0 && (
                      <div className="ml-11 mt-4 space-y-3">
                        {messages.filter(m => m.parent_id === note.id).map(reply => (
                          <div key={reply.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                  {reply.sender?.full_name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-800 text-sm">{reply.sender?.full_name || 'Unknown'}</span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="text-gray-700 text-sm ml-8">{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    {replyTo === note.id && (
                      <div className="ml-11 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Input
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                          className="mb-2 border-blue-300 focus:border-blue-500"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAddReply(note.id)} 
                            disabled={!replyContent.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Send Reply
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => { setReplyTo(null); setReplyContent(''); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No team notes yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to share your thoughts about this candidate with your team!</p>
                    <Button 
                      onClick={() => document.querySelector('textarea')?.focus()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add First Note
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Candidate Documents */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Candidate Documents</h2>
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8 relative">
                <button
                  onClick={() => handleTabSwitch('resume')}
                  className={cn(
                    'py-3 px-1 font-medium text-sm transition-all duration-300 hover:text-gray-900 relative',
                    activeTab === 'resume'
                      ? 'text-purple-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Resume
                  {activeTab === 'resume' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 animate-in slide-in-from-left duration-300" />
                  )}
                </button>
                <button
                  onClick={() => handleTabSwitch('application')}
                  className={cn(
                    'py-3 px-1 font-medium text-sm transition-all duration-300 hover:text-gray-900 relative',
                    activeTab === 'application'
                      ? 'text-purple-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Application
                  {activeTab === 'application' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 animate-in slide-in-from-left duration-300" />
                  )}
                </button>
                <button
                  onClick={() => handleTabSwitch('qualifications')}
                  className={cn(
                    'py-3 px-1 font-medium text-sm transition-all duration-300 hover:text-gray-900 relative',
                    activeTab === 'qualifications'
                      ? 'text-purple-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Qualifications
                  {activeTab === 'qualifications' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 animate-in slide-in-from-right duration-300" />
                  )}
                </button>
              </nav>
            </div>

                        {activeTab === 'resume' && (
              <div className={cn(
                "transition-all duration-500",
                isTransitioning ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              )}>
                {(application.cv_url || candidate.cv_url || (candidate.documents && candidate.documents[0]?.file_url)) ? (
                  <div className="space-y-4">
                    <PDFViewer 
                      url={application.cv_url || candidate.cv_url || candidate.documents[0].file_url} 
                      title="Candidate Resume"
                    />
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.cv_url || candidate.cv_url || candidate.documents[0].file_url, '_blank')}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open CV in new tab
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[600px] bg-white animate-in fade-in duration-500">
                    <div className="text-center space-y-6">
                      <div className="p-6 rounded-full bg-gray-50">
                        <FileText className="w-20 h-20 text-gray-300 mx-auto" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-900 font-semibold text-lg">No resume uploaded</p>
                          <p className="text-gray-600 text-sm mt-1">The candidate hasn't provided a resume yet</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:scale-105 transition-all duration-200"
                          onClick={() => toast({
                            title: "Request Resume",
                            description: "You can request the candidate to upload their resume."
                          })}
                        >
                          Request Resume
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'application' && (
              <div className={cn(
                "transition-all duration-500",
                isTransitioning ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              )}>
                <div className="space-y-8">
                  {/* Application Details */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-purple-600" />
                      Application Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Personal Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {application.full_name || candidate.full_name}
                              </p>
                              <p className="text-xs text-gray-500">Full Name</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {application.email || candidate.email}
                              </p>
                              <p className="text-xs text-gray-500">Email Address</p>
                            </div>
                          </div>
                          
                          {(application.phone || candidate.phone) && (
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {application.phone || candidate.phone}
                                </p>
                                <p className="text-xs text-gray-500">Phone Number</p>
                              </div>
                            </div>
                          )}
                          
                          {(application.location || candidate.location) && (
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {application.location || candidate.location}
                                </p>
                                <p className="text-xs text-gray-500">Location</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Application Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Application Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(application.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">Application Date</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {job?.title || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">Position Applied For</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {job?.company || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">Company</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={application.status === 'shortlisted' ? 'default' : 
                                     application.status === 'rejected' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {application.status || 'Pending'}
                            </Badge>
                            <span className="text-xs text-gray-500">Status</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {application.cover_letter && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        Cover Letter
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {application.cover_letter}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Work Experience from Application */}
                  {application.work_experience && Array.isArray(application.work_experience) && application.work_experience.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                        Work Experience
                      </h3>
                      <div className="space-y-6">
                        {application.work_experience.map((exp: any, index: number) => (
                          <div key={index} className="relative pl-6 pb-6 border-l-2 border-purple-200">
                            <div className="absolute left-0 top-2 w-2 h-2 bg-purple-400 rounded-full" />
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-base">{exp.title || 'No title provided'}</h4>
                              <p className="text-purple-600 font-medium">{exp.company || 'No company provided'}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {exp.start_date || 'No start date'} - {exp.is_current ? 'Present' : (exp.end_date || 'No end date')}
                              </p>
                              {exp.description && (
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education from Application */}
                  {application.education && Array.isArray(application.education) && application.education.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                        Education
                      </h3>
                      <div className="space-y-6">
                        {application.education.map((edu: any, index: number) => (
                          <div key={index} className="relative pl-6 pb-6 border-l-2 border-purple-200">
                            <div className="absolute left-0 top-2 w-2 h-2 bg-purple-400 rounded-full" />
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-base">{edu.degree || 'No degree provided'}</h4>
                              <p className="text-purple-600 font-medium">{edu.institution || 'No institution provided'}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {edu.start_date || 'No start date'} - {edu.is_current ? 'Present' : (edu.end_date || 'No end date')}
                              </p>
                              {edu.description && (
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{edu.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Fields Responses */}
                  {application.custom_fields && typeof application.custom_fields === 'object' && Object.keys(application.custom_fields).length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-purple-600" />
                        Additional Questions
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(application.custom_fields).map(([question, answer]: [string, any], index: number) => (
                          <div key={index} className="border-l-4 border-purple-200 pl-4">
                            <h4 className="font-medium text-gray-900 mb-2">{question}</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {Array.isArray(answer) ? answer.join(', ') : String(answer || 'No answer provided')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : application.custom_fields ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-purple-600" />
                        Additional Questions
                      </h3>
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No additional questions</p>
                        <p className="text-sm text-gray-400 mt-1">This application didn't include custom questions</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Application Notes */}
                  {application.recruiter_notes && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                        Recruiter Notes
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {application.recruiter_notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'qualifications' && (
              <div className={cn(
                "transition-all duration-500",
                isTransitioning ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              )}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Work Experience */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {candidate.work_experience && Array.isArray(candidate.work_experience) && candidate.work_experience.length > 0 ? (
                        candidate.work_experience.map((exp: any, index: number) => (
                          <div 
                            key={index} 
                            className="relative pl-6 pb-6 animate-in fade-in slide-in-from-left duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="absolute left-0 top-2 w-2 h-2 bg-purple-400 rounded-full" />
                            <div className="absolute left-0.5 top-4 w-0.5 bg-gray-200 h-full" />
                            
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-base">{exp.title}</h4>
                              <p className="text-purple-600 font-medium">{exp.company}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                              </p>
                              {exp.description && (
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 space-y-3">
                          <Briefcase className="w-12 h-12 text-gray-300 mx-auto" />
                          <p className="text-gray-500 font-medium">No work experience provided</p>
                          <p className="text-sm text-gray-400">The candidate hasn't added their work history yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {candidate.education && Array.isArray(candidate.education) && candidate.education.length > 0 ? (
                        candidate.education.map((edu: any, index: number) => (
                          <div 
                            key={index} 
                            className="relative pl-6 pb-6 animate-in fade-in slide-in-from-right duration-500"
                            style={{ animationDelay: `${index * 100 + 200}ms` }}
                          >
                            <div className="absolute left-0 top-2 w-2 h-2 bg-purple-400 rounded-full" />
                            <div className="absolute left-0.5 top-4 w-0.5 bg-gray-200 h-full" />
                            
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-base">{edu.degree}</h4>
                              <p className="text-purple-600 font-medium">{edu.institution}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {edu.start_date} - {edu.end_date}
                              </p>
                              {edu.field_of_study && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Award className="w-4 h-4 text-gray-400" />
                                  <p className="text-sm text-gray-600">{edu.field_of_study}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 space-y-3">
                          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
                          <p className="text-gray-500 font-medium">No education information provided</p>
                          <p className="text-sm text-gray-400">The candidate hasn't added their educational background</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Skills & Experience Analysis */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills & Experience Analysis</h2>
            <div className="space-y-8">
              {/* Skills Match Overview */}
              {ai_analysis?.skills_match && (
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Skills Match Score</h3>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-purple-600">
                        {ai_analysis.skills_match.score}%
                      </div>
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${ai_analysis.skills_match.score}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Matched Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                    Matched Skills
                  </h3>
                  <div className="space-y-3">
                    {ai_analysis?.skills_match?.matched_skills?.map((skill: string, index: number) => (
                      <div 
                        key={skill} 
                        className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all duration-200 animate-in fade-in slide-in-from-left-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="text-sm font-medium text-gray-700">{skill}</span>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>Analyzing skills match...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <XCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Development Areas
                  </h3>
                  <div className="space-y-3">
                    {ai_analysis?.skills_match?.missing_skills?.length > 0 ? 
                      ai_analysis.skills_match.missing_skills.map((skill: string, index: number) => (
                        <div 
                          key={skill} 
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all duration-200 animate-in fade-in slide-in-from-right-4"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <span className="text-sm font-medium text-gray-700">{skill}</span>
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        </div>
                      )) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                          <p className="font-medium text-emerald-600">No skill gaps identified!</p>
                          <p className="text-sm">Candidate meets all requirements</p>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>

              {/* Experience Summary */}
              {ai_analysis?.experience_analysis && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                    Experience Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {ai_analysis.experience_analysis.total_years || 0}
                      </div>
                      <div className="text-sm text-gray-600">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {ai_analysis.experience_analysis.relevance_score || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Relevance Score</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 capitalize ${
                        ai_analysis.experience_analysis.progression === 'excellent' ? 'text-emerald-600' :
                        ai_analysis.experience_analysis.progression === 'good' ? 'text-purple-600' :
                        ai_analysis.experience_analysis.progression === 'average' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {ai_analysis.experience_analysis.progression || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Career Progression</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Notes & Review */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notes & Review</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Comments</h3>
                <Textarea
                  placeholder="Add your thoughts about this candidate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['Interview Ready', 'Skills Gap', 'Culture Fit', 'Salary Negotiation', 'Follow-up'].map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105",
                        selectedTags.includes(tag)
                          ? "bg-purple-100 text-purple-800 border-purple-200 border"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <span className="ml-1 animate-in zoom-in duration-200">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleNotesUpdate}
                disabled={updating}
                className="w-full transition-all duration-200 hover:scale-105"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Notes'
                )}
              </Button>
            </div>
          </section>

          {/* Application Details */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Received</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Source</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {application.is_public ? 'Public Application' : 'Candidate Application'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Expected Salary</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {application.salary_expectation || 'R45,000 - R65,000'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Notice Period</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {application.notice_period || '1 month'}
                </p>
              </div>
            </div>
          </section>

          {/* Custom Fields */}
          <CustomFieldsViewer applicationId={applicationId} />
        </div>
      </MotionMain>

      {/* Notes Sheet */}
      <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Note</SheetTitle>
            <SheetDescription>
              Add a note about this candidate for future reference.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Your notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setNotes(note);
                  setIsNoteSheetOpen(false);
                }}
                className="flex-1"
              >
                Save Note
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsNoteSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Message Sheet */}
      <Sheet open={isMessageSheetOpen} onOpenChange={setIsMessageSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Message Team Members</SheetTitle>
            <SheetDescription>
              Send a message to your team about {candidate.full_name || application.full_name}'s application
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                placeholder="Share your thoughts about this candidate with your team..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsMessageSheetOpen(false)}
                disabled={sendingMessage}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendingMessage}
                className="flex-1"
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Team
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add to Pool Sheet */}
      <Sheet open={isAddToPoolSheetOpen} onOpenChange={setIsAddToPoolSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add to Talent Pool</SheetTitle>
            <SheetDescription>
              Add {candidate.full_name || application.full_name} to a talent pool for future opportunities.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            {/* Show existing pools if candidate is already in any */}
            {candidatePools.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Already in {candidatePools.length} pool{candidatePools.length > 1 ? 's' : ''}:
                  </span>
                </div>
                <div className="space-y-1">
                  {candidatePools.map((poolMember) => (
                    <div key={poolMember.id} className="flex items-center gap-2 text-sm text-green-700">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: poolMember.talent_pools.color }}
                      />
                      {poolMember.talent_pools.name}
                      {poolMember.added_notes && (
                        <span className="text-xs text-green-600">
                          - {poolMember.added_notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pools.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No talent pools created yet</p>
                <Button
                  onClick={() => setIsCreatePoolSheetOpen(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Pool
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pool-select">Select Talent Pool</Label>
                  <Select value={selectedPoolId} onValueChange={setSelectedPoolId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a talent pool..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pools.map((pool) => {
                        const isAlreadyInPool = candidatePools.some(cp => cp.pool_id === pool.id);
                        return (
                          <SelectItem 
                            key={pool.id} 
                            value={pool.id}
                            disabled={isAlreadyInPool}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: pool.color }}
                              />
                              {pool.name} ({pool.member_count} members)
                              {isAlreadyInPool && (
                                <Badge variant="outline" className="text-xs ml-2">
                                  Added
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pool-notes">Notes (Optional)</Label>
                  <Textarea
                    id="pool-notes"
                    placeholder="Add any notes about this candidate..."
                    value={poolNotes}
                    onChange={(e) => setPoolNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatePoolSheetOpen(true)}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Pool
                  </Button>
                  <Button
                    onClick={handleAddToPool}
                    disabled={!selectedPoolId || addingToPool}
                    className="flex-1"
                  >
                    {addingToPool ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Add to Pool
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Pool Sheet */}
      <Sheet open={isCreatePoolSheetOpen} onOpenChange={setIsCreatePoolSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create New Talent Pool</SheetTitle>
            <SheetDescription>
              Create a new talent pool to organize your top candidates.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pool-name">Pool Name</Label>
              <Input
                id="pool-name"
                value={newPool.name}
                onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
                placeholder="e.g., Senior Developers, Marketing Team"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pool-description">Description</Label>
              <Textarea
                id="pool-description"
                value={newPool.description}
                onChange={(e) => setNewPool({ ...newPool, description: e.target.value })}
                placeholder="Describe what this pool is for..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pool-color">Color</Label>
              <Select value={newPool.color} onValueChange={(value) => setNewPool({ ...newPool, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: '#6366f1', label: 'Purple' },
                    { value: '#3b82f6', label: 'Blue' },
                    { value: '#10b981', label: 'Green' },
                    { value: '#f59e0b', label: 'Yellow' },
                    { value: '#ef4444', label: 'Red' },
                    { value: '#8b5cf6', label: 'Violet' },
                    { value: '#06b6d4', label: 'Cyan' },
                    { value: '#84cc16', label: 'Lime' }
                  ].map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pool-public"
                checked={newPool.is_public}
                onChange={(e) => setNewPool({ ...newPool, is_public: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="pool-public">Make this pool public</Label>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreatePoolSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePool}
                disabled={!newPool.name.trim() || creatingPool}
                className="flex-1"
              >
                {creatingPool ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pool
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MotionWrapper>
  );
};

export default ApplicationReviewPage;