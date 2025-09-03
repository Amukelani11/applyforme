# Resend Email Setup Guide

This guide will help you set up Resend for sending email notifications in your Talio platform.

## 1. Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Create a free account
3. Verify your email address

## 2. Get Your API Key

1. Log into your Resend dashboard
2. Go to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name like "Talio Email Service"
5. Copy the API key (starts with `re_`)

## 3. Verify Your Domain (Recommended)

For production use, you should verify your domain:

1. Go to **Domains** in your Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `applyforme.com`)
4. Follow the DNS setup instructions
5. Wait for verification (usually takes a few minutes)

## 4. Set Up Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```env
RESEND_API_KEY=re_your_api_key_here
```

### For Supabase Edge Functions

Set the environment variable in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add environment variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_api_key_here`

### For Production Deployment

Set the environment variable in your hosting platform:

```bash
# Vercel
vercel env add RESEND_API_KEY

# Netlify
netlify env:set RESEND_API_KEY re_your_api_key_here
```

## 5. Deploy the Edge Function

```bash
# Deploy the send-email function
supabase functions deploy send-email

# Or deploy all functions
supabase functions deploy
```

## 6. Test the Email System

### Test Job Posted Notification

1. Create a new job posting as a recruiter
2. Check the email logs in your database
3. Verify the email was sent

### Test Application Alert

1. Apply for a job as a candidate
2. Check if the recruiter receives an email alert

### Manual Testing

You can test the email function directly:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test email.</p>",
    "text": "Test\nThis is a test email."
  }'
```

## 7. Monitor Email Delivery

### In Resend Dashboard

1. Go to **Logs** to see all sent emails
2. Check delivery status and any bounces
3. Monitor your sending reputation

### In Your Application

Check the `email_logs` table in your database:

```sql
-- View recent email logs
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;

-- Check for failed emails
SELECT * FROM email_logs WHERE status = 'failed';

-- View email statistics
SELECT 
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM email_logs 
GROUP BY type;
```

## 8. Email Templates

The system includes these email templates:

- **Job Posted Confirmation**: Sent when a recruiter posts a job
- **Application Alert**: Sent when a candidate applies
- **Job Expiry Reminder**: 7-day and 1-day warnings
- **Job Expired**: When a job posting expires
- **Weekly Report**: Performance summaries

## 9. Customization

### Update Sender Email

Edit `supabase/functions/send-email/config.ts`:

```typescript
export const RESEND_CONFIG = {
  DEFAULT_FROM: "Your Company <noreply@yourdomain.com>",
  REPLY_TO: "support@yourdomain.com",
  // ...
}
```

### Customize Email Templates

Edit `lib/email-templates.ts` to modify the email content and styling.

### Add New Email Types

1. Add the template in `lib/email-templates.ts`
2. Add the trigger in `supabase/migrations/20240320000019_create_notification_triggers.sql`
3. Add processing logic in `lib/notification-processor.ts`

## 10. Troubleshooting

### Common Issues

**"RESEND_API_KEY not configured"**
- Check that the environment variable is set correctly
- Verify the API key is valid

**"Failed to send email"**
- Check Resend dashboard for error details
- Verify your domain is verified (if using custom domain)
- Check email logs in your database

**Emails going to spam**
- Verify your domain with Resend
- Set up proper SPF and DKIM records
- Use a consistent sender address

### Rate Limits

Resend free tier limits:
- 3,000 emails per month
- 100 emails per day

For higher limits, upgrade to a paid plan.

## 11. Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor email logs** for suspicious activity
5. **Set up webhook notifications** for delivery events

## 12. Production Checklist

- [ ] Domain verified with Resend
- [ ] Environment variables configured
- [ ] Edge function deployed
- [ ] Database migrations applied
- [ ] Email templates customized
- [ ] Test emails sent successfully
- [ ] Monitoring set up
- [ ] Rate limits reviewed

## Support

If you encounter issues:

1. Check the Resend documentation: [docs.resend.com](https://docs.resend.com)
2. Review your Supabase Edge Function logs
3. Check the email logs in your database
4. Contact support with specific error messages 