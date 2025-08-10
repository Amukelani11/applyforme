"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Search,
  MessageSquare,
  Calendar,
  BarChart3,
  FileText,
  UserPlus,
  Wrench,
  Bell,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useRef, Suspense } from "react"
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const navigation = [
  {
    name: "Dashboard",
    href: "/recruiter/dashboard",
    icon: Home
  },
  {
    name: "Jobs",
    href: "/recruiter/jobs",
    icon: Briefcase
  },
  {
    name: "Applications",
    href: "/recruiter/applications",
    icon: Users
  },
  {
    name: "Talent Pools",
    href: "/recruiter/talent-pools",
    icon: UserPlus
  },
  {
    name: "Messages",
    href: "/recruiter/messages",
    icon: MessageSquare
  },
  {
    name: "Calendar",
    href: "/recruiter/calendar",
    icon: Calendar
  },
  {
    name: "AI Market Research",
    href: "/recruiter/market-research",
    icon: Brain
  },
  {
    name: "Tools",
    href: "/recruiter/tools",
    icon: Wrench
  },
  {
    name: "Team",
    href: "/recruiter/team",
    icon: Users
  }
]

const bottomNavigation = [
  {
    name: "Billing",
    href: "/recruiter/dashboard/billing",
    icon: FileText
  },
  {
    name: "Settings",
    href: "/recruiter/dashboard/settings",
    icon: Settings
  }
]

function RecruiterSidebarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [recruiter, setRecruiter] = useState<any>(null)
  const [role, setRole] = useState<'admin'|'recruiter'|'hiring_manager'|'interviewer'|'owner'|null>(null)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const navRef = useRef<HTMLElement>(null)
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({})

  useEffect(() => {
    const getRecruiterData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Try owner profile first
      const { data: ownerRecruiter } = await supabase
        .from('recruiters')
        .select('id, company_name')
        .eq('user_id', user.id)
        .maybeSingle()

      if (ownerRecruiter) {
        setRecruiter(ownerRecruiter)
        fetchUnreadCount(ownerRecruiter.id)
        setRole('owner')
        return
      }

      // Fallback: team membership -> find recruiter's company
      const { data: membership } = await supabase
        .from('team_members')
        .select('recruiter_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (membership?.recruiter_id) {
        const { data: teamRecruiter } = await supabase
          .from('recruiters')
          .select('id, company_name')
          .eq('id', membership.recruiter_id)
          .maybeSingle()

        if (teamRecruiter) {
          setRecruiter(teamRecruiter)
          fetchUnreadCount(teamRecruiter.id)
          // Read the member role
          const { data: member } = await supabase
            .from('team_members')
            .select('role')
            .eq('user_id', user.id)
            .eq('recruiter_id', teamRecruiter.id)
            .maybeSingle()
          if (member?.role) setRole(member.role)
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
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  return (
    <div className="fixed z-30 flex h-full w-72 flex-col bg-white border-r border-gray-100">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-gray-100">
            <AvatarImage src={undefined} alt={recruiter?.company_name} />
            <AvatarFallback className="bg-theme-100 text-theme-700 font-semibold">
              {user ? getInitials(user.email!) : 'R'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">
              {recruiter?.company_name || 'Recruiter'}
            </div>
            <div className="text-sm text-gray-500">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 p-6 space-y-2 relative">
        <div 
          className="absolute left-0 w-1 bg-theme-600 rounded-full transition-all duration-500 ease-in-out"
          style={activeIndicatorStyle}
        />
        {navigation.filter(item => {
            // UI gating based on role
            if (!role || role === 'owner') return true
            if (role === 'recruiter') {
              // Hide Team management
              if (item.name === 'Team') return false
              // Allow others
              return true
            }
            if (role === 'hiring_manager') {
              // Hide Team, Jobs, Talent Pools, Tools
              if (['Team','Jobs','Talent Pools','Tools','AI Market Research'].includes(item.name)) return false
              return true
            }
            if (role === 'interviewer') {
              // Only Applications, Messages, Calendar, Dashboard
              if (!['Dashboard','Applications','Messages','Calendar'].includes(item.name)) return false
              return true
            }
            return true
          }).map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              data-active={isActive}
              className={cn(
                "group relative flex items-center space-x-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-lg z-10",
                isActive
                  ? "text-theme-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-theme-50"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-200",
                isActive ? "text-theme-600" : "text-gray-400 group-hover:text-gray-600"
              )} />
              <span className="transition-all duration-200">{item.name}</span>
              {item.name === "Applications" && unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation & Sign Out */}
      <div className="p-6 border-t border-gray-50 space-y-2">
        {bottomNavigation.filter(item => {
            if (!role || role === 'owner') return true
            if (role === 'admin') return true
            // Hide Billing for non-admins; allow Settings only for owner/admin
            if (item.name === 'Billing') return false
            if (item.name === 'Settings') return false
            return true
          }).map((item) => {
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

export function RecruiterSidebar() {
  return (
    <Suspense fallback={
      <div className="fixed z-30 flex h-full w-72 flex-col bg-white border-r border-gray-100">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-2">
          {navigation.map((item, index) => (
            <div key={item.name} className="flex items-center space-x-3 px-3 py-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <RecruiterSidebarContent />
    </Suspense>
  )
} 