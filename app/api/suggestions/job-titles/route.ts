import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Define the handler for POST requests
export async function POST(req: Request) {
  try {
    const { query, existingTitles } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Create a dynamic prompt based on whether we are looking for suggestions or similar titles
    const prompt = existingTitles && existingTitles.length > 0
      ? `Based on the existing job titles: ${existingTitles.join(', ')}, and the current user input "${query}", suggest up to 7 related job titles. The suggestions should be diverse and relevant. Avoid returning any of the already existing titles. Return the suggestions as a simple JSON array of strings.`
      : `Based on the user input "${query}", suggest up to 7 relevant job titles. The user is looking for job roles. The suggestions should be common and recognizable job titles. Return the suggestions as a simple JSON array of strings.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the JSON response from the AI model
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(cleanedText);

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Error generating job title suggestions:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate suggestions', details: errorMessage }, { status: 500 });
  }
} 