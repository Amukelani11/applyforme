import { NextRequest, NextResponse } from 'next/server'

type Suggestion = {
  type: 'improvement' | 'warning' | 'suggestion'
  category: string
  text: string
  action?: string
}

type OptimizeResponse = {
  enhancedText: string
  overallScore: number
  readability: number
  seoScore: number
  clarityScore: number
  keywords: string[]
  suggestions: Suggestion[]
  missingSections: string[]
  biasDetected: string[]
}

function scoreReadability(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]\s/g) || []).length)
  const words = Math.max(1, text.trim().split(/\s+/).length)
  const avgWordsPerSentence = words / sentences
  // Ideal 12-18
  const delta = Math.abs(avgWordsPerSentence - 15)
  return Math.max(40, Math.min(95, Math.round(95 - delta * 6)))
}

function detectKeywords(text: string): string[] {
  const corpus = text.toLowerCase()
  const kws = ['javascript','react','node.js','typescript','aws','docker','sql','python','agile','scrum','communication','leadership','stakeholder','kpi','okr','seo','marketing','design','figma']
  return kws.filter(k => corpus.includes(k)).slice(0, 12)
}

function addBoilerplate(jd: string): string {
  const sections: string[] = []
  if (!/requirements\s*:|responsibilities\s*:|key requirements/i.test(jd)) {
    sections.push('🎯 Key Requirements:\n• Strong analytical and problem-solving skills\n• Excellent communication and collaboration abilities\n• Proven track record of delivering high-quality results')
  }
  if (!/benefits\s*:|what we offer/i.test(jd)) {
    sections.push('💡 What We Offer:\n• Competitive salary and comprehensive benefits\n• Professional development and growth opportunities\n• Collaborative and innovative work environment\n• Work-life balance and flexible arrangements')
  }
  return [jd.trim(), ...sections].join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const enhancedText = addBoilerplate(text)
    const readability = scoreReadability(enhancedText)
    const seoScore = Math.min(95, 60 + detectKeywords(enhancedText).length * 3)
    const clarityScore = Math.min(95, 70 + Math.round(enhancedText.length / 1200))
    const overallScore = Math.round(readability * 0.4 + seoScore * 0.3 + clarityScore * 0.3)

    const keywords = detectKeywords(enhancedText)

    const biasDetected = [] as string[]
    if (/rockstar|ninja|guru/i.test(text)) biasDetected.push('Biased terms ("rockstar", "ninja")')

    const missingSections: string[] = []
    if (!/culture|values|mission/i.test(text)) missingSections.push('Company culture description')
    if (!/remote|hybrid|onsite/i.test(text)) missingSections.push('Remote work policy')
    if (!/growth|career|development/i.test(text)) missingSections.push('Career growth opportunities')

    const suggestions: Suggestion[] = [
      { type: 'improvement', category: 'Clarity', text: 'Replace vague requirements with measurable outcomes (e.g., delivered feature X improving metric Y by Z%)', action: 'Add specific examples' },
      { type: 'warning', category: 'Bias', text: 'Avoid gendered/biased language; prefer neutral terms like "skilled" or "experienced"', action: 'Replace terms' },
      { type: 'suggestion', category: 'SEO', text: 'Include role- and stack-specific keywords present in your environment for better ATS matches', action: 'Include keywords' }
    ]

    const payload: OptimizeResponse = {
      enhancedText,
      overallScore,
      readability,
      seoScore,
      clarityScore,
      keywords,
      suggestions,
      missingSections,
      biasDetected
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('JD optimize error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


