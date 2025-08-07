'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createFreeTrialSession() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to start a free trial.')
  }

  // Generate a unique identifier for the transaction
  const m_payment_id = `TRIAL-${Date.now()}`

  // Create payment data for tokenization (capture card without charging)
  const paymentData: { [key: string]: any } = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/recruiter/trial-success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/recruiter/free-trial`,
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/webhook`,
    name_first: user.user_metadata?.full_name?.split(' ')[0] || 'Test',
    name_last: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'User',
    email_address: user.email,
    m_payment_id: m_payment_id,
    amount: "0.00", // R0 - no charge, just capture card details
    item_name: "ApplyForMe Professional - Free Trial",
    item_description: "30-day free trial - card details captured for future billing",
    custom_str1: user.id, // User ID for webhook
    custom_str2: 'free_trial',
    custom_str3: 'professional',
    // Tokenization fields (capture card without charging)
    subscription_type: '2', // 2 for tokenization payment
  }
  
  // Debug logging
  console.log('Payment Data:', paymentData);
  
  // Create PayFast URL using the same method as the working billing implementation
  const baseUrl = 'https://sandbox.payfast.co.za/eng/process'
  const queryString = new URLSearchParams(paymentData).toString()
  const redirectUrl = `${baseUrl}?${queryString}`
  console.log('Redirect URL:', redirectUrl);
  
  redirect(redirectUrl)
} 