import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { EmailService } from '@/lib/email-service';

function createSignature(data: Record<string, any>, passphrase?: string): string {
  // Create parameter string
  let pfOutput = '';
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (key !== 'signature') {
        pfOutput += `${key}=${encodeURIComponent(data[key]?.trim()).replace(/%20/g, '+')}&`;
        }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
    if (passphrase) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }
  return crypto.createHash('md5').update(getString).digest('hex');
}

function validatePayFastRequest(formData: FormData, passphrase?: string): boolean {
    const body = Object.fromEntries(formData.entries());
    const receivedSignature = body.signature;
    if (!receivedSignature) return false;

    const calculatedSignature = createSignature(body, passphrase);
    
    console.log('Received Signature:  ', receivedSignature);
    console.log('Calculated Signature:', calculatedSignature);

    return receivedSignature === calculatedSignature;
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  
  console.log('PayFast webhook received');
  
  try {
    const formData = await req.formData();
    console.log('Form data received:', Object.fromEntries(formData.entries()));

    // --- Security Check ---
    if (!validatePayFastRequest(formData, process.env.PAYFAST_PASSPHRASE)) {
    console.warn('PayFast signature validation failed.');
      return new NextResponse('Invalid PayFast signature', { status: 400 });
  }

    const body = Object.fromEntries(formData.entries());
  
  // --- Process only successful payments ---
  if (body.payment_status !== 'COMPLETE') {
    return new NextResponse('Ignoring non-complete payment', { status: 200 });
  }

    // --- Type-safe variable extraction ---
    const userId = String(body.custom_str1 || '');
    const productId = String(body.custom_str2 || '');
    const transactionId = String(body.m_payment_id || '');
    const amount = String(body.amount_gross || '0');
    const creditsAmount = parseInt(String(body.custom_int1 || '0'), 10);

  if (!userId) {
      throw new Error('User ID not found in webhook payload');
  }

    // --- Get Recruiter Info ---
    const { data: recruiter, error: recruiterError } = await supabase
        .from('recruiters')
    .select('id, full_name, email')
        .eq('user_id', userId)
        .single();
    
    if (recruiterError) {
      console.error('Supabase error fetching recruiter:', recruiterError);
      throw new Error(`Database error fetching recruiter. Check server logs for details.`);
    }

    if(!recruiter) {
        throw new Error(`Recruiter not found for user_id: ${userId}`);
    }

    // --- Handle Product Fulfillment ---
    if (productId === 'premium') {
      console.log(`Processing premium subscription for recruiter: ${recruiter.id}`);
      
      const subscriptionData = {
        plan_id: 'premium',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        payfast_token: String(body.token || ''),
        payfast_subscription_id: String(body.pf_payment_id || ''), 
        updated_at: new Date().toISOString(),
        recruiter_id: recruiter.id,
      };
    } else if (productId === 'free_trial') {
      console.log(`Processing free trial for user: ${userId}`);
      console.log('Webhook data received:', body);
      
      // First, ensure the user record exists in the users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userCheckError && userCheckError.code !== 'PGRST116') {
        console.error('Error checking user:', userCheckError);
        throw new Error('Failed to check user');
      }

      if (!existingUser) {
        // User doesn't exist in users table, insert them
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            subscription_plan: 'professional',
            subscription_status: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            payfast_token: String(body.token || ''),
            payfast_subscription_id: String(body.pf_payment_id || ''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting user:', insertError);
          throw new Error('Failed to create user record');
        }
      } else {
        // User exists, update their subscription status
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_plan: 'professional',
            subscription_status: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            payfast_token: String(body.token || ''),
            payfast_subscription_id: String(body.pf_payment_id || ''),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user trial status:', updateError);
          throw new Error('Failed to update trial status');
        }
      }

      // Send welcome email for free trial
      try {
        const emailService = new EmailService();
        await emailService.sendEmail({
          to: String(body.email_address || ''),
          subject: 'Welcome to Your ApplyForMe Free Trial!',
          html: `
            <h2>Welcome to ApplyForMe!</h2>
            <p>Your 30-day free trial has been activated successfully.</p>
            <p><strong>What's included in your trial:</strong></p>
            <ul>
              <li>Unlimited job postings</li>
              <li>Advanced AI screening</li>
              <li>Talent pool management</li>
              <li>Up to 3 team members</li>
              <li>Priority support</li>
            </ul>
            <p>Your trial ends on ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
            <p>You can cancel anytime before the trial ends to avoid charges.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/recruiter/dashboard">Start using ApplyForMe now</a></p>
          `
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }

      // Check if a subscription already exists
      if (!recruiter) {
        throw new Error('Recruiter not found');
      }

      const { data: existingSubscription, error: selectError } = await supabase
        .from('recruiter_subscriptions')
        .select('id')
        .eq('recruiter_id', recruiter.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw new Error(`Database error checking for subscription: ${selectError.message}`);
      }

      // Define subscription data
      const subscriptionData = {
        recruiter_id: recruiter.id,
        plan_name: 'Premium Plan',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: parseFloat(amount),
        transaction_id: transactionId
      };

      const emailPayload = {
        planName: 'Premium Plan',
        amount: amount,
        nextBillingDate: subscriptionData.current_period_end,
        transactionId: transactionId,
      };
      
      if (existingSubscription) {
        // Update existing subscription
        console.log(`Updating existing subscription for recruiter: ${recruiter.id}`);
        const { error: updateError } = await supabase
          .from('recruiter_subscriptions')
          .update(subscriptionData)
          .eq('id', existingSubscription?.id);

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }
        await EmailService.sendSubscriptionRenewal(emailPayload, { name: recruiter.full_name, email: recruiter.email });
      } else {
        // Insert new subscription
        console.log(`Inserting new subscription for recruiter: ${recruiter.id}`);
        const { error: insertError } = await supabase
          .from('recruiter_subscriptions')
          .insert(subscriptionData);

        if (insertError) {
          throw new Error(`Failed to create subscription: ${insertError.message}`);
        }
        await EmailService.sendSubscriptionConfirmation(emailPayload, { name: recruiter.full_name, email: recruiter.email });
      }
    } else if (productId === 'credits') {
      if (isNaN(creditsAmount) || creditsAmount <= 0) {
        throw new Error('Invalid credits amount');
      }

      console.log(`Attempting to add ${creditsAmount} credits for recruiter: ${recruiter.id}`);
      const { error: rpcError } = await supabase.rpc('add_job_credits', {
          p_recruiter_id: recruiter.id,
        p_credits_to_add: creditsAmount,
      });

      if (rpcError) {
        console.error(`RPC Error adding credits for recruiter ${recruiter.id}:`, rpcError);
        throw new Error(`Failed to add credits: ${rpcError.message}`);
      }
      
      console.log(`Successfully added ${creditsAmount} credits for recruiter: ${recruiter.id}`);
    }

    // --- Log Successful Transaction ---
    console.log(`Logging successful transaction for recruiter_id: ${recruiter.id}`);
    await supabase.from('transaction_logs').insert({
        recruiter_id: recruiter.id,
      transaction_id: transactionId,
      product_id: productId,
      amount: parseFloat(amount),
      status: 'success',
    });

    return new NextResponse('Webhook processed successfully', { status: 200 });

  } catch (error) {
    console.error('Error processing PayFast webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 500 });
  }
} 