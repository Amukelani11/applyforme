#!/usr/bin/env node

/**
 * Test script for Resend email functionality
 * Run with: node scripts/test-email.js
 */

const fetch = require('node-fetch');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   - TEST_EMAIL (optional, defaults to test@example.com)');
  process.exit(1);
}

async function testEmailFunction() {
  console.log('🧪 Testing Resend email functionality...\n');

  const testEmail = {
    to: TEST_EMAIL,
    subject: '🧪 Test Email from ApplyForMe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Test Email</h1>
            <p>Resend email functionality is working!</p>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p>This is a test email to verify that your Resend email setup is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>✅ Resend API configured</li>
              <li>✅ Edge Function deployed</li>
              <li>✅ Email templates ready</li>
              <li>✅ Notification system active</li>
            </ul>
            <p>If you received this email, your email notification system is ready to go!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ApplyForMe Team</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Test Email from ApplyForMe

Hello!

This is a test email to verify that your Resend email setup is working correctly.

Test Details:
✅ Resend API configured
✅ Edge Function deployed
✅ Email templates ready
✅ Notification system active

If you received this email, your email notification system is ready to go!

Best regards,
The ApplyForMe Team

Sent at: ${new Date().toLocaleString()}
    `
  };

  try {
    console.log('📧 Sending test email...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmail),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      console.log(`📬 Check your email at: ${TEST_EMAIL}`);
    } else {
      console.error('❌ Failed to send email:');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
  }
}

async function checkEmailLogs() {
  console.log('\n📋 Checking email logs...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/email_logs?select=*&order=sent_at.desc&limit=5`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (response.ok) {
      const logs = await response.json();
      console.log('📊 Recent email logs:');
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.type} - ${log.recipient_email} - ${log.status} - ${new Date(log.sent_at).toLocaleString()}`);
      });
    } else {
      console.log('ℹ️  No email logs found (this is normal if no emails have been sent yet)');
    }
  } catch (error) {
    console.log('ℹ️  Could not fetch email logs (table might not exist yet)');
  }
}

async function main() {
  console.log('🚀 ApplyForMe Email System Test\n');
  console.log('Configuration:');
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Test Email: ${TEST_EMAIL}\n`);

  await testEmailFunction();
  await checkEmailLogs();

  console.log('\n🎉 Test completed!');
  console.log('\nNext steps:');
  console.log('1. Check your email inbox for the test email');
  console.log('2. If received, your Resend setup is working!');
  console.log('3. If not received, check the error messages above');
  console.log('4. Verify your RESEND_API_KEY is set correctly');
  console.log('5. Check your Resend dashboard for delivery status');
}

// Run the test
main().catch(console.error); 