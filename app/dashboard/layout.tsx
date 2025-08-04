"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Award,
  User,
  Briefcase,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/navbar"

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "CV & Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "Certifications",
    href: "/dashboard/certifications",
    icon: Award,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Applications",
    href: "/dashboard/applications",
    icon: Briefcase,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-6">
        {children}
      </main>
    </div>
  )
} 