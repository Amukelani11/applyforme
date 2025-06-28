"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"
import { Plus, Trash2, ArrowLeft, Award, Upload, FileText, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Certification {
  id: string
  name: string
  issuer: string
  date_obtained: string
  expiry_date?: string
  credential_id?: string
  credential_url?: string
  document_url?: string
  document_name?: string
}

export default function CertificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({
    name: '',
    issuer: '',
    date_obtained: '',
    expiry_date: '',
    credential_id: '',
    credential_url: ''
  })
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | null>(null)

  const fetchCertifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signin')
        return
      }

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date_obtained', { ascending: false })

      if (error) throw error
      setCertifications(data || [])
    } catch (err: any) {
      console.error('Error fetching certifications:', err)
      setError(err.message || 'Failed to load certifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (!session?.user) {
          router.push('/signin')
          return
        }

        setUser(session.user)

        // Fetch certifications
        const { data: certificationsData, error: certificationsError } = await supabase
          .from('certifications')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date_obtained', { ascending: false })

        if (certificationsError) throw certificationsError
        setCertifications(certificationsData || [])

      } catch (err: any) {
        console.error('Error loading certifications:', err)
        setError(err.message || 'Failed to load certifications')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCertification(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase
        .from('certifications')
        .insert({
          user_id: user.id,
          name: newCertification.name,
          issuer: newCertification.issuer,
          date_obtained: newCertification.date_obtained,
          expiry_date: newCertification.expiry_date || null,
          credential_id: newCertification.credential_id || null,
          credential_url: newCertification.credential_url || null
        })

      if (error) throw error

      // Refresh certifications
      const { data: certificationsData } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('date_obtained', { ascending: false })

      setCertifications(certificationsData || [])
      setNewCertification({
        name: '',
        issuer: '',
        date_obtained: '',
        expiry_date: '',
        credential_id: '',
        credential_url: ''
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCertification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCertifications(prev => prev.filter(cert => cert.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDocumentUpload = async (certificationId: string) => {
    if (!selectedDocument) return

    try {
      setUploadingDocument(true)
      setError(null)

      // Upload document to private documents bucket
      const fileExt = selectedDocument.name.split('.').pop()
      const fileName = `certifications/${certificationId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedDocument, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get signed URL for the uploaded file
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 31536000) // URL valid for 1 year

      if (!data?.signedUrl) throw new Error('Failed to generate signed URL')

      // Update certification with document info
      const { error: updateError } = await supabase
        .from('certifications')
        .update({
          document_url: data.signedUrl,
          document_name: selectedDocument.name
        })
        .eq('id', certificationId)

      if (updateError) throw updateError

      // Refresh certifications list
      fetchCertifications()
      setSelectedDocument(null)
    } catch (err: any) {
      console.error('Error uploading document:', err)
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleDeleteDocument = async (certificationId: string, documentUrl: string) => {
    try {
      setError(null)

      // Extract file path from URL
      const urlParts = documentUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `certifications/${fileName}`

      // Delete from private documents bucket
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Update certification
      const { error: updateError } = await supabase
        .from('certifications')
        .update({
          document_url: null,
          document_name: null
        })
        .eq('id', certificationId)

      if (updateError) throw updateError

      // Refresh certifications list
      fetchCertifications()
    } catch (err: any) {
      console.error('Error deleting document:', err)
      setError(err.message || 'Failed to delete document')
    }
  }

  // Add function to refresh signed URLs
  const refreshSignedUrls = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: certifications, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', session.user.id)
        .not('document_url', 'is', null)

      if (error) throw error

      for (const cert of certifications) {
        if (cert.document_url) {
          const urlParts = cert.document_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          const filePath = `certifications/${fileName}`

          const { data } = await supabase.storage
            .from('documents')
            .createSignedUrl(filePath, 31536000) // URL valid for 1 year

          if (data?.signedUrl) {
            await supabase
              .from('certifications')
              .update({ document_url: data.signedUrl })
              .eq('id', cert.id)
          }
        }
      }

      // Refresh the certifications list
      fetchCertifications()
    } catch (err) {
      console.error('Error refreshing signed URLs:', err)
    }
  }

  // Refresh signed URLs when component mounts
  useEffect(() => {
    refreshSignedUrls()
  }, [])

  const handlePreview = (url: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (extension === 'pdf') {
      setPreviewType('pdf')
    } else if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
      setPreviewType('image')
    }
    setPreviewUrl(url)
    setPreviewOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#c084fc] hover:bg-[#a855f7]"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid gap-8">
          {/* Add New Certification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Certification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCertification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Certification Name</label>
                    <Input
                      name="name"
                      value={newCertification.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issuing Organization</label>
                    <Input
                      name="issuer"
                      value={newCertification.issuer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Obtained</label>
                    <Input
                      type="date"
                      name="date_obtained"
                      value={newCertification.date_obtained}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                    <Input
                      type="date"
                      name="expiry_date"
                      value={newCertification.expiry_date || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credential ID (Optional)</label>
                    <Input
                      name="credential_id"
                      value={newCertification.credential_id || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credential URL (Optional)</label>
                    <Input
                      type="url"
                      name="credential_url"
                      value={newCertification.credential_url || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Certification Document</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedDocument(e.target.files?.[0] || null)}
                      disabled={uploadingDocument}
                    />
                    {selectedDocument && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedDocument(null)}
                        disabled={uploadingDocument}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max size: 5MB)
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#c084fc] hover:bg-[#a855f7]"
                    disabled={saving || uploadingDocument}
                  >
                    {saving ? 'Adding...' : 'Add Certification'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Certifications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Your Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certifications.length > 0 ? (
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="p-4 bg-white rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{cert.name}</h3>
                          <p className="text-sm text-gray-500">{cert.issuer}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              Obtained: {new Date(cert.date_obtained).toLocaleDateString()}
                            </p>
                            {cert.expiry_date && (
                              <p className="text-sm text-gray-600">
                                Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                              </p>
                            )}
                            {cert.credential_id && (
                              <p className="text-sm text-gray-600">
                                Credential ID: {cert.credential_id}
                              </p>
                            )}
                            {cert.credential_url && (
                              <a
                                href={cert.credential_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#c084fc] hover:underline"
                              >
                                View Credential
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {cert.document_url ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(cert.document_url!, cert.document_name!)}
                                className="text-[#c084fc] hover:text-[#a855f7] flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                {cert.document_name}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDocument(cert.id, cert.document_url!)}
                                disabled={uploadingDocument}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setSelectedDocument(file)
                                    handleDocumentUpload(cert.id)
                                  }
                                }}
                                disabled={uploadingDocument}
                                className="hidden"
                                id={`document-${cert.id}`}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`document-${cert.id}`)?.click()}
                                disabled={uploadingDocument}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCertification(cert.id)}
                            disabled={loading || uploadingDocument}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No certifications added yet. Add your first certification above.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewType === 'pdf' && previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            )}
            {previewType === 'image' && previewUrl && (
              <img
                src={previewUrl}
                alt="Document Preview"
                className="max-w-full max-h-full object-contain mx-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 