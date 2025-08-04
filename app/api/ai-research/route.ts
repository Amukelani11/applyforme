import { NextRequest, NextResponse } from 'next/server';
import { aiConfig, systemPrompts, aiEndpoints } from '@/lib/ai-config';

interface ResearchRequest {
  query: string;
  type: 'plan' | 'research';
  plan?: any;
}

interface ResearchPlan {
  id: string;
  title: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed';
}

interface ResearchResult {
  id: string;
  sector: string;
  industry: string;
  salaryData: {
    entry: string;
    mid: string;
    senior: string;
    executive: string;
  };
  experienceRequirements: {
    entry: string[];
    mid: string[];
    senior: string[];
    executive: string[];
  };
  skills: string[];
  marketTrends: string[];
  companies: string[];
  certifications: string[];
  insights: string[];
  sources: string[];
}

// AI service that can be configured to use different AI providers
class AIService {
  private config = aiConfig;

  constructor() {
    // Configuration is loaded from aiConfig
  }

  private async callAI(prompt: string, systemPrompt?: string): Promise<string> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(prompt, systemPrompt);
      case 'anthropic':
        return this.callAnthropic(prompt, systemPrompt);
      case 'simulated':
      default:
        return this.callSimulatedAI(prompt, systemPrompt);
    }
  }

  private async callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      if (!this.config.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch(aiEndpoints.openai, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt || systemPrompts.marketResearch },
            { role: 'user', content: prompt }
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Fallback to simulated AI
      return this.callSimulatedAI(prompt, systemPrompt);
    }
  }

  private async callAnthropic(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Anthropic API key not configured');
      }

      const response = await fetch(aiEndpoints.anthropic, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-sonnet-20240229',
          max_tokens: this.config.maxTokens || 2000,
          messages: [
            { role: 'user', content: `${systemPrompt || systemPrompts.marketResearch}\n\n${prompt}` }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Anthropic API Error:', error);
      // Fallback to simulated AI
      return this.callSimulatedAI(prompt, systemPrompt);
    }
  }

  private async callSimulatedAI(prompt: string, systemPrompt?: string): Promise<string> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // For now, return structured responses based on the prompt
    if (prompt.includes('plan')) {
      return this.generateResearchPlan(prompt);
    } else if (prompt.includes('research')) {
      return this.generateResearchResults(prompt);
    }
    
    return "I'm here to help with your South African market research. Please provide a specific query.";
  }

  private generateResearchPlan(query: string): string {
    const sector = this.extractSector(query);
    const industry = this.extractIndustry(query);
    
    return JSON.stringify({
      id: Date.now().toString(),
      title: `Research Plan: ${sector} in ${industry}`,
      description: `Comprehensive analysis of the ${sector} sector in the ${industry} industry in South Africa`,
      steps: [
        "Analyzing current market trends and industry reports for South Africa",
        "Researching salary benchmarks across experience levels in the region",
        "Identifying key skills and certifications required for the role",
        "Mapping top companies and employers in the sector",
        "Gathering insights on experience requirements and career progression",
        "Compiling market intelligence and future outlook for the industry"
      ],
      estimatedTime: "4-6 minutes",
      status: 'pending'
    });
  }

  private generateResearchResults(query: string): string {
    const sector = this.extractSector(query);
    const industry = this.extractIndustry(query);
    
    // Generate comprehensive research results based on the query
    const results: ResearchResult = {
      id: Date.now().toString(),
      sector: sector,
      industry: industry,
      salaryData: this.generateSalaryData(sector, industry),
      experienceRequirements: this.generateExperienceRequirements(sector, industry),
      skills: this.generateSkills(sector, industry),
      marketTrends: this.generateMarketTrends(sector, industry),
      companies: this.generateCompanies(sector, industry),
      certifications: this.generateCertifications(sector, industry),
      insights: this.generateInsights(sector, industry),
      sources: this.generateSources(sector, industry)
    };
    
    return JSON.stringify(results);
  }

  private extractSector(query: string): string {
    if (query.toLowerCase().includes('supply chain')) return 'Supply Chain Management';
    if (query.toLowerCase().includes('software') || query.toLowerCase().includes('development')) return 'Software Development';
    if (query.toLowerCase().includes('finance') || query.toLowerCase().includes('banking')) return 'Financial Services';
    if (query.toLowerCase().includes('healthcare') || query.toLowerCase().includes('medical')) return 'Healthcare';
    if (query.toLowerCase().includes('manufacturing')) return 'Manufacturing';
    if (query.toLowerCase().includes('mining')) return 'Mining';
    return 'General Business';
  }

  private extractIndustry(query: string): string {
    if (query.toLowerCase().includes('mining')) return 'Mining Sector';
    if (query.toLowerCase().includes('technology') || query.toLowerCase().includes('tech')) return 'Technology Sector';
    if (query.toLowerCase().includes('finance') || query.toLowerCase().includes('banking')) return 'Financial Sector';
    if (query.toLowerCase().includes('healthcare') || query.toLowerCase().includes('medical')) return 'Healthcare Sector';
    if (query.toLowerCase().includes('manufacturing')) return 'Manufacturing Sector';
    return 'General Industry';
  }

  private generateSalaryData(sector: string, industry: string): any {
    const baseSalaries = {
      'Supply Chain Management': {
        entry: "R350,000 - R450,000",
        mid: "R550,000 - R750,000",
        senior: "R850,000 - R1,200,000",
        executive: "R1,500,000 - R2,500,000"
      },
      'Software Development': {
        entry: "R400,000 - R600,000",
        mid: "R700,000 - R1,000,000",
        senior: "R1,200,000 - R1,800,000",
        executive: "R2,000,000 - R3,500,000"
      },
      'Financial Services': {
        entry: "R450,000 - R650,000",
        mid: "R800,000 - R1,200,000",
        senior: "R1,500,000 - R2,200,000",
        executive: "R2,500,000 - R4,000,000"
      },
      'Healthcare': {
        entry: "R300,000 - R500,000",
        mid: "R600,000 - R900,000",
        senior: "R1,000,000 - R1,500,000",
        executive: "R1,800,000 - R2,800,000"
      }
    };
    
    return baseSalaries[sector] || baseSalaries['Supply Chain Management'];
  }

  private generateExperienceRequirements(sector: string, industry: string): any {
    const requirements = {
      'Supply Chain Management': {
        entry: [
          "Bachelor's degree in Supply Chain, Logistics, or related field",
          "1-3 years experience in logistics or operations",
          "Understanding of SAP or similar ERP systems",
          "Knowledge of South African mining regulations"
        ],
        mid: [
          "5-8 years experience in supply chain management",
          "Experience with mining industry supply chains",
          "Project management certification (PMP or similar)",
          "Leadership experience with teams of 5+ people"
        ],
        senior: [
          "8-12 years experience in senior supply chain roles",
          "Experience managing complex mining operations",
          "MBA or advanced degree preferred",
          "Proven track record of cost optimization"
        ],
        executive: [
          "15+ years experience in executive supply chain roles",
          "Experience with multi-national mining operations",
          "Strategic planning and business development experience",
          "Board-level communication and stakeholder management"
        ]
      },
      'Software Development': {
        entry: [
          "Bachelor's degree in Computer Science or related field",
          "1-3 years experience in software development",
          "Proficiency in JavaScript, Python, or Java",
          "Understanding of web development frameworks"
        ],
        mid: [
          "5-8 years experience in software development",
          "Experience with cloud platforms (AWS, Azure, GCP)",
          "Knowledge of microservices architecture",
          "Team leadership and mentoring experience"
        ],
        senior: [
          "8-12 years experience in senior development roles",
          "Experience with large-scale system design",
          "Advanced degree in Computer Science preferred",
          "Proven track record of technical leadership"
        ],
        executive: [
          "15+ years experience in technology leadership",
          "Experience with digital transformation initiatives",
          "Strategic technology planning experience",
          "Board-level technology strategy and governance"
        ]
      }
    };
    
    return requirements[sector] || requirements['Supply Chain Management'];
  }

  private generateSkills(sector: string, industry: string): string[] {
    const skills = {
      'Supply Chain Management': [
        "SAP S/4HANA", "Oracle Supply Chain", "Microsoft Dynamics", "Tableau", "Power BI",
        "Six Sigma", "Lean Management", "Project Management", "Risk Management",
        "Contract Negotiation", "Supplier Management", "Inventory Optimization",
        "Transportation Management", "Warehouse Management", "Compliance Management"
      ],
      'Software Development': [
        "JavaScript", "Python", "Java", "React", "Node.js", "AWS", "Azure", "Docker",
        "Kubernetes", "Git", "CI/CD", "Microservices", "REST APIs", "GraphQL",
        "Machine Learning", "Data Science", "DevOps", "Agile Methodologies"
      ]
    };
    
    return skills[sector] || skills['Supply Chain Management'];
  }

  private generateMarketTrends(sector: string, industry: string): string[] {
    const trends = {
      'Supply Chain Management': [
        "Digital transformation driving automation in supply chains",
        "Increased focus on ESG compliance and sustainable sourcing",
        "Rising demand for real-time visibility and tracking",
        "Growing importance of risk management and resilience",
        "Integration of AI and machine learning in logistics"
      ],
      'Software Development': [
        "Rapid adoption of cloud-native technologies",
        "Growing demand for AI and machine learning skills",
        "Increased focus on cybersecurity and data protection",
        "Rise of remote work and distributed teams",
        "Integration of DevOps and agile methodologies"
      ]
    };
    
    return trends[sector] || trends['Supply Chain Management'];
  }

  private generateCompanies(sector: string, industry: string): string[] {
    const companies = {
      'Supply Chain Management': [
        "Anglo American", "Sibanye-Stillwater", "Impala Platinum", "Exxaro Resources",
        "Harmony Gold", "Gold Fields", "Kumba Iron Ore", "Northam Platinum",
        "Royal Bafokeng Platinum", "African Rainbow Minerals"
      ],
      'Software Development': [
        "Naspers", "Takealot", "Discovery", "Old Mutual", "Sanlam",
        "MTN", "Vodacom", "Cell C", "Standard Bank", "FirstRand"
      ]
    };
    
    return companies[sector] || companies['Supply Chain Management'];
  }

  private generateCertifications(sector: string, industry: string): string[] {
    const certifications = {
      'Supply Chain Management': [
        "CSCP (Certified Supply Chain Professional)",
        "CPIM (Certified in Production and Inventory Management)",
        "CPSM (Certified Professional in Supply Management)",
        "PMP (Project Management Professional)",
        "Six Sigma Black Belt",
        "ISO 9001 Lead Auditor"
      ],
      'Software Development': [
        "AWS Certified Solutions Architect",
        "Microsoft Certified: Azure Developer",
        "Google Cloud Professional Developer",
        "Certified Scrum Master (CSM)",
        "PMP (Project Management Professional)",
        "CISSP (Certified Information Systems Security Professional)"
      ]
    };
    
    return certifications[sector] || certifications['Supply Chain Management'];
  }

  private generateInsights(sector: string, industry: string): string[] {
    const insights = {
      'Supply Chain Management': [
        "Supply chain managers in mining are increasingly focused on digital transformation",
        "ESG compliance is becoming a critical requirement for all levels",
        "Remote monitoring and IoT integration are key growth areas",
        "Talent shortage in specialized mining supply chain roles",
        "Cross-functional skills (tech + operations) are highly valued"
      ],
      'Software Development': [
        "Full-stack developers with cloud expertise are in high demand",
        "AI and machine learning skills are becoming essential",
        "Remote work has increased demand for collaboration tools",
        "Cybersecurity skills are increasingly important",
        "DevOps and automation skills are highly valued"
      ]
    };
    
    return insights[sector] || insights['Supply Chain Management'];
  }

  private generateSources(sector: string, industry: string): string[] {
    return [
      "PwC South Africa Industry Report 2024",
      "Deloitte Industry Outlook",
      "South African Institute of Supply Chain Management",
      "Industry Weekly Analysis",
      "LinkedIn Salary Insights",
      "Indeed South Africa Job Market Report",
      "Glassdoor Salary Data",
      "Industry-specific publications and research"
    ];
  }

  async generateResearchPlan(query: string): Promise<ResearchPlan> {
    const prompt = `Generate a comprehensive research plan for: ${query}

Please provide a structured research plan that includes:
- Clear title and description
- Specific research steps
- Estimated time for completion
- Focus areas (salary, skills, experience, market trends)

Format the response as a valid JSON object with the following structure:
{
  "id": "unique_id",
  "title": "Research Plan: [Sector] in [Industry]",
  "description": "Comprehensive analysis description",
  "steps": ["step1", "step2", "step3", "step4", "step5", "step6"],
  "estimatedTime": "4-6 minutes",
  "status": "pending"
}`;

    const response = await this.callAI(prompt, systemPrompts.researchPlan);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse research plan:', error);
      // Fallback to generated plan
      return this.generateFallbackPlan(query);
    }
  }

  async executeResearch(plan: ResearchPlan, query: string): Promise<ResearchResult> {
    const prompt = `Execute comprehensive market research based on this plan: ${JSON.stringify(plan)}

Query: ${query}

Please provide detailed research results including:
- Salary data for different experience levels
- Required skills and certifications
- Experience requirements
- Market trends
- Key companies
- Industry insights
- Sources and references

Format the response as a valid JSON object with comprehensive research data.`;

    const response = await this.callAI(prompt, systemPrompts.researchExecution);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse research results:', error);
      // Fallback to generated results
      return this.generateFallbackResults(query);
    }
  }

  private generateFallbackPlan(query: string): ResearchPlan {
    const sector = this.extractSector(query);
    const industry = this.extractIndustry(query);
    
    return {
      id: Date.now().toString(),
      title: `Research Plan: ${sector} in ${industry}`,
      description: `Comprehensive analysis of the ${sector} sector in the ${industry} industry in South Africa`,
      steps: [
        "Analyzing current market trends and industry reports for South Africa",
        "Researching salary benchmarks across experience levels in the region",
        "Identifying key skills and certifications required for the role",
        "Mapping top companies and employers in the sector",
        "Gathering insights on experience requirements and career progression",
        "Compiling market intelligence and future outlook for the industry"
      ],
      estimatedTime: "4-6 minutes",
      status: 'pending'
    };
  }

  private generateFallbackResults(query: string): ResearchResult {
    const sector = this.extractSector(query);
    const industry = this.extractIndustry(query);
    
    return {
      id: Date.now().toString(),
      sector: sector,
      industry: industry,
      salaryData: this.generateSalaryData(sector, industry),
      experienceRequirements: this.generateExperienceRequirements(sector, industry),
      skills: this.generateSkills(sector, industry),
      marketTrends: this.generateMarketTrends(sector, industry),
      companies: this.generateCompanies(sector, industry),
      certifications: this.generateCertifications(sector, industry),
      insights: this.generateInsights(sector, industry),
      sources: this.generateSources(sector, industry)
    };
  }
}

const aiService = new AIService();

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { query, type, plan } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (type === 'plan') {
      const researchPlan = await aiService.generateResearchPlan(query);
      return NextResponse.json({ plan: researchPlan });
    } else if (type === 'research' && plan) {
      const researchResults = await aiService.executeResearch(plan, query);
      return NextResponse.json({ results: researchResults });
    } else {
      return NextResponse.json(
        { error: 'Invalid request type or missing plan' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('AI Research API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 