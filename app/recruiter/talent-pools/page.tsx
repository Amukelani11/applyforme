'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Settings
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface TalentPool {
  id: string
  name: string
  description: string
  color: string
  is_public: boolean
  created_at: string
  updated_at: string
  member_count: number
}

interface PoolMember {
  id: string
  candidate_name: string
  candidate_email: string
  candidate_phone: string
  candidate_location: string
  job_title: string
  company_name: string
  added_notes: string
  created_at: string
}

export default function TalentPoolsPage() {
  const [pools, setPools] = useState<TalentPool[]>([])
  const [members, setMembers] = useState<PoolMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPool, setSelectedPool] = useState<TalentPool | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewMembersDialogOpen, setIsViewMembersDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const [newPool, setNewPool] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    is_public: false
  })

  const [editingPool, setEditingPool] = useState({
    id: '',
    name: '',
    description: '',
    color: '#6366f1',
    is_public: false
  })

  const supabase = createClient()

  // Fetch talent pools
  const fetchPools = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to view talent pools',
          variant: 'destructive'
        })
        return
      }

      // Get recruiter ID
      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!recruiter) {
        toast({
          title: 'Access Denied',
          description: 'Only recruiters can access talent pools',
          variant: 'destructive'
        })
        return
      }

      // Fetch pools with member count
      const { data: poolsData, error } = await supabase
        .from('talent_pools')
        .select(`
          *,
          member_count:talent_pool_members(count)
        `)
        .eq('recruiter_id', recruiter.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pools:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch talent pools',
          variant: 'destructive'
        })
        return
      }

      // Transform the data to include member count
      const transformedPools = poolsData.map(pool => ({
        ...pool,
        member_count: pool.member_count?.[0]?.count || 0
      }))

      setPools(transformedPools)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load talent pools',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch pool members
  const fetchPoolMembers = async (poolId: string) => {
    try {
      const { data, error } = await supabase
        .from('talent_pool_members')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching members:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch pool members',
          variant: 'destructive'
        })
        return
      }

      setMembers(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load pool members',
        variant: 'destructive'
      })
    }
  }

  // Create new pool
  const createPool = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!recruiter) return

      const { error } = await supabase
        .from('talent_pools')
        .insert({
          recruiter_id: recruiter.id,
          name: newPool.name,
          description: newPool.description,
          color: newPool.color,
          is_public: newPool.is_public
        })

      if (error) {
        console.error('Error creating pool:', error)
        toast({
          title: 'Error',
          description: 'Failed to create talent pool',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Talent pool created successfully'
      })

      setIsCreateDialogOpen(false)
      setNewPool({ name: '', description: '', color: '#6366f1', is_public: false })
      fetchPools()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create talent pool',
        variant: 'destructive'
      })
    }
  }

  // Update pool
  const updatePool = async () => {
    try {
      const { error } = await supabase
        .from('talent_pools')
        .update({
          name: editingPool.name,
          description: editingPool.description,
          color: editingPool.color,
          is_public: editingPool.is_public
        })
        .eq('id', editingPool.id)

      if (error) {
        console.error('Error updating pool:', error)
        toast({
          title: 'Error',
          description: 'Failed to update talent pool',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Talent pool updated successfully'
      })

      setIsEditDialogOpen(false)
      fetchPools()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update talent pool',
        variant: 'destructive'
      })
    }
  }

  // Delete pool
  const deletePool = async (poolId: string) => {
    if (!confirm('Are you sure you want to delete this talent pool? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('talent_pools')
        .delete()
        .eq('id', poolId)

      if (error) {
        console.error('Error deleting pool:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete talent pool',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Talent pool deleted successfully'
      })

      fetchPools()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete talent pool',
        variant: 'destructive'
      })
    }
  }

  // Remove member from pool
  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this candidate from the pool?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('talent_pool_members')
        .delete()
        .eq('id', memberId)

      if (error) {
        console.error('Error removing member:', error)
        toast({
          title: 'Error',
          description: 'Failed to remove candidate from pool',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Candidate removed from pool successfully'
      })

      if (selectedPool) {
        fetchPoolMembers(selectedPool.id)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove candidate from pool',
        variant: 'destructive'
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (pool: TalentPool) => {
    setEditingPool({
      id: pool.id,
      name: pool.name,
      description: pool.description,
      color: pool.color,
      is_public: pool.is_public
    })
    setIsEditDialogOpen(true)
  }

  // Open view members dialog
  const openViewMembersDialog = async (pool: TalentPool) => {
    setSelectedPool(pool)
    await fetchPoolMembers(pool.id)
    setIsViewMembersDialogOpen(true)
  }

  useEffect(() => {
    fetchPools()
  }, [])

  // Filter pools based on search and filter
  const filteredPools = pools.filter(pool => {
    const matchesSearch = pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'public' && pool.is_public) ||
                         (filterStatus === 'private' && !pool.is_public)
    
    return matchesSearch && matchesFilter
  })

  const colorOptions = [
    { value: '#6366f1', label: 'Purple' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#84cc16', label: 'Lime' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading talent pools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Talent Pools</h1>
          <p className="text-gray-600 mt-2">Manage your candidate talent pools</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Pool
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Talent Pool</DialogTitle>
              <DialogDescription>
                Create a new talent pool to organize your top candidates.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Pool Name</Label>
                <Input
                  id="name"
                  value={newPool.name}
                  onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
                  placeholder="e.g., Senior Developers, Marketing Team"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPool.description}
                  onChange={(e) => setNewPool({ ...newPool, description: e.target.value })}
                  placeholder="Describe what this pool is for..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Select value={newPool.color} onValueChange={(value) => setNewPool({ ...newPool, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newPool.is_public}
                  onChange={(e) => setNewPool({ ...newPool, is_public: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_public">Make this pool public</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPool} disabled={!newPool.name.trim()}>
                Create Pool
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search pools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pools</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPools.map((pool) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: pool.color }}
                      />
                      <div>
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {pool.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={pool.is_public ? "default" : "secondary"}>
                        {pool.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {pool.member_count} {pool.member_count === 1 ? 'candidate' : 'candidates'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(pool.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewMembersDialog(pool)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pool)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePool(pool.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPools.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No pools found' : 'No talent pools yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first talent pool to start organizing candidates'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Pool
            </Button>
          )}
        </div>
      )}

      {/* Edit Pool Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Talent Pool</DialogTitle>
            <DialogDescription>
              Update your talent pool details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Pool Name</Label>
              <Input
                id="edit-name"
                value={editingPool.name}
                onChange={(e) => setEditingPool({ ...editingPool, name: e.target.value })}
                placeholder="e.g., Senior Developers, Marketing Team"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingPool.description}
                onChange={(e) => setEditingPool({ ...editingPool, description: e.target.value })}
                placeholder="Describe what this pool is for..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-color">Color</Label>
              <Select value={editingPool.color} onValueChange={(value) => setEditingPool({ ...editingPool, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_public"
                checked={editingPool.is_public}
                onChange={(e) => setEditingPool({ ...editingPool, is_public: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-is_public">Make this pool public</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updatePool} disabled={!editingPool.name.trim()}>
              Update Pool
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={isViewMembersDialogOpen} onOpenChange={setIsViewMembersDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedPool?.color }}
              />
              {selectedPool?.name} - Members
            </DialogTitle>
            <DialogDescription>
              {members.length} {members.length === 1 ? 'candidate' : 'candidates'} in this pool
            </DialogDescription>
          </DialogHeader>
          
          {members.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No candidates in this pool yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add candidates from job applications to build your talent pool
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{member.candidate_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {member.job_title || 'No title'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {member.candidate_email}
                        </div>
                        {member.candidate_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {member.candidate_phone}
                          </div>
                        )}
                        {member.candidate_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {member.candidate_location}
                          </div>
                        )}
                        {member.company_name && (
                          <div className="flex items-center gap-2">
                            <Building className="w-3 h-3" />
                            {member.company_name}
                          </div>
                        )}
                        {member.added_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <strong>Notes:</strong> {member.added_notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Added {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 