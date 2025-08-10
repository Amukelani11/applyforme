import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { ConditionalFooter } from "@/components/conditional-footer"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import GoogleAnalytics from "@/components/google-analytics"
import RootClientLayout from "@/components/RootClientLayout"
import McpEditScript from "@/components/McpEditScript"
import { Suspense } from "react"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: "ApplyForMe - Automated Job Applications Made Easy",
    template: "%s | ApplyForMe"
  },
  description: "We apply for jobs so you don't have to. Automate your job search with AI-powered applications, CV improvements, and personalized job matching. Start your career journey today.",
  keywords: ["job applications", "automated job search", "AI job matching", "career platform", "job hunting", "CV improvement", "job opportunities", "career development"],
  authors: [{ name: "ApplyForMe Team" }],
  creator: "ApplyForMe",
  publisher: "ApplyForMe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://applyforme.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://applyforme.com",
    siteName: "ApplyForMe",
    title: "ApplyForMe - Automated Job Applications Made Easy",
    description: "We apply for jobs so you don't have to. Automate your job search with AI-powered applications, CV improvements, and personalized job matching.",
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
    creator: "@applyforme",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={poppins.className} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <RootClientLayout>
            {children}
          </RootClientLayout>
          <Toaster />
          <Suspense fallback={null}>
            <McpEditScript />
          </Suspense>
          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
