import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as mammoth from 'https://esm.sh/mammoth@1.6.0'
import { encode as base64Encode, decode as base64Decode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { file, fileName, fileType } = await req.json()

    if (!file || !fileName || !fileType) {
      throw new Error('Missing required parameters: file, fileName, and fileType are required')
    }

    // Decode base64 data to Uint8Array
    const fileData = base64Decode(file)

    let text = ''
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ arrayBuffer: fileData })
      text = result.value
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Please upload a DOCX file.`)
    }

    if (!text || text.length < 10) {
      throw new Error('No text content could be extracted from the file or content is too short')
    }

    // Get service account key from environment variable
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set')
    }

    const serviceAccount = JSON.parse(serviceAccountKey)
    const token = await generateJWT(serviceAccount)

    // Call Vertex AI API
    const response = await fetch(
      `https://${serviceAccount.project_id}-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/us-central1/publishers/google/models/text-bison:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: `Analyze this CV and provide a detailed analysis in the following format:

1. Education
- List all educational qualifications
- Evaluate the relevance and quality of education
- Identify any gaps or areas for improvement

2. Work Experience
- List all work experiences
- Evaluate the progression and relevance of roles
- Identify any gaps or areas for improvement

3. Skills
- List all technical and soft skills
- Evaluate the relevance and marketability of skills
- Identify any gaps or areas for improvement

4. Structure and Format
- Evaluate the overall structure and organization
- Comment on formatting and presentation
- Identify any structural issues

5. Areas for Improvement
- List specific areas that need improvement
- Provide actionable recommendations
- Suggest ways to enhance marketability

CV Text:
${text}`
          }],
          parameters: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            topP: 0.8,
            topK: 40
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Vertex AI API error: ${error}`)
    }

    const result = await response.json()
    const analysis = result.predictions[0].content

    return new Response(
      JSON.stringify({
        text,
        analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing file:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function generateJWT(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: serviceAccount.private_key_id
  }

  const encodedHeader = base64Encode(JSON.stringify(header))
  const encodedPayload = base64Encode(JSON.stringify(payload))

  const signatureInput = `${encodedHeader}.${encodedPayload}`
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    await crypto.subtle.importKey(
      'pkcs8',
      base64Decode(serviceAccount.private_key),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(signatureInput)
  )

  const encodedSignature = base64Encode(new Uint8Array(signature))
  const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

// Helper function to create DOCX
async function createDocx(text: string, originalFileName: string): Promise<ArrayBuffer> {
  try {
    const docx = await mammoth.createDocument({
      text: text,
      options: {
        styleMap: [
          "p[style-name='Normal'] => p:fresh",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "b => strong",
          "i => em",
          "u => u",
          "strike => s",
          "table => table",
          "tr => tr",
          "td => td",
        ]
      }
    })

    // Convert the document to a buffer
    const buffer = await docx.save()
    return buffer
  } catch (error) {
    console.error('Error creating DOCX:', error)
    throw new Error(`Failed to create DOCX: ${error.message}`)
  }
} 