import { NextRequest, NextResponse } from 'next/server'

type MatchResult = {
  overallScore: number
  skillsMatch: number
  experienceMatch: number
  educationMatch: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
}

const COMMON_SKILLS = [
  'javascript','typescript','react','next.js','node','node.js','python','java','c#','sql','postgres','mysql','mongodb','aws','azure','gcp','docker','kubernetes','git','ci/cd','rest','graphql','testing','cypress','jest','playwright','html','css','sass','tailwind','redux','vue','angular','go','rust','redis','rabbitmq','kafka','terraform','ansible','linux','bash','power bi','tableau'
]

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.#\/\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function extractSkills(text: string): string[] {
  const tokens = new Set(tokenize(text))
  return COMMON_SKILLS.filter(s => tokens.has(s) || tokens.has(s.replace(/\./g, '')))
}

function estimateExperienceScore(resume: string, jd: string): number {
  const r = resume.toLowerCase()
  const j = jd.toLowerCase()
  let score = 50
  // Heuristics for experience seniority alignment
  const seniorSignals = ['senior','lead','principal','staff']
  const midSignals = ['mid','intermediate']
  const juniorSignals = ['junior','entry']

  const yearsMatch = r.match(/(\d+)[+\s-]*year/)
  const years = yearsMatch ? Math.min(parseInt(yearsMatch[1], 10), 40) : 0

  const wantsSenior = seniorSignals.some(s => j.includes(s))
  const wantsMid = midSignals.some(s => j.includes(s))
  const wantsJunior = juniorSignals.some(s => j.includes(s))

  if (wantsSenior) score = years >= 5 ? 85 : years >= 3 ? 65 : 40
  else if (wantsMid) score = years >= 3 ? 85 : years >= 1 ? 70 : 45
  else if (wantsJunior) score = years <= 2 ? 85 : years <= 4 ? 70 : 55
  else score = Math.min(90, 50 + years * 6)

  return Math.max(30, Math.min(95, score))
}

function estimateEducationScore(resume: string): number {
  const r = resume.toLowerCase()
  if (r.includes('phd') || r.includes('doctorate')) return 95
  if (r.includes("master's") || r.includes('masters') || r.includes('msc')) return 90
  if (r.includes("bachelor") || r.includes('bsc') || r.includes('degree')) return 80
  if (r.includes('diploma') || r.includes('certificate')) return 70
  return 60
}

function buildRecommendations(missingSkills: string[], scores: { skills: number; experience: number; education: number }): string[] {
  const recs: string[] = []
  if (missingSkills.length) {
    recs.push(`Consider upskilling on: ${missingSkills.slice(0, 7).join(', ')}`)
  }
  if (scores.experience < 70) {
    recs.push('Highlight measurable outcomes and leadership/impact to strengthen experience alignment')
  }
  if (scores.education < 75) {
    recs.push('Add relevant certifications or courses to bolster qualifications')
  }
  if (scores.skills < 75) {
    recs.push('Mirror key terms from the job description to pass ATS keyword screens')
  }
  if (recs.length === 0) recs.push('Strong match. Proceed to technical screening/interview')
  return recs
}

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, resumeText } = await req.json()

    if (!jobDescription || !resumeText) {
      return NextResponse.json({ error: 'jobDescription and resumeText are required' }, { status: 400 })
    }

    const jdSkills = extractSkills(jobDescription)
    const cvSkills = extractSkills(resumeText)

    const matched = jdSkills.filter(s => cvSkills.includes(s))
    const missing = jdSkills.filter(s => !cvSkills.includes(s))

    const skillsMatch = jdSkills.length ? Math.round((matched.length / jdSkills.length) * 100) : 60
    const experienceMatch = estimateExperienceScore(resumeText, jobDescription)
    const educationMatch = estimateEducationScore(resumeText)

    // Weighted overall score: skills 50%, experience 35%, education 15%
    const overallScore = Math.round(skillsMatch * 0.5 + experienceMatch * 0.35 + educationMatch * 0.15)

    const recommendations = buildRecommendations(missing, { skills: skillsMatch, experience: experienceMatch, education: educationMatch })

    const result: MatchResult = {
      overallScore,
      skillsMatch,
      experienceMatch,
      educationMatch,
      matchedSkills: matched,
      missingSkills: missing,
      recommendations
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Resume match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


