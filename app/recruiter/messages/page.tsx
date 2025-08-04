"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Send, 
  MoreHorizontal,
  Users,
  UserPlus,
  Calendar,
  Clock
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  application_id: string
  created_at: string
  updated_at: string
  messages: Message[]
  application?: {
    candidate_name?: string
    job_title?: string
    company?: string
  }
}

interface Message {
  id: string
  content: string
  created_at: string
  sender: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface TeamMember {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role?: string
  last_active?: string
}

export default function MessagesPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"conversations" | "team">("conversations")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch conversations
      await fetchConversations(user.id)
      
      // Fetch team members
      await fetchTeamMembers(user.id)

    } catch (error) {
      console.error('Error fetching messages data:', error)
      toast({
        title: "Error",
        description: "Failed to load messages data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConversations = async (userId: string) => {
    try {
      // Get recruiter ID
      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!recruiter) return

      // Get job IDs for this recruiter
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('recruiter_id', recruiter.id)

      if (!jobs || jobs.length === 0) return

      const jobIds = jobs.map(j => j.id)

      // Get conversations for applications
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(
            *,
            sender:users(full_name, avatar_url)
          ),
          candidate_applications(
            candidate_name,
            job_postings(title, company)
          ),
          public_applications(
            full_name,
            job_postings(title, company)
          )
        `)
        .in('application_id', jobIds.map(id => `job-${id}`))

      if (conversationsData) {
        const formattedConversations = conversationsData.map(conv => ({
          id: conv.id,
          application_id: conv.application_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          messages: conv.messages || [],
          application: conv.candidate_applications || conv.public_applications
        }))
        setConversations(formattedConversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchTeamMembers = async (userId: string) => {
    try {
      // Get recruiter ID
      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id, company_id')
        .eq('user_id', userId)
        .single()

      if (!recruiter) return

      // Get team members (other recruiters in the same company)
      const { data: teamData } = await supabase
        .from('recruiters')
        .select('id, user_id')
        .eq('company_id', recruiter.company_id)
        .neq('id', recruiter.id)

      if (teamData && teamData.length > 0) {
        // Get user details for team members
        const userIds = teamData.map(member => member.user_id)
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds)

        if (usersData) {
          const userMap = new Map(usersData.map(user => [user.id, user]))
          const formattedTeam = teamData.map(member => {
            const user = userMap.get(member.user_id)
            return {
              id: member.id,
              full_name: user?.full_name || 'Unknown User',
              email: user?.email || 'unknown@email.com',
              avatar_url: user?.avatar_url,
              role: 'Recruiter',
              last_active: new Date().toISOString() // Mock data
            }
          })
          setTeamMembers(formattedTeam)
        }
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim()
        })
        .select(`
          *,
          sender:users(full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      // Update local state
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null)
      setNewMessage("")

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully"
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const filteredConversations = conversations.filter(conv => 
    conv.application?.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.application?.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeamMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("conversations")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "conversations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "team"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Team
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "conversations" ? (
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No conversations yet</h3>
                  <p className="text-gray-500 text-sm">Start messaging candidates from your applications</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedConversation?.id === conversation.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {conversation.application?.candidate_name?.[0] || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.application?.candidate_name || 'Unknown Candidate'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.application?.job_title || 'Application'}
                      </p>
                      {conversation.messages.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(conversation.messages[conversation.messages.length - 1].created_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    {conversation.messages.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {conversation.messages.length}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTeamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No team members</h3>
                  <p className="text-gray-500 text-sm">Invite team members to start collaborating</p>
                  <Button className="mt-4" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Team Member
                  </Button>
                </div>
              ) : (
                filteredTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>{member.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last active {formatDistanceToNow(new Date(member.last_active || ''), { addSuffix: true })}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedConversation.application?.candidate_name?.[0] || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.application?.candidate_name || 'Unknown Candidate'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.application?.job_title || 'Application'}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No messages yet</h3>
                  <p className="text-gray-500 text-sm">Start the conversation with this candidate</p>
                </div>
              ) : (
                selectedConversation.messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src={message.sender.avatar_url} />
                      <AvatarFallback>{message.sender.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-gray-900">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 