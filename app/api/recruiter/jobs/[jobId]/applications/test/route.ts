import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    return NextResponse.json({ 
      message: 'Test route working', 
      jobId: jobId 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Test route error' }, { status: 500 });
  }
} 