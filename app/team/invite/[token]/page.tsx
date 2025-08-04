"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  UserPlus, 
  LogIn, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building,
  Mail,
  User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TeamInvitation {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer'
  expires_at: string
  accepted_at?: string
  created_at: string
  recruiter: {
    company_name: string
    user: {
      full_name: string
      email: string
    }
  }
  invited_by: {
    full_name: string
    email: string
  }
}

const roleLabels = {
  admin: 'Admin',
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  interviewer: 'Interviewer'
}

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  recruiter: 'bg-blue-100 text-blue-800',
  hiring_manager: 'bg-green-100 text-green-800',
  interviewer: 'bg-purple-100 text-purple-800'
}

export default function TeamInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [activeTab, setActiveTab] = useState('existing')
  
  // Form states
  const [existingEmail, setExistingEmail] = useState('')
  const [existingPassword, setExistingPassword] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if (token) {
      fetchInvitation()
    }
  }, [token])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/team/invite/${token}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "Invalid or expired invitation link",
            variant: "destructive"
          })
        } else if (response.status === 410) {
          toast({
            title: "Expired",
            description: "This invitation has expired",
            variant: "destructive"
          })
        } else if (response.status === 409) {
          toast({
            title: "Already Accepted",
            description: "This invitation has already been accepted",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to load invitation",
            variant: "destructive"
          })
        }
        return
      }

      setInvitation(data.invitation)
      setNewEmail(data.invitation.email)
      setNewFullName(data.invitation.full_name || '')
      setExistingEmail(data.invitation.email)
    } catch (error) {
      console.error('Error fetching invitation:', error)
      toast({
        title: "Error",
        description: "Failed to load invitation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const acceptWithExistingAccount = async () => {
    if (!invitation || !existingEmail || !existingPassword) return

    setAccepting(true)
    try {
      // Sign in with existing account
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: existingEmail,
        password: existingPassword
      })

      if (signInError) {
        toast({
          title: "Sign In Failed",
          description: signInError.message,
          variant: "destructive"
        })
        return
      }

      // Accept the invitation
      await acceptInvitation(user.id)
    } catch (error) {
      console.error('Error accepting invitation with existing account:', error)
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive"
      })
    } finally {
      setAccepting(false)
    }
  }

  const acceptWithNewAccount = async () => {
    if (!invitation || !newFullName || !newEmail || !newPassword || !confirmPassword) return

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    setAccepting(true)
    try {
      // Create new user account
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: {
            full_name: newFullName
          }
        }
      })

      if (signUpError) {
        toast({
          title: "Sign Up Failed",
          description: signUpError.message,
          variant: "destructive"
        })
        return
      }

      if (!user) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive"
        })
        return
      }

      // Accept the invitation
      await acceptInvitation(user.id)
    } catch (error) {
      console.error('Error accepting invitation with new account:', error)
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive"
      })
    } finally {
      setAccepting(false)
    }
  }

  const acceptInvitation = async (userId: string) => {
    if (!invitation) return

    try {
      // Add user to team
      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          recruiter_id: invitation.recruiter.id,
          user_id: userId,
          role: invitation.role,
          status: 'active',
          invited_by: invitation.invited_by.id,
          joined_at: new Date().toISOString()
        })

      if (teamError) {
        console.error('Error adding to team:', teamError)
        throw new Error('Failed to add to team')
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (updateError) {
        console.error('Error updating invitation:', updateError)
        // Don't throw here as the user is already added to team
      }

      // Log activity
      await supabase
        .from('team_activity_log')
        .insert({
          recruiter_id: invitation.recruiter.id,
          user_id: userId,
          action_type: 'member_joined',
          action_details: {
            invitation_id: invitation.id,
            role: invitation.role
          }
        })

      toast({
        title: "Welcome to the Team!",
        description: `You've successfully joined ${invitation.recruiter.company_name}`,
      })

      // Redirect to recruiter dashboard
      setTimeout(() => {
        router.push('/recruiter/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Error accepting invitation:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
              <p className="text-gray-600 mb-4">
                This invitation link is invalid or has expired.
              </p>
              <Button onClick={() => router.push('/')}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Team Invitation</h1>
          </div>
          <p className="text-gray-600">
            You've been invited to join a team on applyforme
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {invitation.recruiter.company_name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {invitation.recruiter.company_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Invited by {invitation.invited_by.full_name}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className={roleColors[invitation.role]}>
                {roleLabels[invitation.role]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{invitation.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Accept Options */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Existing Account
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                New Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={existingEmail}
                    onChange={(e) => setExistingEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={existingPassword}
                    onChange={(e) => setExistingPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={acceptWithExistingAccount}
                  disabled={accepting || !existingEmail || !existingPassword}
                  className="w-full"
                >
                  {accepting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Accepting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Accept Invitation
                    </div>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={acceptWithNewAccount}
                  disabled={accepting || !newFullName || !newEmail || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {accepting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Create Account & Join Team
                    </div>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Role Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Your Role: {roleLabels[invitation.role]}</h4>
            <p className="text-sm text-blue-800">
              As a {roleLabels[invitation.role].toLowerCase()}, you'll have access to recruitment tools, 
              candidate management, and team collaboration features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 