import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';
import { createCookieHandler } from '@/lib/supabase/cookie-handler';

export async function POST(request: NextRequest) {
  const { userId, plan } = await request.json();

  if (!userId || !plan) {
    return NextResponse.json({ error: 'Missing userId or plan' }, { status: 400 });
  }

  if (plan !== 'basic' && plan !== 'pro') {
    return NextResponse.json({ message: 'No action needed for this plan' });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: createCookieHandler(),
    }
  );
  
  const { data, error } = await supabase
    .from('users')
    .update({ subscription_status: 'free' })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user with free plan:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }

  return NextResponse.json({ message: 'User updated with free plan' });
}