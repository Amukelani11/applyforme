import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read our terms of service to understand the rules and guidelines for using Talio's job application automation platform.",
  keywords: ["terms of service", "legal", "user agreement", "platform terms", "service agreement"],
  openGraph: {
    title: "Terms of Service - Talio",
    description: "Read our terms of service to understand the rules and guidelines for using Talio's job application automation platform.",
    url: "https://applyforme.com/terms",
  },
  twitter: {
    title: "Terms of Service - Talio",
    description: "Read our terms of service to understand the rules and guidelines for using Talio's job application automation platform.",
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Talio, you agree to be bound by these Terms of Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Talio is a job application automation platform that helps users apply for jobs,
              track applications, and manage career documents.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You must create an account to use our services. You are responsible for maintaining
              the confidentiality of your account information and for all activities under your account.
            </p>

            <h2>4. Subscription and Payments</h2>
            <p>
              We offer subscription plans with different features and pricing. Subscriptions are
              billed monthly and will automatically renew unless cancelled. You can cancel your
              subscription at any time.
            </p>

            <h2>5. User Content</h2>
            <p>
              You retain ownership of any content you submit to our platform. You grant us a
              license to use, store, and process your content to provide our services.
            </p>

            <h2>6. Prohibited Activities</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use the service for any illegal purpose</li>
              <li>Submit false or misleading information</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>

            <h2>7. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account for violations of these
              terms or for any other reason at our discretion.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              We are not liable for any indirect, incidental, or consequential damages arising
              from your use of our service.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. We will notify you of significant changes
              via email or through our platform.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              For questions about these terms, please contact us at support@applyforme.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
