"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't show navbar on dashboard pages (it's handled by dashboard layout)
  if (pathname.startsWith('/dashboard')) {
    return null
  }
  
  return <Navbar variant="default" />
} 