"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  FileText,
  Building2,
  Sparkles,
  Briefcase,
  Settings,
  LogOut,
  Home,
  CreditCard,
  BarChart3,
  MessageSquare,
  FileEdit,
  Bot,
  Shield,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useRef } from "react"
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "Recruiter Management",
    href: "/admin/recruiters",
    icon: Building2
  },
  {
    name: "Job Post Management",
    href: "/admin/jobs",
    icon: Briefcase
  },
  {
    name: "Application Oversight",
    href: "/admin/applications",
    icon: FileText
  },
  {
    name: "Subscription Management",
    href: "/admin/subscriptions",
    icon: CreditCard
  },
  {
    name: "Analytics & Insights",
    href: "/admin/analytics",
    icon: BarChart3
  },
  {
    name: "Support & Communication",
    href: "/admin/support",
    icon: MessageSquare
  },
  {
    name: "Content & Settings",
    href: "/admin/content",
    icon: FileEdit
  },
  {
    name: "AI Usage Monitoring",
    href: "/admin/ai-monitoring",
    icon: Bot
  },
  {
    name: "CV Improvements",
    href: "/admin/cv-improvements",
    icon: Sparkles
  },
  {
    name: "Security & Moderation",
    href: "/admin/security",
    icon: Shield
  },
  {
    name: "Activity Logs",
    href: "/admin/activity",
    icon: Activity
  },
]

const bottomNavigation = [
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  
  const navRef = useRef<HTMLElement>(null)
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({})

  useEffect(() => {
    const getProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const { data: profileData, error } = await supabase
          .from('users')
          .select('full_name, avatar_url, is_admin')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      }
    }
    getProfileData()
  }, [supabase])

  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeLink) {
        setActiveIndicatorStyle({
          top: activeLink.offsetTop,
          height: activeLink.offsetHeight,
          opacity: 1,
        });
      } else {
        // Hide indicator if no active link
        setActiveIndicatorStyle({ opacity: 0 });
      }
    }
  }, [pathname, searchParams]);

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('')
  }

  return (
    <div className="fixed z-30 flex h-full w-72 flex-col bg-white border-r border-gray-100">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-gray-100">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-theme-100 text-theme-700 font-semibold">
              {user ? getInitials(profile?.full_name || user.email!) : 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">
              {profile?.full_name || 'Admin'}
            </div>
            <div className="text-sm text-gray-500">
                {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 p-6 space-y-2 relative overflow-y-auto">
        <div 
          className="absolute left-0 w-1 bg-theme-600 rounded-full transition-all duration-500 ease-in-out"
          style={activeIndicatorStyle}
        />
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation & Sign Out */}
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