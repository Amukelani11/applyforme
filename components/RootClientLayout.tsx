"use client"

import { usePathname } from "next/navigation"
import { ConditionalNavbar } from "./conditional-navbar"
import { ConditionalFooter } from "./conditional-footer"
import TourProvider from './tour/TourProvider'

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isRecruiterRoute = pathname.startsWith('/recruiter')
  const isAdRoute = pathname.startsWith('/ad')

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
      <TourProvider>
        {children}
      </TourProvider>
      <ConditionalFooter />
    </>
  )
} 