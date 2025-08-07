export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface JobPostingData {
  id: number
  title: string
  company: string
  location: string
  job_type: string
  salary_range: string
  created_at: string
  expires_at?: string
}

export interface ApplicationData {
  id: number
  candidate_name: string
  candidate_email: string
  job_title: string
  company: string
  applied_date: string
  cv_url: string
}

export interface WeeklyReportData {
  total_applications: number
  new_applications: number
  active_jobs: number
  expiring_jobs: number
  top_performing_jobs: Array<{
    title: string
    applications: number
  }>
  date_range: string
}

export interface SubscriptionData {
  planName: string;
  amount: string;
  nextBillingDate: string;
  transactionId: string;
}

export interface NewMessageData {
  senderName: string
  jobTitle: string
  messageContent: string
  conversationUrl: string
}

export interface TeamMessageData {
  senderName: string
  jobTitle: string
  candidateName: string
  messageContent: string
  applicationUrl: string
  applicationId: string
}

export interface TeamInvitationData {
  inviteeName: string
  inviterName: string
  companyName: string
  role: string
  invitationUrl: string
  expiresAt: string
}

// Job Posted Confirmation Email
export function getJobPostedTemplate(jobData: JobPostingData, recruiterName: string): EmailTemplate {
  return {
    subject: `Job Posted Successfully: ${jobData.title} at ${jobData.company}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Posted Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .job-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #c084fc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Job Posted Successfully!</h1>
            <p>Your job posting is now live and ready to receive applications</p>
          </div>
          <div class="content">
            <p>Hi ${recruiterName},</p>
            <p>Great news! Your job posting has been successfully published and is now visible to potential candidates.</p>
            
            <div class="job-card">
              <h2>${jobData.title}</h2>
              <p><strong>Company:</strong> ${jobData.company}</p>
              <p><strong>Location:</strong> ${jobData.location}</p>
              <p><strong>Type:</strong> ${jobData.job_type}</p>
              <p><strong>Salary:</strong> ${jobData.salary_range}</p>
              <p><strong>Posted:</strong> ${new Date(jobData.created_at).toLocaleDateString()}</p>
            </div>
            
            <p>Your job posting will start receiving applications immediately. You'll be notified via email whenever a candidate applies.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/recruiter/jobs/${jobData.id}" class="button">View Job Details</a>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Monitor applications in your dashboard</li>
              <li>Review candidate profiles and CVs</li>
              <li>Contact promising candidates</li>
              <li>Update job status as needed</li>
            </ul>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ApplyForMe Team</p>
            <p>Need help? Contact us at support@applyforme.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Job Posted Successfully: ${jobData.title} at ${jobData.company}

Hi ${recruiterName},

Great news! Your job posting has been successfully published and is now visible to potential candidates.

Job Details:
- Title: ${jobData.title}
- Company: ${jobData.company}
- Location: ${jobData.location}
- Type: ${jobData.job_type}
- Salary: ${jobData.salary_range}
- Posted: ${new Date(jobData.created_at).toLocaleDateString()}

Your job posting will start receiving applications immediately. You'll be notified via email whenever a candidate applies.

View Job Details: ${process.env.NEXT_PUBLIC_APP_URL}/recruiter/jobs/${jobData.id}

Next Steps:
- Monitor applications in your dashboard
- Review candidate profiles and CVs
- Contact promising candidates
- Update job status as needed

Best regards,
The ApplyForMe Team
    `
  }
}

// New Application Alert Email
export function getApplicationAlertTemplate(applicationData: ApplicationData, recruiterName: string): EmailTemplate {
  return {
    subject: `New Application: ${applicationData.candidate_name} applied for ${applicationData.job_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Application Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .application-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 New Application Received!</h1>
            <p>A candidate has applied for your job posting</p>
          </div>
          <div class="content">
            <p>Hi ${recruiterName},</p>
            <p>You have received a new application for your job posting!</p>
            
            <div class="application-card">
              <h2>Application Details</h2>
              <p><strong>Candidate:</strong> ${applicationData.candidate_name}</p>
              <p><strong>Email:</strong> ${applicationData.candidate_email}</p>
              <p><strong>Job:</strong> ${applicationData.job_title}</p>
              <p><strong>Company:</strong> ${applicationData.company}</p>
              <p><strong>Applied:</strong> ${new Date(applicationData.applied_date).toLocaleDateString()}</p>
            </div>
            
            <p>Don't keep the candidate waiting! Review their application and CV to make a quick decision.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/recruiter/dashboard" class="button">Review Application</a>
            
            <p><strong>Quick Actions:</strong></p>
            <ul>
              <li>Review the candidate's CV</li>
              <li>Check their profile and experience</li>
              <li>Update application status</li>
              <li>Contact the candidate if interested</li>
            </ul>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ApplyForMe Team</p>
            <p>Need help? Contact us at support@applyforme.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Application: ${applicationData.candidate_name} applied for ${applicationData.job_title}

Hi ${recruiterName},

You have received a new application for your job posting!

Application Details:
- Candidate: ${applicationData.candidate_name}
- Email: ${applicationData.candidate_email}
- Job: ${applicationData.job_title}
- Company: ${applicationData.company}
- Applied: ${new Date(applicationData.applied_date).toLocaleDateString()}

Don't keep the candidate waiting! Review their application and CV to make a quick decision.

Review Application: ${process.env.NEXT_PUBLIC_APP_URL}/recruiter/dashboard

Quick Actions:
- Review the candidate's CV
- Check their profile and experience
- Update application status
- Contact the candidate if interested

Best regards,
The ApplyForMe Team
    `
  }
}

// Job Expiry Reminder Email
export function getJobExpiryReminderTemplate(jobData: JobPostingData, recruiterName: string, daysLeft: number): EmailTemplate {
  return {
    subject: `⚠️ Job Expiring Soon: ${jobData.title} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Expiring Soon</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .job-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Job Expiring Soon!</h1>
            <p>Your job posting will expire in ${daysLeft} day${daysLeft === 1 ? '' : 's'}</p>
          </div>
          <div class="content">
            <p>Hi ${recruiterName},</p>
            <p>Your job posting is about to expire. Take action to keep it active and continue receiving applications.</p>
            
            <div class="warning">
              <strong>⚠️ Action Required:</strong> Your job posting will expire on ${jobData.expires_at ? new Date(jobData.expires_at).toLocaleDateString() : 'soon'}.
            </div>
            
            <div class="job-card">
              <h2>${jobData.title}</h2>
              <p><strong>Company:</strong> ${jobData.company}</p>
              <p><strong>Location:</strong> ${jobData.location}</p>
              <p><strong>Type:</strong> ${jobData.job_type}</p>
              <p><strong>Posted:</strong> ${new Date(jobData.created_at).toLocaleDateString()}</p>
            </div>
            
            <p><strong>Your Options:</strong></p>
            <ul>
              <li><strong>Extend the job posting</strong> to continue receiving applications</li>
              <li><strong>Close the job posting</strong> if you've found the right candidate</li>
              <li><strong>Repost the job</strong> with updated requirements</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/recruiter/jobs/${jobData.id}" class="button">Manage Job Posting</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ApplyForMe Team</p>
            <p>Need help? Contact us at support@applyforme.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Job Expiring Soon: ${jobData.title} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}

Hi ${recruiterName},

Your job posting is about to expire. Take action to keep it active and continue receiving applications.

⚠️ Action Required: Your job posting will expire on ${jobData.expires_at ? new Date(jobData.expires_at).toLocaleDateString() : 'soon'}.

Job Details:
- Title: ${jobData.title}
- Company: ${jobData.company}
- Location: ${jobData.location}
- Type: ${jobData.job_type}
- Posted: ${new Date(jobData.created_at).toLocaleDateString()}

Your Options:
- Extend the job posting to continue receiving applications
- Close the job posting if you've found the right candidate
- Repost the job with updated requirements

Manage Job Posting: ${process.env.NEXT_PUBLIC_APP_URL}/recruiter/jobs/${jobData.id}

Best regards,
The ApplyForMe Team
    `
  }
}

// Job Expired Email
export function getJobExpiredTemplate(jobData: JobPostingData, recruiterName: string): EmailTemplate {
  return {
    subject: `❌ Job Expired: ${jobData.title} is no longer active`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Expired</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .job-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .expired { background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Job Expired</h1>
            <p>Your job posting is no longer active</p>
          </div>
          <div class="content">
            <p>Hi ${recruiterName},</p>
            <p>Your job posting has expired and is no longer visible to candidates.</p>
            
            <div class="expired">
              <strong>❌ Expired:</strong> This job posting is no longer accepting applications.
            </div>
            
            <div class="job-card">
              <h2>${jobData.title}</h2>
              <p><strong>Company:</strong> ${jobData.company}</p>
              <p><strong>Location:</strong> ${jobData.location}</p>
              <p><strong>Type:</strong> ${jobData.job_type}</p>
              <p><strong>Posted:</strong> ${new Date(jobData.created_at).toLocaleDateString()}</p>
            </div>
            
            <p><strong>What you can do:</strong></p>
            <ul>
              <li><strong>Repost the job</strong> to continue receiving applications</li>
              <li><strong>Review existing applications</strong> and contact candidates</li>
              <li><strong>Create a new job posting</strong> with updated requirements</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/recruiter/jobs/new" class="button">Post New Job</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ApplyForMe Team</p>
            <p>Need help? Contact us at support@applyforme.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Job Expired: ${jobData.title} is no longer active

Hi ${recruiterName},

Your job posting has expired and is no longer visible to candidates.

❌ Expired: This job posting is no longer accepting applications.

Job Details:
- Title: ${jobData.title}
- Company: ${jobData.company}
- Location: ${jobData.location}
- Type: ${jobData.job_type}
- Posted: ${new Date(jobData.created_at).toLocaleDateString()}

What you can do:
- Repost the job to continue receiving applications
- Review existing applications and contact candidates
- Create a new job posting with updated requirements

Post New Job: ${process.env.NEXT_PUBLIC_APP_URL}/recruiter/jobs/new

Best regards,
The ApplyForMe Team
    `
  }
}

// Weekly Report Email
export function getWeeklyReportTemplate(reportData: WeeklyReportData, recruiterName: string): EmailTemplate {
  const topJobsHtml = reportData.top_performing_jobs.map(job => 
    `<li><strong>${job.title}</strong> - ${job.applications} applications</li>`
  ).join('')

  return {
    subject: `📊 Weekly Report: ${reportData.total_applications} applications received`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .stat-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; color: #3b82f6; }
          .top-jobs { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Performance Report</h1>
            <p>${reportData.date_range}</p>
          </div>
          <div class="content">
            <p>Hi ${recruiterName},</p>
            <p>Here's your weekly performance summary for your job postings on ApplyForMe.</p>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${reportData.total_applications}</div>
                <div>Total Applications</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${reportData.new_applications}</div>
                <div>New This Week</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${reportData.active_jobs}</div>
                <div>Active Jobs</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${reportData.expiring_jobs}</div>
                <div>Expiring Soon</div>
              </div>
            </div>
            
            <div class="top-jobs">
              <h3>🏆 Top Performing Jobs</h3>
              <ul>
                ${topJobsHtml}
              </ul>
            </div>
            
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>Review and respond to new applications promptly</li>
              <li>Consider extending jobs that are expiring soon</li>
              <li>Update job descriptions for better performance</li>
              <li>Engage with candidates to improve response rates</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/recruiter/dashboard" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ApplyForMe Team</p>
            <p>Need help? Contact us at support@applyforme.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Weekly Report: ${reportData.total_applications} applications received

Hi ${recruiterName},

Here's your weekly performance summary for your job postings on ApplyForMe.

📊 Performance Summary (${reportData.date_range}):
- Total Applications: ${reportData.total_applications}
- New This Week: ${reportData.new_applications}
- Active Jobs: ${reportData.active_jobs}
- Expiring Soon: ${reportData.expiring_jobs}

🏆 Top Performing Jobs:
${reportData.top_performing_jobs.map(job => `- ${job.title}: ${job.applications} applications`).join('\n')}

Recommendations:
- Review and respond to new applications promptly
- Consider extending jobs that are expiring soon
- Update job descriptions for better performance
- Engage with candidates to improve response rates

View Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/recruiter/dashboard

Best regards,
The ApplyForMe Team
    `
  }
}

// CV Improvement Notification Email
export function getCVImprovementTemplate(
  userName: string, 
  improvements: string[], 
  cvDownloadUrl: string
): EmailTemplate {
  return {
    subject: `Your improved CV is ready - ${userName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Improved CV is Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .improvement-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .improvement-list { list-style: none; padding: 0; }
          .improvement-list li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .improvement-list li:last-child { border-bottom: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Your Improved CV is Ready!</h1>
            <p>Expertly enhanced by our professional team</p>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Great news! Your CV has been expertly reviewed and enhanced by our professional team. We've optimized it to help you stand out in today's competitive job market.</p>
            
            <div class="improvement-card">
              <h2>Key Improvements Made</h2>
              <ul class="improvement-list">
                ${improvements.map(imp => `<li>✅ ${imp}</li>`).join('')}
              </ul>
            </div>
            
            <p><strong>What we've optimized for:</strong></p>
            <ul>
              <li>ATS (Applicant Tracking System) compatibility</li>
              <li>Industry-specific requirements</li>
              <li>Professional presentation and formatting</li>
              <li>Keyword optimization for better visibility</li>
              <li>Enhanced readability and impact</li>
            </ul>
            
            <p>Your improved CV is now ready for download and use in your job applications.</p>
            
            <a href="${cvDownloadUrl}" class="button">Download Improved CV</a>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Download your improved CV</li>
              <li>Review the changes and improvements</li>
              <li>Start applying to jobs with confidence</li>
              <li>Track your applications in your dashboard</li>
            </ul>
            
            <p>We're confident that your enhanced CV will help you make a stronger impression on potential employers.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ApplyForMe Team</p>
            <p>Need help? Contact us at support@applyforme.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Your improved CV is ready - ${userName}

Dear ${userName},

Great news! Your CV has been expertly reviewed and enhanced by our professional team. We've optimized it to help you stand out in today's competitive job market.

Key Improvements Made:
${improvements.map(imp => `• ${imp}`).join('\n')}

What we've optimized for:
• ATS (Applicant Tracking System) compatibility
• Industry-specific requirements
• Professional presentation and formatting
• Keyword optimization for better visibility
• Enhanced readability and impact

Your improved CV is now ready for download and use in your job applications.

Download Improved CV: ${cvDownloadUrl}

Next Steps:
• Download your improved CV
• Review the changes and improvements
• Start applying to jobs with confidence
• Track your applications in your dashboard

We're confident that your enhanced CV will help you make a stronger impression on potential employers.

Best regards,
The ApplyForMe Team
    `
  }
}

export function getSubscriptionConfirmationTemplate(
  userName: string,
  subscriptionData: SubscriptionData
): EmailTemplate {
  const { planName, amount, nextBillingDate, transactionId } = subscriptionData;
  const subject = `Your Subscription to ${planName} is Confirmed!`;

  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to ${planName}!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for subscribing! Your payment has been processed successfully and your ${planName} plan is now active.</p>
        <h3>Invoice Details:</h3>
        <ul>
          <li><strong>Plan:</strong> ${planName}</li>
          <li><strong>Amount:</strong> R${amount}</li>
          <li><strong>Transaction ID:</strong> ${transactionId}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>Your next billing date is <strong>${new Date(nextBillingDate).toLocaleDateString()}</strong>.</p>
        <p>You can manage your subscription from your dashboard at any time.</p>
        <p>Thanks,<br>The ApplyForMe Team</p>
      </div>
    `,
    text: `
      Welcome to ${planName}!\n\n
      Hi ${userName},\n\n
      Thank you for subscribing! Your payment has been processed successfully and your ${planName} plan is now active.\n\n
      Invoice Details:\n
      - Plan: ${planName}\n
      - Amount: R${amount}\n
      - Transaction ID: ${transactionId}\n
      - Date: ${new Date().toLocaleDateString()}\n\n
      Your next billing date is ${new Date(nextBillingDate).toLocaleDateString()}.\n\n
      You can manage your subscription from your dashboard at any time.\n\n
      Thanks,\nThe ApplyForMe Team
    `
  }
}

export function getSubscriptionRenewalTemplate(
  userName: string,
  subscriptionData: SubscriptionData
): EmailTemplate {
  const { planName, amount, nextBillingDate, transactionId } = subscriptionData;
  const subject = `Your ${planName} Subscription Has Been Renewed`;

  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Subscription Renewed</h2>
        <p>Hi ${userName},</p>
        <p>This is a confirmation that your ${planName} subscription has been successfully renewed.</p>
        <h3>Billing Details:</h3>
        <ul>
          <li><strong>Plan:</strong> ${planName}</li>
          <li><strong>Amount:</strong> R${amount}</li>
          <li><strong>Transaction ID:</strong> ${transactionId}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>Your subscription will continue to be active, and your next billing date is now <strong>${new Date(nextBillingDate).toLocaleDateString()}</strong>.</p>
        <p>Thank you for your continued support!</p>
        <p>Thanks,<br>The ApplyForMe Team</p>
      </div>
    `,
    text: `
      Subscription Renewed\n\n
      Hi ${userName},\n\n
      This is a confirmation that your ${planName} subscription has been successfully renewed.\n\n
      Billing Details:\n
      - Plan: ${planName}\n
      - Amount: R${amount}\n
      - Transaction ID: ${transactionId}\n
      - Date: ${new Date().toLocaleDateString()}\n\n
      Your subscription will continue to be active, and your next billing date is now ${new Date(nextBillingDate).toLocaleDateString()}.\n\n
      Thank you for your continued support!\n\n
      Thanks,\nThe ApplyForMe Team
    `
  }
} 

// Get new message notification template
export function getNewMessageTemplate(
  messageData: NewMessageData,
  recipientName: string
): EmailTemplate {
  const subject = `New message from ${messageData.senderName} regarding ${messageData.jobTitle}`;
  const text = `Hi ${recipientName},\nYou have received a new message from ${messageData.senderName} regarding your application for ${messageData.jobTitle}.\n\nMessage: ${messageData.messageContent}\n\nView and reply here: ${messageData.conversationUrl}`;
  
  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message Received</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            margin: 0; 
            padding: 0; 
            background-color: #f9fafb;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header { 
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0 0 8px 0; 
            font-size: 28px; 
            font-weight: 700; 
            letter-spacing: -0.025em;
          }
          .header p { 
            margin: 0; 
            font-size: 16px; 
            opacity: 0.9; 
            font-weight: 400;
          }
          .content { 
            padding: 40px 30px; 
            background-color: #ffffff;
          }
          .message-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 12px; 
            padding: 24px; 
            margin: 24px 0; 
            border-left: 4px solid #8b5cf6;
          }
          .message-card p { 
            margin: 0; 
            color: #374151; 
            font-size: 16px; 
            line-height: 1.6;
          }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 24px 0; 
            font-weight: 600; 
            font-size: 16px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);
          }
          .button:hover { 
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(139, 92, 246, 0.4);
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280; 
            font-size: 14px; 
          }
          .sender-info {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            border: 1px solid #e5e7eb;
          }
          .sender-info strong {
            color: #8b5cf6;
            font-weight: 600;
          }
          .job-title {
            color: #1f2937;
            font-weight: 600;
          }
          .cta-section {
            text-align: center;
            margin: 32px 0;
          }
          .cta-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 16px;
          }
          @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content { padding: 24px 20px; }
            .header h1 { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message Received</h1>
            <p>You have a new message regarding your job application</p>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 24px;">Hi ${recipientName},</p>
            
            <div class="sender-info">
              <p style="margin: 0 0 8px 0;">You have received a new message from <strong>${messageData.senderName}</strong> regarding your application for <span class="job-title">${messageData.jobTitle}</span>.</p>
            </div>
            
            <div class="message-card">
              <p>${messageData.messageContent}</p>
            </div>
            
            <div class="cta-section">
              <p class="cta-text">Click the button below to view the full conversation and reply:</p>
              <a href="${messageData.conversationUrl}" class="button">View Conversation</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
              This message was sent from your ApplyForMe account. You can manage your notification preferences in your dashboard settings.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;"><strong>Best regards,</strong><br>The ApplyForMe Team</p>
            <p style="margin: 0; font-size: 13px;">Need help? Contact us at <a href="mailto:support@applyforme.com" style="color: #8b5cf6; text-decoration: none;">support@applyforme.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text,
  }
} 

// Team Message Notification Email
export function getTeamMessageTemplate(messageData: TeamMessageData, recipientName: string): EmailTemplate {
  return {
    subject: `Team Message: ${messageData.senderName} commented on ${messageData.candidateName}'s application`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Message Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .sender-info { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Team Message</h1>
            <p>New comment on candidate application</p>
          </div>
          <div class="content">
            <p>Hi ${recipientName},</p>
            <p>${messageData.senderName} has added a comment to the application for <strong>${messageData.candidateName}</strong>.</p>
            
            <div class="sender-info">
              <p><strong>From:</strong> ${messageData.senderName}</p>
              <p><strong>Job:</strong> ${messageData.jobTitle}</p>
              <p><strong>Candidate:</strong> ${messageData.candidateName}</p>
            </div>
            
            <div class="message-card">
              <h3>Message:</h3>
              <p style="white-space: pre-line; margin: 0;">${messageData.messageContent}</p>
            </div>
            
            <p>Click the button below to view the full application and respond to the team message.</p>
            
            <a href="${messageData.applicationUrl}" class="button">View Application</a>
            
            <p><strong>Quick Actions:</strong></p>
            <ul>
              <li>Review the candidate's full profile</li>
              <li>Add your own notes or comments</li>
              <li>Update the application status</li>
              <li>Schedule an interview</li>
            </ul>
            
            <div class="footer">
              <p>This is an automated notification from your recruitment platform.</p>
              <p>You can manage your notification preferences in your account settings.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Team Message Notification

Hi ${recipientName},

${messageData.senderName} has added a comment to the application for ${messageData.candidateName}.

From: ${messageData.senderName}
Job: ${messageData.jobTitle}
Candidate: ${messageData.candidateName}

Message:
${messageData.messageContent}

View the full application and respond: ${messageData.applicationUrl}

Quick Actions:
- Review the candidate's full profile
- Add your own notes or comments
- Update the application status
- Schedule an interview

This is an automated notification from your recruitment platform.
You can manage your notification preferences in your account settings.
    `
  }
} 

// Team Invitation Email
export function getTeamInvitationTemplate(invitationData: TeamInvitationData): EmailTemplate {
  const expiresDate = new Date(invitationData.expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return {
    subject: `You're invited to join ${invitationData.companyName} on ApplyForMe`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .invitation-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #c084fc; }
          .button { display: inline-block; background: #c084fc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold; }
          .button:hover { background: #a855f7; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .role-badge { display: inline-block; background: #f0f9ff; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
          .expiry-notice { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .company-info { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>Join ${invitationData.companyName} on ApplyForMe</p>
          </div>
          <div class="content">
            <p>Hi ${invitationData.inviteeName},</p>
            <p><strong>${invitationData.inviterName}</strong> has invited you to join their recruitment team on ApplyForMe.</p>
            
            <div class="company-info">
              <h3>🏢 ${invitationData.companyName}</h3>
              <p>You'll be joining as a <span class="role-badge">${invitationData.role}</span></p>
            </div>
            
            <div class="invitation-card">
              <h3>What you'll be able to do:</h3>
              <ul>
                <li>📋 Review and manage job applications</li>
                <li>💬 Collaborate with team members on candidates</li>
                <li>📊 Access recruitment analytics and insights</li>
                <li>🎯 Help find the best talent for ${invitationData.companyName}</li>
              </ul>
            </div>
            
            <p>Click the button below to accept the invitation and set up your account:</p>
            
            <a href="${invitationData.invitationUrl}" class="button">Accept Invitation</a>
            
            <div class="expiry-notice">
              <p><strong>⏰ Important:</strong> This invitation expires on <strong>${expiresDate}</strong></p>
              <p>Please accept the invitation before it expires to join the team.</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ol>
              <li>Click "Accept Invitation" to create your account</li>
              <li>Complete your profile setup</li>
              <li>Start collaborating with your team immediately</li>
            </ol>
            
            <p>If you have any questions, please contact ${invitationData.inviterName} or reply to this email.</p>
            
            <div class="footer">
              <p>This invitation was sent from ApplyForMe - Your recruitment platform</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
You're Invited to Join ${invitationData.companyName} on ApplyForMe

Hi ${invitationData.inviteeName},

${invitationData.inviterName} has invited you to join their recruitment team on ApplyForMe.

Company: ${invitationData.companyName}
Role: ${invitationData.role}

What you'll be able to do:
- Review and manage job applications
- Collaborate with team members on candidates
- Access recruitment analytics and insights
- Help find the best talent for ${invitationData.companyName}

Accept the invitation: ${invitationData.invitationUrl}

IMPORTANT: This invitation expires on ${expiresDate}

What happens next?
1. Click the link above to create your account
2. Complete your profile setup
3. Start collaborating with your team immediately

If you have any questions, please contact ${invitationData.inviterName}.

This invitation was sent from ApplyForMe - Your recruitment platform
If you didn't expect this invitation, you can safely ignore this email.
    `
  }
}