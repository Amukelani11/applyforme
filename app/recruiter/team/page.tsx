"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Activity, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer'
  status: 'active' | 'inactive' | 'pending'
  last_active?: string
  created_at: string
  invited_by: {
    full_name: string
    email: string
  }
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
}

const roles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features and team management',
    permissions: [
      'Manage team members',
      'Access billing & subscription',
      'Create and manage job postings',
      'View all candidates and applications',
      'Manage company settings',
      'Access analytics and reports'
    ],
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    description: 'Full recruitment capabilities',
    permissions: [
      'Create and manage job postings',
      'View all candidates and applications',
      'Review and rate candidates',
      'Manage talent pools',
      'Access AI screening tools',
      'Collaborate with team members'
    ],
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'hiring_manager',
    name: 'Hiring Manager',
    description: 'Review candidates and make hiring decisions',
    permissions: [
      'View assigned candidates',
      'Review applications and CVs',
      'Rate and comment on candidates',
      'Submit interview feedback',
      'Make hiring recommendations',
      'Access candidate collaboration tools'
    ],
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'interviewer',
    name: 'Interviewer',
    description: 'Conduct interviews and provide feedback',
    permissions: [
      'View assigned candidates',
      'Access candidate profiles',
      'Submit interview feedback forms',
      'Rate candidates',
      'Add notes and comments',
      'View team collaboration'
    ],
    color: 'bg-purple-100 text-purple-800'
  }
]

// Define what each role CANNOT access
const roleRestrictions = {
  admin: {
    cannotAccess: []
  },
  recruiter: {
    cannotAccess: [
      'Manage team members',
      'Access billing & subscription',
      'Manage company settings',
      'Access analytics and reports'
    ]
  },
  hiring_manager: {
    cannotAccess: [
      'Manage team members',
      'Access billing & subscription',
      'Create and manage job postings',
      'Manage company settings',
      'Access analytics and reports',
      'Manage talent pools',
      'Access AI screening tools'
    ]
  },
  interviewer: {
    cannotAccess: [
      'Manage team members',
      'Access billing & subscription',
      'Create and manage job postings',
      'Manage company settings',
      'Access analytics and reports',
      'Manage talent pools',
      'Access AI screening tools',
      'Review all applications and CVs',
      'Make hiring recommendations'
    ]
  }
}

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'recruiter' as const,
    full_name: ''
  })

  const [editData, setEditData] = useState({
    full_name: '',
    role: 'recruiter' as 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer',
    status: 'active' as 'active' | 'inactive' | 'pending'
  })
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recruiter/team/members')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch team members')
      }

      // Transform the data to match our interface
      const transformedMembers: TeamMember[] = (data.teamMembers || []).map((member: any) => ({
        id: member.id,
        full_name: member.user?.full_name || '',
        email: member.user?.email || '',
        role: member.role,
        status: member.status,
        last_active: member.user?.last_sign_in_at,
        created_at: member.created_at,
        invited_by: {
          full_name: member.invited_by_user?.full_name || 'System',
          email: member.invited_by_user?.email || 'system@applyforme.com'
        }
      }))

      setTeamMembers(transformedMembers)
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const inviteTeamMember = async () => {
    if (!inviteData.email || !inviteData.full_name) return

    setLoading(true)
    try {
      const response = await fetch('/api/recruiter/team/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      // If it's a new invitation (not an existing user), show success message
      if (data.invitation) {
        toast({
          title: "Invitation Sent Successfully! 🎉",
          description: `An email invitation has been sent to ${inviteData.email}. They'll receive a beautiful invitation email with a link to join your team.`,
        })
        setInviteDialogOpen(false)
        setInviteData({ email: '', role: 'recruiter', full_name: '' })
      } else {
        toast({
          title: "Team Member Added",
          description: data.message || `${inviteData.full_name} has been added to your team successfully!`,
        })
        setInviteDialogOpen(false)
        setInviteData({ email: '', role: 'recruiter', full_name: '' })
      }
      
      // Refresh team members
      await fetchTeamMembers()
    } catch (error) {
      console.error('Error inviting team member:', error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTeamMember = async () => {
    if (!selectedMember) return

    setLoading(true)
    try {
      const response = await fetch(`/api/recruiter/team/members/${selectedMember.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update team member')
      }

      toast({
        title: "Updated",
        description: data.message || `${editData.full_name}'s profile has been updated`,
      })

      setEditDialogOpen(false)
      setSelectedMember(null)
      setEditData({ full_name: '', role: 'recruiter', status: 'active' })
      
      // Refresh team members
      await fetchTeamMembers()
    } catch (error) {
      console.error('Error updating team member:', error)
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const removeTeamMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/recruiter/team/members/${memberId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove team member')
      }

      toast({
        title: "Removed",
        description: data.message || "Team member has been removed",
      })
      
      // Refresh team members
      await fetchTeamMembers()
    } catch (error) {
      console.error('Error removing team member:', error)
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member)
    setEditData({
      full_name: member.full_name,
      role: member.role,
      status: member.status
    })
    setEditDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'inactive':
        return <UserX className="w-4 h-4 text-gray-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members, roles, and permissions</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  placeholder="Enter full name"
                  value={inviteData.full_name}
                  onChange={(e) => setInviteData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Select value={inviteData.role} onValueChange={(value: any) => setInviteData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={inviteTeamMember}
                  disabled={loading || !inviteData.email || !inviteData.full_name}
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Team Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => {
                      const role = roles.find(r => r.id === member.role)
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-xs">
                                  {member.full_name?.charAt(0) || member.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.full_name || 'No name'}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {role && (
                              <Badge variant="secondary" className={role.color}>
                                {role.name}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(member.status)}
                              <Badge variant="secondary" className={getStatusColor(member.status)}>
                                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.last_active ? (
                              <span className="text-sm text-gray-600">
                                {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(member)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTeamMember(member.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {/* Roles & Permissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roles.map((role) => {
              const restrictions = roleRestrictions[role.id as keyof typeof roleRestrictions]
              return (
                <Card key={role.id} className="overflow-hidden">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {role.name}
                      </CardTitle>
                      <Badge variant="secondary" className={role.color}>
                        {role.permissions.length} permissions
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                                             {/* Permissions */}
                       <div className="p-6 border-r">
                         <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                           <CheckCircle className="w-4 h-4" />
                           CAN ACCESS
                         </h4>
                         <div className="space-y-2">
                           {role.permissions.map((permission, index) => (
                             <div key={index} className="flex items-center gap-2 text-sm">
                               <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                               <span className="text-gray-700">{permission}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       {/* Restrictions */}
                       <div className="p-6">
                         <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" />
                           CANNOT ACCESS
                         </h4>
                         <div className="space-y-2">
                           {restrictions.cannotAccess.length > 0 ? (
                             restrictions.cannotAccess.map((restriction, index) => (
                               <div key={index} className="flex items-center gap-2 text-sm">
                                 <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                 <span className="text-gray-700">{restriction}</span>
                               </div>
                             ))
                           ) : (
                             <div className="flex items-center gap-2 text-sm">
                               <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                               <span className="text-gray-700">No restrictions - full access</span>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Team Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Activity log coming soon!</p>
                <p className="text-sm mt-1">Track team member actions and system events.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

             {/* Edit Team Member Dialog */}
       <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Edit Team Member</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <label className="text-sm font-medium mb-2 block">Full Name</label>
               <Input
                 placeholder="Enter full name"
                 value={editData.full_name}
                 onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
               />
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">Role</label>
               <Select value={editData.role} onValueChange={(value: any) => setEditData(prev => ({ ...prev, role: value }))}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {roles.map((role) => (
                     <SelectItem key={role.id} value={role.id}>
                       {role.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div>
               <label className="text-sm font-medium mb-2 block">Status</label>
               <Select value={editData.status} onValueChange={(value: any) => setEditData(prev => ({ ...prev, status: value }))}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="active">Active</SelectItem>
                   <SelectItem value="inactive">Inactive</SelectItem>
                   <SelectItem value="pending">Pending</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="flex justify-end gap-2 pt-4">
               <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                 Cancel
               </Button>
               <Button 
                 onClick={updateTeamMember}
                 disabled={loading || !editData.full_name}
               >
                 Update Member
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>


    </div>
  )
} 