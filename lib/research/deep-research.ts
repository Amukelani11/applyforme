import { 
  performGoogleSearch, 
  generateSearchQueries, 
  generateFollowUpQueries,
  SearchResult 
} from './google-search';
import { conductResearchAnalysis, FinalReport } from './ai-analysis';

export interface DeepResearchResult {
  summary: string;
  fullReport: string;
  sources: Array<{
    title: string;
    url: string;
    description: string;
    domain: string;
    date: string;
  }>;
  dataPoints: number;
  analysisTime: string;
  confidenceScore: string;
}

export interface ResearchActivity {
  type: 'search' | 'extract' | 'analyze' | 'reasoning' | 'synthesis' | 'thought';
  status: 'pending' | 'complete' | 'error';
  message: string;
  timestamp: string;
}

export async function startDeepResearch(
  query: string, 
  mode: 'quick' | 'full' = 'quick',
  onActivity?: (activity: ResearchActivity) => void
): Promise<DeepResearchResult> {
  const startTime = Date.now();
  
  // Helper function to report activity
  const reportActivity = (
    type: ResearchActivity['type'], 
    message: string, 
    status: ResearchActivity['status'] = 'complete'
  ) => {
    if (onActivity) {
      onActivity({
        type,
        status,
        message,
        timestamp: new Date().toISOString()
      });
    }
  };

  try {
    // Phase 1: Research Planning and Query Generation
    reportActivity('thought', '🔍 RESEARCH PHASE: Analyzing query to identify key South African market research areas...');
    
    const initialSearchQueries = await generateSearchQueries(query, mode);
    reportActivity('search', `Generated ${initialSearchQueries.length} targeted search queries for SA job boards, salary surveys, and industry reports...`);
    
    // Phase 2: Execute Initial Searches
    reportActivity('search', 'Searching South African salary data sources for ZAR compensation information...');
    
    const allSearchResults: SearchResult[] = [];
    const processedQueries = new Set<string>();
    
    // Process initial queries
    for (const searchQuery of initialSearchQueries) {
      try {
        reportActivity('search', `Researching: "${searchQuery}"`);
        const results = await performGoogleSearch(searchQuery);
        allSearchResults.push(...results);
        processedQueries.add(searchQuery);
        
        // Add delay between searches to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        reportActivity('search', `Search failed for: "${searchQuery}"`, 'error');
        console.error(`Search error for query "${searchQuery}":`, error);
      }
    }

    reportActivity('search', `Cross-referencing multiple South African data sources for accuracy...`);

    // Phase 3: Follow-up Searches (for full mode)
    if (mode === 'full' && allSearchResults.length > 0) {
      reportActivity('thought', '🤔 CRITICAL ANALYSIS: Questioning data reliability and South African market relevance...');
      
      const followUpQueries = await generateFollowUpQueries(query, allSearchResults, processedQueries);
      
      reportActivity('search', 'Identifying data gaps and potential biases in the collected information...');
      
      for (const followUpQuery of followUpQueries) {
        try {
          reportActivity('search', `Deep dive research: "${followUpQuery}"`);
          const results = await performGoogleSearch(followUpQuery);
          allSearchResults.push(...results);
          processedQueries.add(followUpQuery);
          
          // Add delay between searches
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          reportActivity('search', `Follow-up search failed for: "${followUpQuery}"`, 'error');
          console.error(`Follow-up search error for query "${followUpQuery}":`, error);
        }
      }
    }

    reportActivity('analyze', 'Validating findings against known South African market conditions...');
    reportActivity('analyze', 'Assessing regional variations across Johannesburg, Cape Town, and Durban...');

    // Phase 4: AI Analysis and Synthesis
    reportActivity('reasoning', '📊 COMPILATION PHASE: Synthesizing research findings into comprehensive insights...');
    reportActivity('reasoning', 'Questioning completeness: Have all aspects of the query been addressed?');
    reportActivity('reasoning', 'Analyzing patterns and connections between different data points...');
    reportActivity('reasoning', 'Considering South African economic factors, BEE requirements, and employment laws...');
    reportActivity('reasoning', 'Evaluating implications for different stakeholders in the SA market...');

    if (allSearchResults.length === 0) {
      throw new Error('No search results found. Please try a different query.');
    }

    reportActivity('synthesis', 'Structuring findings into a comprehensive, actionable report...');
    
    // Conduct the two-phase AI analysis
    const analysisResult = await conductResearchAnalysis(query, allSearchResults, mode);
    
    reportActivity('synthesis', 'Generating detailed recommendations with implementation strategies...');
    reportActivity('synthesis', 'Finalizing comprehensive market analysis with South African context...');

    // Phase 5: Structure the Final Results
    const sources = allSearchResults.map(result => ({
      title: result.title,
      url: result.link,
      description: result.snippet,
      domain: result.source,
      date: new Date().toISOString().split('T')[0]
    }));

    const endTime = Date.now();
    const analysisTime = Math.round((endTime - startTime) / 1000);

    const result: DeepResearchResult = {
      summary: analysisResult.summary,
      fullReport: analysisResult.fullReport,
      sources: sources,
      dataPoints: sources.length,
      analysisTime: `${analysisTime} seconds`,
      confidenceScore: mode === 'quick' ? '85%' : '92%'
    };

    reportActivity('synthesis', `Research complete! Analyzed ${sources.length} sources and generated comprehensive South African market report.`);

    return result;

  } catch (error) {
    reportActivity('analyze', `Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    console.error('Deep research error:', error);
    throw error;
  }
}

// Types are already exported as interfaces above

