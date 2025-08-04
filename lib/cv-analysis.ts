import { createClient } from './supabase/client'

export interface CVAnalysisResult {
  personalInfo: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  workExperience: Array<{
    role: string
    company: string
    startDate?: string
    endDate?: string
    currentlyWorking?: boolean
    description?: string
  }>
  education: Array<{
    institution: string
    qualification: string
    startDate?: string
    endDate?: string
  }>
  skills: {
    technical: string[]
    soft: string[]
  }
  summary?: string
  customFieldsSuggestions: Record<string, any>
}

export class CVAnalysisService {
  static async analyzeCV(fileUrl: string, jobTitle: string, customFields: any[], supabase: any): Promise<CVAnalysisResult> {
    try {
      console.log('Starting CV analysis for file:', fileUrl)
      
      // Extract text from the CV document
      const cvText = await this.extractTextFromCV(fileUrl, supabase)
      console.log('Text extracted, length:', cvText.length)
      
      // Use AI to analyze the CV content
      const analysis = await this.analyzeCVWithAI(cvText, jobTitle, customFields)
      console.log('AI analysis completed')
      
      return analysis
    } catch (error) {
      console.error('Error analyzing CV:', error)
      
      // Return a more informative fallback analysis if everything fails
      return {
        personalInfo: {
          firstName: 'CV',
          lastName: 'Analysis',
          email: 'analysis@example.com',
          phone: 'N/A'
        },
        workExperience: [],
        education: [],
        skills: {
          technical: [],
          soft: []
        },
        summary: `CV analysis encountered an issue: ${error instanceof Error ? error.message : 'Unknown error'}. Please try uploading the CV again or contact support if the problem persists.`,
        customFieldsSuggestions: {}
      }
    }
  }

  private static async analyzeCVWithAI(cvText: string, jobTitle: string, customFields: any[]): Promise<CVAnalysisResult> {
    try {
      // Use Google AI to analyze the CV content
      const prompt = this.buildAnalysisPrompt(cvText, jobTitle, customFields)
      
      // Get access token from service account or use API key
      let accessToken = process.env.GOOGLE_API_KEY
      
      // If it looks like a service account JSON, parse it and get access token
      if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.startsWith('{')) {
        try {
          const serviceAccount = JSON.parse(process.env.GOOGLE_API_KEY)
          // For now, we'll use the API key approach, but you might need to implement JWT token generation
          console.log('Service account detected, using API key approach')
        } catch (error) {
          console.error('Error parsing service account JSON:', error)
        }
      }

      // Use Google AI API endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Google AI API error response:', errorText)
        throw new Error(`Google AI API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const aiResponse = data.candidates[0].content.parts[0].text
      
      // Parse the AI response
      return this.parseAIResponse(aiResponse, customFields)
    } catch (error) {
      console.error('Error with AI analysis:', error)
      // Fallback to basic text analysis if AI fails
      return this.basicTextAnalysis(cvText, jobTitle, customFields)
    }
  }

  private static buildAnalysisPrompt(cvText: string, jobTitle: string, customFields: any[]): string {
    const customFieldsInfo = customFields.map(field => {
      let fieldInfo = `- ${field.field_name} (${field.field_type}): ${field.field_label}`
      if (field.field_options && field.field_options.length > 0) {
        fieldInfo += ` - Options: ${field.field_options.join(', ')}`
      }
      return fieldInfo
    }).join('\n')

    return `
You are an AI assistant that analyzes CV/resume documents and extracts structured information. Please analyze the following CV text and provide a JSON response with the extracted information.

CV TEXT:
${cvText}

JOB TITLE: ${jobTitle}

CUSTOM FIELDS TO CONSIDER:
${customFieldsInfo}

Please extract and return the following information in valid JSON format:

{
  "personalInfo": {
    "firstName": "extracted first name",
    "lastName": "extracted last name", 
    "email": "extracted email address",
    "phone": "extracted phone number"
  },
  "workExperience": [
    {
      "role": "job title",
      "company": "company name",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM format or null if current",
      "currentlyWorking": true/false,
      "description": "brief description of role and achievements"
    }
  ],
  "education": [
    {
      "institution": "school/university name",
      "qualification": "degree/certificate name",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM format"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2", "skill3"]
  },
  "summary": "brief professional summary",
  "customFieldsSuggestions": {
    "field_name": "suggested value based on CV content and field type"
  }
}

DATE EXTRACTION GUIDELINES:

1. DATE FORMATS TO RECOGNIZE:
   - "Jan 2020 - Dec 2023" → startDate: "2020-01", endDate: "2023-12"
   - "January 2020 - December 2023" → startDate: "2020-01", endDate: "2023-12"
   - "01/2020 - 12/2023" → startDate: "2020-01", endDate: "2023-12"
   - "2020-01 - 2023-12" → startDate: "2020-01", endDate: "2023-12"
   - "2020 to 2023" → startDate: "2020-01", endDate: "2023-12"
   - "2020 - Present" → startDate: "2020-01", endDate: null, currentlyWorking: true
   - "2020 - Current" → startDate: "2020-01", endDate: null, currentlyWorking: true
   - "2020 - Now" → startDate: "2020-01", endDate: null, currentlyWorking: true
   - "Since 2020" → startDate: "2020-01", endDate: null, currentlyWorking: true
   - "2020" (single year) → startDate: "2020-01", endDate: "2020-12"
   - "2020-2023" → startDate: "2020-01", endDate: "2023-12"

2. MONTH MAPPING:
   - Jan/January → 01
   - Feb/February → 02
   - Mar/March → 03
   - Apr/April → 04
   - May → 05
   - Jun/June → 06
   - Jul/July → 07
   - Aug/August → 08
   - Sep/September → 09
   - Oct/October → 10
   - Nov/November → 11
   - Dec/December → 12

3. DATE EXTRACTION RULES:
   - Always use YYYY-MM format for dates
   - If only year is given, assume January start and December end
   - If "Present", "Current", "Now", or "Since" is mentioned, set currentlyWorking: true
   - For education, if no end date is found, assume graduation year
   - For work experience, if no end date and no "current" indicators, leave as null

4. COMMON DATE PATTERNS:
   - Look for patterns like "Month Year - Month Year"
   - Look for patterns like "YYYY - YYYY"
   - Look for patterns like "MM/YYYY - MM/YYYY"
   - Look for patterns like "YYYY-MM - YYYY-MM"
   - Look for single years followed by job titles
   - Look for "since" or "from" followed by dates

CUSTOM FIELD ANALYSIS GUIDELINES:

1. SINGLE CHOICE FIELDS (select_one):
   - For gender/sex fields: Look for pronouns (he/him, she/her, they/them) or explicit mentions
   - For experience level: Calculate total years from work experience dates
   - For education level: Determine highest degree achieved
   - For availability: Check if currently employed or recent graduation
   - For industry experience: Match job titles/companies to specific industries
   - For location preferences: Extract from address or current location
   - For work authorization: Look for citizenship, visa, or work permit mentions
   - For remote work preference: Check if current role is remote or location mentions
   - For salary expectations: Look for current salary or compensation mentions
   - For notice period: Check if currently employed and estimate notice period

2. EXPERIENCE CALCULATION:
   - Calculate total years of experience from work history
   - For industry-specific experience: Count years in relevant industry
   - For role-specific experience: Count years in similar roles
   - For technology experience: Count years using specific technologies

3. EDUCATION LEVEL MAPPING:
   - High School/Secondary: "High School"
   - Associate's Degree: "Associate's"
   - Bachelor's Degree: "Bachelor's"
   - Master's Degree: "Master's"
   - PhD/Doctorate: "PhD"
   - Certificate/Diploma: "Certificate"

4. EXPERIENCE LEVEL MAPPING:
   - 0-1 years: "Entry Level"
   - 1-3 years: "Junior"
   - 3-5 years: "Mid Level"
   - 5-8 years: "Senior"
   - 8+ years: "Expert/Lead"

5. INDUSTRY DETECTION:
   - Technology/IT: software, programming, IT, tech, digital
   - Healthcare: medical, healthcare, hospital, clinical, nursing
   - Finance: banking, finance, accounting, investment, insurance
   - Manufacturing: production, manufacturing, industrial, factory
   - Retail: retail, sales, customer service, store
   - Education: teaching, education, academic, school, university
   - Marketing: marketing, advertising, PR, communications
   - Engineering: engineering, construction, architecture
   - Legal: law, legal, attorney, lawyer, paralegal
   - Government: government, public sector, policy, administration

6. COMMON FIELD PATTERNS:
   - "years of experience": Calculate total work experience
   - "industry experience": Count years in specific industry
   - "management experience": Count years in management roles
   - "technical skills": Extract programming languages, tools, technologies
   - "soft skills": Extract communication, leadership, teamwork skills
   - "certifications": Look for certifications, licenses, accreditations
   - "languages": Extract language proficiencies
   - "availability": Check employment status and notice period

IMPORTANT:
- Extract real information from the CV text
- For dates, use YYYY-MM format when possible
- For skills, separate technical and soft skills appropriately
- For single choice fields, select the most appropriate option from the provided choices
- For experience calculations, be precise and conservative
- For industry detection, match job titles and company descriptions
- If information is not found, use null or empty arrays
- Ensure the response is valid JSON
- Always choose from the provided options for single choice fields
- Pay special attention to date extraction and formatting
`
  }

  private static parseAIResponse(aiResponse: string, customFields: any[]): CVAnalysisResult {
    try {
      // Extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and clean the parsed data
      return {
        personalInfo: {
          firstName: parsed.personalInfo?.firstName || '',
          lastName: parsed.personalInfo?.lastName || '',
          email: parsed.personalInfo?.email || '',
          phone: parsed.personalInfo?.phone || ''
        },
        workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: {
          technical: Array.isArray(parsed.skills?.technical) ? parsed.skills.technical : [],
          soft: Array.isArray(parsed.skills?.soft) ? parsed.skills.soft : []
        },
        summary: parsed.summary || '',
        customFieldsSuggestions: parsed.customFieldsSuggestions || {}
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      throw new Error('Failed to parse AI analysis response')
    }
  }

  private static basicTextAnalysis(cvText: string, jobTitle: string, customFields: any[]): CVAnalysisResult {
    // Fallback basic text analysis if AI fails
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    console.log('Performing basic text analysis on:', cvText.substring(0, 200) + '...')
    
    const analysis: CVAnalysisResult = {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      workExperience: [],
      education: [],
      skills: {
        technical: [],
        soft: []
      },
      summary: '',
      customFieldsSuggestions: {}
    }

    // Check if this is mock data
    if (cvText.includes('Mock CV Content:')) {
      console.log('Detected mock CV data, parsing...')
      
      // Parse mock data
      const mockLines = cvText.split('\n')
      
      for (let i = 0; i < mockLines.length; i++) {
        const line = mockLines[i].trim()
        
        if (line.includes('John Doe')) {
          analysis.personalInfo.firstName = 'John'
          analysis.personalInfo.lastName = 'Doe'
        } else if (line.includes('john.doe@email.com')) {
          analysis.personalInfo.email = 'john.doe@email.com'
        } else if (line.includes('+1-555-0123')) {
          analysis.personalInfo.phone = '+1-555-0123'
        } else if (line.includes('Senior Developer at Tech Corp')) {
          analysis.workExperience.push({
            role: 'Senior Developer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: '2023-12',
            currentlyWorking: false,
            description: 'Senior development role with focus on modern technologies'
          })
        } else if (line.includes('Junior Developer at Startup Inc')) {
          analysis.workExperience.push({
            role: 'Junior Developer',
            company: 'Startup Inc',
            startDate: '2018-01',
            endDate: '2020-12',
            currentlyWorking: false,
            description: 'Junior development position working on innovative projects'
          })
        } else if (line.includes('Bachelor\'s in Computer Science')) {
          analysis.education.push({
            institution: 'University of Technology',
            qualification: 'Bachelor\'s in Computer Science',
            startDate: '2014-09',
            endDate: '2018-05'
          })
        } else if (line.includes('JavaScript, React, Node.js, Python, SQL')) {
          analysis.skills.technical = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']
        } else if (line.includes('Leadership, Communication, Problem Solving')) {
          analysis.skills.soft = ['Leadership', 'Communication', 'Problem Solving']
        }
      }
      
      analysis.summary = 'Experienced software developer with strong technical skills and leadership abilities.'
      
         } else {
      // Basic extraction logic for real CV text
      console.log('Processing', lines.length, 'lines for basic text analysis')
      
      for (const line of lines) {
        console.log('Processing line:', line)
        
        // Extract email
        const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
        if (emailMatch && !analysis.personalInfo.email) {
          analysis.personalInfo.email = emailMatch[0]
          console.log('Found email:', emailMatch[0])
        }

        // Extract phone
        const phoneMatch = line.match(/[\+]?[1-9][\d]{0,15}/)
        if (phoneMatch && !analysis.personalInfo.phone) {
          analysis.personalInfo.phone = phoneMatch[0]
          console.log('Found phone:', phoneMatch[0])
        }

        // Extract names (basic heuristic)
        if (line.includes('@') && !analysis.personalInfo.firstName) {
          const nameParts = line.split(' ').filter(part => part.length > 0 && !part.includes('@'))
          if (nameParts.length >= 2) {
            analysis.personalInfo.firstName = nameParts[0]
            analysis.personalInfo.lastName = nameParts[1]
            console.log('Found name:', nameParts[0], nameParts[1])
          }
        }

        // Extract work experience with dates
        const workExp = this.extractWorkExperienceFromLine(line)
        if (workExp) {
          console.log('Found work experience:', workExp)
          analysis.workExperience.push(workExp)
        }

        // Extract education with dates
        const education = this.extractEducationFromLine(line)
        if (education) {
          console.log('Found education:', education)
          analysis.education.push(education)
        }
      }
      
      console.log('Final analysis results:')
      console.log('- Work experience entries:', analysis.workExperience.length)
      console.log('- Education entries:', analysis.education.length)
      console.log('- Personal info:', analysis.personalInfo)
    }

    // Generate intelligent custom field suggestions
    customFields.forEach(field => {
      const fieldName = field.field_name.toLowerCase()
      const fieldLabel = field.field_label.toLowerCase()
      const fieldType = field.field_type
      const options = field.field_options || []
      
      // Calculate total years of experience
      const totalYears = this.calculateTotalExperience(analysis.workExperience)
      
      // For single choice fields, try to match with provided options
      if (fieldType === 'select_one' && options.length > 0) {
        const suggestion = this.getSingleChoiceSuggestion(fieldName, fieldLabel, options, analysis, totalYears, cvText)
        analysis.customFieldsSuggestions[field.field_name] = suggestion
      } else {
        // For other field types, provide intelligent suggestions
        const suggestion = this.getFieldSuggestion(fieldName, fieldLabel, analysis, totalYears, cvText)
        analysis.customFieldsSuggestions[field.field_name] = suggestion
      }
    })

    console.log('Basic analysis completed:', analysis)
    return analysis
  }

  private static calculateTotalExperience(workExperience: any[]): number {
    let totalYears = 0
    const currentDate = new Date()
    
    workExperience.forEach(exp => {
      if (exp.startDate) {
        const startDate = new Date(exp.startDate + '-01') // Add day for parsing
        const endDate = exp.currentlyWorking ? currentDate : (exp.endDate ? new Date(exp.endDate + '-01') : currentDate)
        
        const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        totalYears += Math.max(0, years)
      }
    })
    
    return Math.round(totalYears * 10) / 10 // Round to 1 decimal place
  }

  private static getSingleChoiceSuggestion(fieldName: string, fieldLabel: string, options: string[], analysis: any, totalYears: number, cvText: string): string {
    const lowerOptions = options.map(opt => opt.toLowerCase())
    const lowerCvText = cvText.toLowerCase()
    
    // Gender/Sex detection
    if (fieldName.includes('gender') || fieldName.includes('sex')) {
      if (lowerCvText.includes('he ') || lowerCvText.includes('his ') || lowerCvText.includes('him ')) {
        return this.findMatchingOption('male', lowerOptions, options)
      } else if (lowerCvText.includes('she ') || lowerCvText.includes('her ')) {
        return this.findMatchingOption('female', lowerOptions, options)
      }
    }
    
    // Experience level detection
    if (fieldName.includes('experience') || fieldName.includes('level') || fieldName.includes('seniority')) {
      if (totalYears <= 1) return this.findMatchingOption('entry level', lowerOptions, options)
      if (totalYears <= 3) return this.findMatchingOption('junior', lowerOptions, options)
      if (totalYears <= 5) return this.findMatchingOption('mid level', lowerOptions, options)
      if (totalYears <= 8) return this.findMatchingOption('senior', lowerOptions, options)
      return this.findMatchingOption('expert', lowerOptions, options)
    }
    
    // Education level detection
    if (fieldName.includes('education') || fieldName.includes('degree')) {
      const education = analysis.education
      let highestLevel = 'High School'
      
      education.forEach(edu => {
        const qual = edu.qualification.toLowerCase()
        if (qual.includes('phd') || qual.includes('doctorate')) highestLevel = 'PhD'
        else if (qual.includes('master')) highestLevel = 'Master\'s'
        else if (qual.includes('bachelor')) highestLevel = 'Bachelor\'s'
        else if (qual.includes('associate')) highestLevel = 'Associate\'s'
      })
      
      return this.findMatchingOption(highestLevel.toLowerCase(), lowerOptions, options)
    }
    
    // Industry detection
    if (fieldName.includes('industry')) {
      const industry = this.detectIndustry(analysis.workExperience, cvText)
      return this.findMatchingOption(industry.toLowerCase(), lowerOptions, options)
    }
    
    // Availability detection
    if (fieldName.includes('availability') || fieldName.includes('notice')) {
      const isCurrentlyWorking = analysis.workExperience.some(exp => exp.currentlyWorking)
      if (isCurrentlyWorking) {
        return this.findMatchingOption('2 weeks', lowerOptions, options) || this.findMatchingOption('1 month', lowerOptions, options)
      } else {
        return this.findMatchingOption('immediate', lowerOptions, options) || this.findMatchingOption('available', lowerOptions, options)
      }
    }
    
    // Remote work preference
    if (fieldName.includes('remote') || fieldName.includes('work from home')) {
      if (lowerCvText.includes('remote') || lowerCvText.includes('work from home') || lowerCvText.includes('wfh')) {
        return this.findMatchingOption('yes', lowerOptions, options) || this.findMatchingOption('remote', lowerOptions, options)
      }
    }
    
    // Default to first option if no match found
    return options[0] || 'Not specified'
  }

  private static getFieldSuggestion(fieldName: string, fieldLabel: string, analysis: any, totalYears: number, cvText: string): string {
    // Years of experience
    if (fieldName.includes('experience') || fieldName.includes('years')) {
      return `${totalYears} years`
    }
    
    // Skills
    if (fieldName.includes('skills') || fieldName.includes('technical')) {
      if (analysis.skills.technical.length > 0) {
        return analysis.skills.technical.join(', ')
      }
    }
    
    // Soft skills
    if (fieldName.includes('soft') || fieldName.includes('interpersonal')) {
      if (analysis.skills.soft.length > 0) {
        return analysis.skills.soft.join(', ')
      }
    }
    
    // Industry experience
    if (fieldName.includes('industry')) {
      return this.detectIndustry(analysis.workExperience, cvText)
    }
    
    // Management experience
    if (fieldName.includes('management') || fieldName.includes('leadership')) {
      const managementYears = this.calculateManagementExperience(analysis.workExperience)
      return `${managementYears} years`
    }
    
    // Certifications
    if (fieldName.includes('certification') || fieldName.includes('license')) {
      return this.extractCertifications(cvText)
    }
    
    // Languages
    if (fieldName.includes('language')) {
      return this.extractLanguages(cvText)
    }
    
    // Default response
    return 'Based on CV content'
  }

  private static findMatchingOption(searchTerm: string, lowerOptions: string[], originalOptions: string[]): string {
    for (let i = 0; i < lowerOptions.length; i++) {
      if (lowerOptions[i].includes(searchTerm) || searchTerm.includes(lowerOptions[i])) {
        return originalOptions[i]
      }
    }
    return originalOptions[0] || 'Not specified'
  }

  private static detectIndustry(workExperience: any[], cvText: string): string {
    const lowerCvText = cvText.toLowerCase()
    
    // Check for industry keywords
    if (lowerCvText.includes('software') || lowerCvText.includes('programming') || lowerCvText.includes('developer')) {
      return 'Technology/IT'
    }
    if (lowerCvText.includes('medical') || lowerCvText.includes('healthcare') || lowerCvText.includes('hospital')) {
      return 'Healthcare'
    }
    if (lowerCvText.includes('banking') || lowerCvText.includes('finance') || lowerCvText.includes('accounting')) {
      return 'Finance'
    }
    if (lowerCvText.includes('manufacturing') || lowerCvText.includes('production') || lowerCvText.includes('factory')) {
      return 'Manufacturing'
    }
    if (lowerCvText.includes('retail') || lowerCvText.includes('sales') || lowerCvText.includes('customer service')) {
      return 'Retail'
    }
    if (lowerCvText.includes('teaching') || lowerCvText.includes('education') || lowerCvText.includes('academic')) {
      return 'Education'
    }
    if (lowerCvText.includes('marketing') || lowerCvText.includes('advertising') || lowerCvText.includes('pr')) {
      return 'Marketing'
    }
    if (lowerCvText.includes('engineering') || lowerCvText.includes('construction') || lowerCvText.includes('architecture')) {
      return 'Engineering'
    }
    if (lowerCvText.includes('law') || lowerCvText.includes('legal') || lowerCvText.includes('attorney')) {
      return 'Legal'
    }
    if (lowerCvText.includes('government') || lowerCvText.includes('public sector') || lowerCvText.includes('policy')) {
      return 'Government'
    }
    
    return 'Other'
  }

  private static calculateManagementExperience(workExperience: any[]): number {
    let managementYears = 0
    const currentDate = new Date()
    
    workExperience.forEach(exp => {
      const role = exp.role.toLowerCase()
      const description = (exp.description || '').toLowerCase()
      
      if (role.includes('manager') || role.includes('director') || role.includes('lead') || 
          role.includes('supervisor') || role.includes('head') || role.includes('chief') ||
          description.includes('manage') || description.includes('lead') || description.includes('supervise')) {
        
        if (exp.startDate) {
          const startDate = new Date(exp.startDate + '-01')
          const endDate = exp.currentlyWorking ? currentDate : (exp.endDate ? new Date(exp.endDate + '-01') : currentDate)
          
          const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          managementYears += Math.max(0, years)
        }
      }
    })
    
    return Math.round(managementYears * 10) / 10
  }

  private static extractCertifications(cvText: string): string {
    const lowerCvText = cvText.toLowerCase()
    const certifications: string[] = []
    
    // Common certification patterns
    const certPatterns = [
      /certified\s+([a-zA-Z\s]+)/gi,
      /certification\s+in\s+([a-zA-Z\s]+)/gi,
      /([a-zA-Z\s]+)\s+certification/gi,
      /([a-zA-Z\s]+)\s+license/gi,
      /([a-zA-Z\s]+)\s+accreditation/gi
    ]
    
    certPatterns.forEach(pattern => {
      const matches = lowerCvText.match(pattern)
      if (matches) {
        certifications.push(...matches)
      }
    })
    
    return certifications.length > 0 ? certifications.join(', ') : 'None specified'
  }

  private static extractLanguages(cvText: string): string {
    const lowerCvText = cvText.toLowerCase()
    const languages: string[] = []
    
    // Common language patterns
    const languagePatterns = [
      /fluent\s+in\s+([a-zA-Z\s]+)/gi,
      /speak\s+([a-zA-Z\s]+)/gi,
      /language[s]?\s*:\s*([a-zA-Z\s,]+)/gi,
      /([a-zA-Z]+)\s+language/gi
    ]
    
    languagePatterns.forEach(pattern => {
      const matches = lowerCvText.match(pattern)
      if (matches) {
        languages.push(...matches)
      }
    })
    
         return languages.length > 0 ? languages.join(', ') : 'English'
   }

   private static extractWorkExperienceFromLine(line: string): any | null {
    const lowerLine = line.toLowerCase()
    
    // Skip lines that are clearly not work experience
    if (lowerLine.includes('email') || lowerLine.includes('phone') || lowerLine.includes('@') || 
        lowerLine.includes('education') || lowerLine.includes('skills') || lowerLine.includes('summary') ||
        lowerLine.includes('objective') || lowerLine.includes('profile')) {
      return null
    }

    console.log('Analyzing line for work experience:', line)

    // Look for date patterns in the line - more flexible patterns
    const datePatterns = [
      // "Jan 2020 - Dec 2023" or "January 2020 - December 2023"
      /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})\s*[-–—]\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/i,
      // "2020 - 2023" or "2020 to 2023"
      /(\d{4})\s*[-–—]\s*(\d{4})/,
      // "2020 - Present" or "2020 - Current"
      /(\d{4})\s*[-–—]\s*(present|current|now)/i,
      // "Since 2020"
      /since\s+(\d{4})/i,
      // "2020 - 2023" with any separator
      /(\d{4})\s*[-–—to]\s*(\d{4})/,
      // Single year "2020" - but only if it looks like a date
      /\b(19|20)\d{2}\b/,
      // Month Year format "Jan 2020"
      /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/i
    ]

    for (const pattern of datePatterns) {
      const match = line.match(pattern)
      if (match) {
        console.log('Found date pattern match:', match[0])
        const dates = this.parseDateRange(match, line)
        if (dates) {
          console.log('Parsed dates:', dates)
          // Extract role and company from the line
          const roleCompany = this.extractRoleAndCompany(line, dates)
          console.log('Extracted role/company:', roleCompany)
          
          // Only return if we have a reasonable role/company
          if (roleCompany.role && roleCompany.role !== 'Unknown Role' && 
              roleCompany.company && roleCompany.company !== 'Unknown Company') {
            return {
              role: roleCompany.role,
              company: roleCompany.company,
              startDate: dates.startDate,
              endDate: dates.endDate,
              currentlyWorking: dates.currentlyWorking,
              description: ''
            }
          }
        }
      }
    }

    // If no dates found, try to extract work experience without dates
    // Look for common job title keywords
    const jobKeywords = ['developer', 'engineer', 'manager', 'director', 'coordinator', 'specialist', 
                        'analyst', 'consultant', 'assistant', 'officer', 'supervisor', 'lead', 'architect',
                        'designer', 'programmer', 'admin', 'executive', 'president', 'ceo', 'cto', 'cfo']
    
    const hasJobKeyword = jobKeywords.some(keyword => lowerLine.includes(keyword))
    const hasCompanyIndicators = lowerLine.includes(' at ') || lowerLine.includes(' - ') || 
                                lowerLine.includes(' | ') || lowerLine.includes(' • ') || 
                                lowerLine.includes(' @ ') || lowerLine.includes('inc') || 
                                lowerLine.includes('corp') || lowerLine.includes('ltd') || 
                                lowerLine.includes('company') || lowerLine.includes('group')
    
    if (hasJobKeyword || hasCompanyIndicators) {
      console.log('Found potential work experience without dates:', line)
      const roleCompany = this.extractRoleAndCompany(line, { startDate: null, endDate: null })
      if (roleCompany.role && roleCompany.role !== 'Unknown Role') {
        return {
          role: roleCompany.role,
          company: roleCompany.company || 'Unknown Company',
          startDate: null,
          endDate: null,
          currentlyWorking: false,
          description: ''
        }
      }
    }

    return null
  }

  private static extractEducationFromLine(line: string): any | null {
    const lowerLine = line.toLowerCase()
    
    console.log('Analyzing line for education:', line)
    
    // Look for education keywords
    const educationKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'certificate',
                              'university', 'college', 'school', 'institute', 'academy', 'degree', 'graduated']
    
    const hasEducationKeyword = educationKeywords.some(keyword => lowerLine.includes(keyword))
    
    if (!hasEducationKeyword) {
      return null
    }

    // Look for date patterns
    const datePatterns = [
      /(\d{4})\s*[-–—]\s*(\d{4})/,
      /(\d{4})/,
      /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/i
    ]

    for (const pattern of datePatterns) {
      const match = line.match(pattern)
      if (match) {
        console.log('Found education date pattern match:', match[0])
        const dates = this.parseEducationDates(match)
        if (dates) {
          console.log('Parsed education dates:', dates)
          const education = this.extractEducationDetails(line, dates)
          console.log('Extracted education details:', education)
          return education
        }
      }
    }

    // If no dates found, try to extract education without dates
    console.log('Found potential education without dates:', line)
    const education = this.extractEducationDetails(line, { startDate: null, endDate: null })
    if (education.institution && education.institution !== 'Unknown Institution') {
      return education
    }

    return null
  }

   private static parseDateRange(match: RegExpMatchArray, fullLine: string): any | null {
     const pattern = match[0]
     const lowerPattern = pattern.toLowerCase()

     // Handle "Jan 2020 - Dec 2023" format
     if (lowerPattern.includes('jan') || lowerPattern.includes('feb') || lowerPattern.includes('mar') || 
         lowerPattern.includes('apr') || lowerPattern.includes('may') || lowerPattern.includes('jun') ||
         lowerPattern.includes('jul') || lowerPattern.includes('aug') || lowerPattern.includes('sep') ||
         lowerPattern.includes('oct') || lowerPattern.includes('nov') || lowerPattern.includes('dec')) {
       
       const monthMap: { [key: string]: string } = {
         'jan': '01', 'january': '01',
         'feb': '02', 'february': '02',
         'mar': '03', 'march': '03',
         'apr': '04', 'april': '04',
         'may': '05',
         'jun': '06', 'june': '06',
         'jul': '07', 'july': '07',
         'aug': '08', 'august': '08',
         'sep': '09', 'september': '09',
         'oct': '10', 'october': '10',
         'nov': '11', 'november': '11',
         'dec': '12', 'december': '12'
       }

       const parts = pattern.split(/[-–—]/)
       if (parts.length === 2) {
         const startPart = parts[0].trim().toLowerCase()
         const endPart = parts[1].trim().toLowerCase()

         // Extract start date
         const startMatch = startPart.match(/(\w+)\s+(\d{4})/)
         if (startMatch) {
           const startMonth = monthMap[startMatch[1]] || '01'
           const startYear = startMatch[2]
           const startDate = `${startYear}-${startMonth}`

           // Check if end is "Present", "Current", etc.
           if (endPart.includes('present') || endPart.includes('current') || endPart.includes('now')) {
             return { startDate, endDate: null, currentlyWorking: true }
           }

           // Extract end date
           const endMatch = endPart.match(/(\w+)\s+(\d{4})/)
           if (endMatch) {
             const endMonth = monthMap[endMatch[1]] || '12'
             const endYear = endMatch[2]
             const endDate = `${endYear}-${endMonth}`
             return { startDate, endDate, currentlyWorking: false }
           }
         }
       }
     }

     // Handle "2020 - 2023" format
     if (match.length >= 3 && match[1] && match[2]) {
       const startYear = match[1]
       const endYear = match[2]
       
       if (endYear.toLowerCase().includes('present') || endYear.toLowerCase().includes('current') || endYear.toLowerCase().includes('now')) {
         return { startDate: `${startYear}-01`, endDate: null, currentlyWorking: true }
       }
       
       return { startDate: `${startYear}-01`, endDate: `${endYear}-12`, currentlyWorking: false }
     }

     // Handle "Since 2020" format
     if (match.length >= 2 && match[1]) {
       const year = match[1]
       return { startDate: `${year}-01`, endDate: null, currentlyWorking: true }
     }

     // Handle single year
     if (match.length >= 2 && match[1]) {
       const year = match[1]
       return { startDate: `${year}-01`, endDate: `${year}-12`, currentlyWorking: false }
     }

     return null
   }

   private static parseEducationDates(match: RegExpMatchArray): any | null {
     if (match.length >= 3 && match[1] && match[2]) {
       // "2020 - 2024" format
       const startYear = match[1]
       const endYear = match[2]
       return { startDate: `${startYear}-09`, endDate: `${endYear}-05` }
     } else if (match.length >= 2 && match[1]) {
       // Single year "2020"
       const year = match[1]
       return { startDate: `${year}-09`, endDate: `${year}-05` }
     }
     return null
   }

   private static extractRoleAndCompany(line: string, dates: any): { role: string, company: string } {
    // Remove the date part from the line
    let lineWithoutDates = line
      .replace(/[\d\s\-–—]+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/gi, '')
      .replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/\s*[-–—]\s*(present|current|now)/gi, '')
      .replace(/\s*[-–—]\s*\d{4}/g, '')
      .replace(/\s*to\s*\d{4}/g, '')
      .trim()
    
    console.log('Line without dates:', lineWithoutDates)
    
    // Look for common separators
    const separators = [' at ', ' - ', ' | ', ' • ', ' @ ', ' in ', ' of ', ' with ']
    let role = lineWithoutDates
    let company = ''

    for (const separator of separators) {
      if (lineWithoutDates.includes(separator)) {
        const parts = lineWithoutDates.split(separator)
        if (parts.length >= 2) {
          role = parts[0].trim()
          company = parts[1].trim()
          break
        }
      }
    }

    // If no separator found, try to extract from the end
    if (!company) {
      const words = lineWithoutDates.split(' ')
      if (words.length > 2) {
        // Look for company indicators at the end
        const companyIndicators = ['inc', 'corp', 'ltd', 'llc', 'company', 'group', 'enterprises', 'solutions', 'technologies', 'systems']
        const lastWords = words.slice(-3) // Check last 3 words
        
        for (let i = lastWords.length; i > 0; i--) {
          const potentialCompany = lastWords.slice(-i).join(' ')
          const hasIndicator = companyIndicators.some(indicator => 
            potentialCompany.toLowerCase().includes(indicator)
          )
          
          if (hasIndicator || i === 1) {
            company = potentialCompany
            role = words.slice(0, -i).join(' ')
            break
          }
        }
      }
    }

    // Clean up role and company
    role = role.replace(/^[,\s]+|[,\s]+$/g, '') // Remove leading/trailing commas and spaces
    company = company.replace(/^[,\s]+|[,\s]+$/g, '')

    // If role is too short or seems like a company name, try to fix
    if (role.length < 3 || role.toLowerCase().includes('inc') || role.toLowerCase().includes('corp')) {
      const temp = role
      role = company
      company = temp
    }

    console.log('Final role/company extraction:', { role, company })

    return { 
      role: role || 'Unknown Role', 
      company: company || 'Unknown Company' 
    }
  }

  private static extractEducationDetails(line: string, dates: any): any {
    // Remove date patterns from the line
    let lineWithoutDates = line
      .replace(/[\d\s\-–—]+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/gi, '')
      .replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/\s*[-–—]\s*(present|current|now)/gi, '')
      .replace(/\s*[-–—]\s*\d{4}/g, '')
      .replace(/\s*to\s*\d{4}/g, '')
      .trim()
    
    console.log('Education line without dates:', lineWithoutDates)
    
    // Look for degree keywords
    const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'certificate', 'degree']
    let qualification = ''
    let institution = ''

    // First, try to find degree keywords and extract qualification
    for (const keyword of degreeKeywords) {
      if (lineWithoutDates.toLowerCase().includes(keyword)) {
        // Look for common separators
        const separators = [' in ', ' from ', ' at ', ' of ', ' - ', ' | ', ' • ']
        
        for (const separator of separators) {
          if (lineWithoutDates.includes(separator)) {
            const parts = lineWithoutDates.split(separator)
            if (parts.length >= 2) {
              qualification = parts[0].trim()
              institution = parts[1].trim()
              break
            }
          }
        }
        
        // If no separator found, try to extract institution from the end
        if (!institution) {
          const words = lineWithoutDates.split(' ')
          if (words.length > 2) {
            // Look for institution indicators
            const institutionIndicators = ['university', 'college', 'school', 'institute', 'academy', 'polytechnic']
            const lastWords = words.slice(-3) // Check last 3 words
            
            for (let i = lastWords.length; i > 0; i--) {
              const potentialInstitution = lastWords.slice(-i).join(' ')
              const hasIndicator = institutionIndicators.some(indicator => 
                potentialInstitution.toLowerCase().includes(indicator)
              )
              
              if (hasIndicator || i === 1) {
                institution = potentialInstitution
                qualification = words.slice(0, -i).join(' ')
                break
              }
            }
          }
        }
        
        break
      }
    }

    // If no degree keyword found, try to extract based on common patterns
    if (!qualification) {
      const words = lineWithoutDates.split(' ')
      if (words.length > 2) {
        // Assume first part is qualification, last part is institution
        qualification = words.slice(0, -2).join(' ')
        institution = words.slice(-2).join(' ')
      } else {
        qualification = lineWithoutDates
        institution = 'Unknown Institution'
      }
    }

    // Clean up qualification and institution
    qualification = qualification.replace(/^[,\s]+|[,\s]+$/g, '')
    institution = institution.replace(/^[,\s]+|[,\s]+$/g, '')

    console.log('Final education extraction:', { qualification, institution })

    return {
      institution: institution || 'Unknown Institution',
      qualification: qualification || lineWithoutDates,
      startDate: dates.startDate,
      endDate: dates.endDate
    }
  }



  static async extractTextFromCV(fileUrl: string, supabase: any): Promise<string> {
    try {
      console.log('Attempting to download file from URL:', fileUrl)
      
      // The fileUrl should be the storage path, not a full URL
      // Remove any leading slashes and ensure it's just the filename/path
      const cleanPath = fileUrl.replace(/^\/+/, '')
      console.log('Clean path for download:', cleanPath)
      
      // First check if the file exists - try different approaches
      console.log('Checking file existence...')
      
      // Try to list files in the directory
      const pathParts = cleanPath.split('/')
      const directory = pathParts.slice(0, -1).join('/')
      const filename = pathParts[pathParts.length - 1]
      
      console.log('Directory:', directory)
      console.log('Filename:', filename)
      
      let fileExists = false
      
      try {
        const { data: fileList, error: listError } = await supabase.storage
          .from('documents')
          .list(directory || '')
        
        if (listError) {
          console.error('Error listing directory:', listError)
        } else {
          console.log('Files in directory:', fileList)
          fileExists = fileList?.some(file => file.name === filename) || false
          console.log('File exists:', fileExists)
        }
      } catch (listError) {
        console.error('Error checking file existence:', listError)
      }
      
      // Download the file from Supabase storage
      console.log('Attempting to download file...')
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(cleanPath)

      if (downloadError) {
        console.error('Download error details:', downloadError)
        console.error('Error code:', downloadError.status)
        console.error('Error message:', downloadError.message)
        
        // Try alternative download method
        console.log('Trying alternative download method...')
        try {
          const { data: altFileData, error: altError } = await supabase.storage
            .from('documents')
            .download(cleanPath, {
              transform: {
                width: 800,
                height: 600,
              }
            })
          
          if (altError) {
            console.error('Alternative download also failed:', altError)
            throw new Error(`Failed to download file: ${downloadError.message}`)
          }
          
          if (altFileData) {
            console.log('Alternative download successful')
            return this.processFileData(altFileData, fileUrl, supabase)
          }
        } catch (altError) {
          console.error('Alternative download failed:', altError)
        }
        
        throw new Error(`Failed to download file: ${downloadError.message}`)
      }

      if (!fileData) {
        throw new Error('No file data received')
      }
      
      console.log('File download successful')
      return this.processFileData(fileData, fileUrl, supabase)
    } catch (error) {
      console.error('Error in extractTextFromCV:', error)
      // Instead of throwing, return a fallback text for better user experience
      return `
        CV Analysis - File Download Issue
        Unable to download the CV file from storage.
        This could be due to:
        - File permissions
        - Storage configuration issues
        - Network connectivity problems
        
        Error details: ${error instanceof Error ? error.message : 'Unknown error'}
        
        Please try uploading the CV again or contact support if the issue persists.
      `
    }
  }
  
  static async processFileData(fileData: any, fileUrl: string, supabase: any): Promise<string> {
    try {
      // Convert file to base64 for Google AI
      const arrayBuffer = await fileData.arrayBuffer()
      const base64Data = Buffer.from(arrayBuffer).toString('base64')

      // Determine file type
      const fileExtension = fileUrl.split('.').pop()?.toLowerCase()
      let mimeType = 'application/pdf'
      
      if (fileExtension === 'doc') {
        mimeType = 'application/msword'
      } else if (fileExtension === 'docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (fileExtension === 'txt') {
        mimeType = 'text/plain'
      }

      console.log('File type detected:', mimeType)
      console.log('Base64 data length:', base64Data.length)
      
      // Check if Google AI API key is available
      if (!process.env.GOOGLE_API_KEY) {
        console.error('Google AI API key not configured')
        console.log('Using fallback text extraction...')
        // For testing, return a mock text instead of throwing
        return `
          CV Analysis - Mock Mode
          Since Google AI API key is not configured, this is a mock response.
          In production, please set GOOGLE_API_KEY environment variable.
          
          Mock CV Content:
          John Doe
          Software Engineer
          john.doe@email.com
          +1-555-0123
          
          Work Experience:
          - Senior Developer at Tech Corp (2020-2023)
          - Junior Developer at Startup Inc (2018-2020)
          
          Education:
          - Bachelor's in Computer Science, University of Technology (2018)
          
          Skills:
          - JavaScript, React, Node.js, Python, SQL
          - Leadership, Communication, Problem Solving
        `
      }
      
      console.log('Google AI API key available:', process.env.GOOGLE_API_KEY ? 'Yes' : 'No')
      console.log('API key length:', process.env.GOOGLE_API_KEY?.length || 0)

      // Get access token from service account or use API key
      let accessToken = process.env.GOOGLE_API_KEY
      
      // If it looks like a service account JSON, parse it and get access token
      if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.startsWith('{')) {
        try {
          const serviceAccount = JSON.parse(process.env.GOOGLE_API_KEY)
          // For now, we'll use the API key approach, but you might need to implement JWT token generation
          console.log('Service account detected, using API key approach')
        } catch (error) {
          console.error('Error parsing service account JSON:', error)
        }
      }

      // Use Google AI API endpoint for vision model
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Please extract and return all the text content from this CV/resume document. Return only the raw text without any formatting or additional commentary."
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }]
        })
      })

      console.log('Google AI API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Google AI API error response:', errorText)
        throw new Error(`Google AI API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Google AI API response structure:', Object.keys(data))
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Unexpected Google AI API response structure:', data)
        throw new Error('Unexpected response structure from Google AI API')
      }

      const extractedText = data.candidates[0].content.parts[0].text

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the document')
      }

      console.log('Successfully extracted text, length:', extractedText.length)
      return extractedText
    } catch (error) {
      console.error('Error extracting text from CV:', error)
      
      // If AI extraction fails, try basic text extraction for text files
      if (fileUrl.toLowerCase().endsWith('.txt')) {
        try {
          console.log('Attempting fallback text extraction for .txt file')
          const cleanPath = fileUrl.replace(/^\/+/, '')
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('documents')
            .download(cleanPath)

          if (!downloadError && fileData) {
            const text = await fileData.text()
            console.log('Fallback text extraction successful, length:', text.length)
            return text
          }
        } catch (textError) {
          console.error('Text file extraction also failed:', textError)
        }
      }
      
      // Provide more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to extract text from CV document: ${errorMessage}`)
      
      // Return a basic fallback text for testing
      return `
        CV Analysis - Fallback Mode
        This is a fallback response when AI analysis is not available.
        Please check your Google AI API key configuration.
        Error: ${errorMessage}
      `
    }
  }
} 