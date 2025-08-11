import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type SectionType = 'description' | 'requirements' | 'benefits'

interface ImproveRequest {
  section: SectionType
  text: string
  title?: string
  company?: string
  location?: string
  jobType?: string
  seniority?: string
}

function buildPrompt(payload: ImproveRequest): string {
  const { section, text, title, company, location, jobType, seniority } = payload

  const contextLines: string[] = []
  if (title) contextLines.push(`Role Title: ${title}`)
  if (company) contextLines.push(`Company: ${company}`)
  if (location) contextLines.push(`Location: ${location}`)
  if (jobType) contextLines.push(`Employment Type: ${jobType}`)
  if (seniority) contextLines.push(`Seniority: ${seniority}`)

  const sharedGuidelines = `
You are an expert South African hiring copywriter. Improve the provided job posting ${section} while:
- Preserving intent and factual content
- Using inclusive, bias-free language (no "rockstar/ninja/guru")
- Optimizing for ATS and SEO with relevant, natural keywords
- Writing clearly, concisely, and professionally
- Formatting with short paragraphs and bullet points where appropriate
- Returning ONLY the improved plain text for the ${section}, no preamble, no markdown fences, no extra commentary.
`

  const sectionGuidanceMap: Record<SectionType, string> = {
    description: `
Rewrite as a compelling overview focused on impact, scope, and collaboration. Mention primary objectives, typical day-to-day, and how this role contributes to the business. Avoid generic fluff. Keep it 120–220 words.
` ,
    requirements: `
Rewrite as a structured, scannable bullet list. Split into "Must-have" and "Nice-to-have" if helpful. Use measurable or specific competencies where possible. 6–12 bullets total.
`,
    benefits: `
Rewrite as a concise, attractive bullet list of benefits/perks. Prioritize items valued in South Africa (medical aid, pension, leave, remote/hybrid flexibility). 5–10 bullets.
`,
  }

  const contextBlock = contextLines.length ? `Context\n${contextLines.join('\n')}` : ''

  return `
${sharedGuidelines}
${sectionGuidanceMap[section]}
${contextBlock}

Original ${section}:
"""
${text}
"""

Improved ${section} (plain text only):
`.trim()
}

function basicFallback(section: SectionType, text: string): string {
  const cleaned = (text || '').trim().replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n')
  if (section === 'requirements' || section === 'benefits') {
    const parts = cleaned
      .split(/\n|\.|;|,|•|\u2022/g)
      .map(p => p.trim())
      .filter(Boolean)
    const unique = Array.from(new Set(parts))
    return unique.map(p => `• ${p.replace(/^[-•\u2022]\s*/, '')}`).join('\n')
  }
  return cleaned
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImproveRequest
    const { section, text } = body

    if (!section || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'section and text are required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      // Fallback if no API key configured
      const improved = basicFallback(section, text)
      return NextResponse.json({ text: improved, provider: 'fallback' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = buildPrompt(body)
    const result = await model.generateContent(prompt)
    const response = await result.response
    let improved = response.text() || ''

    // Clean fences or accidental markdown
    improved = improved.replace(/```[a-z]*\n?|```/gi, '').trim()

    if (!improved) {
      improved = basicFallback(section, text)
    }

    return NextResponse.json({ text: improved, provider: 'gemini' })
  } catch (error) {
    console.error('AI job-posting improve error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type ImproveField = 'description' | 'requirements' | 'benefits'

interface ImproveRequestBody {
  field: ImproveField
  text: string
  job?: {
    title?: string
    company?: string
    location?: string
    jobType?: string
    salaryRange?: string
    seniority?: string
    contractTerm?: string | null
  }
}

function buildPrompt(field: ImproveField, text: string, job: ImproveRequestBody['job'] = {}) {
  const { title, company, location, jobType, salaryRange, seniority, contractTerm } = job

  const contextLines: string[] = []
  if (title) contextLines.push(`Job Title: ${title}`)
  if (company) contextLines.push(`Company: ${company}`)
  if (location) contextLines.push(`Location: ${location}`)
  if (jobType) contextLines.push(`Job Type: ${jobType}${contractTerm ? ` (${contractTerm})` : ''}`)
  if (seniority) contextLines.push(`Seniority: ${seniority}`)
  if (salaryRange) contextLines.push(`Salary Range: ${salaryRange}`)

  const sharedGuidance = `
You are an expert recruiter and job description writer for South African roles. Improve the provided ${field} content so it is:
- Clear, inclusive (no biased language), and ATS-friendly
- Concise but compelling, with strong verbs and measurable outcomes
- Formatted with Markdown where helpful (short paragraphs and bullet points)
- Grounded strictly in the provided content; do not invent facts or benefits
- Keep meaning and specifics; polish structure and wording
`

  let fieldSpecific = ''
  if (field === 'description') {
    fieldSpecific = `
For Description, produce:
- 1–2 concise paragraphs summarizing mission, impact, and scope
- A short bullet list of 4–7 core responsibilities
`
  } else if (field === 'requirements') {
    fieldSpecific = `
For Requirements, produce two bullet lists:
- Must-have (5–8 items)
- Nice-to-have (3–6 items)
`
  } else if (field === 'benefits') {
    fieldSpecific = `
For Benefits, produce a bullet list grouped logically (e.g., compensation, growth, flexibility). Keep claims realistic and avoid exaggeration.
`
  }

  const contextBlock = contextLines.length ? `Context:\n${contextLines.join('\n')}` : ''

  return `Rewrite and improve the following job posting ${field}.
${contextBlock}
${sharedGuidance}
${fieldSpecific}

Return only the improved ${field} text, no extra commentary.

Original ${field}:
"""
${text}
"""`
}

function fallbackImprove(field: ImproveField, text: string): string {
  // Simple heuristic cleanup as a fallback when no AI key is configured
  const trimmed = text.trim()
  if (!trimmed) return ''
  if (field === 'requirements') {
    // Normalize to bullets
    const lines = trimmed.split(/\n+/).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    return ['Must-have:', ...lines.slice(0, 6).map(l => `• ${l}`), '', 'Nice-to-have:', ...lines.slice(6, 10).map(l => `• ${l}`)].join('\n')
  }
  if (field === 'benefits') {
    const lines = trimmed.split(/\n+/).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    return ['Compensation & Rewards:', ...lines.slice(0, 3).map(l => `• ${l}`), '', 'Growth & Culture:', ...lines.slice(3, 7).map(l => `• ${l}`), '', 'Flexibility:', ...lines.slice(7, 10).map(l => `• ${l}`)].join('\n')
  }
  // description fallback
  return trimmed
}

export async function POST(req: NextRequest) {
  try {
    const { field, text, job }: ImproveRequestBody = await req.json()
    if (!field || !text) {
      return NextResponse.json({ error: 'field and text are required' }, { status: 400 })
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
    const prompt = buildPrompt(field, text, job)

    if (!GOOGLE_API_KEY) {
      // Fallback when no AI key
      const improved = fallbackImprove(field, text)
      return NextResponse.json({ improved })
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const improved = (response.text() || '').replace(/^```[a-z]*|```$/g, '').trim()

    return NextResponse.json({ improved: improved || fallbackImprove(field, text) })
  } catch (error) {
    console.error('AI job-posting improve error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


