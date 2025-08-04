"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  CreditCard,
  MessageSquare,
  Shield,
  UserCheck,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useRef, Suspense } from "react"
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "Applications",
    href: "/admin/applications",
    icon: Briefcase
  },
  {
    name: "Jobs",
    href: "/admin/jobs",
    icon: FileText
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3
  },
  {
    name: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard
  },
  {
    name: "Support",
    href: "/admin/support",
    icon: MessageSquare
  },
  {
    name: "CV Improvements",
    href: "/admin/cv-improvements",
    icon: UserCheck
  },
  {
    name: "Recruiters",
    href: "/admin/recruiters",
    icon: Shield
  },
  {
    name: "Setup",
    href: "/admin/setup",
    icon: Database
  }
]

const bottomNavigation = [
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
]

function AdminSidebarContent() {
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

export function AdminSidebar() {
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
      <AdminSidebarContent />
    </Suspense>
  )
} 