"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't show navbar on these pages (they handle their own navigation)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/jobs/public/')) {
    return null
  }
  
  return <Navbar variant="default" />
} 