import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(req: NextRequest) {
  try {
    const { title = '', description = '', requirements = '' } = await req.json()
    const fields = suggestFieldsFromSpec(String(title), String(description), String(requirements))
    return NextResponse.json({ fields })
  } catch (error) {
    console.error('custom-fields suggest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


