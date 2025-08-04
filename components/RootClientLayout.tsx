"use client"

import { usePathname } from "next/navigation"
import { ConditionalNavbar } from "./conditional-navbar"
import { ConditionalFooter } from "./conditional-footer"

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isRecruiterRoute = pathname.startsWith('/recruiter')
  const isAdRoute = pathname.startsWith('/ad')

  if (isRecruiterRoute || isAdRoute) {
    return <>{children}</>
  }

  return (
    <>
      <ConditionalNavbar />
      {children}
      <ConditionalFooter />
    </>
  )
} 