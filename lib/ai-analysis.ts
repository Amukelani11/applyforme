import { SupabaseClient } from '@supabase/supabase-js'

type SupabaseClientType = any

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  address: string | null
}

interface Document {
  id: number
  file_url: string
  type: string
  created_at: string
  title?: string
  description?: string
}

interface CustomFieldResponse {
  id: number
  field_id: number
  field_value: string
  file_url?: string
  custom_field: {
    field_label: string
    field_type: string
    field_required: boolean
    field_options?: string[]
  }
}

interface ApplicationAnalysis {
  customFields: CustomFieldResponse[]
  documents: Document[]
  applicationId: string
  jobId: number
}

interface WorkExperience {
  id: number
  title: string
  company: string
  description: string
  start_date: string
  end_date: string | null
  is_current: boolean
}

interface Education {
  id: number
  institution: string
  degree: string
  field_of_study: string
  start_date: string
  end_date: string | null
  description: string | null
}

interface Certification {
  id: number
  name: string
  issuer: string
  date_obtained: string
  expiry_date: string | null
  credential_id: string | null
  credential_url: string | null
}

interface JobPosting {
  id: number
  title: string
  company: string
  location: string | null
  job_type: string
  salary_range: string | null
  description: string
  requirements: string
  benefits: string
  is_active: boolean
}

interface QualificationSummary {
  summary: string
  keySkills: string[]
  experienceLevel: string
  preferredIndustries: string[]
  salaryExpectation: string
}

interface JobRecommendation {
  jobId: number
  jobTitle: string
  company: string
  matchScore: number
  reasoning: string
  whyGoodFit: string[]
}

export class AIAnalysisService {
  static async analyzeUserQualifications(userId: string, supabase: SupabaseClientType): Promise<QualificationSummary> {
    try {
      // First, try to get or create user profile
      let userData = await this.getOrCreateUser(userId, supabase)

      // Fetch user's documents (CV) - don't throw error if no CV
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'cv')
        .order('created_at', { ascending: false })
        .limit(1)

      if (documentsError) {
        console.warn('Error fetching documents:', documentsError)
      }

      // Fetch work experience - don't throw error if no work experience
      const { data: workExperience, error: workError } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })

      if (workError) {
        console.warn('Error fetching work experience:', workError)
      }

      // Fetch education - don't throw error if no education
      const { data: education, error: educationError } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })

      if (educationError) {
        console.warn('Error fetching education:', educationError)
      }

      // Fetch certifications - don't throw error if no certifications
      const { data: certifications, error: certError } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', userId)
        .order('date_obtained', { ascending: false })

      if (certError) {
        console.warn('Error fetching certifications:', certError)
      }

      // Create comprehensive profile data
      const profileData = {
        user: userData,
        documents: documents || [],
        workExperience: workExperience || [],
        education: education || [],
        certifications: certifications || []
      }

      // Analyze qualifications using AI
      const summary = await this.generateQualificationSummary(profileData)
      return summary

    } catch (error) {
      console.error('Error analyzing user qualifications:', error)
      return this.getBasicAnalysis(userId)
    }
  }

  private static async getOrCreateUser(userId: string, supabase: SupabaseClientType): Promise<any> {
    try {
      // Try to get existing user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, try to create them
        console.log('User not found, attempting to create user profile...')
        
        try {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: 'user@example.com', // Will be updated when user completes profile
              full_name: 'New User',
              subscription_status: 'trial',
              trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating user:', createError)
            // Return a basic user object if creation fails due to RLS
            return {
              id: userId,
              email: 'user@example.com',
              full_name: 'New User'
            }
          }

          return newUser
        } catch (insertError) {
          console.error('Error in user creation:', insertError)
          // Return a basic user object if creation fails
          return {
            id: userId,
            email: 'user@example.com',
            full_name: 'New User'
          }
        }
      }

      if (userError) {
        console.error('Error fetching user data:', userError)
        return {
          id: userId,
          email: 'user@example.com',
          full_name: 'User'
        }
      }

      return userData
    } catch (error) {
      console.error('Error in getOrCreateUser:', error)
      return {
        id: userId,
        email: 'user@example.com',
        full_name: 'User'
      }
    }
  }

  private static getBasicAnalysis(userId: string): QualificationSummary {
    return {
      summary: `This user (${userId}) has not yet completed their profile. They can enhance their profile by adding work experience, education, and certifications to receive personalized job recommendations.`,
      keySkills: [],
      experienceLevel: 'Entry Level',
      preferredIndustries: [],
      salaryExpectation: 'R30,000 - R45,000'
    }
  }

  static async getJobRecommendations(userId: string, supabase: SupabaseClientType, limit: number = 10): Promise<JobRecommendation[]> {
    try {
      // Get user qualification summary
      const qualificationSummary = await this.analyzeUserQualifications(userId, supabase)

      // Fetch active job postings
      const { data: jobPostings, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (jobError) throw jobError

      // Generate recommendations using AI
      const recommendations = await this.generateJobRecommendations(
        qualificationSummary,
        jobPostings || []
      )

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit)

    } catch (error) {
      console.error('Error getting job recommendations:', error)
      throw error
    }
  }

  private static async generateQualificationSummary(profileData: any): Promise<QualificationSummary> {
    // This would integrate with your AI service (OpenAI, Google AI, etc.)
    // For now, I'll create a basic analysis based on the data
    
    const { user, workExperience, education, certifications } = profileData
    
    // Analyze work experience
    const totalExperience = workExperience.reduce((total: number, exp: WorkExperience) => {
      try {
        const start = new Date(exp.start_date)
        const end = exp.is_current ? new Date() : new Date(exp.end_date || '')
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
      } catch (error) {
        console.warn('Error calculating experience for entry:', exp, error)
        return total
      }
    }, 0)

    // Extract skills from job titles and descriptions
    const skills = new Set<string>()
    workExperience.forEach((exp: WorkExperience) => {
      try {
        // Extract common skills from job titles
        const title = (exp.title || '').toLowerCase()
        const description = (exp.description || '').toLowerCase()
        
        if (title.includes('developer') || description.includes('developer')) skills.add('Software Development')
        if (title.includes('manager') || description.includes('manager')) skills.add('Management')
        if (title.includes('designer') || description.includes('designer')) skills.add('Design')
        if (title.includes('analyst') || description.includes('analyst')) skills.add('Data Analysis')
        if (title.includes('engineer') || description.includes('engineer')) skills.add('Engineering')
        if (title.includes('marketing') || description.includes('marketing')) skills.add('Marketing')
        if (title.includes('sales') || description.includes('sales')) skills.add('Sales')
        if (title.includes('admin') || description.includes('admin')) skills.add('Administration')
        if (title.includes('consultant') || description.includes('consultant')) skills.add('Consulting')
        if (title.includes('coordinator') || description.includes('coordinator')) skills.add('Coordination')
        if (title.includes('specialist') || description.includes('specialist')) skills.add('Specialization')
        if (title.includes('assistant') || description.includes('assistant')) skills.add('Administrative Support')
      } catch (error) {
        console.warn('Error processing work experience entry:', exp, error)
      }
    })

    // Determine experience level
    let experienceLevel = 'Entry Level'
    if (totalExperience >= 5) experienceLevel = 'Senior'
    else if (totalExperience >= 2) experienceLevel = 'Mid-Level'
    else if (totalExperience >= 1) experienceLevel = 'Junior'

    // Determine preferred industries based on work history
    const industries = new Set<string>()
    workExperience.forEach((exp: WorkExperience) => {
      try {
        const company = (exp.company || '').toLowerCase()
        if (company.includes('tech') || company.includes('software') || company.includes('digital')) industries.add('Technology')
        if (company.includes('finance') || company.includes('bank') || company.includes('investment')) industries.add('Finance')
        if (company.includes('health') || company.includes('medical') || company.includes('hospital')) industries.add('Healthcare')
        if (company.includes('retail') || company.includes('shop') || company.includes('store')) industries.add('Retail')
        if (company.includes('education') || company.includes('school') || company.includes('university')) industries.add('Education')
        if (company.includes('consulting') || company.includes('consultant')) industries.add('Consulting')
        if (company.includes('manufacturing') || company.includes('factory')) industries.add('Manufacturing')
        if (company.includes('government') || company.includes('public')) industries.add('Government')
      } catch (error) {
        console.warn('Error processing company for industry detection:', exp.company, error)
      }
    })

    // Generate summary based on available data
    let summary = ''
    const userName = user.full_name || 'This candidate'
    
    if (workExperience.length > 0) {
      summary = `${userName} has ${totalExperience.toFixed(1)} years of professional experience`
      if (industries.size > 0) {
        summary += ` in ${Array.from(industries).join(', ')}`
      } else {
        summary += ' in various industries'
      }
      summary += '.'
    } else {
      summary = `${userName} is a new professional`
    }

    if (skills.size > 0) {
      summary += ` They have demonstrated expertise in ${Array.from(skills).join(', ')}.`
    } else if (workExperience.length > 0) {
      summary += ' They have experience in multiple areas.'
    }

    if (education.length > 0 || certifications.length > 0) {
      summary += ` They hold ${education.length} educational qualification${education.length !== 1 ? 's' : ''}`
      if (certifications.length > 0) {
        summary += ` and ${certifications.length} professional certification${certifications.length !== 1 ? 's' : ''}`
      }
      summary += '.'
    }

    // If no data at all, provide a basic summary
    if (workExperience.length === 0 && education.length === 0 && certifications.length === 0) {
      summary = `${userName} is a new user who has not yet completed their profile. They can enhance their profile by adding work experience, education, and certifications to receive personalized job recommendations.`
    }

    return {
      summary,
      keySkills: Array.from(skills),
      experienceLevel,
      preferredIndustries: Array.from(industries),
      salaryExpectation: this.estimateSalaryExpectation(totalExperience, experienceLevel)
    }
  }

  private static async generateJobRecommendations(
    qualificationSummary: QualificationSummary,
    jobPostings: JobPosting[]
  ): Promise<JobRecommendation[]> {
    const recommendations: JobRecommendation[] = []

    for (const job of jobPostings) {
      let matchScore = 0
      const reasoning: string[] = []
      const whyGoodFit: string[] = []

      // Score based on job title matching skills
      const jobTitle = job.title.toLowerCase()
      const jobDescription = job.description.toLowerCase()
      const jobRequirements = job.requirements.toLowerCase()

      // Check skill matches
      qualificationSummary.keySkills.forEach(skill => {
        const skillLower = skill.toLowerCase()
        if (jobTitle.includes(skillLower) || jobDescription.includes(skillLower)) {
          matchScore += 20
          whyGoodFit.push(`Strong ${skill} experience`)
        }
      })

      // Check experience level match
      if (qualificationSummary.experienceLevel === 'Senior' && 
          (jobTitle.includes('senior') || jobTitle.includes('lead') || jobTitle.includes('manager'))) {
        matchScore += 15
        reasoning.push('Experience level matches senior position requirements')
      } else if (qualificationSummary.experienceLevel === 'Mid-Level' && 
                 !jobTitle.includes('senior') && !jobTitle.includes('lead')) {
        matchScore += 15
        reasoning.push('Experience level appropriate for this position')
      }

      // Check industry preferences
      qualificationSummary.preferredIndustries.forEach(industry => {
        const industryLower = industry.toLowerCase()
        if (job.company.toLowerCase().includes(industryLower) || 
            jobDescription.includes(industryLower)) {
          matchScore += 10
          whyGoodFit.push(`Experience in ${industry} industry`)
        }
      })

      // Check location preferences (if available)
      if (job.location) {
        matchScore += 5
        reasoning.push('Location specified')
      }

      // Check job type preferences
      if (job.job_type === 'full-time') {
        matchScore += 5
      }

      // Normalize score to 0-100
      matchScore = Math.min(100, Math.max(0, matchScore))

      if (matchScore > 30) { // Only recommend jobs with decent match
        recommendations.push({
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          matchScore,
          reasoning: reasoning.join('. '),
          whyGoodFit
        })
      }
    }

    return recommendations
  }

  private static estimateSalaryExpectation(experienceYears: number, experienceLevel: string): string {
    // Basic salary estimation based on experience
    let baseSalary = 30000 // Starting salary
    
    if (experienceLevel === 'Senior') {
      baseSalary = 80000 + (experienceYears - 5) * 5000
    } else if (experienceLevel === 'Mid-Level') {
      baseSalary = 50000 + (experienceYears - 2) * 3000
    } else {
      baseSalary = 30000 + experienceYears * 2000
    }

    return `R${baseSalary.toLocaleString()} - R${(baseSalary * 1.3).toLocaleString()}`
  }

  static async submitJobApplication(userId: string, jobId: number, supabase: SupabaseClientType): Promise<boolean> {
    try {
      // Get user's CV
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('user_id', userId)
        .eq('type', 'cv')
        .order('created_at', { ascending: false })
        .limit(1)

      if (documentsError) throw documentsError

      if (!documents || documents.length === 0) {
        throw new Error('No CV found for this user. Please upload your CV first.')
      }

      // Check if application already exists
      const { data: existingApp, error: checkError } = await supabase
        .from('candidate_applications')
        .select('id')
        .eq('job_posting_id', jobId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw checkError
      }

      if (existingApp) {
        throw new Error('You have already applied for this job')
      }

      // Create candidate application
      const { error: applicationError } = await supabase
        .from('candidate_applications')
        .insert({
          job_posting_id: jobId,
          user_id: userId,
          cv_url: documents[0].file_url,
          status: 'pending',
          recruiter_notes: 'Application submitted via AI recommendation'
        })

      if (applicationError) throw applicationError

      return true
    } catch (error) {
      console.error('Error submitting job application:', error)
      throw error
    }
  }

  static async analyzeApplicationWithCustomFields(applicationId: string, supabase: SupabaseClientType): Promise<any> {
    try {
      // Fetch custom field responses
      const { data: customFieldResponses, error: customFieldsError } = await supabase
        .from('custom_field_responses')
        .select(`
          id,
          field_id,
          field_value,
          file_url,
          custom_field:job_custom_fields(
            field_label,
            field_type,
            field_required,
            field_options
          )
        `)
        .eq('application_id', applicationId)
        .order('id')

      if (customFieldsError) {
        console.error('Error fetching custom field responses:', customFieldsError)
        throw customFieldsError
      }

      // Fetch application details to get job ID
      const { data: application, error: applicationError } = await supabase
        .from('public_applications')
        .select('id, job_id, full_name, email')
        .eq('id', applicationId)
        .single()

      if (applicationError) {
        console.error('Error fetching application:', applicationError)
        throw applicationError
      }

      // Fetch job details
      const { data: job, error: jobError } = await supabase
        .from('job_postings')
        .select('id, title, company, description, requirements')
        .eq('id', application.job_id)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
        throw jobError
      }

      // Process custom field responses to match expected type
      const processedResponses = (customFieldResponses || []).map((response: any) => ({
        id: response.id,
        field_id: response.field_id,
        field_value: response.field_value,
        file_url: response.file_url,
        custom_field: Array.isArray(response.custom_field) ? response.custom_field[0] : response.custom_field
      }))

      // Analyze custom fields
      const customFieldsAnalysis = await this.analyzeCustomFields(processedResponses, job)

      // Analyze uploaded documents
      const documentsAnalysis = await this.analyzeUploadedDocuments(processedResponses, job)

      return {
        applicationId,
        jobId: application.job_id,
        candidateName: application.full_name,
        candidateEmail: application.email,
        jobTitle: job.title,
        company: job.company,
        customFieldsAnalysis,
        documentsAnalysis,
        overallAssessment: await this.generateOverallAssessment(
          customFieldsAnalysis,
          documentsAnalysis,
          job
        )
      }

    } catch (error) {
      console.error('Error analyzing application:', error)
      throw error
    }
  }

  private static async analyzeCustomFields(
    customFieldResponses: CustomFieldResponse[],
    job: any
  ): Promise<any> {
    const analysis = {
      relevantSkills: [] as string[],
      experienceLevel: '',
      culturalFit: '',
      technicalSkills: [] as string[],
      softSkills: [] as string[],
      summary: ''
    }

    for (const response of customFieldResponses) {
      const { field_value, custom_field } = response
      const fieldType = custom_field.field_type
      const fieldLabel = custom_field.field_label.toLowerCase()

      // Analyze text-based responses
      if (['text', 'textarea'].includes(fieldType) && field_value) {
        const value = field_value.toLowerCase()
        
        // Extract skills from responses
        if (fieldLabel.includes('experience') || fieldLabel.includes('skills')) {
          if (value.includes('javascript') || value.includes('js')) analysis.technicalSkills.push('JavaScript')
          if (value.includes('python')) analysis.technicalSkills.push('Python')
          if (value.includes('react')) analysis.technicalSkills.push('React')
          if (value.includes('node')) analysis.technicalSkills.push('Node.js')
          if (value.includes('sql')) analysis.technicalSkills.push('SQL')
          if (value.includes('aws') || value.includes('amazon')) analysis.technicalSkills.push('AWS')
          if (value.includes('docker')) analysis.technicalSkills.push('Docker')
          if (value.includes('kubernetes')) analysis.technicalSkills.push('Kubernetes')
          if (value.includes('git')) analysis.technicalSkills.push('Git')
          if (value.includes('agile')) analysis.softSkills.push('Agile')
          if (value.includes('leadership')) analysis.softSkills.push('Leadership')
          if (value.includes('communication')) analysis.softSkills.push('Communication')
          if (value.includes('teamwork')) analysis.softSkills.push('Teamwork')
          if (value.includes('problem solving')) analysis.softSkills.push('Problem Solving')
        }

        // Analyze experience level
        if (fieldLabel.includes('years') || fieldLabel.includes('experience')) {
          const yearsMatch = value.match(/(\d+)\s*(?:years?|yrs?)/i)
          if (yearsMatch) {
            const years = parseInt(yearsMatch[1])
            if (years >= 5) analysis.experienceLevel = 'Senior'
            else if (years >= 2) analysis.experienceLevel = 'Mid-Level'
            else analysis.experienceLevel = 'Junior'
          }
        }

        // Analyze cultural fit
        if (fieldLabel.includes('motivation') || fieldLabel.includes('values') || fieldLabel.includes('culture')) {
          if (value.includes('growth') || value.includes('learning') || value.includes('development')) {
            analysis.culturalFit = 'High - Shows growth mindset'
          } else if (value.includes('team') || value.includes('collaboration')) {
            analysis.culturalFit = 'Good - Team-oriented'
          } else {
            analysis.culturalFit = 'Standard - Professional approach'
          }
        }
      }

      // Analyze selection-based responses
      if (['select', 'radio', 'multiselect'].includes(fieldType) && field_value) {
        const value = field_value.toLowerCase()
        
        if (fieldLabel.includes('experience') || fieldLabel.includes('level')) {
          if (value.includes('senior') || value.includes('lead')) analysis.experienceLevel = 'Senior'
          else if (value.includes('mid') || value.includes('intermediate')) analysis.experienceLevel = 'Mid-Level'
          else if (value.includes('junior') || value.includes('entry')) analysis.experienceLevel = 'Junior'
        }
      }
    }

    // Generate summary
    analysis.summary = `Candidate demonstrates ${analysis.technicalSkills.length} technical skills and ${analysis.softSkills.length} soft skills. `
    if (analysis.experienceLevel) {
      analysis.summary += `Experience level: ${analysis.experienceLevel}. `
    }
    if (analysis.culturalFit) {
      analysis.summary += analysis.culturalFit
    }

    return analysis
  }

  private static async analyzeUploadedDocuments(
    customFieldResponses: CustomFieldResponse[],
    job: any
  ): Promise<any> {
    const analysis = {
      documentsFound: [] as string[],
      documentTypes: [] as string[],
      summary: ''
    }

    // Find file upload responses
    const fileResponses = customFieldResponses.filter(
      response => response.custom_field.field_type === 'file' && response.file_url
    )

    for (const response of fileResponses) {
      const fieldLabel = response.custom_field.field_label
      const fileName = (response.file_url || '').split('/').pop() || 'Unknown'
      
      analysis.documentsFound.push(`${fieldLabel}: ${fileName}`)
      
      // Determine document type from file extension
      const extension = fileName.split('.').pop()?.toLowerCase()
      if (extension === 'pdf') analysis.documentTypes.push('PDF')
      else if (extension === 'doc' || extension === 'docx') analysis.documentTypes.push('Word Document')
      else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') analysis.documentTypes.push('Image')
      else analysis.documentTypes.push('Other')
    }

    // Generate summary
    if (analysis.documentsFound.length > 0) {
      analysis.summary = `Candidate uploaded ${analysis.documentsFound.length} document(s): ${analysis.documentsFound.join(', ')}. `
      analysis.summary += `Document types: ${analysis.documentTypes.join(', ')}.`
    } else {
      analysis.summary = 'No documents were uploaded by the candidate.'
    }

    return analysis
  }

  private static async generateOverallAssessment(
    customFieldsAnalysis: any,
    documentsAnalysis: any,
    job: any
  ): Promise<string> {
    let assessment = `Overall Assessment for ${job.title} position at ${job.company}:\n\n`

    // Technical skills assessment
    if (customFieldsAnalysis.technicalSkills.length > 0) {
      assessment += `✅ Technical Skills: ${customFieldsAnalysis.technicalSkills.join(', ')}\n`
    } else {
      assessment += `⚠️ Limited technical skills mentioned in custom fields\n`
    }

    // Experience level
    if (customFieldsAnalysis.experienceLevel) {
      assessment += `📊 Experience Level: ${customFieldsAnalysis.experienceLevel}\n`
    }

    // Soft skills
    if (customFieldsAnalysis.softSkills.length > 0) {
      assessment += `🤝 Soft Skills: ${customFieldsAnalysis.softSkills.join(', ')}\n`
    }

    // Cultural fit
    if (customFieldsAnalysis.culturalFit) {
      assessment += `🎯 Cultural Fit: ${customFieldsAnalysis.culturalFit}\n`
    }

    // Documents
    if (documentsAnalysis.documentsFound.length > 0) {
      assessment += `📄 Documents: ${documentsAnalysis.documentsFound.length} document(s) uploaded\n`
    } else {
      assessment += `📄 Documents: No additional documents provided\n`
    }

    // Recommendations
    assessment += `\n💡 Recommendations:\n`
    if (customFieldsAnalysis.technicalSkills.length >= 3) {
      assessment += `• Strong technical background - Consider for technical interview\n`
    }
    if (customFieldsAnalysis.experienceLevel === 'Senior') {
      assessment += `• Senior-level experience - May be suitable for leadership roles\n`
    }
    if (customFieldsAnalysis.culturalFit.includes('High')) {
      assessment += `• Excellent cultural fit - Strong growth mindset\n`
    }
    if (documentsAnalysis.documentsFound.length === 0) {
      assessment += `• Consider requesting additional supporting documents\n`
    }

    return assessment
  }

  static async enhanceExistingAnalysis(applicationId: string, existingAnalysis: any, supabase: SupabaseClientType): Promise<any> {
    try {
      // Fetch custom field responses
      const { data: customFieldResponses, error: customFieldsError } = await supabase
        .from('custom_field_responses')
        .select(`
          id,
          field_id,
          field_value,
          file_url,
          custom_field:job_custom_fields(
            field_label,
            field_type,
            field_required,
            field_options
          )
        `)
        .eq('application_id', applicationId)
        .order('id')

      if (customFieldsError) {
        console.error('Error fetching custom field responses:', customFieldsError)
        return existingAnalysis // Return existing analysis if custom fields fail
      }

      // Process custom field responses to match expected type
      const processedResponses = (customFieldResponses || []).map((response: any) => ({
        id: response.id,
        field_id: response.field_id,
        field_value: response.field_value,
        file_url: response.file_url,
        custom_field: Array.isArray(response.custom_field) ? response.custom_field[0] : response.custom_field
      }))

      // Analyze custom fields
      const customFieldsAnalysis = await this.analyzeCustomFields(processedResponses, { title: 'Job Position' })

      // Analyze uploaded documents
      const documentsAnalysis = await this.analyzeUploadedDocuments(processedResponses, { title: 'Job Position' })

      // Enhance existing analysis with custom fields insights
      const enhancedAnalysis = {
        ...existingAnalysis,
        custom_fields_insights: {
          technicalSkills: customFieldsAnalysis.technicalSkills,
          softSkills: customFieldsAnalysis.softSkills,
          experienceLevel: customFieldsAnalysis.experienceLevel,
          culturalFit: customFieldsAnalysis.culturalFit,
          summary: customFieldsAnalysis.summary
        },
        documents_insights: {
          documentsFound: documentsAnalysis.documentsFound,
          documentTypes: documentsAnalysis.documentTypes,
          summary: documentsAnalysis.summary
        },
        enhanced_recommendations: [
          ...(existingAnalysis.next_steps || []),
          ...(customFieldsAnalysis.technicalSkills.length >= 3 ? ['Consider technical interview due to strong technical background'] : []),
          ...(customFieldsAnalysis.experienceLevel === 'Senior' ? ['May be suitable for leadership roles'] : []),
          ...(customFieldsAnalysis.culturalFit.includes('High') ? ['Excellent cultural fit - strong growth mindset'] : []),
          ...(documentsAnalysis.documentsFound.length === 0 ? ['Consider requesting additional supporting documents'] : [])
        ]
      }

      return enhancedAnalysis

    } catch (error) {
      console.error('Error enhancing analysis with custom fields:', error)
      return existingAnalysis // Return existing analysis if enhancement fails
    }
  }
}
