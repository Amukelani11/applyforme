import { createClient } from '@supabase/supabase-js'
import { 
  EmailTemplate, 
  JobPostingData, 
  ApplicationData, 
  WeeklyReportData,
  SubscriptionData,
  NewMessageData,
  TeamMessageData,
  getJobPostedTemplate,
  getApplicationAlertTemplate,
  getJobExpiryReminderTemplate,
  getJobExpiredTemplate,
  getWeeklyReportTemplate,
  getCVImprovementTemplate,
  getSubscriptionConfirmationTemplate,
  getSubscriptionRenewalTemplate,
  getNewMessageTemplate,
  getTeamMessageTemplate
} from './email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface EmailRecipient {
  email: string
  name: string
}

export class EmailService {
  // Send job posted confirmation
  static async sendJobPostedNotification(
    jobData: JobPostingData, 
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getJobPostedTemplate(jobData, recipient.name)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending job posted email:', error)
        return false
      }

      // Log the email sent
      await this.logEmailSent('job_posted', recipient.email, jobData.id)
      return true
    } catch (error) {
      console.error('Error sending job posted notification:', error)
      return false
    }
  }

  // Send application alert
  static async sendApplicationAlert(
    applicationData: ApplicationData,
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getApplicationAlertTemplate(applicationData, recipient.name)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending application alert email:', error)
        return false
      }

      // Log the email sent
      await this.logEmailSent('application_alert', recipient.email, applicationData.id)
      return true
    } catch (error) {
      console.error('Error sending application alert:', error)
      return false
    }
  }

  // Send job expiry reminder
  static async sendJobExpiryReminder(
    jobData: JobPostingData,
    recipient: EmailRecipient,
    daysLeft: number
  ): Promise<boolean> {
    try {
      const template = getJobExpiryReminderTemplate(jobData, recipient.name, daysLeft)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending job expiry reminder email:', error)
        return false
      }

      // Log the email sent
      await this.logEmailSent('job_expiry_reminder', recipient.email, jobData.id)
      return true
    } catch (error) {
      console.error('Error sending job expiry reminder:', error)
      return false
    }
  }

  // Send job expired notification
  static async sendJobExpiredNotification(
    jobData: JobPostingData,
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getJobExpiredTemplate(jobData, recipient.name)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending job expired email:', error)
        return false
      }

      // Log the email sent
      await this.logEmailSent('job_expired', recipient.email, jobData.id)
      return true
    } catch (error) {
      console.error('Error sending job expired notification:', error)
      return false
    }
  }

  // Send weekly report
  static async sendWeeklyReport(
    reportData: WeeklyReportData,
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getWeeklyReportTemplate(reportData, recipient.name)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending weekly report email:', error)
        return false
      }

      // Log the email sent
      await this.logEmailSent('weekly_report', recipient.email)
      return true
    } catch (error) {
      console.error('Error sending weekly report:', error)
      return false
    }
  }

  // Send new message notification
  static async sendNewMessageNotification(
    messageData: NewMessageData,
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getNewMessageTemplate(messageData, recipient.name);
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      });

      if (error) {
        console.error('Error sending new message email:', error);
        return false;
      }

      // Log the email sent
      await this.logEmailSent('new_message', recipient.email);
      return true;
    } catch (error) {
      console.error('Error sending new message notification:', error);
      return false;
    }
  }

  // Send CV improvement notification
  static async sendCVImprovementNotification(
    userEmail: string,
    userName: string,
    improvements: string[],
    cvDownloadUrl: string
  ): Promise<boolean> {
    try {
      const template = getCVImprovementTemplate(userName, improvements, cvDownloadUrl)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending CV improvement email:', error)
        return false
      }

      // Log the email sent
      await this.logEmailSent('cv_improvement', userEmail)
      return true
    } catch (error) {
      console.error('Error sending CV improvement notification:', error)
      return false
    }
  }

  // Send Subscription Confirmation
  static async sendSubscriptionConfirmation(
    subscriptionData: SubscriptionData,
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getSubscriptionConfirmationTemplate(recipient.name, subscriptionData)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending subscription confirmation email:', error)
        return false
      }

      await this.logEmailSent('subscription_confirmation', recipient.email)
      return true
    } catch (error) {
      console.error('Error sending subscription confirmation:', error)
      return false
    }
  }

  // Send Subscription Renewal
  static async sendSubscriptionRenewal(
    subscriptionData: SubscriptionData,
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getSubscriptionRenewalTemplate(recipient.name, subscriptionData)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending subscription renewal email:', error)
        return false
      }

      await this.logEmailSent('subscription_renewal', recipient.email)
      return true
    } catch (error) {
      console.error('Error sending subscription renewal:', error)
      return false
    }
  }

  // Send team message notification
  static async sendTeamMessageNotification(
    messageData: TeamMessageData,
    recipient: EmailRecipient
  ): Promise<boolean> {
    try {
      const template = getTeamMessageTemplate(messageData, recipient.name)
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      })

      if (error) {
        console.error('Error sending team message email:', error)
        return false
      }

      // Log the email sent
      await this.logEmailSent('team_message', recipient.email, parseInt(messageData.applicationId) || undefined)
      return true
    } catch (error) {
      console.error('Error sending team message notification:', error)
      return false
    }
  }

  // Log email sent for tracking
  private static async logEmailSent(
    type: string, 
    recipientEmail: string, 
    relatedId?: number
  ): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .insert({
          type,
          recipient_email: recipientEmail,
          related_id: relatedId,
          sent_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging email:', error)
    }
  }

  // Check if user has notifications enabled
  static async shouldSendNotification(
    userId: string, 
    notificationType: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('recruiter_notifications')
        .select(notificationType)
        .eq('recruiter_id', userId)
        .single()

      if (error || !data) {
        return true // Default to true if no settings found
      }

      return (data as any)[notificationType] as boolean
    } catch (error) {
      console.error('Error checking notification settings:', error)
      return false // Default to not sending on error
    }
  }

  // Get recruiter email and name
  static async getRecruiterInfo(userId: string): Promise<EmailRecipient | null> {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      const { data: recruiterData, error: recruiterError } = await supabase
        .from('recruiters')
        .select('full_name')
        .eq('user_id', userId)
        .single()

      if (recruiterError && recruiterError.code !== 'PGRST116') throw recruiterError

      return {
        email: userData.email,
        name: recruiterData?.full_name || 'Recruiter'
      }
    } catch (error) {
      console.error('Error getting recruiter info:', error)
      return null
    }
  }

  // Send a custom email
  static async sendCustomEmail(
    recipient: EmailRecipient,
    subject: string,
    htmlBody: string,
    textBody?: string
  ): Promise<boolean> {
    try {
      console.log(`Sending custom email to ${recipient.email} with subject "${subject}"`)
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: subject,
          html: htmlBody,
          text: textBody || htmlBody.replace(/<[^>]*>?/gm, ''), // Basic text version
        },
      })

      if (error) {
        console.error('Error sending custom email:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      // Log the email sent
      await this.logEmailSent('custom_admin_email', recipient.email)
      console.log('Custom email sent successfully.')
      return true
    } catch (error) {
      console.error('Error in sendCustomEmail:', error)
      return false
    }
  }
  
  // Send a generic email with optional attachments
  async sendEmail(params: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
  }): Promise<boolean> {
    try {
      console.log(`Sending email to ${params.to} with subject "${params.subject}"`)
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.to,
          subject: params.subject,
          html: params.html || params.text,
          text: params.text || params.html?.replace(/<[^>]*>/g, ''),
          attachments: params.attachments
        }
      })

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`)
      }

      // Log the email sent
      await EmailService.logEmailSent('custom_email', params.to)
      console.log('Email sent successfully.')
      return true
    } catch (error) {
      console.error('Error in sendEmail:', error)
      return false
    }
  }
} 