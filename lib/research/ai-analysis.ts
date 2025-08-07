import { GoogleGenerativeAI } from '@google/generative-ai';
import { SearchResult } from './google-search';

export interface ResearchFindings {
  keyFindings: Array<{
    finding: string;
    source: string;
    reliability: 'high' | 'medium' | 'low';
    southAfricaRelevance: string;
    implications: string;
    questions: string;
  }>;
  dataGaps: string[];
  contradictions: string[];
  saContextFactors: string[];
  confidenceLevel: string;
}

export interface FinalReport {
  summary: string;
  fullReport: string;
}

export async function conductResearchAnalysis(
  query: string, 
  searchResults: SearchResult[], 
  mode: 'quick' | 'full'
): Promise<FinalReport> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Combine search results into research content
  const researchContent = searchResults.map(result => 
    `Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.snippet}\nURL: ${result.link}\n`
  ).join('\n---\n');

  // Phase 1: Research and Analysis with Self-Questioning
  const researchPrompt = `
    You are a senior market research analyst with 15+ years of experience specializing in the South African job market and talent landscape.
    
    RESEARCH PHASE: Analyze and extract insights from this content about: "${query}"
    
    Content to analyze:
    ${researchContent}
    
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
  `;

  // Get research findings first
  const researchResult = await model.generateContent(researchPrompt);
  const researchResponse = await researchResult.response;
  const researchText = researchResponse.text();
  
  let researchFindings: ResearchFindings;
  try {
    // Try to parse the research findings
    let jsonText = researchText;
    
    // Extract JSON from code blocks if present
    const jsonMatch = researchText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    } else {
      // Handle generic code blocks
      const genericMatch = researchText.match(/```\s*([\s\S]*?)\s*```/);
      if (genericMatch) {
        jsonText = genericMatch[1].trim();
      }
    }
    
    researchFindings = JSON.parse(jsonText);
  } catch (parseError) {
    console.error('Failed to parse research findings:', parseError);
    researchFindings = {
      keyFindings: [{ 
        finding: researchText, 
        source: "Analysis", 
        reliability: "medium", 
        southAfricaRelevance: "General", 
        implications: "Requires further analysis", 
        questions: "Data structure needs review" 
      }],
      dataGaps: ["Complete data analysis required"],
      contradictions: [],
      saContextFactors: ["General South African market conditions"],
      confidenceLevel: "Medium"
    };
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
  `;

  // Get the final compiled report
  try {
    const compilationResult = await model.generateContent(compilationPrompt);
    const compilationResponse = await compilationResult.response;
    const compilationText = compilationResponse.text();
    
    // Try to parse as JSON - handle markdown code blocks
    try {
      let jsonText = compilationText;
      
      // Remove markdown code blocks if present
      if (compilationText.includes('```json')) {
        const jsonMatch = compilationText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      } else if (compilationText.includes('```')) {
        // Handle generic code blocks
        const jsonMatch = compilationText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      }
      
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse compilation response as JSON:', parseError);
      console.error('Raw compilation response:', compilationText);
      // Return a clean fallback response with the AI's natural text
      return {
        summary: "Research analysis completed. Please see the detailed report below.",
        fullReport: `<div class="prose"><h2>Research Analysis</h2><p>${compilationText.replace(/\n/g, '</p><p>')}</p></div>`
      };
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw new Error(`AI analysis failed: ${error}`);
  }
}

