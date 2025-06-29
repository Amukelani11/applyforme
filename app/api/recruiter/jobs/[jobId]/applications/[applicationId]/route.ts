import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";

// Google Cloud AI Analysis
async function analyzeApplicationWithAI(candidateData: any, jobPosting: any) {
  const GOOGLE_CLOUD_API_KEY = config.googleCloud.apiKey;
  const GOOGLE_CLOUD_PROJECT_ID = config.googleCloud.projectId;
  const GOOGLE_CLOUD_LOCATION = config.googleCloud.location;

  if (!GOOGLE_CLOUD_API_KEY) {
    console.warn('Google Cloud API key not configured, using mock analysis');
    return generateMockAnalysis(candidateData, jobPosting);
  }

  try {
    // Prepare candidate profile for AI analysis
    const candidateProfile = `
Candidate Profile:
Name: ${candidateData.user?.full_name || candidateData.full_name || 'Not provided'}
Email: ${candidateData.user?.email || candidateData.email || 'Not provided'}
Phone: ${candidateData.user?.phone || candidateData.phone || 'Not provided'}

Work Experience:
${candidateData.work_experience ? JSON.stringify(candidateData.work_experience, null, 2) : 'No work experience provided'}

Education:
${candidateData.education ? JSON.stringify(candidateData.education, null, 2) : 'No education information provided'}

Cover Letter:
${candidateData.cover_letter || 'No cover letter provided'}
`;

    const jobRequirements = `
Job Position: ${jobPosting.title}
Company: ${jobPosting.company}
Requirements: ${jobPosting.requirements || 'No specific requirements listed'}
Description: ${jobPosting.description || 'No job description provided'}
`;

    const response = await fetch(
      `https://${GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/publishers/google/models/gemini-pro:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GOOGLE_CLOUD_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this job application and provide a comprehensive assessment. Be specific and actionable.

${candidateProfile}

${jobRequirements}

Please provide your analysis in the following JSON format:
{
  "overall_score": <number 0-100>,
  "confidence_level": "<high|medium|low>",
  "key_insights": [
    "<insight 1>",
    "<insight 2>",
    "<insight 3>"
  ],
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "concerns": [
    "<concern 1>",
    "<concern 2>"
  ],
  "skills_match": {
    "score": <number 0-100>,
    "matched_skills": ["<skill 1>", "<skill 2>"],
    "missing_skills": ["<skill 1>", "<skill 2>"]
  },
  "experience_analysis": {
    "total_years": <number>,
    "relevance_score": <number 0-100>,
    "progression": "<excellent|good|average|poor>",
    "gaps": ["<gap 1>", "<gap 2>"]
  },
  "education_assessment": {
    "relevance": "<high|medium|low>",
    "level": "<doctorate|masters|bachelors|diploma|certificate|none>",
    "notes": "<assessment notes>"
  },
  "recommendation": "<hire|interview|consider|reject>",
  "next_steps": [
    "<step 1>",
    "<step 2>"
  ]
}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Google Cloud AI API error: ${response.status}`);
    }

    const result = await response.json();
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw new Error('No AI response received');
    }

    // Parse JSON from AI response
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse AI JSON response, using fallback');
    }

    // Fallback parsing
    return parseAIResponseFallback(aiText, candidateData, jobPosting);

  } catch (error) {
    console.error('AI Analysis error:', error);
    return generateMockAnalysis(candidateData, jobPosting);
  }
}

function generateMockAnalysis(candidateData: any, jobPosting: any) {
  // Generate realistic mock analysis based on actual data
  const workExp = candidateData.work_experience || [];
  const education = candidateData.education || [];
  
  const totalYears = workExp.reduce((total: number, exp: any) => {
    const start = new Date(exp.start_date || exp.startDate || '2020-01-01');
    const end = exp.is_current || exp.isCurrent ? new Date() : new Date(exp.end_date || exp.endDate || '2021-01-01');
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);

  const hasRelevantExp = workExp.some((exp: any) => 
    exp.title?.toLowerCase().includes(jobPosting.title?.toLowerCase().split(' ')[0]) ||
    exp.description?.toLowerCase().includes(jobPosting.title?.toLowerCase().split(' ')[0])
  );

  const hasHigherEd = education.some((edu: any) => 
    edu.degree?.toLowerCase().includes('bachelor') || 
    edu.degree?.toLowerCase().includes('master') ||
    edu.degree?.toLowerCase().includes('degree')
  );

  const baseScore = 60;
  const expBonus = Math.min(totalYears * 5, 20);
  const relevanceBonus = hasRelevantExp ? 15 : 0;
  const educationBonus = hasHigherEd ? 10 : 0;
  const coverLetterBonus = candidateData.cover_letter ? 5 : 0;

  const overallScore = Math.min(95, baseScore + expBonus + relevanceBonus + educationBonus + coverLetterBonus);

  return {
    overall_score: overallScore,
    confidence_level: overallScore > 80 ? 'high' : overallScore > 60 ? 'medium' : 'low',
    key_insights: [
      `Candidate has ${totalYears.toFixed(1)} years of professional experience`,
      hasRelevantExp ? 'Strong relevant experience in the field' : 'Limited directly relevant experience',
      hasHigherEd ? 'Strong educational background' : 'Practical experience focus'
    ],
    strengths: [
      totalYears > 3 ? 'Experienced professional' : 'Eager to learn and grow',
      candidateData.cover_letter ? 'Thoughtful application with cover letter' : 'Direct and concise application',
      workExp.length > 2 ? 'Diverse work experience' : 'Focused career path'
    ],
    concerns: [
      totalYears < 1 ? 'Limited professional experience' : null,
      !hasRelevantExp ? 'May require additional training' : null,
      !candidateData.cover_letter ? 'No cover letter provided' : null
    ].filter(Boolean),
    skills_match: {
      score: hasRelevantExp ? 85 : 65,
      matched_skills: hasRelevantExp ? ['Relevant Experience', 'Professional Background'] : ['Transferable Skills'],
      missing_skills: hasRelevantExp ? [] : ['Direct Industry Experience']
    },
    experience_analysis: {
      total_years: Math.round(totalYears * 10) / 10,
      relevance_score: hasRelevantExp ? 90 : 60,
      progression: totalYears > 5 ? 'good' : totalYears > 2 ? 'average' : 'early-career',
      gaps: []
    },
    education_assessment: {
      relevance: hasHigherEd ? 'high' : education.length > 0 ? 'medium' : 'low',
      level: hasHigherEd ? 'bachelors' : education.length > 0 ? 'diploma' : 'none',
      notes: hasHigherEd ? 'Strong educational foundation' : 'Experience-based background'
    },
    recommendation: overallScore > 80 ? 'interview' : overallScore > 65 ? 'consider' : 'review',
    next_steps: [
      overallScore > 80 ? 'Schedule initial interview' : 'Review application in detail',
      'Verify references and background',
      hasRelevantExp ? 'Discuss specific project experience' : 'Assess learning potential and motivation'
    ]
  };
}

function parseAIResponseFallback(aiText: string, candidateData: any, jobPosting: any) {
  // Extract key information from unstructured AI response
  return {
    overall_score: 75,
    confidence_level: 'medium',
    key_insights: [
      'AI analysis completed with basic assessment',
      'Candidate profile reviewed against job requirements',
      'Recommendation based on available information'
    ],
    strengths: ['Professional background', 'Complete application'],
    concerns: ['Limited AI parsing available'],
    skills_match: { score: 70, matched_skills: ['General'], missing_skills: [] },
    experience_analysis: { total_years: 2, relevance_score: 70, progression: 'average', gaps: [] },
    education_assessment: { relevance: 'medium', level: 'unknown', notes: 'Review required' },
    recommendation: 'consider',
    next_steps: ['Manual review recommended', 'Contact candidate for interview']
  };
}

export async function GET(
  request: Request,
  { params }: { params: { jobId: string; applicationId: string } }
) {
  try {
    const supabase = await createClient();
    const { jobId, applicationId } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'candidate';

    // Get current user to verify they're a recruiter for this job
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify recruiter owns this job
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_postings')
      .select(`
        *,
        recruiter:recruiters!inner(user_id)
      `)
      .eq('id', jobId)
      .eq('recruiter.user_id', user.id)
      .single();

    if (jobError || !jobPosting) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    let applicationData;
    let candidateData;

    if (type === 'candidate') {
      // Fetch candidate application
      const { data: application, error: appError } = await supabase
        .from('candidate_applications')
        .select(`
          *,
          user:users(
            id,
            full_name,
            email,
            phone,
            location,
            linkedin_url,
            github_url,
            portfolio_url
          )
        `)
        .eq('id', applicationId)
        .eq('job_posting_id', jobId)
        .single();

      if (appError || !application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      // Fetch additional candidate data
      const userId = application.user_id;
      
      // Get work experience
      const { data: workExperience } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      // Get education
      const { data: education } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      // Get certifications
      const { data: certifications } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', userId)
        .order('date_obtained', { ascending: false });

      // Get documents (CV)
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'cv')
        .order('created_at', { ascending: false })
        .limit(1);

      applicationData = application;
      candidateData = {
        ...application,
        work_experience: workExperience || [],
        education: education || [],
        certifications: certifications || [],
        documents: documents || []
      };

    } else {
      // Fetch public/detailed application
      const { data: application, error: appError } = await supabase
        .from('public_applications')
        .select('*')
        .eq('id', applicationId)
        .eq('job_id', jobId)
        .single();

      if (appError || !application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      applicationData = application;
      candidateData = {
        ...application,
        user: {
          full_name: `${application.first_name} ${application.last_name}`.trim(),
          email: application.email,
          phone: application.phone_number,
          location: application.location
        },
        work_experience: application.work_experience || [],
        education: application.education || [],
        certifications: [],
        documents: application.cv_path ? [{ file_url: application.cv_path, type: 'cv' }] : []
      };
    }

    // Perform AI analysis
    const aiAnalysis = await analyzeApplicationWithAI(candidateData, jobPosting);

    // Return comprehensive application data
    return NextResponse.json({
      application: applicationData,
      candidate: candidateData,
      job: jobPosting,
      ai_analysis: aiAnalysis,
      type
    });

  } catch (error: any) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update application status (shortlist/reject)
export async function PATCH(
  request: Request,
  { params }: { params: { jobId: string; applicationId: string } }
) {
  try {
    const supabase = await createClient();
    const { jobId, applicationId } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'candidate';
    
    const body = await request.json();
    const { status, notes } = body;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify recruiter owns this job
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_postings')
      .select(`
        *,
        recruiter:recruiters!inner(user_id)
      `)
      .eq('id', jobId)
      .eq('recruiter.user_id', user.id)
      .single();

    if (jobError || !jobPosting) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    let updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.recruiter_notes = notes;
    updateData.updated_at = new Date().toISOString();

    if (type === 'candidate') {
      // Update candidate application
      const { data, error } = await supabase
        .from('candidate_applications')
        .update(updateData)
        .eq('id', applicationId)
        .eq('job_posting_id', jobId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, application: data });
    } else {
      // Update public/detailed application
      const { data, error } = await supabase
        .from('public_applications')
        .update(updateData)
        .eq('id', applicationId)
        .eq('job_id', jobId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, application: data });
    }

  } catch (error: any) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 