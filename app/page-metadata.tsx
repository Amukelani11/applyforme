import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ApplyForMe - Automated Job Applications Made Easy",
  description: "We apply for jobs so you don't have to. Automate your job search with AI-powered applications, CV improvements, and personalized job matching. Start your career journey today.",
  keywords: "job applications, automated job search, AI job matching, career platform, job hunting, CV improvement, job opportunities",
  openGraph: {
    title: "ApplyForMe - Automated Job Applications Made Easy",
    description: "We apply for jobs so you don't have to. Automate your job search with AI-powered applications, CV improvements, and personalized job matching.",
    type: "website",
    url: "https://applyforme.com",
    siteName: "ApplyForMe",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "ApplyForMe - Job Application Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyForMe - Automated Job Applications Made Easy",
    description: "We apply for jobs so you don't have to. Automate your job search with AI-powered applications, CV improvements, and personalized job matching.",
    images: ["/placeholder-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
} 