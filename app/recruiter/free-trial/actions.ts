'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function createFreeTrialSession() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const normalizeBaseUrl = (url: string | undefined | null) => {
    let base = (url || '').trim()
    if (!base) return ''
    // Fix common malformed schemes like 'https:domain', 'https//domain', 'https:/domain'
    base = base.replace(/^https:\/*/i, 'https://').replace(/^http:\/*/i, 'http://')
    if (!/^https?:\/\//i.test(base)) {
      base = `https://${base}`
    }
    // Remove trailing slashes
    return base.replace(/\/+$/, '')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to start a free trial.')
  }

  // Generate a unique identifier for the transaction
  const m_payment_id = `TRIAL-${Date.now()}`

  // Default: Skip PayFast and grant trial unless explicitly enabled via env
  const payfastEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYFAST === 'true' || process.env.PAYFAST_ENABLED === 'true'
  if (!payfastEnabled) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be logged in to start a free trial.')

    // Ensure user row exists, then set trial status
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          subscription_status: 'trial',
          subscription_plan: 'professional',
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEnd,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } else {
        await supabase.from('users').update({
          subscription_status: 'trial',
          subscription_plan: 'professional',
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEnd,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)
      }
    } catch (e) {
      console.error('Error enabling trial without payment:', e)
    }

    redirect('/recruiter/trial-success')
  }

  // Resolve absolute HTTPS base URL for PayFast required fields (kept for when enabling in future)
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  const siteBase = normalizeBaseUrl(envSiteUrl) || normalizeBaseUrl(origin)
  if (!siteBase || !/^https:\/\//i.test(siteBase)) {
    throw new Error('Invalid site URL configuration for PayFast. Ensure NEXT_PUBLIC_SITE_URL is an absolute https URL.')
  }

  // Create payment data for tokenization (capture card without charging)
  const paymentData: { [key: string]: any } = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${siteBase}/recruiter/trial-success`,
    cancel_url: `${siteBase}/recruiter/free-trial`,
    notify_url: `${siteBase}/api/payfast/webhook`,
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
  
  // Create PayFast URL using environment (supports sandbox/production)
  const baseUrl = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process'
  const queryString = new URLSearchParams(paymentData).toString()
  const redirectUrl = `${baseUrl}?${queryString}`
  console.log('Redirect URL:', redirectUrl);
  
  redirect(redirectUrl)
} 