# Google AI API Setup Guide

## 🔑 Setting up Google AI API for CV Analysis

### 1. Get a Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Add to Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# Google AI API Key for CV Analysis
GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Test the Setup

Run the test script to verify your API key works:

```bash
node test-google-ai.js
```

### 4. Features Enabled

Once configured, the CV analysis will:
- ✅ Extract text from PDF, DOC, DOCX files
- ✅ Analyze CV content with AI
- ✅ Extract personal information
- ✅ Parse work experience and education
- ✅ Identify skills (technical and soft)
- ✅ Suggest values for custom fields
- ✅ Auto-fill application forms

### 5. Fallback Mode

If the API key is not configured, the system will:
- ✅ Still work with mock data for testing
- ✅ Show clear error messages
- ✅ Allow form autofill with sample data
- ✅ Provide instructions for setup

### 6. Troubleshooting

**API Key Issues:**
- Ensure the key is valid and active
- Check that you have billing enabled on your Google Cloud account
- Verify the key has access to Gemini Pro and Gemini Pro Vision models

**File Upload Issues:**
- Check Supabase storage permissions
- Verify file format is supported (PDF, DOC, DOCX, TXT)
- Ensure file size is reasonable (< 10MB)

**Error Messages:**
- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: API key doesn't have proper permissions
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side issue, try again later

### 7. Cost Considerations

- Google AI API has usage-based pricing
- Text extraction and analysis are charged per request
- Consider setting up usage limits in Google Cloud Console
- Monitor usage in the Google AI Studio dashboard 