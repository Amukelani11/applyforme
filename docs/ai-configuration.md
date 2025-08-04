# AI Configuration Guide

This guide explains how to configure the AI-powered market research assistant to use different AI providers.

## Overview

The market research assistant can be configured to use:
- **OpenAI GPT-4** (recommended for production)
- **Anthropic Claude** (alternative option)
- **Simulated AI** (for development/testing)

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

### For OpenAI
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
```

### For Anthropic Claude
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-3-sonnet-20240229
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
```

### For Simulated AI (Development)
```bash
AI_PROVIDER=simulated
# No API key required
```

## Configuration Options

### AI_PROVIDER
- `openai` - Use OpenAI's GPT-4 model
- `anthropic` - Use Anthropic's Claude model
- `simulated` - Use simulated responses (no API calls)

### AI_MODEL
- **OpenAI**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`
- **Anthropic**: `claude-3-sonnet-20240229`, `claude-3-haiku-20240307`, `claude-3-opus-20240229`

### AI_TEMPERATURE
Controls randomness in responses (0.0 to 1.0)
- `0.0` - Most deterministic
- `0.7` - Balanced (recommended)
- `1.0` - Most creative

### AI_MAX_TOKENS
Maximum number of tokens in the response
- `1000` - Short responses
- `2000` - Standard responses (recommended)
- `4000` - Detailed responses

## Getting API Keys

### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

## Testing the Configuration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Market Research Assistant:
   ```
   http://localhost:3000/recruiter/insights
   ```

3. Try a research query like:
   - "Research the supply chain management sector in the mining industry"
   - "Research software development salaries in Cape Town"

4. Check the browser console and server logs for any errors

## Troubleshooting

### API Key Errors
- Ensure your API key is correct and active
- Check that the environment variable is properly set
- Verify the API key has sufficient credits/quota

### Rate Limiting
- If you encounter rate limits, consider:
  - Using a higher-tier API plan
  - Implementing request throttling
  - Switching to simulated mode for development

### Response Parsing Errors
- The system includes fallback mechanisms for parsing errors
- Check the server logs for detailed error information
- Ensure the AI model is configured correctly

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Use a production-grade AI model (GPT-4 or Claude-3)
3. Implement proper error handling and logging
4. Consider implementing request caching for cost optimization
5. Monitor API usage and costs

## Cost Considerations

### OpenAI Pricing (as of 2024)
- GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- GPT-3.5-turbo: ~$0.0015 per 1K input tokens, ~$0.002 per 1K output tokens

### Anthropic Pricing (as of 2024)
- Claude-3-Sonnet: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- Claude-3-Haiku: ~$0.00025 per 1K input tokens, ~$0.00125 per 1K output tokens

### Estimated Costs
- Typical research query: ~500-1000 tokens
- Cost per query: $0.01-$0.05 (depending on model)
- Monthly cost for 1000 queries: $10-$50

## Security Considerations

1. **Never commit API keys to version control**
2. Use environment variables for all sensitive configuration
3. Implement proper API key rotation
4. Monitor API usage for unusual patterns
5. Consider implementing user authentication for API access

## Support

For issues with:
- **OpenAI API**: Contact OpenAI Support
- **Anthropic API**: Contact Anthropic Support
- **Application Issues**: Check the application logs and documentation 