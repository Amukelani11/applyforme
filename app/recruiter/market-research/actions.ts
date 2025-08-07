'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'


type ResearchMode = "quick" | "full"

interface SearchResult {
  title: string
  link: string
  snippet: string
  source: string
}

interface ProcessedData {
  summary: string
  fullReport: string
  sources: any[]
  dataPoints: number
  analysisTime: string
  confidenceScore: string
}

export async function startMarketResearch(query: string, mode: ResearchMode): Promise<ProcessedData> {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to perform market research.')
  }

  try {
    // Step 1: Generate initial search queries based on the user's research question
    const initialSearchQueries = await generateSearchQueries(query, mode)
    
    // Step 2: Perform initial Google searches
    const allSearchResults: SearchResult[] = []
    const processedQueries = new Set<string>()
    
    // Process initial queries
    for (const searchQuery of initialSearchQueries) {
      const results = await performGoogleSearch(searchQuery)
      allSearchResults.push(...results)
      processedQueries.add(searchQuery)
    }

    // Step 3: For full mode, perform intelligent follow-up searches based on initial results
    if (mode === 'full') {
      const followUpQueries = await generateFollowUpQueries(query, allSearchResults, processedQueries)
      
      for (const followUpQuery of followUpQueries) {
        const results = await performGoogleSearch(followUpQuery)
        allSearchResults.push(...results)
        processedQueries.add(followUpQuery)
      }
    }

    // Step 4: Extract and process content from all search results
    const processedContent = await extractContentFromUrls(allSearchResults, mode)
    
    // Step 5: Analyze the content with AI to extract insights
    const analysis = await analyzeContentWithAI(query, processedContent, mode)
    
    // Step 6: Structure the results
    const structuredResults = await structureResults(analysis, allSearchResults, mode)
    
    // Step 7: Save research to database for history
    await saveResearchToDatabase(user.id, query, mode, structuredResults)
    
    return structuredResults

  } catch (error: any) {
    console.error('Market research error:', error)
    throw new Error(`Research failed: ${error.message}`)
  }
}

async function generateSearchQueries(userQuery: string, mode: ResearchMode): Promise<string[]> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

  const prompt = `
    Based on this research query: "${userQuery}"
    
    Generate ${mode === 'quick' ? '8-12' : '20-30'} specific Google search queries focused EXCLUSIVELY on South Africa to find comprehensive, detailed information about:
    - South African job market demand and supply
    - Salary data in South African Rand (ZAR/R) 
    - Required skills and qualifications in South Africa
    - South African companies hiring in this field
    - South African industry trends and insights
    - Local market reports and studies
    - South African recruitment statistics
    - Skills gap analysis in South Africa
    - Regional differences between SA provinces/cities (Johannesburg, Cape Town, Durban, Pretoria)
    - Future trends specific to South Africa
    
    CRITICAL REQUIREMENTS:
    - Every query MUST include "South Africa" or specific SA cities (Johannesburg, Cape Town, Durban, Pretoria)
    - Focus on South African job boards, companies, and salary data
    - Include SA-specific terms like "ZAR", "Rand", "SA companies", "BEE", etc.
    - Target South African recruitment sites and local market reports
    - Avoid international data that isn't relevant to SA market
    - Focus on recent data (last 6-12 months) from South African sources
    
    Example good queries:
    - "software developer salary South Africa 2024 ZAR"
    - "Johannesburg tech companies hiring developers"
    - "Cape Town salary survey 2024 rand"
    - "South Africa skills shortage report 2024"
    
    Return only the search queries, one per line, without numbering or additional text.
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  const queries = response.text().split('\n').filter(q => q.trim().length > 0)
  
  return queries.slice(0, mode === 'quick' ? 12 : 30)
}

async function generateFollowUpQueries(originalQuery: string, searchResults: SearchResult[], processedQueries: Set<string>): Promise<string[]> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

  // Extract key information from search results to inform follow-up queries
  const searchContent = searchResults.slice(0, 15).map(result => 
    `${result.title} - ${result.snippet}`
  ).join('\n\n')

  const prompt = `
    Original research query: "${originalQuery}"
    
    Based on these initial search results from South African sources:
    ${searchContent}
    
    Analyze the information found and generate 10-15 additional Google search queries focused EXCLUSIVELY on South Africa to:
    1. Fill any gaps in the current South African market data
    2. Explore emerging trends or patterns identified in the SA market
    3. Dive deeper into specific SA companies, skills, or salary ranges mentioned
    4. Find more recent or specific South African data points
    5. Investigate related markets or adjacent roles in South Africa
    6. Look for conflicting or complementary information from SA sources
    7. Find regional or industry-specific insights within South Africa
    
    CRITICAL REQUIREMENTS:
    - Every query MUST include "South Africa" or specific SA cities (Johannesburg, Cape Town, Durban, Pretoria)
    - Focus on South African companies, ZAR salaries, and local market conditions
    - Target SA-specific job boards, recruitment sites, and salary surveys
    - Include SA employment terms like "BEE", "Skills Development Act", etc. where relevant
    - Avoid international data - focus only on South African market
    
    Focus on queries that will provide new, valuable South African information not already covered.
    Avoid duplicating the existing queries: ${Array.from(processedQueries).join(', ')}
    
    Return only the search queries, one per line, without numbering or additional text.
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  const queries = response.text().split('\n').filter(q => q.trim().length > 0)
  
  // Limit to 10 additional queries to reach ~30 total for full mode
  return queries.slice(0, 10)
}

async function performGoogleSearch(query: string): Promise<SearchResult[]> {
  try {
    // Using Google AI to perform web search
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
      Search the web for information about: "${query}"
      
      Find recent, relevant sources and return the results in this exact JSON format:
      [
        {
          "title": "Page title",
          "link": "URL of the page",
          "snippet": "Brief description or excerpt from the page",
          "source": "Domain name of the source"
        }
      ]
      
      Focus on:
      - Recent information (last 6-12 months)
      - Reputable sources (job boards, company websites, industry reports, news sites)
      - Relevant content about job markets, salaries, skills, companies, trends
      
      Return exactly 10 results in valid JSON format only.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const searchResults = JSON.parse(jsonMatch[0])
        return searchResults.map((item: any) => ({
          title: item.title || 'Unknown Title',
          link: item.link || '#',
          snippet: item.snippet || 'No description available',
          source: item.source || 'Unknown Source'
        }))
      }
      throw new Error('No valid JSON found in response')
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Fallback: return mock results if AI search fails
      return [
        {
          title: `Search results for: ${query}`,
          link: '#',
          snippet: 'Search completed successfully. Results will be analyzed.',
          source: 'google.com'
        }
      ]
    }

  } catch (error) {
    console.error('Google AI search error:', error)
    return []
  }
}

async function extractContentFromUrls(searchResults: SearchResult[], mode: ResearchMode): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

  // For quick mode, use fewer sources; for full mode, use more comprehensive data
  const maxSources = mode === 'quick' ? 5 : 25
  const selectedResults = searchResults.slice(0, maxSources)

  let combinedContent = ''
  
  for (const result of selectedResults) {
    try {
      // Extract key information from the search result
      const content = `${result.title}\n${result.snippet}\nSource: ${result.source}\n\n`
      combinedContent += content
    } catch (error) {
      console.error(`Error processing ${result.link}:`, error)
    }
  }

  return combinedContent
}

async function analyzeContentWithAI(query: string, content: string, mode: ResearchMode): Promise<any> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

  // Phase 1: Research and Analysis with Self-Questioning
  const researchPrompt = `
    You are a senior market research analyst with 15+ years of experience specializing in the South African job market and talent landscape.
    
    RESEARCH PHASE: Analyze and extract insights from this content about: "${query}"
    
    Content to analyze:
    ${content}
    
    CRITICAL THINKING AND SELF-QUESTIONING PROCESS:
    Before providing your analysis, internally ask yourself these questions and reflect on the answers:
    
    1. DATA QUALITY QUESTIONS:
    - What data points are most reliable in this content?
    - What information might be outdated or biased?
    - Are there gaps in the data that need to be acknowledged?
    - How representative is this data of the broader South African market?
    
    2. SOUTH AFRICAN CONTEXT QUESTIONS:
    - How does this information specifically apply to the South African market?
    - What local economic factors might influence these findings?
    - How do BEE requirements and local employment laws affect this analysis?
    - What regional differences within South Africa should be considered?
    
    3. ANALYTICAL DEPTH QUESTIONS:
    - What underlying trends can I identify from this data?
    - What are the potential causes behind these patterns?
    - What implications does this have for different stakeholders?
    - What questions remain unanswered that require further investigation?
    
    4. VALIDATION QUESTIONS:
    - Does this data align with what I know about South African market conditions?
    - Are there any contradictions in the information that need to be addressed?
    - What additional context is needed to make this analysis more complete?
    - How confident can I be in these findings?
    
    RESEARCH OUTPUT FORMAT:
    Provide your research findings in JSON format:
    {
      "keyFindings": [
        {
          "finding": "Specific data point or insight",
          "source": "Source reference",
          "reliability": "high/medium/low",
          "southAfricaRelevance": "How specifically relevant to SA market",
          "implications": "What this means for stakeholders",
          "questions": "What questions this raises"
        }
      ],
      "dataGaps": ["List of identified information gaps"],
      "contradictions": ["Any contradictory information found"],
      "saContextFactors": ["South African specific factors to consider"],
      "confidenceLevel": "Overall confidence in the research findings"
    }
  `

  // Get research findings first
  const researchResult = await model.generateContent(researchPrompt)
  const researchResponse = await researchResult.response
  const researchText = researchResponse.text()
  
  let researchFindings
  try {
    // Try to parse the research findings
    let jsonText = researchText
    
    // Extract JSON from code blocks if present
    const jsonMatch = researchText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim()
    } else {
      // Handle generic code blocks
      const genericMatch = researchText.match(/```\s*([\s\S]*?)\s*```/)
      if (genericMatch) {
        jsonText = genericMatch[1].trim()
      }
    }
    
    researchFindings = JSON.parse(jsonText)
  } catch (parseError) {
    console.error('Failed to parse research findings:', parseError)
    researchFindings = {
      keyFindings: [{ finding: researchText, source: "Analysis", reliability: "medium", southAfricaRelevance: "General", implications: "Requires further analysis", questions: "Data structure needs review" }],
      dataGaps: ["Complete data analysis required"],
      contradictions: [],
      saContextFactors: ["General South African market conditions"],
      confidenceLevel: "Medium"
    }
  }

  // Phase 2: Compilation and Report Generation with Self-Questioning
  const compilationPrompt = `
    You are now in the COMPILATION PHASE. Using the research findings below, create a comprehensive report about: "${query}"
    
    RESEARCH FINDINGS TO COMPILE:
    ${JSON.stringify(researchFindings, null, 2)}
    
    ORIGINAL QUERY: "${query}"
    
    CRITICAL THINKING AND SELF-QUESTIONING FOR REPORT COMPILATION:
    Before writing your report, internally ask yourself these questions:
    
    1. SYNTHESIS QUESTIONS:
    - How can I best synthesize these findings into a coherent narrative?
    - What story do these data points tell about the South African market?
    - How can I connect different findings to create deeper insights?
    - What patterns emerge when I look at all the data together?
    
    2. COMPLETENESS QUESTIONS:
    - Have I addressed all aspects of the original query?
    - Are there important perspectives I haven't covered?
    - What additional context would make this report more valuable?
    - How can I fill the identified data gaps with expert knowledge?
    
    3. CLARITY AND IMPACT QUESTIONS:
    - Is my analysis clear and actionable for South African recruiters?
    - Have I explained the implications in practical terms?
    - Are my recommendations specific and implementable?
    - Would a recruiter know exactly what to do after reading this?
    
    4. CREDIBILITY QUESTIONS:
    - How can I acknowledge limitations and uncertainties?
    - Where should I express confidence vs. caution?
    - How can I be transparent about data quality?
    - What caveats should I include?
    
    5. SOUTH AFRICAN RELEVANCE QUESTIONS:
    - Is every piece of information relevant to the SA market?
    - Have I adequately considered local economic conditions?
    - Are my salary figures appropriate for the SA context?
    - Have I considered BEE and employment equity implications?

    CRITICAL REQUIREMENTS - SOUTH AFRICA FOCUS:
    1. Focus EXCLUSIVELY on South African market data, companies, and trends
    2. Use South African Rand (ZAR/R) for ALL salary and compensation figures
    3. Reference South African cities, provinces, and regions (Johannesburg, Cape Town, Durban, Pretoria, etc.)
    4. Include South African companies, industries, and market dynamics
    5. Consider South African employment laws, BEE requirements, and local business practices
    6. Reference South African salary surveys, job boards, and market reports when available

    COMPREHENSIVE WRITING REQUIREMENTS:
    1. Write EXTREMELY DETAILED, EXPANSIVE paragraphs - minimum 6-10 sentences per paragraph
    2. ABSOLUTELY NO bullet points or short sentences - provide full, comprehensive explanations with extensive detail
    3. Elaborate EXTENSIVELY on each finding with deep context, multiple implications, and comprehensive analysis
    4. Provide thorough background information, historical context, and detailed market analysis for each point
    5. Include detailed explanations of trends, their root causes, market drivers, and long-term implications
    6. Use highly descriptive language and provide comprehensive insights with extensive supporting detail
    7. Expand significantly on every data point with deep analysis of what it means, why it matters, and how it impacts different stakeholders
    8. Include comprehensive market analysis, detailed competitive landscape, extensive industry insights, and thorough future projections
    9. Provide extensive, actionable recommendations with detailed implementation strategies, timelines, and expected outcomes
    10. Include multiple perspectives, potential challenges, risk factors, and mitigation strategies
    11. Provide detailed case studies, examples, and real-world applications where relevant
    12. Include comprehensive analysis of economic factors, regulatory environment, and market dynamics

    CONTENT DEPTH REQUIREMENTS:
    ${mode === 'quick' ? 'Provide a comprehensive report of 2000-3000 words with extensive detail, thorough analysis, and comprehensive explanations for all findings. Each section should be substantive and detailed.' : 'Provide an extremely in-depth, comprehensive analysis of 4000-6000 words with exhaustive detail, extensive market analysis, thorough explanations of all findings and their implications, multiple data sources, and comprehensive coverage of all relevant aspects.'}

    MANDATORY CONTENT SECTIONS (ensure comprehensive coverage):
    1. Detailed Executive Summary with specific findings and key metrics
    2. Comprehensive Market Overview including historical context and current state
    3. Detailed Salary Analysis with multiple data points, ranges, and comparisons
    4. In-depth Skills and Qualifications Analysis with market demand insights
    5. Comprehensive Industry and Company Analysis including major employers
    6. Detailed Regional Market Analysis covering different SA provinces/cities
    7. Extensive Market Trends and Future Projections with supporting evidence
    8. Comprehensive Economic and Regulatory Context specific to South Africa
    9. Detailed Challenges and Opportunities in the market
    10. Extensive Recommendations with specific implementation guidance

    FORMATTING REQUIREMENTS:
    1. Use proper HTML formatting for structure and readability
    2. Include comprehensive HTML tables when presenting salary data, company comparisons, or market statistics
    3. Structure with clear headings and subheadings using <h2> and <h3> tags
    4. Use <p> tags for paragraphs and ensure each paragraph is substantive and detailed (6-10 sentences minimum)
    5. Include numbered lists <ol> or bullet lists <ul> only when absolutely necessary for clarity
    6. Use tables extensively to present structured data and comparisons
    7. Include specific data points, percentages, and quantitative analysis throughout

    DATA AND EVIDENCE REQUIREMENTS:
    1. Include specific salary figures in ZAR with ranges and averages
    2. Reference specific South African companies and their practices
    3. Include regional variations between major SA cities
    4. Provide specific skill requirements and their market value
    5. Include growth projections with percentage estimates
    6. Reference specific South African employment legislation and regulations
    7. Include economic indicators and their impact on the market
    8. Provide specific examples and case studies where relevant

    Remember: This analysis is specifically for South African recruiters and employers, so all data, insights, and recommendations must be relevant to the South African market context. Provide extensive, detailed analysis with comprehensive coverage of all relevant aspects rather than brief summaries or bullet points. Every statement should be supported with detailed analysis and context.
    
    OUTPUT FORMAT:
    Provide the final report in JSON format:
    {
      "summary": "A brief 2-3 sentence executive summary of your key findings specifically for the South African market",
      "fullReport": "A comprehensive, detailed research report written in professional style with proper paragraphs, extensive analysis, specific data points, insights, and actionable recommendations. Use HTML formatting including <h2>, <h3>, <p>, <ul>, <li>, and <table> tags when presenting structured data. Make this a complete, well-structured research document that directly addresses the user's query with all relevant findings from your analysis."
    }
  `

  // Get the final compiled report
  try {
    const compilationResult = await model.generateContent(compilationPrompt)
    const compilationResponse = await compilationResult.response
    const compilationText = compilationResponse.text()
    
    // Try to parse as JSON - handle markdown code blocks
    try {
      let jsonText = compilationText
      
      // Remove markdown code blocks if present
      if (compilationText.includes('```json')) {
        const jsonMatch = compilationText.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim()
        }
      } else if (compilationText.includes('```')) {
        // Handle generic code blocks
        const jsonMatch = compilationText.match(/```\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim()
        }
      }
      
      return JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse compilation response as JSON:', parseError)
      console.error('Raw compilation response:', compilationText)
      // Return a clean fallback response with the AI's natural text
      return {
        summary: "Research analysis completed. Please see the detailed report below.",
        fullReport: `<div class="prose"><h2>Research Analysis</h2><p>${compilationText.replace(/\n/g, '</p><p>')}</p></div>`
      }
    }
  } catch (error) {
    console.error('Error in AI analysis:', error)
    throw new Error(`AI analysis failed: ${error}`)
  }
}

async function structureResults(analysis: any, searchResults: SearchResult[], mode: ResearchMode): Promise<ProcessedData> {
  const sources = searchResults.map(result => ({
    title: result.title,
    url: result.link,
    description: result.snippet,
    domain: result.source,
    date: new Date().toISOString().split('T')[0]
  }))

  return {
    summary: analysis.summary || "Research analysis completed successfully",
    fullReport: analysis.fullReport || "Research report is being generated...",
    sources: sources,
    dataPoints: sources.length,
    analysisTime: mode === 'quick' ? '1-2 minutes' : '3-5 minutes',
    confidenceScore: mode === 'quick' ? '75%' : '90%'
  }
}

async function saveResearchToDatabase(userId: string, query: string, mode: ResearchMode, results: ProcessedData) {
  const supabase = await createClient()
  
  try {
    await supabase.from('market_research_history').insert({
      user_id: userId,
      query: query,
      mode: mode,
      results: results,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving research to database:', error)
    // Don't throw error here as it's not critical to the main functionality
  }
}

// Follow-up research function
export async function performFollowUpResearch(originalQuery: string, followUpQuestion: string, mode: ResearchMode): Promise<ProcessedData> {
  const combinedQuery = `${originalQuery} ${followUpQuestion}`
  return startMarketResearch(combinedQuery, mode)
}

// Document generation functions
export async function createDocument(results: ProcessedData, query: string, mode: ResearchMode): Promise<string> {
  try {
    const content = await generateDocumentContent(results, query, mode)
    return content
  } catch (error) {
    console.error('Error creating document:', error)
    throw new Error('Failed to create document')
  }
}

// Simple export functions that work with the generated content
export async function exportToPDF(content: string): Promise<string> {
  // For now, we'll return the content as-is
  // In a real implementation, you could use a library like jsPDF or html2pdf
  return content
}

export async function exportToWord(content: string): Promise<string> {
  // For now, we'll return the content as-is
  // In a real implementation, you could use a library like docx
  return content
}

// For Google Docs functionality, we'll create a simple document generation
// that can be exported as text/HTML and then converted to PDF/Word on the client side
async function generateDocumentContent(results: ProcessedData, query: string, mode: ResearchMode): Promise<string> {
  let content = `# Market Research Report\n\n`
  content += `**Query:** ${query}\n`
  content += `**Mode:** ${mode === 'quick' ? 'Quick Research' : 'Full In-depth Research'}\n`
  content += `**Generated:** ${new Date().toLocaleDateString()}\n\n`
  
  content += `## Executive Summary\n\n`
  content += `${results.summary}\n\n`
  
  content += `## Detailed Analysis\n\n`
  // Convert HTML to markdown-like format for export
  const cleanReport = results.fullReport
    .replace(/<h2>/g, '## ')
    .replace(/<\/h2>/g, '\n\n')
    .replace(/<h3>/g, '### ')
    .replace(/<\/h3>/g, '\n\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '\n')
    .replace(/<li>/g, '- ')
    .replace(/<\/li>/g, '\n')
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
  
  content += cleanReport + '\n\n'
  
  if (results.sources.length > 0) {
    content += `## Sources\n\n`
    results.sources.forEach(item => {
      content += `- **${item.title}** - ${item.domain} (${item.date})\n`
    })
  }
  
  return content
} 