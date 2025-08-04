"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Briefcase,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Home,
  Calendar,
  Lightbulb,
  Wand2, // Use Wand2 for Tools
  Database,
  Shield,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useRef } from "react"
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

const navigation = [
  {
    name: "Dashboard",
    href: "/recruiter/dashboard",
    icon: Home
  },
  {
    name: "Job Postings",
    href: "/recruiter/jobs",
    icon: Briefcase
  },
  {
    name: "Applications",
    href: "/recruiter/applications",
    icon: Users
  },
  {
    name: "Messages",
    href: "/recruiter/messages",
    icon: MessageSquare
  },
  {
    name: "Talent Pools",
    href: "/recruiter/talent-pools",
    icon: Database
  },
  {
    name: "Tools",
    href: "/recruiter/tools",
    icon: Wand2
  },
  {
    name: "Calendar",
    href: "/recruiter/calendar",
    icon: Calendar
  },
  {
    name: "Team Management",
    href: "/recruiter/team",
    icon: Shield
  },
  {
    name: "Billing",
    href: "/recruiter/dashboard/billing",
    icon: CreditCard
  },
]

// Remove the separate tools section and all individual tool links.

const bottomNavigation = [
  {
    name: "Settings",
    href: "/recruiter/dashboard/settings",
    icon: Settings
  }
]

export function RecruiterSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [recruiter, setRecruiter] = useState<any>(null)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const navRef = useRef<HTMLElement>(null)
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({})

  useEffect(() => {
    const getRecruiterData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: recruiterData, error } = await supabase
          .from('recruiters')
          .select('id, company_name')
          .eq('user_id', user.id)
          .single()
        
        if (recruiterData) {
          setRecruiter(recruiterData)
          // Fetch unread application count
          fetchUnreadCount(recruiterData.id)
        }
      }
    }
    getRecruiterData()
  }, [supabase])

  const fetchUnreadCount = async (recruiterId: string) => {
    try {
      // Get job IDs for this recruiter
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('recruiter_id', recruiterId)
      
      if (!jobs || jobs.length === 0) {
        setUnreadCount(0)
        return
      }
      
      const jobIds = jobs.map((j: any) => j.id)
      
      // Count unread candidate applications
      const { count: candidateCount } = await supabase
        .from('candidate_applications')
        .select('*', { count: 'exact', head: true })
        .in('job_posting_id', jobIds)
        .eq('is_read', false)
      
      // Count unread public applications
      const { count: publicCount } = await supabase
        .from('public_applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobIds)
        .eq('is_read', false)
      
      const totalUnread = (candidateCount || 0) + (publicCount || 0)
      setUnreadCount(totalUnread)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeLink) {
        setActiveIndicatorStyle({
          top: activeLink.offsetTop,
          height: activeLink.offsetHeight,
          opacity: 1,
        });
      }
    }
  }, [pathname, searchParams]);

  // Refresh unread count periodically
  useEffect(() => {
    if (recruiter?.id) {
      const interval = setInterval(() => {
        fetchUnreadCount(recruiter.id)
      }, 30000) // Check every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [recruiter?.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/recruiter/login")
  }

  const getInitials = (email: string) => {
    if (!email) return 'R'
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="fixed z-30 flex h-full w-72 flex-col bg-white border-r border-gray-100">
      {/* User Profile Section - Refined */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-gray-100">
            <AvatarImage src="" alt={recruiter?.company_name} />
            <AvatarFallback className="bg-theme-100 text-theme-700 font-semibold">
              {user ? getInitials(recruiter?.company_name || user.email!) : 'R'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">
              {recruiter?.company_name || 'Recruiter'}
            </div>
            <div className="text-sm text-gray-500">Recruiter</div>
          </div>
        </div>
      </div>

      {/* Search Bar - Sleek Design */}
      <div className="p-6 border-b border-gray-50">
        <div className="relative">
          {searchExpanded ? (
            <div className="flex items-center space-x-2 animate-fade-in">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search jobs..." 
                  className="pl-9 border-0 border-b border-gray-200 rounded-none bg-transparent focus:border-theme-500 focus:ring-0 transition-colors duration-200"
                  autoFocus
                  onBlur={() => setSearchExpanded(false)}
                />
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchExpanded(true)}
              className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Jobs
            </Button>
          )}
        </div>
      </div>

      {/* Navigation - Minimalist Design */}
      <nav ref={navRef} className="flex-1 p-6 space-y-2 relative">
        {/* Active state indicator - Animated */}
        <div 
          className="absolute left-0 w-1 bg-theme-600 rounded-full transition-all duration-500 ease-in-out"
          style={activeIndicatorStyle}
        />

        {navigation.map((item, index) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/recruiter/dashboard' || pathname === item.href);
          const isApplicationsPage = item.name === "Applications";
          
          return (
            <Link
              key={item.name}
              href={item.href}
              data-active={isActive}
              className={cn(
                "group relative flex items-center space-x-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-lg z-10",
                isActive
                  ? "text-theme-600" // No background for active, just text color
                  : "text-gray-600 hover:text-gray-900 hover:bg-theme-50"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-200",
                isActive ? "text-theme-600" : "text-gray-400 group-hover:text-gray-600"
              )} />
              <span className="transition-all duration-200 flex-1">{item.name}</span>
              {isApplicationsPage && unreadCount > 0 && (
                <div className="relative">
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs font-semibold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Tools Section */}
      {/* The separate tools section and all individual tool links are removed. */}

      {/* Bottom Navigation - Refined */}
      <div className="p-6 border-t border-gray-50 space-y-2">
        {bottomNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center space-x-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
                isActive
                  ? "text-theme-600 bg-theme-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-theme-50"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-theme-600 rounded-full animate-fade-in" />
              )}
              
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-200",
                isActive ? "text-theme-600" : "text-gray-400 group-hover:text-gray-600"
              )} />
              <span className="transition-all duration-200">{item.name}</span>
            </Link>
          )
        })}
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="group w-full justify-start space-x-3 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg px-3 py-3"
        >
          <LogOut className="h-5 w-5 transition-all duration-200 text-gray-400 group-hover:text-red-500" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  )
} 