"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Trash2, 
  Eye, 
  UploadCloud, 
  FileText, 
  File, 
  Loader2,
  FileImage,
  FileJson,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Document {
  id: string
  name: string
  type: string
  url: string
  created_at: string
  user_id: string
}

const FileTypeIcon = ({ type, className }: { type: string, className?: string }) => {
  const defaultClass = "h-6 w-6 text-gray-400"
  switch (type) {
    case 'cv':
    case 'pdf':
    case 'docx':
    case 'txt':
      return <FileText className={className || defaultClass} />;
    case 'cover_letter':
      return <FileJson className={className || defaultClass} />;
    case 'certificate':
      return <FileImage className={className || defaultClass} />;
    default:
      return <File className={className || defaultClass} />;
  }
}

export default function DocumentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("cv")
  const [isDragOver, setIsDragOver] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName) {
      toast({ variant: "destructive", title: 'Please select a file and enter a document name' })
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Not authenticated')

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError
      
      // Fake progress for demo
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 100);

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('documents').insert({
        name: documentName,
        type: documentType,
        url: publicUrl,
        user_id: session.user.id
      })

      if (dbError) throw dbError

      toast({ title: 'Success!', description: 'Document uploaded successfully' })
      
      setSelectedFile(null)
      setDocumentName("")
      setDocumentType("cv")
      
      await fetchDocuments()
    } catch (err: any) {
      toast({ variant: "destructive", title: 'Upload failed', description: err.message || 'Please try again.'})
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (documentId: string, documentUrl: string) => {
    try {
      setDeleting(documentId)
      
      // Delete from storage
      const fileName = documentUrl.split('/').pop()
      if(fileName) {
        await supabase.storage.from('documents').remove([`${(await supabase.auth.getUser()).data.user?.id}/${fileName}`])
      }
      
      // Delete from database
      const { error } = await supabase.from('documents').delete().eq('id', documentId)

      if (error) throw error

      toast({ title: 'Document deleted successfully' })
      setDocuments(documents.filter(doc => doc.id !== documentId))
    } catch (err: any) {
      toast({ variant: "destructive", title: 'Failed to delete document', description: err.message })
    } finally {
      setDeleting(null)
    }
  }

  if (loading && !documents.length) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-12 w-12 animate-spin text-theme-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 p-8 bg-red-50 border-l-4 border-red-400">
        <h2 className="font-bold text-red-800">An Error Occurred</h2>
        <p className="text-red-700">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents</h1>
        <p className="mt-2 text-lg text-gray-600">
          Upload and manage your CV, cover letters, and other important documents for your applications.
        </p>
      </div>
      
      <Separator />

      {/* Upload Section */}
      <div className="grid gap-6">
        <Card className="border-0 shadow-none bg-gray-50/50 p-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Upload a New Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
                ${isDragOver ? 'border-theme-500 bg-theme-50' : 'border-gray-300 hover:border-theme-400'}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                id="file-input"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={uploading}
              />
              <div className="flex flex-col items-center text-center">
                <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                <p className="font-semibold text-gray-700">
                  <span className="text-theme-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">PDF, DOCX, TXT, JPG, PNG (max 5MB)</p>
              </div>
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 border rounded-lg bg-white space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <FileTypeIcon type={selectedFile.type} />
                  <div className="flex-grow">
                    <p className="font-medium text-sm text-gray-800">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedFile(null)}>
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
                
                {uploading && <Progress value={uploadProgress} className="w-full h-2" />}

              </motion.div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document-name" className="font-medium">Document Name</Label>
                <Input
                  id="document-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g., My Resume"
                  className="mt-1"
                  disabled={uploading}
                />
              </div>

              <div>
                <Label htmlFor="document-type" className="font-medium">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
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
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={uploading || !selectedFile || !documentName}
              className="w-full sm:w-auto bg-theme-600 hover:bg-theme-700 text-white font-semibold"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : 'Upload Document'}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Separator />

      {/* Your Documents Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Documents</h2>
        {documents.length > 0 ? (
          <div className="bg-white border border-gray-200/50 rounded-lg">
            <ul className="divide-y divide-gray-200/50">
              <AnimatePresence>
                {documents.map((doc) => (
                  <motion.li
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                    className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <FileTypeIcon type={doc.type} />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • Uploaded on {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button asChild variant="ghost" size="icon" className="text-gray-500 hover:text-theme-600 hover:bg-theme-50">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" aria-label="View document">
                          <Eye className="h-5 w-5" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(doc.id, doc.url)} 
                        disabled={deleting === doc.id}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        aria-label="Delete document"
                      >
                        {deleting === doc.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading your first document.</p>
            </div>
          )
        )}
      </div>
    </motion.div>
  )
} 