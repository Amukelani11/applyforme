import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('\n=== PayFast Log ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== End PayFast Log ===\n');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logging error:', error);
    return NextResponse.json({ success: false, error: 'Failed to log data' }, { status: 500 });
  }
} 