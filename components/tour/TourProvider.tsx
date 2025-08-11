"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { TourContext, TourStep } from './useTour'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
}

const DEFAULT_STEPS: TourStep[] = [
  { path: '/recruiter/dashboard', title: 'Dashboard', content: 'Your hiring overview: funnel, performance, and activity.', selector: 'nav a[href="/recruiter/dashboard"]' },
  { path: '/recruiter/jobs/new', title: 'Post a Job', content: 'Create and publish a new role to start receiving candidates.' },
  { path: '/recruiter/jobs', title: 'Manage Jobs', content: 'Track job status and open Applications for candidate review.' },
  { path: '/recruiter/messages', title: 'Messages', content: 'Chat with candidates and collaborate with your team in real time.' },
  { path: '/recruiter/tools', title: 'AI Tools', content: 'Use AI to optimize JDs, match resumes, benchmark salaries, and more.' },
  { path: '/recruiter/calendar', title: 'Calendar', content: 'Schedule interviews and keep your team aligned.' },
  { path: '/recruiter/team', title: 'Team', content: 'Invite teammates, set roles, and collaborate securely.' },
  { path: '/recruiter/dashboard/billing', title: 'Billing', content: 'See your plan and free-trial status; manage subscription.' },
]

export default function TourProvider({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const steps = DEFAULT_STEPS
  const [targetRect, setTargetRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null)

  useEffect(() => {
    // Only auto-open when already on the first step path (dashboard)
    const seen = localStorage.getItem('recruiter_tour_seen')
    const firstStepPath = steps[0]?.path
    const isOnFirstStep = pathname === firstStepPath
    if (!seen && isOnFirstStep) {
      setIsOpen(true)
    }
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const targetPath = steps[stepIndex]?.path
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath)
      return
    }

    const measure = () => {
      const sel = steps[stepIndex]?.selector
      if (!sel) {
        setTargetRect(null)
        return
      }
      const el = document.querySelector(sel) as HTMLElement | null
      if (el) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        } catch {}
        const rect = el.getBoundingClientRect()
        setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
      } else {
        setTargetRect(null)
      }
    }

    // Initial measure and a couple of delayed re-measures to handle late layout shifts
    measure()
    const t1 = setTimeout(measure, 200)
    const t2 = setTimeout(measure, 600)

    // Keep highlight in sync on scroll/resize
    const onScroll = () => measure()
    const onResize = () => measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen, stepIndex, pathname])

  const start = () => {
    setStepIndex(0)
    setIsOpen(true)
  }
  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0))
  const skip = () => {
    setIsOpen(false)
    localStorage.setItem('recruiter_tour_seen', '1')
  }
  const complete = () => {
    setIsOpen(false)
    localStorage.setItem('recruiter_tour_seen', '1')
  }

  const value = useMemo(() => ({ steps, isOpen, stepIndex, start, next, prev, skip, complete }), [steps, isOpen, stepIndex])

  return (
    <TourContext.Provider value={value}>
      {children}
      {isOpen && steps[stepIndex] && createPortal(
        <div className="fixed inset-0 z-[1000]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Spotlight around target if any */}
          {targetRect && (
            <div
              className="pointer-events-none absolute rounded-lg ring-2 ring-yellow-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
              style={{
                top: Math.max(8, targetRect.top - 8),
                left: Math.max(8, targetRect.left - 8),
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
          )}
          {/* Panel */}
          <div
            className="absolute w-full max-w-md rounded-lg bg-white shadow-lg p-4 space-y-3"
            style={targetRect ? {
              top: Math.min(window.innerHeight - 140, targetRect.top + targetRect.height + 12),
              left: Math.min(window.innerWidth - 360, Math.max(12, targetRect.left)),
            } : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="text-xs text-gray-500">Step {stepIndex + 1} of {steps.length}</div>
            <h3 className="text-lg font-semibold">{steps[stepIndex].title}</h3>
            <p className="text-sm text-gray-700">{steps[stepIndex].content}</p>
            <div className="flex justify-between pt-2">
              <div className="space-x-2">
                <Button variant="outline" onClick={skip}>Skip</Button>
                <Button variant="ghost" onClick={prev} disabled={stepIndex === 0}>Back</Button>
              </div>
              <div className="space-x-2">
                <Button onClick={stepIndex === steps.length - 1 ? complete : next}>{stepIndex === steps.length - 1 ? 'Done' : 'Next'}</Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </TourContext.Provider>
  )
}


