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
  { path: '/recruiter/dashboard', title: 'Dashboard', content: 'Your hiring overview: funnel, performance, and activity.' },
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

  useEffect(() => {
    const seen = localStorage.getItem('recruiter_tour_seen')
    if (!seen) setIsOpen(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const targetPath = steps[stepIndex]?.path
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath)
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
        <div className="fixed inset-0 z-[1000] bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-lg p-4 space-y-3">
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


