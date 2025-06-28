import { createClient } from '@supabase/supabase-js'
import { 
  EmailTemplate, 
  JobPostingData, 
  ApplicationData, 
  WeeklyReportData,
  getJobPostedTemplate,
  getApplicationAlertTemplate,
  getJobExpiryReminderTemplate,
  getJobExpiredTemplate,
  getWeeklyReportTemplate,
  getCVImprovementTemplate
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
    notificationType: keyof WeeklyReportData
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

      return data[notificationType] as boolean
    } catch (error) {
      console.error('Error checking notification settings:', error)
      return true // Default to true on error
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
} 