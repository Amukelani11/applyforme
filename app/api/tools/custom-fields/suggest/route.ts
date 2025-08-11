import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type SuggestedField = {
  field_label: string
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'radio' | 'multiselect' | 'checkbox' | 'file'
  field_required: boolean
  field_placeholder?: string
  field_help_text?: string
  field_options?: string[]
}

function suggestFieldsFromSpec(title: string, description: string, requirements: string): SuggestedField[] {
  const text = `${title}\n${description}\n${requirements}`.toLowerCase()
  const fields: SuggestedField[] = []

  // Years of experience
  if (/\byears?\b|\bexperience\b/.test(text)) {
    fields.push({
      field_label: 'Years of Relevant Experience',
      field_type: 'number',
      field_required: true,
      field_placeholder: 'e.g., 3'
    })
  }

  // Portfolio / GitHub / LinkedIn
  if (/portfolio|github|git hub/.test(text)) {
    fields.push({
      field_label: 'Portfolio or GitHub URL',
      field_type: 'text',
      field_required: false,
      field_placeholder: 'https://...'
    })
  }
  if (/linkedin|linkd?in/.test(text)) {
    fields.push({
      field_label: 'LinkedIn Profile URL',
      field_type: 'text',
      field_required: false,
      field_placeholder: 'https://www.linkedin.com/in/your-profile'
    })
  }

  // Cover letter
  if (/cover letter|motivation/.test(text)) {
    fields.push({
      field_label: 'Motivation / Cover Letter',
      field_type: 'textarea',
      field_required: false,
      field_placeholder: 'Share why you are a great fit for this role'
    })
  }

  // Tech stack cues
  const stack: string[] = []
  if (/react/.test(text)) stack.push('React')
  if (/node/.test(text)) stack.push('Node.js')
  if (/typescript|ts\b/.test(text)) stack.push('TypeScript')
  if (/python/.test(text)) stack.push('Python')
  if (/aws/.test(text)) stack.push('AWS')
  if (/docker/.test(text)) stack.push('Docker')
  if (stack.length >= 2) {
    fields.push({
      field_label: 'Primary Technology',
      field_type: 'select',
      field_required: true,
      field_options: stack
    })
  }

  // Availability
  if (/shift|schedule|availability|hours/.test(text)) {
    fields.push({
      field_label: 'Availability',
      field_type: 'radio',
      field_required: false,
      field_options: ['Immediate', '2 weeks', '1 month', 'More than 1 month']
    })
  }

  // Location preference
  if (/remote|hybrid|onsite|on-site/.test(text)) {
    fields.push({
      field_label: 'Work Preference',
      field_type: 'radio',
      field_required: false,
      field_options: ['Remote', 'Hybrid', 'On-site']
    })
  }

  // Optional file upload for writing sample or portfolio
  if (/writing|sample|design|figma|case study/.test(text)) {
    fields.push({
      field_label: 'Sample or Portfolio Upload',
      field_type: 'file',
      field_required: false,
      field_help_text: 'Attach a relevant sample (PDF, DOCX, or image)'
    })
  }

  // Fallback baseline when spec is sparse
  if (fields.length === 0) {
    fields.push(
      { field_label: 'Years of Relevant Experience', field_type: 'number', field_required: true },
      { field_label: 'LinkedIn Profile URL', field_type: 'text', field_required: false, field_placeholder: 'https://www.linkedin.com/in/...' }
    )
  }

  // Deduplicate by label
  const unique: SuggestedField[] = []
  const seen = new Set<string>()
  for (const f of fields) {
    if (seen.has(f.field_label.toLowerCase())) continue
    seen.add(f.field_label.toLowerCase())
    unique.push(f)
  }

  return unique.slice(0, 10)
}

async function suggestFieldsWithAI(title: string, description: string, requirements: string): Promise<SuggestedField[] | null> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) return null

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = `
You are an expert hiring assistant for South Africa. Based on the job spec, propose up to 10 custom application fields we should ask candidates.
Return ONLY a valid JSON array with objects of this exact shape (no markdown fences, no commentary):
[
  {
    "field_label": string,
    "field_type": "text" | "textarea" | "number" | "email" | "phone" | "date" | "select" | "radio" | "multiselect" | "checkbox" | "file",
    "field_required": boolean,
    "field_placeholder"?: string,
    "field_help_text"?: string,
    "field_options"?: string[] // required for select/radio/multiselect
  }
]

Guidelines:
- Use inclusive, bias-free wording
- Prefer measurable, role-relevant questions
- If the spec hints at a tech stack, include a select with those options
- Keep labels concise and clear
- Only include options when appropriate

Job Title: ${title || ''}
Description: ${description || ''}
Requirements: ${requirements || ''}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text().trim()
    text = text.replace(/```json|```/g, '').trim()

    // Try parse strict JSON
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) return parsed.slice(0, 10)
    } catch {}

    // Attempt to extract JSON array substring as fallback
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']')
    if (start !== -1 && end !== -1 && end > start) {
      const jsonLike = text.slice(start, end + 1)
      try {
        const parsed = JSON.parse(jsonLike)
        if (Array.isArray(parsed)) return parsed.slice(0, 10)
      } catch {}
    }

    return null
  } catch (err) {
    console.error('AI custom-fields suggest error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title = '', description = '', requirements = '' } = await req.json()

    // Try AI first
    const aiFields = await suggestFieldsWithAI(String(title), String(description), String(requirements))
    if (aiFields && aiFields.length > 0) {
      return NextResponse.json({ fields: aiFields, provider: 'gemini' })
    }

    // Fallback heuristic
    const fields = suggestFieldsFromSpec(String(title), String(description), String(requirements))
    return NextResponse.json({ fields, provider: 'heuristic' })
  } catch (error) {
    console.error('custom-fields suggest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


