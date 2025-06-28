import { config } from './config'
import { supabase } from './supabaseClient'

// Initialize Google Cloud client with API key
const GOOGLE_CLOUD_API_KEY = config.googleCloud.apiKey
const GOOGLE_CLOUD_PROJECT_ID = config.googleCloud.projectId
const GOOGLE_CLOUD_LOCATION = config.googleCloud.location

// Document AI processor ID - you'll need to create this in Google Cloud Console
const DOCUMENT_PROCESSOR_ID = 'your-processor-id'

// Vertex AI model name
const MODEL_NAME = 'gemini-pro'

interface AnalysisResult {
  text: string
  analysis: string
}

interface ImprovementResult {
  improvedText: string
  improvements: string[]
  improvedDocx: string
}

// CV Analysis and Improvement Functions
export async function analyzeCV(fileData: string, fileName: string, fileType: string): Promise<AnalysisResult> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-cv', {
      body: { 
        file: fileData,
        fileName,
        fileType
      }
    })

    if (error) {
      throw new Error(`Failed to analyze CV: ${error.message}`)
    }

    return {
      text: data.text,
      analysis: data.analysis
    }
  } catch (error: any) {
    console.error('Error analyzing CV:', error)
    throw new Error(`Failed to analyze CV: ${error.message}`)
  }
}

export async function improveCV(originalText: string, analysis: string): Promise<ImprovementResult> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-cv', {
      body: { 
        text: `Based on this analysis, provide specific improvements for the CV:

${analysis}

Please provide the improved version of the CV with all suggested changes implemented.` 
      }
    })

    if (error) {
      throw new Error(`Failed to improve CV: ${error.message}`)
    }

    const improvedText = data.improvedText
    const improvedDocx = data.improvedDocx

    // Extract improvements made
    const improvementsResponse = await fetch(
      `https://${GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/publishers/google/models/${MODEL_NAME}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GOOGLE_CLOUD_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `List the specific improvements made to this CV in bullet points:

${improvedText}`
            }]
          }]
        })
      }
    )

    if (!improvementsResponse.ok) {
      const errorData = await improvementsResponse.json().catch(() => null)
      throw new Error(`Vertex AI API error: ${improvementsResponse.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`)
    }

    const improvementsResult = await improvementsResponse.json()
    const improvements = improvementsResult.candidates[0].content.parts[0].text
      .split('\n')
      .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))

    return {
      improvedText,
      improvements,
      improvedDocx
    }
  } catch (error) {
    console.error('Error improving CV:', error)
    throw error
  }
}

// Helper function to convert text to PDF
export async function textToPDF(text: string, outputPath: string): Promise<Blob> {
  try {
    // For now, we'll just return the text as a PDF blob
    // In a production environment, you would want to use a proper PDF generation library
    const blob = new Blob([text], { type: 'application/pdf' })
    return blob
  } catch (error) {
    console.error('Error converting text to PDF:', error)
    throw error
  }
} 