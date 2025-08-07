# Environment Setup Guide

## 🚨 **URGENT: Missing Environment Variables**

Your project is missing the required `.env.local` file, which is causing the AI Market Research Assistant to fail.

## 📋 **Required Environment Variables**

Create a `.env.local` file in your project root with these variables:

```bash
# Google AI API Key (REQUIRED for Market Research)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# PayFast Configuration (for payments)
PAYFAST_MERCHANT_ID=your_payfast_merchant_id
PAYFAST_MERCHANT_KEY=your_payfast_merchant_key
PAYFAST_URL=https://sandbox.payfast.co.za/eng/process

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 🔑 **Getting Your Google AI API Key**

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the generated key**
5. **Add it to `.env.local`** as `GOOGLE_AI_API_KEY=your_key_here`

## 🗄️ **Getting Your Supabase Keys**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Copy these values**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 **Quick Setup Steps**

1. **Create `.env.local`** in your project root
2. **Add the Google AI API key** (most important for Market Research)
3. **Add Supabase keys** (required for database)
4. **Restart your development server**:
   ```bash
   pnpm dev
   ```

## ✅ **Verification**

Run this command to check if your environment is set up correctly:

```bash
node test-market-research.js
```

You should see:
- ✅ GOOGLE_AI_API_KEY: [first 10 characters]...
- ✅ NEXT_PUBLIC_SUPABASE_URL: [first 10 characters]...
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: [first 10 characters]...

## 🎯 **Priority Order**

1. **HIGHEST**: `GOOGLE_AI_API_KEY` - Required for AI Market Research
2. **HIGH**: Supabase keys - Required for database operations
3. **MEDIUM**: PayFast keys - Required for payments
4. **LOW**: Other keys - Optional features

## 🆘 **Need Help?**

If you don't have these API keys:
1. **Google AI**: Free tier available at https://makersuite.google.com/
2. **Supabase**: Free tier available at https://supabase.com/
3. **PayFast**: Sandbox available for testing

## 🎉 **Success**

Once you've added the Google AI API key, the Market Research Assistant will work perfectly! 