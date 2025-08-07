# AI Market Research Assistant Setup

## 🚀 Quick Setup Guide

### 1. Get Google AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Add to Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Google AI API Key for Market Research
GOOGLE_AI_API_KEY=your_actual_api_key_here

# Other required variables (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Access the Tool
The AI Market Research Assistant is now available at:
- **URL**: `/recruiter/market-research`
- **Navigation**: Sidebar → "AI Market Research"
- **Tools Page**: "AI Market Research Assistant" card

## 🎯 Features

### ✅ What's Working Now:
- **Advanced AI-powered research** using Google AI
- **Real web search** and data analysis
- **Comprehensive market insights** (salaries, skills, trends)
- **Document generation** and export
- **Database storage** of research history
- **Two research modes**: Quick (5 searches) and Full (30+ searches)

### 🔧 How It Works:
1. **Query Input**: Enter your research question
2. **AI Search**: Generates multiple search queries
3. **Web Crawling**: Searches real job boards and industry sources
4. **Data Analysis**: AI analyzes and structures the results
5. **Results Display**: Shows salaries, skills, companies, trends
6. **Export Options**: Download as text documents

## 🎨 User Interface

### Research Query Input:
- Clean, minimalistic design
- Multi-line input for detailed queries
- Mode selector (Quick vs Full research)
- Example queries for inspiration

### Processing Screen:
- Engaging loading animation
- Dynamic status updates
- Estimated completion time
- Progress indicators

### Results Display:
- **Executive Summary**: Key findings
- **Talent Supply & Demand**: Market metrics
- **Salary Benchmarks**: Role-specific ranges
- **Key Skills**: In-demand competencies
- **Top Companies**: Hiring organizations
- **Emerging Trends**: Industry insights
- **Sources**: Citations and references

## 💡 Example Queries

Try these research questions:
- "What's the demand for DevOps engineers in Johannesburg?"
- "Software developer salaries in Cape Town 2024"
- "Data science skills and trends in South Africa"
- "Renewable energy job market analysis"
- "Remote work opportunities for South African developers"

## 🚨 Troubleshooting

### If the tool doesn't work:
1. **Check API Key**: Ensure `GOOGLE_AI_API_KEY` is set in `.env.local`
2. **Restart Server**: Run `pnpm dev` after adding the API key
3. **Check Console**: Look for error messages in browser console
4. **Verify Route**: Ensure `/recruiter/market-research` is accessible

### Common Issues:
- **"API Key Required"**: Add your Google AI API key to `.env.local`
- **"Research Failed"**: Check internet connection and API key validity
- **"No Results"**: Try a more specific query or different keywords

## 🎉 Success!

Once configured, you'll have access to:
- **Real-time market research** powered by Google AI
- **Comprehensive industry insights** for South Africa
- **Professional reports** with source citations
- **Exportable results** for presentations and reports

The AI Market Research Assistant is now the most powerful research tool in your recruitment arsenal! 🚀 