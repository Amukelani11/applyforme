"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Briefcase,
  User,
  Settings,
  LogOut,
  Sparkles,
  FileText,
  Search,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    name: "Applications",
    href: "/dashboard/applications",
    icon: Briefcase
  },
  {
    name: "AI Recommendations",
    href: "/dashboard/ai-recommendations",
    icon: Sparkles
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User
  },
]

const bottomNavigation = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getInitials = (email: string) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }
  
  const getUserName = (email: string) => {
    if(!email) return 'User'
    return email.split('@')[0]
  }

  return (
    <div className="flex h-full w-72 flex-col space-y-4 bg-gray-50 p-4">
      {/* User Profile Section */}
      <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-100 cursor-pointer">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user ? getInitials(user.email!) : 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">{user ? getUserName(user.email!) : 'Loading...'}</span>
            <span className="text-xs text-gray-500">{user ? user.email : 'Loading...'}</span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400"/>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search" className="pl-9 bg-white border-gray-200 focus:border-purple-400" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 border rounded-md px-1.5 py-0.5">/</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
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