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
  ChevronDown,
  Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
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
    href: "/recruiter/dashboard?tab=jobs",
    icon: Briefcase
  },
  {
    name: "Applications",
    href: "/recruiter/dashboard?tab=applications",
    icon: Users
  },
  {
    name: "Billing",
    href: "/recruiter/dashboard/billing",
    icon: CreditCard
  },
]

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
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [recruiter, setRecruiter] = useState<any>(null)

  useEffect(() => {
    const getRecruiterData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: recruiterData, error } = await supabase
          .from('recruiters')
          .select('company_name, cover_image_url, logo_url')
          .eq('user_id', user.id)
          .single()
        
        if (recruiterData) {
          setRecruiter(recruiterData)
        }
      }
    }
    getRecruiterData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/recruiter/login")
  }

  const getInitials = (email: string) => {
    if (!email) return 'R'
    return email.charAt(0).toUpperCase()
  }
  
  const getUserName = (email: string) => {
    if(!email) return 'Recruiter'
    // Fetch company name in a real app
    return 'Recruiter Account'
  }

  return (
    <div className="fixed z-30 flex h-full w-72 flex-col space-y-4 bg-gray-50 p-4">
      {/* User Profile Section */}
      <div 
        className="relative flex items-end justify-between rounded-lg p-3 h-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${recruiter?.cover_image_url || '/placeholder.jpg'})` }}
      >
        <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
        <div className="relative flex items-center gap-3">
          <Avatar className="h-9 w-9">
             <AvatarImage src={recruiter?.logo_url} alt={recruiter?.company_name} />
             <AvatarFallback>{user ? getInitials(recruiter?.company_name || user.email!) : 'R'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{recruiter?.company_name || 'Recruiter'}</span>
            <span className="text-xs text-gray-300">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search jobs..." className="pl-9 bg-white border-gray-200 focus:border-purple-400" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 border rounded-md px-1.5 py-0.5">/</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const currentTab = searchParams.get('tab')
          const isDashboard = item.href.startsWith('/recruiter/dashboard')
          
          let isActive = false
          if (isDashboard) {
            const itemUrl = new URL(item.href, "http://localhost")
            const itemTab = itemUrl.searchParams.get('tab')
            
            if (itemTab) { // It's a dashboard link with a tab
              isActive = pathname === '/recruiter/dashboard' && currentTab === itemTab
            } else if (item.href === '/recruiter/dashboard') { // It's the main dashboard link
              isActive = pathname === item.href && !currentTab
            } else { // It's another dashboard subpage like billing/settings
               isActive = pathname.startsWith(item.href)
            }
          } else {
            isActive = pathname.startsWith(item.href)
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation & Sign Out */}
      <div className="space-y-1">
         {bottomNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
} 