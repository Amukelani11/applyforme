"use client"

import { usePathname } from "next/navigation"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { ConditionalFooter } from "@/components/conditional-footer"

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/recruiter/dashboard")
  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <ConditionalNavbar />}
      <main className="flex-1">{children}</main>
      {!isDashboard && <ConditionalFooter />}
    </div>
  )
} 