"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { motion } from "framer-motion"
import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MessageCircle, Trash2, Briefcase, ChevronDown, Search } from "lucide-react"
import { useRouter } from "next/navigation"

type ApplicationStatus = "Under Review" | "Interview Scheduled" | "Offer" | "Rejected" | "Hired" | "Withdrawn" | "Applied"

interface Application {
  id: string
  jobs: {
    job_title: string
    company_name: string
  }
  status: ApplicationStatus
  created_at: string
  last_activity: string
}

const statusColors: Record<ApplicationStatus, string> = {
  "Under Review": "bg-purple-100 text-purple-800 border-purple-200",
  "Interview Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
  Offer: "bg-cyan-100 text-cyan-800 border-cyan-200",
  Hired: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
  Applied: "bg-indigo-100 text-indigo-800 border-indigo-200"
}


export default function MyApplicationsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All")
  const [dateFilter, setDateFilter] = useState("All Time")

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("candidate_applications")
        .select(`
          id,
          status,
          created_at,
          last_activity,
          jobs (
            job_title,
            company_name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching applications:", error)
      } else {
        setApplications(data as Application[] || [])
      }
      setLoading(false)
    }

    fetchApplications()
  }, [supabase, router])

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        if (statusFilter !== "All" && app.status !== statusFilter) return false
        return true
      })
      .filter(app =>
        app.jobs.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [applications, searchTerm, statusFilter])


  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-20"
    >
      <Briefcase className="mx-auto h-16 w-16 text-gray-300" />
      <h3 className="mt-4 text-xl font-semibold text-gray-800">No applications submitted yet.</h3>
      <p className="mt-2 text-gray-500">Start your job search journey! Let our team find and apply for jobs on your behalf.</p>
      <Button
        onClick={() => router.push('/dashboard/preferences')}
        className="mt-6 bg-[#c084fc] hover:bg-[#a855f7] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        Activate My Job Search Concierge
      </Button>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc]"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-white rounded-lg shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
        <p className="text-gray-500 mt-1">Track the status of your submitted job applications.</p>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by job or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-gray-50 border-gray-200 rounded-full focus:ring-[#c084fc] focus:border-[#c084fc]"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 rounded-full">
                Status: {statusFilter} <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["All", ...Object.keys(statusColors)].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter === status}
                  onCheckedChange={() => setStatusFilter(status as ApplicationStatus | "All")}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 rounded-full">
                Date: {dateFilter} <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["All Time", "Last 7 Days", "Last 30 Days"].map((date) => (
                 <DropdownMenuCheckboxItem
                  key={date}
                  checked={dateFilter === date}
                  onCheckedChange={() => setDateFilter(date)}
                >
                  {date}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="ghost" onClick={() => { setStatusFilter("All"); setDateFilter("All Time"); setSearchTerm(""); }} className="text-gray-600 hover:text-[#c084fc]">
          Clear Filters
        </Button>
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-100">
                <TableHead className="text-gray-600 font-semibold">Job Title</TableHead>
                <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                <TableHead className="text-gray-600 font-semibold">Date Applied</TableHead>
                <TableHead className="text-gray-600 font-semibold">Last Activity</TableHead>
                <TableHead className="text-right text-gray-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app, index) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b-gray-50 hover:bg-gray-50/50"
                >
                  <TableCell>
                    <div className="font-bold text-gray-800">{app.jobs.job_title}</div>
                    <div className="text-sm text-gray-500">{app.jobs.company_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`py-1 px-3 rounded-full font-medium text-xs ${statusColors[app.status]}`}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-gray-600">{app.last_activity || 'Application sent'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#c084fc] hover:bg-purple-50 rounded-full">
                        <Eye className="h-5 w-5" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#c084fc] hover:bg-purple-50 rounded-full">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
} 