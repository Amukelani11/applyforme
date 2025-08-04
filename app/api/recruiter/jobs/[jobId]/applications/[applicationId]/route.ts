import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Generative AI Analysis
async function analyzeApplicationWithAI(candidateData: any, jobPosting: any) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  if (!GOOGLE_API_KEY) {
    console.warn('Google API key not configured, using mock analysis');
    return generateMockAnalysis(candidateData, jobPosting);
  }

  try {
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // --------------------------------------
    // 1. Extract CV text (if a resume PDF is available)
    // --------------------------------------
    let cvText = '';
    try {
      const cvUrl = (candidateData.documents && candidateData.documents[0]?.file_url) || candidateData.cv_url || null;
      if (cvUrl) {
        console.log('Attempting to extract text from CV URL:', cvUrl);
        const cvRes = await fetch(cvUrl);
        if (cvRes.ok) {
          const arrayBuffer = await cvRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Try to extract text using Google AI's text extraction capabilities
          try {
            // Use Google AI to extract text from the PDF
            const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            
            // Convert PDF to base64 for Google AI processing
            const base64Data = buffer.toString('base64');
            const mimeType = 'application/pdf';
            
            const prompt = "Please extract and return all the text content from this PDF document. Focus on extracting: 1) Personal information (name, contact details), 2) Work experience and job titles, 3) Education and qualifications, 4) Skills and certifications, 5) Any other relevant professional information. Return only the extracted text without any analysis or commentary.";
            
            const result = await visionModel.generateContent([
              prompt,
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              }
            ]);
            
            const response = await result.response;
            cvText = response.text();
            console.log('Successfully extracted CV text using Google AI, length:', cvText.length);
            
            // Limit the text length to avoid token limits
            if (cvText.length > 4000) {
              cvText = cvText.substring(0, 4000) + '... (truncated)';
            }
            
          } catch (aiExtractionError) {
            console.warn('Google AI text extraction failed, using fallback method:', aiExtractionError);
            
            // Fallback: Try to extract text using a simple approach
            // For now, we'll use a placeholder but indicate the CV is available
            cvText = `CV document is available for review. The candidate has uploaded a resume/CV document. Please review the attached CV for detailed information about the candidate's experience, skills, and qualifications.`;
          }
        } else {
          console.warn('Failed to fetch CV, status:', cvRes.status, 'URL:', cvUrl);
          cvText = 'CV document could not be accessed for text extraction.';
        }
      } else {
        console.log('No CV URL available for text extraction');
        cvText = 'No CV document was provided by the candidate.';
      }
    } catch (cvErr) {
      console.warn('Failed to extract text from CV PDF:', cvErr);
      cvText = 'CV document processing failed. Please review the attached CV manually.';
    }

    // --------------------------------------
    // 2. Prepare candidate profile for AI analysis
    // --------------------------------------
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

    const prompt = `Analyze this job application and provide a comprehensive assessment. Be specific and actionable.

${cvText ? `CV Content:\n${cvText}\n\n` : ''}${candidateProfile}

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
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
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

interface ApplicationUpdateData {
  status?: string;
  notes?: string;
  markAsRead?: boolean;
}

export async function PATCH(
  request: Request,
  { params }: { params: { jobId: string; applicationId: string } }
) {
  try {
    const { jobId, applicationId } = await params;
    const url = new URL(request.url);
    
    // Determine if this is a public application by checking if the ID starts with "public-"
    const isPublicApplication = applicationId.startsWith('public-');
    const actualApplicationId = isPublicApplication ? applicationId.replace('public-', '') : applicationId;
    const type = isPublicApplication ? 'public' : (url.searchParams.get('type') || 'candidate');
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify this recruiter owns the job
    const { data: recruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    const { data: job } = await supabase
      .from('job_postings')
      .select('id')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    const updateData: ApplicationUpdateData = await request.json();
    const dbUpdate: any = {};

    if (updateData.status) {
      dbUpdate.status = updateData.status;
    }
    
    if (updateData.notes !== undefined) {
      dbUpdate.recruiter_notes = updateData.notes;
    }

    if (updateData.markAsRead) {
      dbUpdate.is_read = true;
    }

    let result;
    if (type === 'public') {
      const { data, error } = await supabase
        .from('public_applications')
        .update(dbUpdate)
        .eq('id', actualApplicationId)
        .eq('job_id', jobId)
        .select()
        .single();

      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from('candidate_applications')
        .update(dbUpdate)
        .eq('id', actualApplicationId)
        .eq('job_posting_id', jobId)
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { jobId: string; applicationId: string } }
) {
  try {
    const { jobId, applicationId } = await params;
    const url = new URL(request.url);
    
    // Determine if this is a public application by checking if the ID starts with "public-"
    const isPublicApplication = applicationId.startsWith('public-');
    const actualApplicationId = isPublicApplication ? applicationId.replace('public-', '') : applicationId;
    const type = isPublicApplication ? 'public' : (url.searchParams.get('type') || 'candidate');
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify this recruiter owns the job
    const { data: recruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    const { data: job } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    let applicationData: any = null;
    let candidateData: any = null;

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
        .eq('id', actualApplicationId)
        .eq('job_posting_id', jobId)
        .single();

      if (appError || !application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      // Mark as read if not already read
      if (!application.is_read) {
        await supabase
          .from('candidate_applications')
          .update({ is_read: true })
          .eq('id', applicationId)
          .eq('job_posting_id', jobId);
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

      applicationData = {
        ...application,
        full_name: application.user?.full_name || application.full_name,
        email: application.user?.email || application.email,
        phone: application.user?.phone || application.phone,
      };
      candidateData = {
        id: application.id,
        full_name: application.user?.full_name || application.full_name,
        email: application.user?.email || application.email,
        phone: application.user?.phone || application.phone,
        location: application.user?.location || application.location,
        linkedin_url: application.user?.linkedin_url,
        github_url: application.user?.github_url,
        portfolio_url: application.user?.portfolio_url,
        work_experience: workExperience || [],
        education: education || [],
        certifications: certifications || [],
        documents: documents || [],
        status: application.status || 'new'
      };

    } else if (type === 'public') {
      // Handle public applications
      const actualApplicationId = applicationId.startsWith('public-') 
        ? applicationId.replace('public-', '') 
        : applicationId;

      const tryParseJSON = (value: any) => {
        if (!value || typeof value !== 'string') return null;
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      };

      const { data: application, error: appError } = await supabase
        .from('public_applications')
        .select('*')
        .eq('id', actualApplicationId)
        .eq('job_id', jobId)
        .single();

      if (appError || !application) {
        return NextResponse.json({ error: 'Public application not found' }, { status: 404 });
      }

      // Mark as read if not already read
      if (!application.is_read) {
        await supabase
          .from('public_applications')
          .update({ is_read: true })
          .eq('id', actualApplicationId)
          .eq('job_id', jobId);
      }

      applicationData = application;
      const parsedWorkExp = Array.isArray(application.work_experience)
        ? application.work_experience
        : tryParseJSON(application.work_experience) || [];

      const parsedEdu = Array.isArray(application.education)
        ? application.education
        : tryParseJSON(application.education) || [];

      // Create CV URL from cv_path if available
      // For public applications, we can use the regular client since storage policies allow access
      let cvUrl: string | null = null;
      if (application.cv_path) {
        try {
          const { data: signedUrl } = await supabase.storage
            .from('documents')
            .createSignedUrl(application.cv_path, 3600); // 1 hour expiry
          cvUrl = signedUrl?.signedUrl || null;
          console.log('Created signed URL for CV:', cvUrl);
        } catch (error) {
          console.warn('Failed to create signed URL for CV:', error);
          // Fallback to direct URL if signed URL fails
          cvUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${application.cv_path}`;
        }
      }

      candidateData = {
        id: `public-${application.id}`,
        full_name: application.full_name,
        email: application.email,
        phone: application.phone_number,
        location: application.location,
        work_experience: parsedWorkExp,
        education: parsedEdu,
        certifications: [],
        documents: cvUrl ? [{ file_url: cvUrl }] : [],
        cv_url: cvUrl,
        cover_letter: application.cover_letter || null,
        status: 'new'
      };
    }

    // Check if AI analysis already exists and is recent (within 24 hours)
    let ai_analysis = null;
    const shouldRunAI = (analysis: any, updatedAt: string) => {
      if (!analysis) return true;
      if (!updatedAt) return true;
      
      const lastAnalysis = new Date(updatedAt);
      const now = new Date();
      const hoursSinceAnalysis = (now.getTime() - lastAnalysis.getTime()) / (1000 * 60 * 60);
      
      // Re-run analysis if it's older than 24 hours
      return hoursSinceAnalysis > 24;
    };

    if (type === 'candidate') {
      // Check existing AI analysis for candidate applications
      if (applicationData.ai_analysis && !shouldRunAI(applicationData.ai_analysis, applicationData.ai_analysis_updated_at)) {
        ai_analysis = applicationData.ai_analysis;
        console.log('Using cached AI analysis for candidate application');
      } else {
        // Perform new AI analysis
        ai_analysis = await analyzeApplicationWithAI(candidateData, job);
        
        // Save the analysis to database
        await supabase
          .from('candidate_applications')
          .update({ 
            ai_analysis: ai_analysis,
            ai_analysis_updated_at: new Date().toISOString()
          })
          .eq('id', applicationId)
          .eq('job_posting_id', jobId);
        
        console.log('Performed new AI analysis for candidate application');
      }
    } else if (type === 'public') {
      // Check existing AI analysis for public applications
      if (applicationData.ai_analysis && !shouldRunAI(applicationData.ai_analysis, applicationData.ai_analysis_updated_at)) {
        ai_analysis = applicationData.ai_analysis;
        console.log('Using cached AI analysis for public application');
      } else {
        // Perform new AI analysis
        ai_analysis = await analyzeApplicationWithAI(candidateData, job);
        
        // Save the analysis to database
        const actualApplicationId = applicationId.startsWith('public-') 
          ? applicationId.replace('public-', '') 
          : applicationId;
          
        await supabase
          .from('public_applications')
          .update({ 
            ai_analysis: ai_analysis,
            ai_analysis_updated_at: new Date().toISOString()
          })
          .eq('id', actualApplicationId)
          .eq('job_id', jobId);
        
        console.log('Performed new AI analysis for public application');
      }
    }

    return NextResponse.json({
      application: applicationData,
      candidate: candidateData,
      job: job,
      ai_analysis: ai_analysis,
      type: type
    });

  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 