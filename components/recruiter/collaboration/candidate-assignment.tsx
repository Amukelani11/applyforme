"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { UserCheck, Calendar, Clock, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface TeamMember {
  id: string
  full_name: string
  email: string
}

interface CandidateAssignment {
  id: string
  assignment_type: 'screening' | 'interview' | 'reference_check' | 'offer_negotiation' | 'onboarding'
  status: 'pending' | 'in_progress' | 'completed' | 'reassigned'
  due_date?: string
  notes?: string
  created_at: string
  updated_at: string
  assigned_by: {
    full_name: string
    email: string
  }
  assigned_to: {
    full_name: string
    email: string
  }
}

interface CandidateAssignmentProps {
  applicationId: string
  applicationType: 'candidate' | 'public'
}

const assignmentTypeLabels = {
  screening: 'Screening',
  interview: 'Interview',
  reference_check: 'Reference Check',
  offer_negotiation: 'Offer Negotiation',
  onboarding: 'Onboarding'
}

const assignmentTypeColors = {
  screening: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  reference_check: 'bg-orange-100 text-orange-800',
  offer_negotiation: 'bg-green-100 text-green-800',
  onboarding: 'bg-indigo-100 text-indigo-800'
}

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  reassigned: 'Reassigned'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  reassigned: 'bg-gray-100 text-gray-800'
}

export function CandidateAssignment({ applicationId, applicationType }: CandidateAssignmentProps) {
  const [assignments, setAssignments] = useState<CandidateAssignment[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newAssignment, setNewAssignment] = useState({
    assigned_to: '',
    assignment_type: 'screening' as const,
    due_date: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    assigned_to: '',
    assignment_type: 'screening' as const,
    status: 'pending' as const,
    due_date: '',
    notes: ''
  })
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchAssignments()
    fetchTeamMembers()
  }, [applicationId])

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_assignments')
        .select(`
          *,
          assigned_by:users!assigned_by(full_name, email),
          assigned_to:users!assigned_to(full_name, email)
        `)
        .eq('application_id', applicationId)
        .eq('application_type', applicationType)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive"
      })
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get recruiter profile to find team members
      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!recruiter) return

      // For now, we'll get all users in the system
      // In a real app, you'd have a team members table
      const { data: users, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .neq('id', user.id)

      if (error) throw error
      setTeamMembers(users || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const addAssignment = async () => {
    if (!newAssignment.assigned_to) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('candidate_assignments')
        .insert({
          application_id: applicationId,
          application_type: applicationType,
          assigned_by: user.id,
          assigned_to: newAssignment.assigned_to,
          assignment_type: newAssignment.assignment_type,
          due_date: newAssignment.due_date || null,
          notes: newAssignment.notes.trim() || null
        })

      if (error) throw error

      setNewAssignment({
        assigned_to: '',
        assignment_type: 'screening',
        due_date: '',
        notes: ''
      })
      await fetchAssignments()
      
      toast({
        title: "Success",
        description: "Assignment created successfully"
      })
    } catch (error) {
      console.error('Error adding assignment:', error)
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAssignment = async (assignmentId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('candidate_assignments')
        .update({
          assigned_to: editData.assigned_to,
          assignment_type: editData.assignment_type,
          status: editData.status,
          due_date: editData.due_date || null,
          notes: editData.notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)

      if (error) throw error

      setEditingAssignment(null)
      setEditData({
        assigned_to: '',
        assignment_type: 'screening',
        status: 'pending',
        due_date: '',
        notes: ''
      })
      await fetchAssignments()
      
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      })
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('candidate_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error

      await fetchAssignments()
      
      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (assignment: CandidateAssignment) => {
    setEditingAssignment(assignment.id)
    setEditData({
      assigned_to: assignment.assigned_to.id,
      assignment_type: assignment.assignment_type,
      status: assignment.status,
      due_date: assignment.due_date ? format(new Date(assignment.due_date), 'yyyy-MM-dd') : '',
      notes: assignment.notes || ''
    })
  }

  const cancelEditing = () => {
    setEditingAssignment(null)
    setEditData({
      assigned_to: '',
      assignment_type: 'screening',
      status: 'pending',
      due_date: '',
      notes: ''
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'reassigned':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Assignments & Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Assignment */}
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assign-to">Assign To</Label>
              <Select value={newAssignment.assigned_to} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, assigned_to: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignment-type">Assignment Type</Label>
              <Select value={newAssignment.assignment_type} onValueChange={(value: any) => setNewAssignment(prev => ({ ...prev, assignment_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(assignmentTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                type="date"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              placeholder="Add any specific instructions or notes..."
              value={newAssignment.notes}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={addAssignment} 
              disabled={loading || !newAssignment.assigned_to}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No assignments yet. Create the first assignment to get started!</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4 bg-white">
                {editingAssignment === assignment.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Assign To</Label>
                        <Select value={editData.assigned_to} onValueChange={(value) => setEditData(prev => ({ ...prev, assigned_to: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.full_name || member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Assignment Type</Label>
                        <Select value={editData.assignment_type} onValueChange={(value: any) => setEditData(prev => ({ ...prev, assignment_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(assignmentTypeLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={editData.status} onValueChange={(value: any) => setEditData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={editData.due_date}
                          onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={editData.notes}
                        onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => updateAssignment(assignment.id)}
                        disabled={loading || !editData.assigned_to}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {assignment.assigned_to.full_name?.charAt(0) || assignment.assigned_to.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {assignment.assigned_to.full_name || assignment.assigned_to.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Assigned by {assignment.assigned_by.full_name || assignment.assigned_by.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(assignment)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAssignment(assignment.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${assignmentTypeColors[assignment.assignment_type]}`}
                      >
                        {assignmentTypeLabels[assignment.assignment_type]}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${statusColors[assignment.status]}`}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(assignment.status)}
                          {statusLabels[assignment.status]}
                        </div>
                      </Badge>
                    </div>
                    
                    {assignment.due_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    
                    {assignment.notes && (
                      <p className="text-sm text-gray-700 mb-2">
                        {assignment.notes}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                      {assignment.updated_at !== assignment.created_at && (
                        <span> (updated {formatDistanceToNow(new Date(assignment.updated_at), { addSuffix: true })})</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 