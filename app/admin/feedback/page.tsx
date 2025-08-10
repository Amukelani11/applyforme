"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FeedbackRow {
  id: string
  created_at: string
  user_id: string
  recruiter_id: string | null
  role: string | null
  context: string
  rating: number | null
  comment: string | null
}

export default function AdminFeedbackPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<FeedbackRow[]>([])
  const [search, setSearch] = useState('')
  const [contextFilter, setContextFilter] = useState('all')

  useEffect(() => { fetchRows() }, [])

  const fetchRows = async () => {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setRows(data as any)
  }

  const filtered = rows.filter(r => {
    const matchesText = (
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.context.toLowerCase().includes(search.toLowerCase()) ||
      (r.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.recruiter_id || '').toLowerCase().includes(search.toLowerCase())
    )
    const matchesCtx = contextFilter === 'all' || r.context === contextFilter
    return matchesText && matchesCtx
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Search comment/context/company id" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={contextFilter} onValueChange={setContextFilter}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Context" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="post_job">Posting Job</SelectItem>
              <SelectItem value="candidate_review">Candidate Review</SelectItem>
              <SelectItem value="collaboration">Collaboration</SelectItem>
              <SelectItem value="sign_out">Sign Out</SelectItem>
              <SelectItem value="threshold">Threshold</SelectItem>
            </SelectContent>
          </SelectSelect>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Recruiter</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                <TableCell>{r.context}</TableCell>
                <TableCell>{r.rating ?? '-'}</TableCell>
                <TableCell className="max-w-[420px] truncate" title={r.comment || ''}>{r.comment}</TableCell>
                <TableCell>{r.user_id}</TableCell>
                <TableCell>{r.recruiter_id || '-'}</TableCell>
                <TableCell>{r.role || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}


