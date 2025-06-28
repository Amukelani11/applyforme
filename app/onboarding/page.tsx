"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

const PLANS = {
  basic: {
    name: "Basic Plan",
    price: 49,
    oldPrice: 99,
    isFreeTrial: true,
    features: [
      "20 job applications per month",
      "Application tips and reminders",
      "Friendly support",
      "Progress tracking dashboard",
    ],
  },
  plus: {
    name: "Plus",
    price: 99,
    oldPrice: 249,
    isFreeTrial: false,
    features: [
      "Unlimited job applications",
      "Personalized feedback",
      "24/7 support",
      "Custom cover letters",
      "Interview tips",
    ],
  },
  pro: {
    name: "Pro",
    price: 149,
    oldPrice: 249,
    isFreeTrial: false,
    features: [
      "Unlimited job applications",
      "Top priority support",
      "Advanced analytics",
      "Early access to new features",
      "Monthly performance report",
    ],
  },
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const plan = searchParams.get("plan")
    if (plan && PLANS[plan as keyof typeof PLANS]) {
      setSelectedPlan(plan as keyof typeof PLANS)
      setStep(2)
    }
  }, [searchParams])

  // Simulate payment gateway
  const handleCheckout = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! Complete your setup</h1>
          <p className="text-gray-600">Step {step} of 3</p>
        </div>
        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Select your plan</CardTitle>
                <CardDescription>Choose the plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PLANS).map(([key, plan]) => (
                    <button
                      key={key}
                      type="button"
                      className={`rounded-2xl border-2 p-4 text-left transition-all relative ${
                        selectedPlan === key 
                          ? plan.isFreeTrial 
                            ? "border-green-500 bg-green-50" 
                            : "border-[#c084fc] bg-[#f3e8ff]"
                          : plan.isFreeTrial
                            ? "border-green-300 bg-white hover:border-green-500"
                            : "border-gray-200 bg-white hover:border-[#c084fc]"
                      }`}
                      onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
                      aria-pressed={selectedPlan === key}
                    >
                      {plan.isFreeTrial && (
                        <div className="absolute -top-2 -right-2">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Free Trial
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col mb-2">
                        <span className="text-xl font-semibold text-gray-900">{plan.name}</span>
                        {plan.isFreeTrial && (
                          <span className="block text-2xl font-extrabold text-green-600 mt-1 mb-1">2 MONTHS FREE</span>
                        )}
                        <span className={`text-lg font-bold ${plan.isFreeTrial ? 'text-green-600' : 'text-[#c084fc]'}`}>R{plan.price}/mo</span>
                        {plan.isFreeTrial && (
                          <span className="text-sm text-green-600 font-medium">after 2 months</span>
                        )}
                      </div>
                      <ul className="space-y-2 mb-2">
                        {plan.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className={`h-4 w-4 mr-2 ${plan.isFreeTrial ? 'text-green-500' : 'text-[#c084fc]'}`} />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-gray-400">+{plan.features.length - 3} more</li>
                        )}
                      </ul>
                      {selectedPlan === key && (
                        <div className={`text-xs font-medium ${plan.isFreeTrial ? 'text-green-600' : 'text-[#a855f7]'}`}>
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  disabled={!selectedPlan}
                  onClick={() => setStep(2)}
                  className="bg-[#c084fc] hover:bg-[#a855f7] text-white rounded-xl"
                >
                  Next
                </Button>
              </CardFooter>
            </>
          )}

          {step === 2 && selectedPlan && (
            <>
              <CardHeader>
                <CardTitle>Review your plan</CardTitle>
                <CardDescription>Confirm your selection before checkout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 text-center">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-2 ${
                    PLANS[selectedPlan].isFreeTrial 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-[#c084fc]/10 text-[#c084fc]'
                  }`}>
                    {PLANS[selectedPlan].name}
                    {PLANS[selectedPlan].isFreeTrial && ' - Free Trial'}
                  </span>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">R{PLANS[selectedPlan].price}</span>
                    <span className="text-gray-500 ml-1">/month</span>
                    {PLANS[selectedPlan].isFreeTrial ? (
                      <span className="text-sm text-green-600 font-medium ml-2">after 2 months</span>
                    ) : (
                      <span className="text-sm text-gray-400 line-through ml-2">R{PLANS[selectedPlan].oldPrice}</span>
                    )}
                  </div>
                  {PLANS[selectedPlan].isFreeTrial && (
                    <p className="text-sm text-green-600 font-medium mb-4">
                      2 MONTHS FREE, then R{PLANS[selectedPlan].price}/month
                    </p>
                  )}
                  <ul className="space-y-2 max-w-xs mx-auto">
                    {PLANS[selectedPlan].features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className={`h-4 w-4 mr-2 ${PLANS[selectedPlan].isFreeTrial ? 'text-green-500' : 'text-[#c084fc]'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">Back</Button>
                <Button className="bg-[#c084fc] hover:bg-[#a855f7] text-white rounded-xl" onClick={() => setStep(3)}>
                  Continue to checkout
                </Button>
              </CardFooter>
            </>
          )}

          {step === 3 && selectedPlan && (
            <>
              <CardHeader>
                <CardTitle>{PLANS[selectedPlan].isFreeTrial ? 'Start Free Trial' : 'Checkout'}</CardTitle>
                <CardDescription>
                  {PLANS[selectedPlan].isFreeTrial 
                    ? '2 MONTHS FREE, then R49/month' 
                    : 'Pay securely to activate your plan'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 text-center">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-2 ${
                    PLANS[selectedPlan].isFreeTrial 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-[#c084fc]/10 text-[#c084fc]'
                  }`}>
                    {PLANS[selectedPlan].name}
                    {PLANS[selectedPlan].isFreeTrial && ' - Free Trial'}
                  </span>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">R{PLANS[selectedPlan].price}</span>
                    <span className="text-gray-500 ml-1">/month</span>
                    {PLANS[selectedPlan].isFreeTrial ? (
                      <span className="text-sm text-green-600 font-medium ml-2">after 2 months</span>
                    ) : (
                      <span className="text-sm text-gray-400 line-through ml-2">R{PLANS[selectedPlan].oldPrice}</span>
                    )}
                  </div>
                  {PLANS[selectedPlan].isFreeTrial && (
                    <p className="text-sm text-green-600 font-medium mb-4">
                      2 MONTHS FREE, then R{PLANS[selectedPlan].price}/month
                    </p>
                  )}
                  <ul className="space-y-2 max-w-xs mx-auto">
                    {PLANS[selectedPlan].features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className={`h-4 w-4 mr-2 ${PLANS[selectedPlan].isFreeTrial ? 'text-green-500' : 'text-[#c084fc]'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground mb-4">
                  {PLANS[selectedPlan].isFreeTrial 
                    ? "You'll start with a 2-month free trial. No charges during the trial period. Cancel anytime."
                    : "You will be redirected to the payment gateway to complete your purchase securely."
                  }
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">Back</Button>
                <Button
                  className={`rounded-xl ${
                    PLANS[selectedPlan].isFreeTrial 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-[#c084fc] hover:bg-[#a855f7] text-white'
                  }`}
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading 
                    ? "Processing..." 
                    : PLANS[selectedPlan].isFreeTrial 
                      ? "Start Free Trial" 
                      : "Pay & Subscribe"
                  }
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  )
} 