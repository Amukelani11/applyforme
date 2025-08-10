"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { MessageSquare, User, Eye, EyeOff, Trash2, Edit } from 'lucide-react'
import { useFeedbackPrompt } from '@/components/feedback/useFeedbackPrompt'
import { formatDistanceToNow } from 'date-fns'

interface CandidateNote {
  id: string
  note_text: string
  note_type: 'general' | 'screening' | 'interview' | 'reference_check' | 'offer'
  is_private: boolean
  created_at: string
  updated_at: string
  user: {
    full_name: string
    email: string
  }
}

interface CandidateNotesProps {
  applicationId: string
  applicationType: 'candidate' | 'public'
  recruiterId: string
}

const noteTypeLabels = {
  general: 'General',
  screening: 'Screening',
  interview: 'Interview',
  reference_check: 'Reference Check',
  offer: 'Offer'
}

const noteTypeColors = {
  general: 'bg-gray-100 text-gray-800',
  screening: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  reference_check: 'bg-orange-100 text-orange-800',
  offer: 'bg-green-100 text-green-800'
}

export function CandidateNotes({ applicationId, applicationType, recruiterId }: CandidateNotesProps) {
  const [notes, setNotes] = useState<CandidateNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<'general' | 'screening' | 'interview' | 'reference_check' | 'offer'>('general')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  
  const supabase = createClient()
  const { toast } = useToast()
  const { Dialog: FeedbackAfterNotesDialog, onAction: feedbackAction } = useFeedbackPrompt({ context: 'collaboration', recruiterId, role: 'team_member', trigger: 'count', actionKey: 'notes_count', actionThreshold: 5 })

  useEffect(() => {
    fetchNotes()
  }, [applicationId])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_notes')
        .select(`
          *,
          user:users(full_name, email)
        `)
        .eq('application_id', applicationId)
        .eq('application_type', applicationType)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      })
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('candidate_notes')
        .insert({
          application_id: applicationId,
          application_type: applicationType,
          user_id: user.id,
          recruiter_id: recruiterId,
          note_text: newNote.trim(),
          note_type: noteType,
          is_private: isPrivate
        })

      if (error) throw error

      setNewNote('')
      setNoteType('general')
      setIsPrivate(false)
      await fetchNotes()
      
      toast({
        title: "Success",
        description: "Note added successfully"
      })
      feedbackAction()
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateNote = async (noteId: string) => {
    if (!editText.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('candidate_notes')
        .update({
          note_text: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)

      if (error) throw error

      setEditingNote(null)
      setEditText('')
      await fetchNotes()
      
      toast({
        title: "Success",
        description: "Note updated successfully"
      })
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('candidate_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      await fetchNotes()
      
      toast({
        title: "Success",
        description: "Note deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (note: CandidateNote) => {
    setEditingNote(note.id)
    setEditText(note.note_text)
  }

  const cancelEditing = () => {
    setEditingNote(null)
    setEditText('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Team Notes & Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {FeedbackAfterNotesDialog}
        {/* Add New Note */}
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="note-type">Note Type</Label>
              <Select value={noteType} onValueChange={(value: any) => setNoteType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(noteTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="private-note"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="private-note" className="text-sm">
                Private Note
              </Label>
            </div>
          </div>
          
          <Textarea
            placeholder="Add a note or comment about this candidate..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {isPrivate ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Private note - only you can see this
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Team note - visible to all team members
                </>
              )}
            </div>
            <Button 
              onClick={addNote} 
              disabled={loading || !newNote.trim()}
              size="sm"
            >
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notes yet. Add the first note to start the conversation!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 bg-white">
                {editingNote === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                    />
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
                        onClick={() => updateNote(note.id)}
                        disabled={loading || !editText.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {note.user?.full_name?.charAt(0) || note.user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {note.user?.full_name || note.user?.email}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${noteTypeColors[note.note_type]}`}
                        >
                          {noteTypeLabels[note.note_type]}
                        </Badge>
                        {note.is_private && (
                          <Badge variant="outline" className="text-xs">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(note)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                      {note.note_text}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      {note.updated_at !== note.created_at && (
                        <span> (edited {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })})</span>
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