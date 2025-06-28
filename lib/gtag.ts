// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_location: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Custom events for ApplyForMe
export const trackJobPosted = (jobTitle: string, company: string) => {
  event({
    action: 'job_posted',
    category: 'recruiter',
    label: `${jobTitle} at ${company}`,
  })
}

export const trackJobApplied = (jobTitle: string, company: string) => {
  event({
    action: 'job_applied',
    category: 'candidate',
    label: `${jobTitle} at ${company}`,
  })
}

export const trackSignUp = (userType: 'candidate' | 'recruiter') => {
  event({
    action: 'sign_up',
    category: 'engagement',
    label: userType,
  })
}

export const trackSignIn = (userType: 'candidate' | 'recruiter') => {
  event({
    action: 'sign_in',
    category: 'engagement',
    label: userType,
  })
}

export const trackCVUpload = () => {
  event({
    action: 'cv_uploaded',
    category: 'candidate',
  })
}

export const trackCVReview = () => {
  event({
    action: 'cv_reviewed',
    category: 'candidate',
  })
}

export const trackPricingView = (plan: string) => {
  event({
    action: 'pricing_viewed',
    category: 'engagement',
    label: plan,
  })
}

export const trackContactForm = () => {
  event({
    action: 'contact_form_submitted',
    category: 'engagement',
  })
}

// Declare gtag on window object
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
} 