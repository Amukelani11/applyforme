"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { useFeedbackPrompt } from '@/components/feedback/useFeedbackPrompt'

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

interface TeamConversation {
  id: string
  conversation_name: string | null
  updated_at: string
}

interface Message {
  id: string
  content: string
  created_at: string
  sender: {
    id?: string
    full_name: string
    avatar_url?: string
  }
}

interface TeamMember {
  id: string
  user_id?: string
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
  const [teamConversations, setTeamConversations] = useState<TeamConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"conversations" | "team">("conversations")
  const [isNewTeamChatOpen, setIsNewTeamChatOpen] = useState(false)
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([])
  const [conversationName, setConversationName] = useState<string>("")
  const [activeChatType, setActiveChatType] = useState<"candidate" | "team">("candidate")
  const [selectedTeamConversation, setSelectedTeamConversation] = useState<{ id: string, messages: any[] } | null>(null)
  const [newTeamMessage, setNewTeamMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [teamRecruiterId, setTeamRecruiterId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string>("")
  // Typing indicators
  const [candidateTyping, setCandidateTyping] = useState<Record<string, { name: string; until: number }>>({})
  const [teamTyping, setTeamTyping] = useState<Record<string, { name: string; until: number }>>({})
  const candidateTypingChRef = useRef<any>(null)
  const teamTypingChRef = useRef<any>(null)
  const candidateTypingLastSentRef = useRef<number>(0)
  const teamTypingLastSentRef = useRef<number>(0)
  // Attachments
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const docInputRef = useRef<HTMLInputElement | null>(null)
  const [isPickingApplication, setIsPickingApplication] = useState(false)
  const [isPickingJob, setIsPickingJob] = useState(false)
  const [availableApps, setAvailableApps] = useState<any[]>([])
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const { Dialog: FeedbackAfterMessagesDialog, onAction: feedbackMessagesAction } = useFeedbackPrompt({ context: 'collaboration', role: 'team_member', trigger: 'count', actionKey: 'messages_sent_count', actionThreshold: 5 })

  const relativeTime = (dateLike?: string | null) => {
    if (!dateLike) return null
    const d = new Date(dateLike)
    if (isNaN(d.getTime())) return null
    return formatDistanceToNow(d, { addSuffix: true })
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Typing channel for candidate conversation
  useEffect(() => {
    if (activeChatType !== 'candidate' || !selectedConversation?.id) return
    const convId = selectedConversation.id
    const ch = supabase.channel(`typing-candidate-${convId}`, { config: { broadcast: { self: true } } })
    ch.on('broadcast', { event: 'typing' }, (payload: any) => {
      const { userId, name } = payload?.payload || {}
      if (!userId || userId === currentUserId) return
      setCandidateTyping(prev => ({ ...prev, [userId]: { name: name || 'Member', until: Date.now() + 3000 } }))
    })
    ch.on('broadcast', { event: 'stop_typing' }, (payload: any) => {
      const { userId } = payload?.payload || {}
      if (!userId) return
      setCandidateTyping(prev => { const next = { ...prev } as any; delete next[userId]; return next })
    })
    ch.subscribe()
    candidateTypingChRef.current = ch
    return () => {
      supabase.removeChannel(ch)
      candidateTypingChRef.current = null
      setCandidateTyping({})
    }
  }, [activeChatType, selectedConversation?.id, currentUserId])

  // Typing channel for team conversation
  useEffect(() => {
    if (activeChatType !== 'team' || !selectedTeamConversation?.id) return
    const convId = selectedTeamConversation.id
    const ch = supabase.channel(`typing-team-${convId}`, { config: { broadcast: { self: true } } })
    ch.on('broadcast', { event: 'typing' }, (payload: any) => {
      const { userId, name } = payload?.payload || {}
      if (!userId || userId === currentUserId) return
      setTeamTyping(prev => ({ ...prev, [userId]: { name: name || 'Member', until: Date.now() + 3000 } }))
    })
    ch.on('broadcast', { event: 'stop_typing' }, (payload: any) => {
      const { userId } = payload?.payload || {}
      if (!userId) return
      setTeamTyping(prev => { const next = { ...prev } as any; delete next[userId]; return next })
    })
    ch.subscribe()
    teamTypingChRef.current = ch
    return () => {
      supabase.removeChannel(ch)
      teamTypingChRef.current = null
      setTeamTyping({})
    }
  }, [activeChatType, selectedTeamConversation?.id, currentUserId])

  // Prune expired typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setCandidateTyping(prev => {
        const next: typeof prev = {}
        Object.entries(prev).forEach(([k, v]) => { if (v.until > now) next[k] = v })
        return next
      })
      setTeamTyping(prev => {
        const next: typeof prev = {}
        Object.entries(prev).forEach(([k, v]) => { if (v.until > now) next[k] = v })
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const notifyTypingCandidate = () => {
    if (!candidateTypingChRef.current || !currentUserId) return
    const now = Date.now()
    if (now - (candidateTypingLastSentRef.current || 0) < 1200) return
    candidateTypingLastSentRef.current = now
    candidateTypingChRef.current.send({ type: 'broadcast', event: 'typing', payload: { userId: currentUserId, name: currentUserName } })
  }
  const notifyStopTypingCandidate = () => {
    if (!candidateTypingChRef.current || !currentUserId) return
    candidateTypingChRef.current.send({ type: 'broadcast', event: 'stop_typing', payload: { userId: currentUserId } })
  }
  const notifyTypingTeam = () => {
    if (!teamTypingChRef.current || !currentUserId) return
    const now = Date.now()
    if (now - (teamTypingLastSentRef.current || 0) < 1200) return
    teamTypingLastSentRef.current = now
    teamTypingChRef.current.send({ type: 'broadcast', event: 'typing', payload: { userId: currentUserId, name: currentUserName } })
  }
  const notifyStopTypingTeam = () => {
    if (!teamTypingChRef.current || !currentUserId) return
    teamTypingChRef.current.send({ type: 'broadcast', event: 'stop_typing', payload: { userId: currentUserId } })
  }

  const renderTypingLine = (record: Record<string, { name: string; until: number }>) => {
    const names = Object.values(record).map(v => v.name)
    if (names.length === 0) return null
    const text = names.length === 1 ? `${names[0]} is typing…` : names.length === 2 ? `${names[0]} and ${names[1]} are typing…` : `${names[0]}, ${names[1]} and ${names.length - 2} others are typing…`
    return <p className="text-xs text-gray-500 px-1 py-1">{text}</p>
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const fallbackName = user.email ? user.email.split('@')[0] : 'You'
      setCurrentUserName((user.user_metadata?.full_name as string) || fallbackName)

      // Fetch conversations (candidate/public applications)
      await fetchConversations(user.id)
      
      // Fetch team members
      await fetchTeamMembers(user.id)

      // Fetch team conversations
      await fetchTeamConversations()

      // Resolve and store team recruiter id for realtime filters
      const resolvedRecruiter = await resolveRecruiterId(user.id)
      setTeamRecruiterId(resolvedRecruiter)

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

  const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9_.-]/g, '_')
  const uploadToStorage = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const fileExt = file.name.split('.').pop()
    const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`
    const path = `chat-attachments/${user.id}/${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (uploadError) throw uploadError
    const { data: pub } = supabase.storage.from('documents').getPublicUrl(path)
    return { url: pub.publicUrl, path, name: file.name, size: file.size, ext: fileExt }
  }

  const sendCandidateAttachment = async (kind: 'image' | 'file', info: { url: string, name: string }) => {
    if (!selectedConversation) return
    const payload = kind === 'image' ? `[image|${info.name}|${info.url}]` : `[file|${info.name}|${info.url}]`
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: message, error } = await supabase
        .from('messages')
        .insert({ conversation_id: selectedConversation.id, sender_id: user.id, content: payload })
        .select(`*, sender:users(id, full_name, avatar_url)`).single()
      if (error) throw error
      setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, message] } : prev)
    } catch (err) {
      console.error('candidate attachment send error', err)
      toast({ title: 'Upload failed', description: 'Could not send attachment', variant: 'destructive' })
    }
  }

  const sendTeamAttachment = async (info: { url: string, name: string, size: number }) => {
    if (!selectedTeamConversation) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: inserted, error } = await supabase
        .from('team_messages')
        .insert({
          conversation_id: selectedTeamConversation.id,
          sender_id: user.id,
          message_text: info.name,
          message_type: 'file',
          file_url: info.url,
          file_name: info.name,
          file_size: info.size,
        })
        .select('*')
        .single()
      if (error) throw error
      const appended = { ...inserted, sender: { id: user.id, full_name: 'You' } }
      setSelectedTeamConversation(prev => prev ? ({ ...prev, messages: [...(prev.messages || []), appended] }) : prev)
    } catch (err) {
      console.error('team attachment send error', err)
      toast({ title: 'Upload failed', description: 'Could not send attachment', variant: 'destructive' })
    }
  }

  const handlePickImage = () => imageInputRef.current?.click()
  const handlePickDocument = () => docInputRef.current?.click()
  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const info = await uploadToStorage(file)
      if (activeChatType === 'team') await sendTeamAttachment(info)
      else await sendCandidateAttachment('image', info)
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }
  const onDocSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const info = await uploadToStorage(file)
      if (activeChatType === 'team') await sendTeamAttachment(info)
      else await sendCandidateAttachment('file', info)
    } finally {
      if (docInputRef.current) docInputRef.current.value = ''
    }
  }

  const openApplicationPicker = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const recruiterId = await resolveRecruiterId(user.id)
      if (!recruiterId) return
      const { data, error } = await supabase
        .from('candidate_applications')
        .select('id, candidate_name, job_posting_id, job_postings(id, title, company)')
        .in('job_posting_id', (
          (await supabase.from('job_postings').select('id').eq('recruiter_id', recruiterId)).data?.map(j => j.id) || []
        ))
        .limit(20)
      if (error) throw error
      setAvailableApps(data || [])
      setIsPickingApplication(true)
    } catch (err) {
      console.error('load application picker error', err)
      toast({ title: 'Could not load applications', variant: 'destructive' })
    }
  }
  const openJobPicker = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const recruiterId = await resolveRecruiterId(user.id)
      if (!recruiterId) return
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, company')
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      setAvailableJobs(data || [])
      setIsPickingJob(true)
    } catch (err) {
      console.error('load job picker error', err)
      toast({ title: 'Could not load job postings', variant: 'destructive' })
    }
  }

  const sendAttachmentLinkMessage = async (payload: string) => {
    if (activeChatType === 'team') {
      await sendTeamMessageText(payload)
    } else {
      await sendCandidateMessageText(payload)
    }
  }
  const sendTeamMessageText = async (text: string) => {
    if (!selectedTeamConversation) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: inserted, error } = await supabase
        .from('team_messages')
        .insert({ conversation_id: selectedTeamConversation.id, sender_id: user.id, message_text: text })
        .select('*')
        .single()
      if (error) throw error
      const appended = { ...inserted, sender: { id: user.id, full_name: 'You' } }
      setSelectedTeamConversation(prev => prev ? ({ ...prev, messages: [...(prev.messages || []), appended] }) : prev)
    } catch (err) {
      console.error('team text send error', err)
    }
  }
  const sendCandidateMessageText = async (text: string) => {
    if (!selectedConversation) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: message, error } = await supabase
        .from('messages')
        .insert({ conversation_id: selectedConversation.id, sender_id: user.id, content: text })
        .select(`*, sender:users(id, full_name, avatar_url)`).single()
      if (error) throw error
      setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, message] } : prev)
    } catch (err) {
      console.error('candidate text send error', err)
    }
  }

  const attachApplication = async (app: any) => {
    setIsPickingApplication(false)
    const jobId = app.job_postings?.id || app.job_posting_id
    const candidateName = app.candidate_name || 'Candidate'
    const jobTitle = app.job_postings?.title || 'Job'
    const payload = `[application|${app.id}|${jobId}|${candidateName}|${jobTitle}]`
    await sendAttachmentLinkMessage(payload)
  }
  const attachJob = async (job: any) => {
    setIsPickingJob(false)
    const payload = `[job|${job.id}|${job.title}|${job.company || ''}]`
    await sendAttachmentLinkMessage(payload)
  }

  // Realtime: subscribe to team_conversations inserts/updates for this team
  useEffect(() => {
    if (!teamRecruiterId) return
    const channel = supabase
      .channel(`team-conv-${teamRecruiterId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_conversations', filter: `recruiter_id=eq.${teamRecruiterId}` },
        (payload) => {
          const row = payload.new as { id: string, conversation_name: string | null, updated_at: string }
          setTeamConversations((prev) => {
            if (prev.some((c) => c.id === row.id)) return prev
            return [{ id: row.id, conversation_name: row.conversation_name || null, updated_at: row.updated_at }, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'team_conversations', filter: `recruiter_id=eq.${teamRecruiterId}` },
        (payload) => {
          const row = payload.new as { id: string, conversation_name: string | null, updated_at: string }
          setTeamConversations((prev) => {
            const next = prev.map((c) => (c.id === row.id ? { ...c, conversation_name: row.conversation_name || c.conversation_name, updated_at: row.updated_at } : c))
            // keep most recent first
            return next.sort((a, b) => (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamRecruiterId])

  // Realtime: subscribe to incoming messages for the selected team conversation
  useEffect(() => {
    if (!selectedTeamConversation?.id) return
    const convId = selectedTeamConversation.id
    const channel = supabase
      .channel(`team-msg-${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `conversation_id=eq.${convId}` },
        async (payload) => {
          const row = payload.new as { id: string, sender_id: string, message_text: string, created_at: string, conversation_id: string }
          setSelectedTeamConversation((prev) => {
            if (!prev) return prev
            if (prev.id !== row.conversation_id) return prev
            if (prev.messages?.some((m: any) => m.id === row.id)) return prev
            const isMine = currentUserId && row.sender_id === currentUserId
            const member = teamMembers.find(tm => tm.user_id === row.sender_id)
            const senderName = isMine ? 'You' : (member?.full_name || (member?.email ? member.email.split('@')[0] : 'Member'))
            const appended = { ...row, sender: { id: row.sender_id, full_name: senderName } }
            return { ...prev, messages: [...(prev.messages || []), appended] }
          })
          // bump conversation ordering by updating updated_at (optimistic)
          setTeamConversations((prev) => prev.map((c) => (c.id === row.conversation_id ? { ...c, updated_at: row.created_at } : c)).sort((a, b) => (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedTeamConversation?.id, currentUserId])

  const fetchConversations = async (userId: string) => {
    try {
      // Resolve recruiter id for owner or team member
      const recruiterId = await resolveRecruiterId(userId)
      if (!recruiterId) return

      // Get job IDs for this recruiter
      const { data: jobs, error: jobsError } = await supabase
        .from('job_postings')
        .select('id')
        .eq('recruiter_id', recruiterId)

      if (jobsError) throw jobsError
      if (!jobs || jobs.length === 0) return

      const jobIds = jobs.map(j => j.id)

      // Get application IDs for those jobs
      const { data: apps, error: appsError } = await supabase
        .from('candidate_applications')
        .select('id')
        .in('job_posting_id', jobIds)

      if (appsError) throw appsError
      if (!apps || apps.length === 0) return

      const appIds = apps.map(a => a.id)

      // Get conversations for those applications
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(
            *,
            sender:users(id, full_name, avatar_url)
          ),
          candidate_applications(
            candidate_name,
            job_postings(title, company)
          )
        `)
        .in('application_id', appIds)

      if (convError) throw convError

      if (conversationsData) {
        const formattedConversations = conversationsData.map(conv => ({
          id: conv.id,
          application_id: conv.application_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          messages: conv.messages || [],
          application: conv.candidate_applications
        }))
        setConversations(formattedConversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchTeamMembers = async (_userId: string) => {
    try {
      const response = await fetch('/api/recruiter/team/members', { method: 'GET' })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to fetch team members')

      // Exclude current user from the team list
      const others = (data.teamMembers || []).filter((m: any) => {
        const memberUserId = m.user?.id || m.user_id
        return memberUserId && memberUserId !== _userId
      })

      const formatted: TeamMember[] = others.map((m: any) => {
        const userId = m.user?.id || m.user_id
        const fullName = m.user?.full_name || m.full_name || ''
        const email = m.user?.email || m.email || ''
        return {
          id: m.id,
          user_id: userId,
          full_name: fullName.trim().length > 0 ? fullName : (email ? email.split('@')[0] : 'Team member'),
          email: email || 'unknown@applyforme.co.za',
          avatar_url: undefined,
          role: m.role,
          last_active: m.user?.last_sign_in_at || undefined,
        }
      })

      // If the current user is a team member, include the team owner as a selectable contact
      // (team_members table does not include the owner by default)
      const { data: ownerCheck } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', _userId)
        .maybeSingle()

      if (!ownerCheck?.id) {
        // Not an owner; find the owner of this team (recruiter)
        const { data: membership } = await supabase
          .from('team_members')
          .select('recruiter_id')
          .eq('user_id', _userId)
          .eq('status', 'active')
          .maybeSingle()

        const teamRecruiterId = membership?.recruiter_id
        if (teamRecruiterId) {
          const { data: ownerRecruiter } = await supabase
            .from('recruiters')
            .select('user_id, full_name')
            .eq('id', teamRecruiterId)
            .maybeSingle()

          const ownerUserId = ownerRecruiter?.user_id
          if (ownerUserId && ownerUserId !== _userId && !formatted.some(f => f.user_id === ownerUserId)) {
            const { data: ownerUser } = await supabase
              .from('users')
              .select('id, full_name, email')
              .eq('id', ownerUserId)
              .maybeSingle()

            formatted.push({
              id: `owner-${teamRecruiterId}`,
              user_id: ownerUserId,
              full_name: ownerUser?.full_name || ownerRecruiter?.full_name || ownerUser?.email?.split('@')[0] || 'Owner',
              email: ownerUser?.email || '',
              avatar_url: undefined,
              role: 'owner',
              last_active: undefined,
            })
          }
        }
      }

      setTeamMembers(formatted)
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const fetchTeamConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('team_conversations')
        .select('id, conversation_name, updated_at')
        .order('updated_at', { ascending: false })
      if (error) throw error
      setTeamConversations(data || [])
    } catch (error) {
      console.error('Error fetching team conversations:', error)
    }
  }

  const fetchTeamConversationMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      const enriched = (data || []).map((row: any) => {
        const isMine = currentUserId && row.sender_id === currentUserId
        const member = teamMembers.find(tm => tm.user_id === row.sender_id)
        const senderName = isMine ? 'You' : (member?.full_name || (member?.email ? member.email.split('@')[0] : 'Member'))
        return { ...row, sender: { id: row.sender_id, full_name: senderName } }
      })
      setSelectedTeamConversation({ id: conversationId, messages: enriched })
    } catch (error) {
      console.error('Error fetching team messages:', error)
      toast({ title: 'Error', description: 'Failed to load team messages', variant: 'destructive' })
    }
  }

  const openTeamConversation = async (conv: TeamConversation) => {
    setActiveChatType('team')
    setConversationName(conv.conversation_name || '')
    await fetchTeamConversationMessages(conv.id)
  }

  const resolveRecruiterId = async (userId: string): Promise<string | null> => {
    const { data: ownerRecruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (ownerRecruiter?.id) return ownerRecruiter.id

    const { data: membership } = await supabase
      .from('team_members')
      .select('recruiter_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    return membership?.recruiter_id || null
  }

  const startTeamChat = async (participantIds: string[], name?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const recruiterId = await resolveRecruiterId(user.id)
      if (!recruiterId) throw new Error('Recruiter context not found')

      // Create conversation via API (server handles permissions)
      const res = await fetch('/api/team/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: participantIds, name: name || null }),
      })

      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.error || 'Failed to create conversation')

      setSelectedTeamConversation({ id: payload.id, messages: [] })
      setActiveChatType('team')
      setIsNewTeamChatOpen(false)
      setSelectedParticipantIds([])
      setConversationName("")

      // Refresh conversations list so it persists across refresh
      await fetchTeamConversations()

      toast({ title: 'Team chat created' })
    } catch (error: any) {
      console.error('Error starting team chat:', error)
      toast({ title: 'Error', description: error.message || 'Failed to start chat', variant: 'destructive' })
    }
  }

  const openDirectChat = async (member: TeamMember) => {
    if (!member.user_id) return
    setSelectedParticipantIds([member.user_id])
    setConversationName(member.full_name || member.email)
    setIsNewTeamChatOpen(true)
  }

  const sendTeamMessage = async () => {
    if (!newTeamMessage.trim() || !selectedTeamConversation) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: inserted, error } = await supabase
        .from('team_messages')
        .insert({
          conversation_id: selectedTeamConversation.id,
          sender_id: user.id,
          message_text: newTeamMessage.trim(),
        })
        .select('*')
        .single()
      if (error) throw error
      const appended = { ...inserted, sender: { id: user.id, full_name: 'You' } }
      setSelectedTeamConversation(prev => prev ? ({ ...prev, messages: [...(prev.messages || []), appended] }) : prev)
      setNewTeamMessage("")
    } catch (error) {
      console.error('Error sending team message:', error)
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' })
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
          sender:users(id, full_name, avatar_url)
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
      feedbackMessagesAction()
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
                <Button size="sm" variant="outline" onClick={() => { setActiveTab('team'); setIsNewTeamChatOpen(true) }}>
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
                      {conversation.messages.length > 0 && relativeTime(conversation.messages[conversation.messages.length - 1].created_at) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {relativeTime(conversation.messages[conversation.messages.length - 1].created_at) as string}
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
                <>
                  {/* Team Conversations List */}
                  {teamConversations.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs uppercase text-gray-500 px-1">Team Conversations</p>
                      {teamConversations.map((tc) => (
                        <div
                          key={tc.id}
                          onClick={() => openTeamConversation(tc)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>T</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {tc.conversation_name || 'Team Conversation'}
                            </p>
                            {relativeTime(tc.updated_at) && (
                              <p className="text-xs text-gray-400 mt-1">
                                {relativeTime(tc.updated_at) as string}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Team Members List */}
                  <p className="text-xs uppercase text-gray-500 px-1">Team Members</p>
                  {filteredTeamMembers.map((member) => (
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
                        {relativeTime(member.last_active) && (
                          <p className="text-xs text-gray-400 mt-1">
                            Last active {relativeTime(member.last_active) as string}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => openDirectChat(member)}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {FeedbackAfterMessagesDialog}
        {activeChatType === 'candidate' && selectedConversation ? (
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
                <Button size="sm" variant="ghost" onClick={() => { /* placeholder for menu */ }}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedConversation.messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No messages yet</h3>
                  <p className="text-gray-500 text-sm">Start the conversation with this candidate</p>
                </div>
              ) : (
                selectedConversation.messages.map((message) => {
                  const isMine = message.sender?.id && currentUserId ? message.sender.id === currentUserId : false
                  const attachment = typeof message.content === 'string' ? parseAttachmentPayload(message.content) : null
                  return (
                    <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-md', isMine ? 'text-right' : 'text-left')}>
                        <div className="text-xs text-gray-500 mb-1">
                          {isMine ? 'You' : (message.sender?.full_name || 'Member')}
                        </div>
                        {attachment ? (
                          <div className={cn('rounded-lg p-3 space-y-2', isMine ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900')}>
                            {attachment.type === 'image' && (
                              <a href={attachment.url} target="_blank" rel="noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={attachment.url} alt={attachment.name} className="rounded max-h-64 object-contain" />
                              </a>
                            )}
                            {attachment.type === 'file' && (
                              <a href={attachment.url} target="_blank" rel="noreferrer" className="underline">
                                {attachment.name}
                              </a>
                            )}
                            {attachment.type === 'application' && (
                              <a href={`/recruiter/jobs/${attachment.jobId}/applications/${attachment.appId}`} className="block p-3 rounded border border-gray-200 bg-white text-left">
                                <div className="text-sm font-medium text-gray-900">Application: {attachment.candidateName}</div>
                                <div className="text-xs text-gray-500">{attachment.jobTitle}</div>
                              </a>
                            )}
                            {attachment.type === 'job' && (
                              <a href={`/recruiter/jobs/${attachment.jobId}`} className="block p-3 rounded border border-gray-200 bg-white text-left">
                                <div className="text-sm font-medium text-gray-900">Job: {attachment.title}</div>
                                {attachment.company && <div className="text-xs text-gray-500">{attachment.company}</div>}
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className={cn('rounded-lg p-3', isMine ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900')}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        )}
                        {relativeTime(message.created_at) && (
                          <p className={cn('text-xs text-gray-400 mt-1', isMine ? 'text-right' : 'text-left')}>{relativeTime(message.created_at) as string}</p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {renderTypingLine(candidateTyping)}
              <div className="flex items-center space-x-2">
                {/* Attach menu */}
                <div className="relative">
                  <Button type="button" variant="outline" className="px-3" onClick={(e) => {
                    const menu = (e.currentTarget.nextSibling as HTMLElement)
                    if (menu) menu.classList.toggle('hidden')
                  }}>+
                  </Button>
                  <div className="absolute bottom-full mb-2 left-0 hidden bg-white border border-gray-200 rounded shadow-md z-10" onMouseLeave={(e) => { (e.currentTarget as HTMLElement).classList.add('hidden') }}>
                    <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={handlePickImage}>Attach Image</button>
                    <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={handlePickDocument}>Attach Document</button>
                    <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={openApplicationPicker}>Attach Existing Application</button>
                    <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={openJobPicker}>Attach Job Posting</button>
                  </div>
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
                <input ref={docInputRef} type="file" className="hidden" onChange={onDocSelected} />
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); notifyTypingCandidate() }}
                  onKeyPress={(e) => { if (e.key === 'Enter') { sendMessage(); notifyStopTypingCandidate() } }}
                  onBlur={notifyStopTypingCandidate}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : activeChatType === 'team' && selectedTeamConversation ? (
          <>
            {/* Team Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {conversationName || 'Team Conversation'}
                    </h2>
                    <p className="text-sm text-gray-500">Internal team chat</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { /* placeholder */ }}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Team Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedTeamConversation.messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No messages yet</h3>
                  <p className="text-gray-500 text-sm">Start the conversation with your team</p>
                </div>
              ) : (
                selectedTeamConversation.messages.map((message: any) => {
                  const isMine = message.sender?.id && currentUserId ? message.sender.id === currentUserId : false
                  return (
                    <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-md', isMine ? 'text-right' : 'text-left')}>
                        <div className="text-xs text-gray-500 mb-1">
                          {isMine ? 'You' : (message.sender?.full_name || 'Member')}
                        </div>
                        {message.message_type === 'file' ? (
                          <div className={cn('rounded-lg p-3 space-y-2', isMine ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900')}>
                            {message.file_url?.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i) ? (
                              <a href={message.file_url} target="_blank" rel="noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={message.file_url} alt={message.file_name || 'attachment'} className="rounded max-h-64 object-contain" />
                              </a>
                            ) : (
                              <a href={message.file_url} target="_blank" rel="noreferrer" className="underline">
                                {message.file_name || 'Attachment'}
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className={cn('rounded-lg p-3', isMine ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900')}>
                            <p className="text-sm">{message.message_text}</p>
                          </div>
                        )}
                        {relativeTime(message.created_at) && (
                          <p className={cn('text-xs text-gray-400 mt-1', isMine ? 'text-right' : 'text-left')}>{relativeTime(message.created_at) as string}</p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Team Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {renderTypingLine(teamTyping)}
              <div className="flex space-x-3">
                <Input
                  placeholder="Type your message..."
                  value={newTeamMessage}
                  onChange={(e) => { setNewTeamMessage(e.target.value); notifyTypingTeam() }}
                  onKeyPress={(e) => { if (e.key === 'Enter') { sendTeamMessage(); notifyStopTypingTeam() } }}
                  onBlur={notifyStopTypingTeam}
                  className="flex-1"
                />
                <Button onClick={sendTeamMessage} disabled={!newTeamMessage.trim()}>
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

      {/* New Team Chat Dialog */}
      <Dialog open={isNewTeamChatOpen} onOpenChange={setIsNewTeamChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Team Chat</DialogTitle>
            <DialogDescription>Select one or more team members to start a chat</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="conversation-name">Conversation name (optional)</Label>
              <Input id="conversation-name" placeholder="e.g. Hiring plan for Q4" value={conversationName} onChange={(e) => setConversationName(e.target.value)} />
            </div>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <label key={member.user_id || member.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <Checkbox
                    checked={selectedParticipantIds.includes(member.user_id || '')}
                    onCheckedChange={(checked) => {
                      const uid = member.user_id || ''
                      setSelectedParticipantIds((prev) =>
                        checked === true ? Array.from(new Set([...prev, uid])) : prev.filter((id) => id !== uid)
                      )
                    }}
                  />
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>{member.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTeamChatOpen(false)}>Cancel</Button>
            <Button onClick={() => startTeamChat(selectedParticipantIds, conversationName)} disabled={selectedParticipantIds.length === 0}>Start Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 