"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: string
  recruiterId?: string | null
  role?: string | null
  title?: string
  question?: string
}

export default function FeedbackDialog({ open, onOpenChange, context, recruiterId, role, title = 'We’d love your feedback!', question = 'How was your experience?' }: FeedbackDialogProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, rating, comment, recruiter_id: recruiterId, role }),
      })
      if (!res.ok) throw new Error('Failed to submit feedback')
      onOpenChange(false)
    } catch (e) {
      onOpenChange(false)
    } finally {
      setSubmitting(false)
      setRating(null)
      setComment('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{question}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1 block">Rate your experience</Label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`h-8 w-8 rounded-full border ${rating === n ? 'bg-yellow-400 border-yellow-500' : 'hover:bg-gray-50'}`}
                  onClick={() => setRating(n)}
                >{n}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1 block">Comments (optional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Share any thoughts to help us improve" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Dismiss</Button>
          <Button onClick={submit} disabled={submitting}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


