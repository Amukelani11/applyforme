import type { Metadata } from "next"
import { PricingClient } from "./pricing-client"

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Choose the perfect pricing plan for your job search. From Basic to Pro, we offer flexible options starting at R49/month with AI-powered applications and CV improvements.",
  keywords: ["pricing", "subscription plans", "job application pricing", "career platform pricing", "AI job search cost"],
  openGraph: {
    title: "Pricing Plans - ApplyForMe",
    description: "Choose the perfect pricing plan for your job search. From Basic to Pro, we offer flexible options starting at R49/month.",
    url: "https://applyforme.com/pricing",
  },
  twitter: {
    title: "Pricing Plans - ApplyForMe",
    description: "Choose the perfect pricing plan for your job search. From Basic to Pro, we offer flexible options starting at R49/month.",
  },
}

export default function PricingPage() {
  return <PricingClient />
}
