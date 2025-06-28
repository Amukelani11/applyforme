import { createClient } from '@supabase/supabase-js'
import { EmailService } from './email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class NotificationProcessor {
  // Process pending email notifications
  static async processPendingNotifications(): Promise<void> {
    try {
      // Get all pending notifications
      const { data: pendingEmails, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('status', 'pending')
        .order('sent_at', { ascending: true })
        .limit(50) // Process in batches

      if (error) {
        console.error('Error fetching pending notifications:', error)
        return
      }

      if (!pendingEmails || pendingEmails.length === 0) {
        console.log('No pending notifications to process')
        return
      }

      console.log(`Processing ${pendingEmails.length} pending notifications`)

      for (const emailLog of pendingEmails) {
        try {
          await this.processNotification(emailLog)
          
          // Mark as sent
          await supabase
            .from('email_logs')
            .update({ status: 'sent' })
            .eq('id', emailLog.id)
            
        } catch (error) {
          console.error(`Error processing notification ${emailLog.id}:`, error)
          
          // Mark as failed
          await supabase
            .from('email_logs')
            .update({ 
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('id', emailLog.id)
        }
      }
    } catch (error) {
      console.error('Error in notification processor:', error)
    }
  }

  // Process individual notification
  private static async processNotification(emailLog: any): Promise<void> {
    const recipient = await EmailService.getRecruiterInfo(emailLog.recipient_email)
    if (!recipient) {
      throw new Error(`Recipient not found: ${emailLog.recipient_email}`)
    }

    switch (emailLog.type) {
      case 'job_posted':
        await this.processJobPostedNotification(emailLog, recipient)
        break
      case 'application_alert':
        await this.processApplicationAlert(emailLog, recipient)
        break
      case 'job_expiry_reminder_7':
        await this.processJobExpiryReminder(emailLog, recipient, 7)
        break
      case 'job_expiry_reminder_1':
        await this.processJobExpiryReminder(emailLog, recipient, 1)
        break
      case 'job_expired':
        await this.processJobExpiredNotification(emailLog, recipient)
        break
      case 'weekly_report':
        await this.processWeeklyReport(emailLog, recipient)
        break
      default:
        throw new Error(`Unknown notification type: ${emailLog.type}`)
    }
  }

  // Process job posted notification
  private static async processJobPostedNotification(emailLog: any, recipient: any): Promise<void> {
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', emailLog.related_id)
      .single()

    if (!jobData) {
      throw new Error(`Job posting not found: ${emailLog.related_id}`)
    }

    // Check if user has notifications enabled
    const shouldSend = await EmailService.shouldSendNotification(recipient.email, 'email_notifications')
    if (!shouldSend) {
      console.log(`Notifications disabled for ${recipient.email}`)
      return
    }

    await EmailService.sendJobPostedNotification(jobData, recipient)
  }

  // Process application alert
  private static async processApplicationAlert(emailLog: any, recipient: any): Promise<void> {
    const { data: applicationData } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        user:users(full_name, email),
        job_posting:job_postings(title, company)
      `)
      .eq('id', emailLog.related_id)
      .single()

    if (!applicationData) {
      throw new Error(`Application not found: ${emailLog.related_id}`)
    }

    // Check if user has application alerts enabled
    const shouldSend = await EmailService.shouldSendNotification(recipient.email, 'application_alerts')
    if (!shouldSend) {
      console.log(`Application alerts disabled for ${recipient.email}`)
      return
    }

    const formattedData = {
      id: applicationData.id,
      candidate_name: applicationData.user.full_name,
      candidate_email: applicationData.user.email,
      job_title: applicationData.job_posting.title,
      company: applicationData.job_posting.company,
      applied_date: applicationData.created_at,
      cv_url: applicationData.cv_url
    }

    await EmailService.sendApplicationAlert(formattedData, recipient)
  }

  // Process job expiry reminder
  private static async processJobExpiryReminder(emailLog: any, recipient: any, daysLeft: number): Promise<void> {
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', emailLog.related_id)
      .single()

    if (!jobData) {
      throw new Error(`Job posting not found: ${emailLog.related_id}`)
    }

    // Check if user has expiry reminders enabled
    const shouldSend = await EmailService.shouldSendNotification(recipient.email, 'job_expiry_reminders')
    if (!shouldSend) {
      console.log(`Expiry reminders disabled for ${recipient.email}`)
      return
    }

    await EmailService.sendJobExpiryReminder(jobData, recipient, daysLeft)
  }

  // Process job expired notification
  private static async processJobExpiredNotification(emailLog: any, recipient: any): Promise<void> {
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', emailLog.related_id)
      .single()

    if (!jobData) {
      throw new Error(`Job posting not found: ${emailLog.related_id}`)
    }

    // Check if user has notifications enabled
    const shouldSend = await EmailService.shouldSendNotification(recipient.email, 'email_notifications')
    if (!shouldSend) {
      console.log(`Notifications disabled for ${recipient.email}`)
      return
    }

    await EmailService.sendJobExpiredNotification(jobData, recipient)
  }

  // Process weekly report
  private static async processWeeklyReport(emailLog: any, recipient: any): Promise<void> {
    // Check if user has weekly reports enabled
    const shouldSend = await EmailService.shouldSendNotification(recipient.email, 'weekly_reports')
    if (!shouldSend) {
      console.log(`Weekly reports disabled for ${recipient.email}`)
      return
    }

    // Get user ID from email
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', recipient.email)
      .single()

    if (!userData) {
      throw new Error(`User not found: ${recipient.email}`)
    }

    // Calculate weekly statistics
    const { data: stats } = await supabase
      .from('job_postings')
      .select(`
        id,
        title,
        candidate_applications(id, created_at)
      `)
      .eq('recruiter_id', userData.id)

    if (!stats) {
      console.log(`No stats found for ${recipient.email}`)
      return
    }

    const totalApplications = stats.reduce((sum, job) => sum + job.candidate_applications.length, 0)
    const newApplications = stats.reduce((sum, job) => 
      sum + job.candidate_applications.filter(app => 
        new Date(app.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length, 0
    )
    const activeJobs = stats.filter(job => job.candidate_applications.length > 0).length
    const expiringJobs = stats.filter(job => {
      const jobDate = new Date(job.created_at)
      const expiryDate = new Date(jobDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      return expiryDate < weekFromNow
    }).length

    const topPerformingJobs = stats
      .map(job => ({
        title: job.title,
        applications: job.candidate_applications.length
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5)

    const reportData = {
      total_applications: totalApplications,
      new_applications: newApplications,
      active_jobs: activeJobs,
      expiring_jobs: expiringJobs,
      top_performing_jobs: topPerformingJobs,
      date_range: `Week of ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`
    }

    await EmailService.sendWeeklyReport(reportData, recipient)
  }

  // Manual trigger for testing
  static async triggerJobPostedNotification(jobId: number): Promise<void> {
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .single()

    if (!jobData) {
      throw new Error(`Job posting not found: ${jobId}`)
    }

    const recipient = await EmailService.getRecruiterInfo(jobData.recruiter_id)
    if (!recipient) {
      throw new Error(`Recruiter not found: ${jobData.recruiter_id}`)
    }

    await EmailService.sendJobPostedNotification(jobData, recipient)
  }

  // Manual trigger for testing
  static async triggerApplicationAlert(applicationId: number): Promise<void> {
    const { data: applicationData } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        user:users(full_name, email),
        job_posting:job_postings(title, company, recruiter_id)
      `)
      .eq('id', applicationId)
      .single()

    if (!applicationData) {
      throw new Error(`Application not found: ${applicationId}`)
    }

    const recipient = await EmailService.getRecruiterInfo(applicationData.job_posting.recruiter_id)
    if (!recipient) {
      throw new Error(`Recruiter not found: ${applicationData.job_posting.recruiter_id}`)
    }

    const formattedData = {
      id: applicationData.id,
      candidate_name: applicationData.user.full_name,
      candidate_email: applicationData.user.email,
      job_title: applicationData.job_posting.title,
      company: applicationData.job_posting.company,
      applied_date: applicationData.created_at,
      cv_url: applicationData.cv_url
    }

    await EmailService.sendApplicationAlert(formattedData, recipient)
  }
} 