"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from '@/lib/supabase/client'
import { Trash2, Eye, Upload } from "lucide-react"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  type: string
  url: string
  created_at: string
  user_id: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("cv")

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      if (!session?.user) {
        // Don't redirect here - let middleware handle it
        setError('Authentication required')
        setLoading(false)
        return
      }

      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (documentsError) throw documentsError
      setDocuments(documentsData || [])
    } catch (err: any) {
      console.error('Error fetching documents:', err)
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-set document name from filename if not already set
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, "")) // Remove extension
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentName) {
      toast.error('Please select a file and enter a document name')
      return
    }

    try {
      setUploading(true)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('documents')
        .getPublicUrl(fileName)

      // Save document record to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: documentName,
          type: documentType,
          url: urlData.publicUrl,
          user_id: session.user.id
        })

      if (dbError) throw dbError

      toast.success('Document uploaded successfully')
      
      // Reset form
      setSelectedFile(null)
      setDocumentName("")
      setDocumentType("cv")
      
      // Refresh documents list
      fetchDocuments()
    } catch (err: any) {
      console.error('Error uploading document:', err)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      setDeleting(documentId)
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      toast.success('Document deleted successfully')
      fetchDocuments()
    } catch (err: any) {
      console.error('Error deleting document:', err)
      toast.error('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Documents</h1>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Documents</h1>
          <p className="text-red-600">Error: {error}</p>
          <p className="text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Documents</h1>
        <p className="text-gray-600">
          Upload and manage your CV and other important documents
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card className="border border-gray-200 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Upload Document</CardTitle>
            <CardDescription>
              Upload your CV or other important documents. CV is required for job applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="file-input">Select File</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="document-name">Document Name</Label>
                <Input
                  id="document-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="document-type">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cv">CV/Resume</SelectItem>
                    <SelectItem value="cover_letter">Cover Letter</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={uploading || !selectedFile || !documentName}
                className="w-full bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="border border-gray-200 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Your Documents</CardTitle>
            <CardDescription>
              Manage your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No documents uploaded yet. Upload your CV to get started with job applications.
              </p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {doc.type.replace('_', ' ')} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                      >
                        {deleting === doc.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 