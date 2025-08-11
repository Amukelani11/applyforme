"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import FeedbackDialog from './FeedbackDialog'
import { createClient } from '@/lib/supabase/client'

type Trigger = 'immediate' | 'count' | 'onLogout'

interface UseFeedbackPromptOptions {
  context: string
  recruiterId?: string | null
  role?: string | null
  trigger?: Trigger
  actionKey?: string // for count-based prompts
  actionThreshold?: number // e.g., 3 jobs posted
}

export function useFeedbackPrompt({ context, recruiterId = null, role = null, trigger = 'immediate', actionKey, actionThreshold = 3 }: UseFeedbackPromptOptions) {
  const [open, setOpen] = useState(false)
  const shownRef = useRef(false)
  const sessionThreshold = Number(process.env.NEXT_PUBLIC_FEEDBACK_SESSION_THRESHOLD || '3')

  useEffect(() => {
    if (trigger !== 'immediate' || shownRef.current) return
    // Only show after a minimum number of sessions/page views
    const alreadyPrompted = localStorage.getItem(`feedback_prompted_${context}`) === '1'
    if (alreadyPrompted) return
    const sessions = Number(localStorage.getItem('app_session_count') || '0')
    if (sessions < sessionThreshold) return
    shownRef.current = true
    localStorage.setItem(`feedback_prompted_${context}`, '1')
    setOpen(true)
  }, [trigger, context, sessionThreshold])

  const onAction = useCallback(() => {
    if (!actionKey) return
    const count = Number(localStorage.getItem(actionKey) || '0') + 1
    localStorage.setItem(actionKey, count.toString())
    if (count >= actionThreshold && !shownRef.current) {
      shownRef.current = true
      localStorage.setItem(`feedback_prompted_${context}`, '1')
      setOpen(true)
    }
  }, [actionKey, actionThreshold, context])

  const onLogout = useCallback(() => {
    if (!shownRef.current) {
      shownRef.current = true
      localStorage.setItem(`feedback_prompted_${context}`, '1')
      setOpen(true)
    }
  }, [])

  const Dialog = (
    <FeedbackDialog open={open} onOpenChange={setOpen} context={context} recruiterId={recruiterId} role={role} />
  )

  return { Dialog, onAction, onLogout, open, setOpen }
}


