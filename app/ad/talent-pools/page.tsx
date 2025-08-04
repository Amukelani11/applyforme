"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Star,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PoolMember {
  id: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  candidateLocation: string
  jobTitle: string
  companyName: string
  addedNotes: string
  addedAt: string
  status: 'active' | 'contacted' | 'interviewed' | 'hired'
  rating: number
}

interface TalentPool {
  id: string
  name: string
  description: string
  color: string
  memberCount: number
  isPublic: boolean
  createdAt: string
}

const mockPools: TalentPool[] = [
  {
    id: '1',
    name: 'Senior Developers',
    description: 'Experienced software developers with 5+ years',
    color: '#8b5cf6',
    memberCount: 23,
    isPublic: false,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Product Managers',
    description: 'Product management professionals',
    color: '#06b6d4',
    memberCount: 12,
    isPublic: false,
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'UX Designers',
    description: 'User experience and UI designers',
    color: '#10b981',
    memberCount: 8,
    isPublic: true,
    createdAt: '2024-02-01'
  },
  {
    id: '4',
    name: 'Data Scientists',
    description: 'Data science and analytics professionals',
    color: '#f59e0b',
    memberCount: 15,
    isPublic: false,
    createdAt: '2024-02-10'
  }
]

const mockMembers: PoolMember[] = [
  {
    id: '1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    candidatePhone: '+27 82 123 4567',
    candidateLocation: 'Johannesburg, South Africa',
    jobTitle: 'Senior Software Engineer',
    companyName: 'TechCorp',
    addedNotes: 'Strong React and Node.js experience. Great cultural fit.',
    addedAt: '2024-01-15',
    status: 'active',
    rating: 5
  },
  {
    id: '2',
    candidateName: 'Michael Chen',
    candidateEmail: 'michael.chen@email.com',
    candidatePhone: '+27 83 234 5678',
    candidateLocation: 'Cape Town, South Africa',
    jobTitle: 'Full Stack Developer',
    companyName: 'InnovateTech',
    addedNotes: 'Excellent problem-solving skills. Available immediately.',
    addedAt: '2024-01-18',
    status: 'contacted',
    rating: 4
  },
  {
    id: '3',
    candidateName: 'Lisa Mokoena',
    candidateEmail: 'lisa.mokoena@email.com',
    candidatePhone: '+27 84 345 6789',
    candidateLocation: 'Durban, South Africa',
    jobTitle: 'Frontend Developer',
    companyName: 'Digital Solutions',
    addedNotes: 'Strong UI/UX skills. Looking for growth opportunities.',
    addedAt: '2024-01-22',
    status: 'interviewed',
    rating: 5
  },
  {
    id: '4',
    candidateName: 'David Smith',
    candidateEmail: 'david.smith@email.com',
    candidatePhone: '+27 85 456 7890',
    candidateLocation: 'Pretoria, South Africa',
    jobTitle: 'Backend Developer',
    companyName: 'CloudTech',
    addedNotes: 'Expert in Python and AWS. Team player.',
    addedAt: '2024-01-25',
    status: 'active',
    rating: 4
  },
  {
    id: '5',
    candidateName: 'Amanda Patel',
    candidateEmail: 'amanda.patel@email.com',
    candidatePhone: '+27 86 567 8901',
    candidateLocation: 'Port Elizabeth, South Africa',
    jobTitle: 'DevOps Engineer',
    companyName: 'InfraTech',
    addedNotes: 'Strong infrastructure and automation skills.',
    addedAt: '2024-01-28',
    status: 'hired',
    rating: 5
  }
]

export default function AdTalentPoolsPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedPool, setSelectedPool] = useState<TalentPool | null>(mockPools[0])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredMembers = mockMembers.filter(member =>
    member.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'interviewed': return 'bg-yellow-100 text-yellow-800'
      case 'hired': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-12 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Talent Pools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Organize and manage your top candidates. Build talent pools for future opportunities 
            and track candidate engagement across all sources.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Talent Pools Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Talent Pools</span>
                  <Button size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockPools.map((pool) => (
                  <div
                    key={pool.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                      selectedPool?.id === pool.id
                        ? "bg-purple-50 border border-purple-200"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedPool(pool)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pool.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{pool.name}</p>
                        <p className="text-xs text-gray-500">{pool.memberCount} members</p>
                      </div>
                    </div>
                    {pool.isPublic && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedPool?.color }}
                      />
                      <span>{selectedPool?.name}</span>
                      <Badge variant="outline">{selectedPool?.memberCount} members</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedPool?.description}</p>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                {getInitials(member.candidateName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{member.candidateName}</h3>
                              <p className="text-sm text-gray-600">{member.jobTitle}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(member.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 mr-2" />
                            {member.companyName}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {member.candidateLocation}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            Added {new Date(member.addedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(member.status)}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {member.addedNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{member.addedNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 