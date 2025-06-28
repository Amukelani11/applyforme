import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// This function is a simplified version. In production, you'd want a more robust
// validation library and better error handling.
function validatePayFastRequest(body: Record<string, any>, passphrase?: string): boolean {
    const fields = [
        'm_payment_id', 'pf_payment_id', 'payment_status', 'item_name', 'item_description',
        'amount_gross', 'amount_fee', 'amount_net', 'custom_str1', 'custom_str2',
        'custom_str3', 'custom_str4', 'custom_str5', 'custom_int1', 'custom_int2',
        'custom_int3', 'custom_int4', 'custom_int5', 'name_first', 'name_last',
        'email_address', 'merchant_id'
    ];

    let signatureString = '';
    fields.forEach(field => {
        if (body[field] !== undefined && body[field] !== '') {
            signatureString += `${field}=${encodeURIComponent(body[field].trim()).replace(/%20/g, '+')}&`;
        }
    });

    // Remove last '&'
    signatureString = signatureString.slice(0, -1);

    if (passphrase) {
        signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }
    
    const generatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

    return generatedSignature === body.signature;
}


export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new NextResponse('Invalid JSON body', { status: 400 });
  }

  console.log('PayFast Webhook Received:', body);

  // --- Security: Verify the request is from PayFast ---
  const isValid = validatePayFastRequest(body, process.env.PAYFAST_PASSPHRASE);
  if (!isValid) {
    console.warn('PayFast signature validation failed.');
    return new NextResponse('Signature validation failed', { status: 400 });
  }
  
  // --- Process only successful payments ---
  if (body.payment_status !== 'COMPLETE') {
    return new NextResponse('Ignoring non-complete payment', { status: 200 });
  }

  const userId = body.custom_str1;
  const productId = body.custom_str2;
  const creditAmount = parseInt(body.custom_int1, 10);

  if (!userId) {
    return new NextResponse('User ID missing', { status: 400 });
  }

  try {
    // --- Get the recruiter's ID from their auth user ID ---
    const { data: recruiter, error: recruiterError } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', userId)
        .single();
    
    if(recruiterError || !recruiter) {
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
        payfast_token: body.token,
        payfast_subscription_id: body.pf_payment_id,
        updated_at: new Date().toISOString(),
      };

      // Check if a subscription already exists
      const { data: existingSubscription, error: selectError } = await supabase
        .from('recruiter_subscriptions')
        .select('id')
        .eq('recruiter_id', recruiter.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // Ignore 'not found' error
        console.error('Error checking for existing subscription:', selectError);
        throw selectError;
      }
      
      if (existingSubscription) {
        // Update existing subscription
        console.log(`Updating existing subscription for recruiter: ${recruiter.id}`);
        const { error: updateError } = await supabase
          .from('recruiter_subscriptions')
          .update(subscriptionData)
          .eq('recruiter_id', recruiter.id);
        if (updateError) throw updateError;
      } else {
        // Insert new subscription
        console.log(`Inserting new subscription for recruiter: ${recruiter.id}`);
        const { error: insertError } = await supabase
          .from('recruiter_subscriptions')
          .insert({ ...subscriptionData, recruiter_id: recruiter.id });
        if (insertError) throw insertError;
      }

    } else if (productId.startsWith('credits_')) {
      // --- Add Job Credits ---
      if (isNaN(creditAmount) || creditAmount <= 0) {
        throw new Error('Invalid credit amount received from webhook.');
      }
      
      const { error: creditsError } = await supabase.rpc('add_job_credits', {
          p_recruiter_id: recruiter.id,
          p_credits_to_add: creditAmount,
      });

      if (creditsError) throw creditsError;
      
      console.log(`Added ${creditAmount} credits to recruiter ${recruiter.id}.`);
    }

    // --- Log the transaction ---
    await supabase.from('payfast_logs').insert({
        pf_payment_id: body.pf_payment_id,
        payment_status: body.payment_status,
        recruiter_id: recruiter.id,
        payload: body,
    });

    return new NextResponse('Webhook processed successfully', { status: 200 });

  } catch (error: any) {
    console.error('Error processing PayFast webhook:', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
} 