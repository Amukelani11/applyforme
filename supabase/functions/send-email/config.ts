// Resend configuration for the send-email Edge Function
export const RESEND_CONFIG = {
  // Default sender email - update this to your verified domain
  DEFAULT_FROM: "ApplyForMe <noreply@applyforme.com>",
  
  // Reply-to email for customer support
  REPLY_TO: "support@applyforme.com",
  
  // Email templates configuration
  TEMPLATES: {
    JOB_POSTED: {
      subject: "Job Posted Successfully",
      category: "job-notifications"
    },
    APPLICATION_ALERT: {
      subject: "New Application Received",
      category: "application-alerts"
    },
    JOB_EXPIRY_REMINDER: {
      subject: "Job Expiring Soon",
      category: "reminders"
    },
    JOB_EXPIRED: {
      subject: "Job Has Expired",
      category: "reminders"
    },
    WEEKLY_REPORT: {
      subject: "Weekly Performance Report",
      category: "reports"
    }
  }
}

// Environment variables required
export const REQUIRED_ENV_VARS = [
  "RESEND_API_KEY"
]

// Validate environment variables
export function validateEnvironment(): void {
  const missing = REQUIRED_ENV_VARS.filter(varName => !Deno.env.get(varName))
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
} 