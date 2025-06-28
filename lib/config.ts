export const config = {
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    apiKey: process.env.GOOGLE_CLOUD_API_KEY || '',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
  }
} 