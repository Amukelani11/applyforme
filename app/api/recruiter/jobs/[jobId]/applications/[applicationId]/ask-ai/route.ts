import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest, { params }: { params: { jobId: string; applicationId: string } }) {
  try {
    const { jobId, applicationId } = await params
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'candidate'
    const { question } = await request.json() as { question: string }

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure recruiter owns the job
    const { data: recruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
    }

    const { data: job } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single()
    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 })
    }

    let application: any = null
    let candidateProfile: any = {}
    let cvText: string | null = null

    if (type === 'candidate') {
      const { data: app } = await supabase
        .from('candidate_applications')
        .select('*')
        .eq('id', applicationId)
        .eq('job_posting_id', jobId)
        .single()
      if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      application = app

      // Load latest CV document if present
      if (app.cv_url) {
        try {
          const res = await fetch(app.cv_url)
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            cvText = `Attached CV PDF (${Math.round(buffer.byteLength / 1024)} KB).` // light placeholder; avoid heavy OCR here
          }
        } catch {}
      }
    } else {
      const realId = applicationId.startsWith('public-') ? applicationId.replace('public-', '') : applicationId
      const { data: app } = await supabase
        .from('public_applications')
        .select('*')
        .eq('id', realId)
        .eq('job_id', jobId)
        .single()
      if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      application = app

      if (app.cv_path) {
        try {
          const { data: signedUrl } = await supabase.storage
            .from('documents')
            .createSignedUrl(app.cv_path, 1800)
          if (signedUrl?.signedUrl) {
            cvText = `Attached CV available at signed URL (temporary).`
          }
        } catch {}
      }
    }

    // Include any existing AI analysis if present
    const priorAnalysis = application.ai_analysis ? JSON.stringify(application.ai_analysis).slice(0, 4000) : ''

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
    if (!GOOGLE_API_KEY) {
      // Simple local heuristic answer
      const fallback = `AI is not configured. Based on available data: Job "${job.title}" at ${job.company}. Question: "${question}". Current analysis indicates ${application.ai_analysis ? 'there is existing AI analysis we can review' : 'no AI analysis available yet'}.`
      return NextResponse.json({ answer: fallback, provider: 'fallback' })
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = `You are an expert recruiter assistant. Answer the question using ONLY the provided application, job, and analysis context. Be concise, structured, and practical. If unsure, say so.

Job Context:
${JSON.stringify({ title: job.title, company: job.company, description: job.description, requirements: job.requirements }).slice(0, 4000)}

Existing AI Analysis (may be partial):
${priorAnalysis}

CV/Document Context (meta only):
${cvText || 'No CV available'}

Question:
"""
${question}
"""

Return a clear, markdown-free answer with short paragraphs and bullet points where useful.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let answer = (response.text() || '').replace(/```[a-z]*|```/g, '').trim()
    if (!answer) answer = 'No answer generated.'

    return NextResponse.json({ answer, provider: 'gemini' })
  } catch (error) {
    console.error('ask-ai error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


