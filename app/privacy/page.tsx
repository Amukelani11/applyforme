import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how ApplyForMe protects your personal information and maintains your privacy while providing job application automation services.",
  keywords: ["privacy policy", "data protection", "personal information", "privacy", "data security", "user privacy"],
  openGraph: {
    title: "Privacy Policy - ApplyForMe",
    description: "Learn how ApplyForMe protects your personal information and maintains your privacy while providing job application automation services.",
    url: "https://applyforme.com/privacy",
  },
  twitter: {
    title: "Privacy Policy - ApplyForMe",
    description: "Learn how ApplyForMe protects your personal information and maintains your privacy while providing job application automation services.",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Account information (name, email, password)</li>
              <li>Profile information (resume, cover letters, job preferences)</li>
              <li>Job application data</li>
              <li>Payment information</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Process your job applications</li>
              <li>Send you important updates and notifications</li>
              <li>Process your payments</li>
              <li>Analyze and improve our platform</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul>
              <li>Service providers who help us operate our platform</li>
              <li>Job sites and employers when you choose to apply</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the internet is 100% secure.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve your experience and analyze
              how you use our platform.
            </p>

            <h2>7. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect
              information from children under 13.
            </p>

            <h2>8. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any
              significant changes.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at
              privacy@applyforme.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
