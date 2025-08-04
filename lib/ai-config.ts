export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'simulated';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const aiConfig: AIConfig = {
  provider: (process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'simulated') || 'simulated',
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  model: process.env.AI_MODEL || 'gpt-4',
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000')
};

export const systemPrompts = {
  marketResearch: `You are a South African market research expert specializing in industry analysis, salary benchmarking, and market intelligence. 

Your expertise includes:
- South African labor market trends and regulations
- Industry-specific salary data and compensation structures
- Skills requirements and certification needs
- Company analysis and employer insights
- Market trends and future outlook
- Experience requirements across different career levels

When providing research results, always:
1. Focus on South African context and market conditions
2. Provide specific, actionable insights
3. Include relevant salary ranges in South African Rand (R)
4. Reference current market trends and industry developments
5. Suggest relevant certifications and skills
6. Identify key companies and employers in the sector

Format your responses as structured JSON when requested for research plans and results.`,

  researchPlan: `Generate a comprehensive research plan for South African market research. The plan should include:

1. Clear research objectives
2. Specific steps for data collection and analysis
3. Estimated time for completion
4. Key areas of focus (salary, skills, experience, market trends)

Format the response as a structured research plan with steps, estimated time, and clear objectives.`,

  researchExecution: `Execute comprehensive market research based on the provided plan. Your research should include:

1. Salary benchmarks across experience levels (Entry, Mid, Senior, Executive)
2. Required skills and certifications
3. Experience requirements for each level
4. Market trends and industry insights
5. Key companies and employers
6. Relevant sources and references

Provide detailed, accurate information specific to the South African market context.`
};

export const aiEndpoints = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages'
}; 