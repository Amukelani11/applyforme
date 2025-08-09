import { NextRequest, NextResponse } from 'next/server'

type QuestionSet = {
  behavioral: string[]
  technical: string[]
  situational: string[]
  culture: string[]
}

const BANK = {
  behavioral: [
    'Tell me about a time you led a project with competing priorities. How did you align stakeholders?',
    'Describe a conflict you resolved within a team. What did you learn?',
    'Share an example where you had to make a decision with incomplete information.',
    'Tell me about a failure. What happened and what would you do differently?'
  ],
  situational: [
    'You discover a critical bug just before release. What is your response plan?',
    'You have three urgent requests from different leaders. How do you prioritize?',
    'A key team member resigns mid-project. What steps do you take to mitigate risk?',
    'You need to improve team throughput by 20%. What would you try first?'
  ],
  culture: [
    'What does psychological safety mean to you and how do you foster it?',
    'How do you prefer to receive feedback, and how do you deliver it?',
    'What motivates you most in your day-to-day work?',
    'Describe the environment in which you do your best work.'
  ]
}

function generateTechnical(jobTitle: string, experience: string, description: string): string[] {
  const base = jobTitle.toLowerCase()
  const isEng = /(engineer|developer|software|frontend|backend|full\s*stack)/.test(base)
  const isData = /(data|ml|ai|science|analyst)/.test(base)
  const isProd = /(product\s*manager|product\s*owner)/.test(base)
  const senior = /senior|lead|principal|staff|manager/.test(experience.toLowerCase())

  if (isEng) {
    return [
      'Walk me through how you would design a scalable API for a high-traffic feature.',
      'How do you approach testing strategy (unit, integration, e2e) in complex systems?',
      'Describe a performance bottleneck you diagnosed and how you resolved it.',
      'Discuss trade-offs between monoliths and microservices in your past work.'
    ].concat(senior ? ['How do you drive technical roadmap and debt reduction across squads?'] : [])
  }
  if (isData) {
    return [
      'How do you validate data quality and manage schema evolution?',
      'Explain a time you improved a model’s performance; what metrics did you use?',
      'When would you prefer a simpler model over a complex one? Why?',
      'Describe your feature engineering approach for time-series data.'
    ].concat(senior ? ['How do you productionize ML and monitor model drift?'] : [])
  }
  if (isProd) {
    return [
      'How do you define success metrics and guardrail metrics for a new feature?',
      'Describe a prioritization decision using a framework (e.g., RICE, ICE, WSJF).',
      'How do you balance user feedback, analytics, and stakeholder pressure?',
      'Share how you validated a product hypothesis end-to-end.'
    ].concat(senior ? ['How do you run portfolio-level tradeoff reviews across initiatives?'] : [])
  }
  return [
    'Describe a complex problem you solved and your approach.',
    'How do you measure impact in your role?',
    'What tools and processes do you rely on to deliver consistently?'
  ]
}

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, experienceLevel, jobDescription } = await req.json()

    if (!jobTitle || !experienceLevel || !jobDescription) {
      return NextResponse.json({ error: 'jobTitle, experienceLevel and jobDescription are required' }, { status: 400 })
    }

    const questions: QuestionSet = {
      behavioral: BANK.behavioral,
      technical: generateTechnical(jobTitle, experienceLevel, jobDescription),
      situational: BANK.situational,
      culture: BANK.culture
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Interview questions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


