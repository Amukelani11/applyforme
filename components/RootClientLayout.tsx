"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { ConditionalNavbar } from "./conditional-navbar"
import { ConditionalFooter } from "./conditional-footer"
import TourProvider from './tour/TourProvider'

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isRecruiterRoute = pathname.startsWith('/recruiter')
  const isAdRoute = pathname.startsWith('/ad')

  // Increment a lightweight session/page-view counter
  useEffect(() => {
    try {
      const current = Number(localStorage.getItem('app_session_count') || '0')
      localStorage.setItem('app_session_count', String(current + 1))
    } catch {}
  }, [pathname])

  if (isRecruiterRoute || isAdRoute) {
    return (
      <TourProvider>
        {children}
      </TourProvider>
    )
  }

  return (
    <>
      <ConditionalNavbar />
      {children}
      <ConditionalFooter />
    </>
  )
} 