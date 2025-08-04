'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, CheckCircle, AlertCircle, FileText, Sparkles } from 'lucide-react'
import { analyzeCV, improveCV, textToPDF } from '@/lib/google-cloud'

type ImprovementStatus = 'idle' | 'uploading' | 'analyzing' | 'improving' | 'complete' | 'error'

interface ImprovementResult {
  issues: string[]
  improvements: string[]
  improvedCvUrl: string
  scores?: {
    education: number
    experience: number
    skills: number
    overall: number
  }
  analysis: string
  improvedDocx: string
}

export default function ImprovePage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ImprovementStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImprovementResult | null>(null)
  const [remainingImprovements, setRemainingImprovements] = useState<number | 'Unlimited'>('Unlimited')
  const [improvedDocx, setImprovedDocx] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      checkImprovementLimits()
    }
    checkAuth()
  }, [router, supabase])

  const checkImprovementLimits = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    try {
      // First try to get existing limits
      const { data: limits, error: fetchError } = await supabase
        .from('user_improvement_limits')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching limits:', fetchError)
        throw fetchError
      }

      if (!limits) {
        // Create new limits record if none exists
        const { error: insertError } = await supabase
          .from('user_improvement_limits')
          .insert({
            user_id: session.user.id,
            plan_type: 'free',
            improvements_this_month: 0,
            last_improvement_date: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating limits:', insertError)
          throw insertError
        }

        // Fetch the newly created record
        const { data: newLimits, error: getError } = await supabase
          .from('user_improvement_limits')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (getError) {
          console.error('Error fetching new limits:', getError)
          throw getError
        }

        setRemainingImprovements('Unlimited')
      } else {
        // Calculate remaining improvements based on plan type
        const planLimits = {
          free: 1,
          basic: 4,
          premium: 20,
          pro: 1000000, // Use a large number for unlimited
        }
        
        const planType = limits.plan_type || 'free'
        const maxImprovements = planLimits[planType as keyof typeof planLimits] || 1
        const currentCount = limits.improvements_this_month || 0
        
        // Show 'Unlimited' in UI if pro
        setRemainingImprovements(planType === 'pro' ? 'Unlimited' : Math.max(0, maxImprovements - currentCount))
      }
    } catch (err: any) {
      console.error('Error checking improvement limits:', err)
      setError('Failed to check improvement limits. Please try again.')
      // Set a default value to allow the user to continue
      setRemainingImprovements('Unlimited')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    console.log('File selected:', selectedFile)
    if (selectedFile) {
      // Check file type
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setError('Please select a DOCX file only.')
        return
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleImprove = async () => {
    console.log('handleImprove called', { file, remainingImprovements, status });
    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setStatus('uploading')
      setProgress(0)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      // Double-check improvement limits before starting
      await checkImprovementLimits()
      
      if (remainingImprovements === 'Unlimited') {
        setError('You have reached your improvement limit for this period. Please upgrade your plan for more improvements.')
        return
      }

      // Verify limits one more time from database to prevent race conditions
      const { data: currentLimits, error: limitsError } = await supabase
        .from('user_improvement_limits')
        .select('improvements_this_month, plan_type')
        .eq('user_id', session.user.id)
        .single()

      if (limitsError) {
        console.error('Error checking current limits:', limitsError)
        throw new Error('Failed to verify improvement limits')
      }

      const planLimits = {
        free: 1,
        basic: 4,
        premium: 20,
        pro: 1000000
      }
      
      const planType = currentLimits.plan_type || 'free'
      const maxImprovements = planLimits[planType as keyof typeof planLimits]
      const currentCount = currentLimits.improvements_this_month || 0

      // Only block if NOT unlimited
      if (planType !== 'pro' && (typeof remainingImprovements === 'number' && remainingImprovements <= 0)) {
        setError('You have reached your improvement limit. Please upgrade your plan for more improvements.')
        setStatus('idle')
        return
      }

      // Read file as ArrayBuffer and convert to base64
      const arrayBuffer = await file.arrayBuffer()
      const base64Data = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      // Upload original CV
      const fileName = `${session.user.id}/${Date.now()}-${file.name}`
      console.log('About to upload file to Supabase storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      console.log('Upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        throw new Error(`Failed to upload file: ${uploadError.message}`)
      }

      // Get the public URL
      console.log('Getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)
      console.log('Public URL:', publicUrl);

      // Create document record
      console.log('Creating document record...');
      const { data: originalDoc, error: originalDocError } = await supabase
        .from('documents')
        .insert({
          user_id: session.user.id,
          name: file.name,
          type: 'cv',
          url: publicUrl
        })
        .select()
        .single()
      console.log('Document record:', { originalDoc, originalDocError });

      if (originalDocError) {
        console.error('Error creating document record:', originalDocError)
        throw new Error(`Failed to create document record: ${originalDocError.message}`)
      }

      setProgress(20)
      setStatus('analyzing')

      // Create improvement record
      console.log('Creating improvement record...');
      const { data: improvement, error: improvementError } = await supabase
        .from('cv_improvements')
        .insert({
          user_id: session.user.id,
          original_cv_id: originalDoc.id,
          status: 'analyzing'
        })
        .select()
        .single()
      console.log('Improvement record:', { improvement, improvementError });

      if (improvementError) {
        console.error('Error creating improvement record:', improvementError)
        throw new Error(`Failed to create improvement record: ${improvementError.message}`)
      }

      // Log before calling analyzeCV
      console.log('Calling analyzeCV', { fileName, fileType: file.type });
      // Analyze CV with base64 encoded data
      const analysis = await analyzeCV(base64Data, file.name, file.type)
      console.log('Analysis result:', analysis);
      setProgress(50)
      setStatus('improving')

      // Improve CV
      const improved = await improveCV(analysis.text, analysis.analysis)
      setProgress(80)

      // Upload improved CV
      const improvedFileName = `${session.user.id}/improved-${Date.now()}.docx`
      const improvedDocxBlob = new Blob(
        [Uint8Array.from(atob(improved.improvedDocx), c => c.charCodeAt(0))],
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      )
      const { data: improvedUpload, error: improvedError } = await supabase.storage
        .from('documents')
        .upload(improvedFileName, improvedDocxBlob, {
          cacheControl: '3600',
          upsert: false
        })

      if (improvedError) {
        console.error('Error uploading improved CV:', improvedError)
        throw new Error(`Failed to upload improved CV: ${improvedError.message}`)
      }

      // Get the public URL for improved CV
      const { data: { publicUrl: improvedPublicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(improvedFileName)

      // Create document record for improved CV
      const { data: improvedDoc, error: improvedDocError } = await supabase
        .from('documents')
        .insert({
          user_id: session.user.id,
          name: `Improved ${file.name}`,
          type: 'cv',
          url: improvedPublicUrl
        })
        .select()
        .single()

      if (improvedDocError) {
        console.error('Error creating improved document record:', improvedDocError)
        throw new Error(`Failed to create improved document record: ${improvedDocError.message}`)
      }

      // Update improvement record
      const { error: updateError } = await supabase
        .from('cv_improvements')
        .update({
          status: 'complete',
          improved_cv_id: improvedDoc.id,
          issues_found: analysis.analysis.split('\n').filter(line => line.startsWith('-') || line.startsWith('•')),
          improvements_made: improved.improvements
        })
        .eq('id', improvement.id)

      if (updateError) {
        console.error('Error updating improvement record:', updateError)
        throw new Error(`Failed to update improvement record: ${updateError.message}`)
      }

      // IMPORTANT: Atomically increment user's improvement count using RPC
      const { data: incremented, error: rpcError } = await supabase.rpc('increment_improvements_if_allowed', {
        user_id: session.user.id,
        plan_limit: maxImprovements
      })

      if (rpcError) {
        console.error('Error incrementing improvement limits:', rpcError)
        setError('Failed to update improvement limits. Please try again.')
        setStatus('error')
        return
      }
      if (!incremented) {
        setError('You have reached your improvement limit. Please upgrade your plan for more improvements.')
        setStatus('idle')
        return
      }

      setProgress(100)
      setStatus('complete')
      setResult({
        issues: analysis.analysis.split('\n').filter(line => line.startsWith('-') || line.startsWith('•')),
        improvements: improved.improvements,
        improvedCvUrl: improvedPublicUrl,
        scores: extractScores(analysis.analysis),
        analysis: analysis.analysis,
        improvedDocx: improved.improvedDocx
      })

      // Refresh remaining improvements to show updated count
      await checkImprovementLimits()

      // Create download link for improved DOCX
      const improvedDocxUrl = URL.createObjectURL(improvedDocxBlob)
      setImprovedDocx(improvedDocxUrl)

    } catch (err: any) {
      console.error('Error improving CV:', err, err?.stack);
      setError(err?.message || 'Failed to improve CV');
      setStatus('error');
    }
  }

  function extractScores(analysis: string) {
    const scores: any = {}
    const scoreLines = analysis.split('\n').filter(line => line.includes('score:'))
    
    scoreLines.forEach(line => {
      const [section, score] = line.split(':').map(s => s.trim())
      scores[section.toLowerCase()] = parseInt(score)
    })

    return scores
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Improve Your CV</h1>
        </div>

        {/* CV Expert Service Info */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Professional CV Expert Service</h2>
              <p className="text-gray-700 mb-3">
                Your CV will be reviewed and improved by our team of professional CV experts with years of experience in recruitment and HR.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">24-hour turnaround time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Email notification when complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Industry-specific improvements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">ATS-optimized formatting</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Improvement Limits Display */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Remaining Improvements: {remainingImprovements === 'Unlimited' ? 'Unlimited' : remainingImprovements}
              </span>
            </div>
            {typeof remainingImprovements === 'number' && remainingImprovements === 0 && (
              <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                Upgrade plan for more improvements
              </span>
            )}
          </div>
        </Card>

        {error && remainingImprovements !== 'Unlimited' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'idle' && (
          <Card className="p-6 border-2 border-dashed border-gray-200 hover:border-primary transition-colors">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Upload Your CV</h2>
              <p className="text-gray-500 mb-6">
                Upload your CV in DOCX format and our expert team will review and improve it within 24 hours. You'll receive an email notification when it's ready.
              </p>
              <div className="flex items-center justify-center gap-4">
                <input
                  type="file"
                  accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {file && (
                  (() => { console.log('Rendering Improve CV button', { file, remainingImprovements, status }); return null; })() ||
                  <Button
                    onClick={handleImprove}
                    className="mt-6"
                    disabled={status !== 'idle' || (typeof remainingImprovements === 'number' && remainingImprovements <= 0)}
                  >
                    Send to CV Expert
                  </Button>
                )}
              </div>
              {file && typeof remainingImprovements === 'number' && remainingImprovements <= 0 && (
                <div className="mt-6">
                  <Button disabled className="mb-2">
                    No Improvements Remaining
                  </Button>
                  <p className="text-sm text-gray-500">
                    Please upgrade your plan to continue improving CVs
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {status !== 'idle' && status !== 'complete' && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">
                  {status === 'uploading' && 'Uploading your CV...'}
                  {status === 'analyzing' && 'Analyzing your CV...'}
                  {status === 'improving' && 'Sending to CV expert...'}
                </h2>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500">
                Your CV is being processed and will be sent to our expert team. You'll receive an email notification within 24 hours when your improved CV is ready.
              </p>
            </div>
          </Card>
        )}

        {status === 'complete' && result && (
          <div className="space-y-6">
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <h2 className="text-xl font-semibold">CV Improvement Complete!</h2>
              </div>
              <p className="text-green-700 mb-4">
                Your CV has been expertly reviewed and improved by our professional team. You should also receive an email notification with your improved CV.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Issues Found</h3>
                  <ul className="space-y-2">
                    {result.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-1" />
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Improvements Made</h3>
                  <ul className="space-y-2">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {result.scores && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">CV Scores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(result.scores).map(([key, value]) => (
                      <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-500 capitalize">{key}</div>
                        <div className="text-2xl font-bold text-primary">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6">
                <Button
                  onClick={() => window.open(result.improvedCvUrl, '_blank')}
                  className="w-full"
                >
                  Download Improved CV
                </Button>
              </div>
            </Card>
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle')
                  setFile(null)
                  setResult(null)
                  setProgress(0)
                }}
              >
                Improve Another CV
              </Button>
            </div>
          </div>
        )}

        {improvedDocx && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Improved CV</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your CV has been improved by our expert team. Click the button below to download the improved version.
            </p>
            <div className="mt-4">
              <a
                href={improvedDocx}
                download="improved-cv.docx"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Download Improved CV
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 