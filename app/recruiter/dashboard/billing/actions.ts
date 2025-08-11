'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
// In a real app, you would use the payfast-sdk or similar
// For this example, we'll simulate generating the redirect URL

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
}

const products: Record<string, Product> = {
    premium: { id: 'premium', name: 'Premium Plan', price: 499, description: 'Monthly subscription' },
    credits_5: { id: 'credits_5', name: '5 Job Credits', price: 150, description: 'One-time purchase' },
    credits_10: { id: 'credits_10', name: '10 Job Credits', price: 250, description: 'One-time purchase' },
    credits_25: { id: 'credits_25', name: '25 Job Credits', price: 500, description: 'One-time purchase' },
};

function getPayFastRedirectUrl(data: Record<string, any>): string {
    const baseUrl = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';
    const queryString = new URLSearchParams(data).toString();
    return `${baseUrl}?${queryString}`;
}

export async function createCheckoutSession(productId: string, amount?: number) {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin') || '';
    const normalizeBaseUrl = (url?: string | null) => {
        let base = (url || '').trim();
        if (!base) return '';
        if (!/^https?:\/\//i.test(base)) {
            base = `https://${base}`;
        }
        return base.replace(/\/$/, '');
    };
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
    const appUrl = normalizeBaseUrl(envUrl) || normalizeBaseUrl(origin);
    if (!appUrl || !/^https:\/\//i.test(appUrl)) {
        throw new Error('Invalid site URL configuration for PayFast. Ensure NEXT_PUBLIC_SITE_URL is an absolute https URL.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to make a purchase.' };
    }

    const productKey = amount ? `${productId}_${amount}` : `${productId}`;
    const product = products[productKey];

    if (!product) {
        return { error: 'Invalid product selected.' };
    }

    // Generate a unique identifier for the transaction
    const m_payment_id = `TXN-${Date.now()}`;

    const paymentData: { [key: string]: any } = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID!,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
        return_url: `${appUrl}/recruiter/dashboard/billing?status=success`,
        cancel_url: `${appUrl}/recruiter/dashboard/billing?status=canceled`,
        notify_url: `${appUrl}/api/payfast/webhook`,
        m_payment_id: m_payment_id,
        amount: product.price.toFixed(2),
        item_name: product.name,
        item_description: product.description,
        custom_str1: user.id, // Pass user ID to webhook
        custom_str2: product.id, // Pass product ID to webhook
        custom_int1: amount || 0, // Pass credit amount
    };

    // --- Add subscription parameters if it's a recurring plan ---
    if (productId === 'premium') {
        paymentData.subscription_type = '1'; // 1 for new subscription
        paymentData.frequency = '3'; // 3 = Monthly
        paymentData.cycles = '0'; // 0 = Indefinite
    }

    // In a real app, you would also save the transaction details to your DB here
    // with a 'pending' status.

    const redirectUrl = getPayFastRedirectUrl(paymentData);
    
    redirect(redirectUrl);
}

export async function cancelSubscription() {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('You must be logged in to manage your subscription.');
    }

    const { data: recruiter, error: recruiterError } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (recruiterError || !recruiter) {
        throw new Error('Could not find your recruiter profile.');
    }

    // In a real app, you would use the subscription token to call the PayFast API
    // and request cancellation. For this simulation, we'll just update our DB.

    const { data: subscription, error: updateError } = await supabase
        .from('recruiter_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('recruiter_id', recruiter.id)
        .eq('status', 'active')
        .select()
        .single();
    
    if (updateError || !subscription) {
        throw new Error('Could not find an active subscription to cancel or failed to update.');
    }

    return { success: true, cancelled_at: subscription.updated_at };
} 