"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Star, StarIcon, MessageSquare, Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CandidateRating {
  id: string
  rating: number
  rating_type: 'overall' | 'technical' | 'cultural_fit' | 'experience' | 'communication'
  comment?: string
  created_at: string
  updated_at: string
  user: {
    full_name: string
    email: string
  }
}

interface CandidateRatingProps {
  applicationId: string
  applicationType: 'candidate' | 'public'
  recruiterId: string
}

const ratingTypeLabels = {
  overall: 'Overall',
  technical: 'Technical Skills',
  cultural_fit: 'Cultural Fit',
  experience: 'Experience',
  communication: 'Communication'
}

const ratingTypeColors = {
  overall: 'bg-purple-100 text-purple-800',
  technical: 'bg-blue-100 text-blue-800',
  cultural_fit: 'bg-green-100 text-green-800',
  experience: 'bg-orange-100 text-orange-800',
  communication: 'bg-pink-100 text-pink-800'
}

export function CandidateRating({ applicationId, applicationType, recruiterId }: CandidateRatingProps) {
  const [ratings, setRatings] = useState<CandidateRating[]>([])
  const [newRating, setNewRating] = useState(0)
  const [ratingType, setRatingType] = useState<'overall' | 'technical' | 'cultural_fit' | 'experience' | 'communication'>('overall')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingRating, setEditingRating] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchRatings()
  }, [applicationId])

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_ratings')
        .select(`
          *,
          user:users(full_name, email)
        `)
        .eq('application_id', applicationId)
        .eq('application_type', applicationType)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRatings(data || [])
    } catch (error) {
      console.error('Error fetching ratings:', error)
      toast({
        title: "Error",
        description: "Failed to load ratings",
        variant: "destructive"
      })
    }
  }

  const addRating = async () => {
    if (newRating === 0) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('candidate_ratings')
        .upsert({
          application_id: applicationId,
          application_type: applicationType,
          user_id: user.id,
          recruiter_id: recruiterId,
          rating: newRating,
          rating_type: ratingType,
          comment: comment.trim() || null
        }, {
          onConflict: 'application_id,application_type,user_id,rating_type'
        })

      if (error) throw error

      setNewRating(0)
      setRatingType('overall')
      setComment('')
      await fetchRatings()
      
      toast({
        title: "Success",
        description: "Rating added successfully"
      })
    } catch (error) {
      console.error('Error adding rating:', error)
      toast({
        title: "Error",
        description: "Failed to add rating",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRating = async (ratingId: string) => {
    if (editRating === 0) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('candidate_ratings')
        .update({
          rating: editRating,
          comment: editComment.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ratingId)

      if (error) throw error

      setEditingRating(null)
      setEditRating(0)
      setEditComment('')
      await fetchRatings()
      
      toast({
        title: "Success",
        description: "Rating updated successfully"
      })
    } catch (error) {
      console.error('Error updating rating:', error)
      toast({
        title: "Error",
        description: "Failed to update rating",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteRating = async (ratingId: string) => {
    if (!confirm('Are you sure you want to delete this rating?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('candidate_ratings')
        .delete()
        .eq('id', ratingId)

      if (error) throw error

      await fetchRatings()
      
      toast({
        title: "Success",
        description: "Rating deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting rating:', error)
      toast({
        title: "Error",
        description: "Failed to delete rating",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (rating: CandidateRating) => {
    setEditingRating(rating.id)
    setEditRating(rating.rating)
    setEditComment(rating.comment || '')
  }

  const cancelEditing = () => {
    setEditingRating(null)
    setEditRating(0)
    setEditComment('')
  }

  const getAverageRating = (type: string) => {
    const typeRatings = ratings.filter(r => r.rating_type === type)
    if (typeRatings.length === 0) return 0
    return typeRatings.reduce((sum, r) => sum + r.rating, 0) / typeRatings.length
  }

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Team Ratings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Ratings Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          {Object.entries(ratingTypeLabels).map(([key, label]) => {
            const avgRating = getAverageRating(key)
            return (
              <div key={key} className="text-center">
                <p className="text-xs text-gray-600 mb-1">{label}</p>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(avgRating))}
                </div>
                <p className="text-sm font-medium">
                  {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
                </p>
              </div>
            )
          })}
        </div>

        {/* Add New Rating */}
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rating Type</label>
              <Select value={ratingType} onValueChange={(value: any) => setRatingType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ratingTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              {renderStars(newRating, true, setNewRating)}
            </div>
          </div>
          
          <Textarea
            placeholder="Add a comment about this rating (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={addRating} 
              disabled={loading || newRating === 0}
              size="sm"
            >
              Add Rating
            </Button>
          </div>
        </div>

        {/* Ratings List */}
        <div className="space-y-3">
          {ratings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No ratings yet. Be the first to rate this candidate!</p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.id} className="border rounded-lg p-4 bg-white">
                {editingRating === rating.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Rating</label>
                        {renderStars(editRating, true, setEditRating)}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Add a comment about this rating (optional)..."
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={2}
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
                        onClick={() => updateRating(rating.id)}
                        disabled={loading || editRating === 0}
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
                            {rating.user?.full_name?.charAt(0) || rating.user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {rating.user?.full_name || rating.user?.email}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${ratingTypeColors[rating.rating_type]}`}
                        >
                          {ratingTypeLabels[rating.rating_type]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(rating)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRating(rating.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      {renderStars(rating.rating)}
                    </div>
                    
                    {rating.comment && (
                      <p className="text-sm text-gray-700 mb-2">
                        {rating.comment}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                      {rating.updated_at !== rating.created_at && (
                        <span> (edited {formatDistanceToNow(new Date(rating.updated_at), { addSuffix: true })})</span>
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