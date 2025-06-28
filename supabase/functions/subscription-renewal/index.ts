import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const PAYFAST_MERCHANT_ID = Deno.env.get('PAYFAST_MERCHANT_ID');
const PAYFAST_MERCHANT_KEY = Deno.env.get('PAYFAST_MERCHANT_KEY');
const PAYFAST_API_URL = 'https://api.payfast.co.za/subscriptions/';

interface Subscription {
  id: string;
  recruiter_id: string;
  payfast_token: string;
  current_period_end: string;
  recruiters: {
    email: string;
  };
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();

    // 1. Fetch all active subscriptions due for renewal
    const { data: subscriptions, error } = await supabase
      .from('recruiter_subscriptions')
      .select(`
        id,
        recruiter_id,
        payfast_token,
        current_period_end,
        recruiters ( email )
      `)
      .eq('status', 'active')
      .lt('current_period_end', now);

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions to process.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Process each due subscription
    for (const sub of subscriptions) {
      // 3. Trigger a tokenized payment with PayFast
      const chargeUrl = `${PAYFAST_API_URL}${sub.payfast_token}/charge`;
      const chargePayload = {
        amount: 49900, // Amount in cents (e.g., R499.00)
        item_name: 'ApplyForMe Premium Subscription Renewal',
      };
      
      const chargeResponse = await fetch(chargeUrl, {
        method: 'POST',
        headers: {
          'merchant-id': PAYFAST_MERCHANT_ID,
          'merchant-key': PAYFAST_MERCHANT_KEY,
          'Content-Type': 'application/json',
          'version': 'v1',
        },
        body: JSON.stringify(chargePayload),
      });

      const chargeResult = await chargeResponse.json();

      if (chargeResult.data.status === 'success') {
        // 4. Payment successful: Update subscription period
        const currentPeriodEnd = new Date(sub.current_period_end);
        const nextPeriodEnd = new Date(currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1));

        await supabase
          .from('recruiter_subscriptions')
          .update({ current_period_end: nextPeriodEnd.toISOString(), status: 'active' })
          .eq('id', sub.id);

        // Optional: Send success email
        
      } else {
        // 5. Payment failed: Update status and notify user
        await supabase
          .from('recruiter_subscriptions')
          .update({ status: 'past_due' })
          .eq('id', sub.id);
          
        // Optional: Send failure email via Resend
      }
    }

    return new Response(JSON.stringify({ message: 'Subscription processing complete.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 });
  }
}); 