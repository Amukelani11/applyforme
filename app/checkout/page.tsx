"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { createHash } from "crypto"

const PLANS = {
  basic: {
    name: "Basic",
    price: 49,
    features: [
      "20 job applications per month",
      "Basic CV optimization",
      "Application tips and reminders",
      "Friendly support",
      "Progress tracking dashboard"
    ],
  },
  plus: {
    name: "Plus",
    price: 99,
    features: [
      "Unlimited job applications",
      "Advanced CV optimization",
      "Personalized feedback",
      "24/7 support",
      "Custom cover letters",
      "Interview tips"
    ],
  },
  pro: {
    name: "Pro",
    price: 149,
    features: [
      "Unlimited job applications",
      "Unlimited AI CV improvements",
      "Top priority recruiter exposure",
      "Priority support",
      "Advanced analytics",
      "Early access to new features"
    ],
  },
}

const PAYFAST_MERCHANT_ID = "10039247"
const PAYFAST_MERCHANT_KEY = "nmp2hu7jk3aie"
const PAYFAST_PASSPHRASE = "wearegoingtobericH11"
const PAYFAST_SANDBOX = true // Force sandbox mode for testing

// Add base URL configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

export default function CheckoutPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "basic")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSignIn, setIsSignIn] = useState(false)
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    fullName: "",
    optIn: false
  })

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsAuthenticated(true)
        } else {
          // If not authenticated and no plan selected, redirect to pricing
          if (!searchParams.get("plan")) {
            router.push("/pricing")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setError("Failed to check authentication status")
      }
    }
    checkAuth()
  }, [router, searchParams])

  const handleSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            opt_in: signupData.optIn,
          },
        },
      })

      if (authError) throw authError

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password,
      })

      if (signInError) throw signInError

      setIsAuthenticated(true)
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password,
      })

      if (signInError) throw signInError

      setIsAuthenticated(true)
      // Redirect to dashboard after successful sign in
      router.push('/dashboard')
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generatePayFastSignature = (data: Record<string, string>) => {
    // Create a sorted array of key-value pairs, excluding 'signature' and empty values
    const sortedData = Object.entries(data)
      .filter(([key, value]) => key !== 'signature' && value !== '' && value !== null && value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));

    // Create the parameter string with proper URL encoding
    let parameterString = sortedData
      .map(([key, value]) => {
        // URL encode the value according to PayFast requirements
        const encodedValue = encodeURIComponent(value.toString().trim())
          .replace(/%20/g, '+')  // Replace %20 with + for spaces
          .replace(/%2B/g, '+')  // Replace %2B with + for plus signs
          .replace(/%2F/g, '/')  // Replace %2F with / for forward slashes
          .replace(/%3A/g, ':')  // Replace %3A with : for colons
          .replace(/%3D/g, '=')  // Replace %3D with = for equals signs
          .replace(/%26/g, '&'); // Replace %26 with & for ampersands
        return `${key}=${encodedValue}`;
      })
      .join('&');

    // Add passphrase with proper encoding
    const encodedPassphrase = encodeURIComponent(PAYFAST_PASSPHRASE.trim())
      .replace(/%20/g, '+')
      .replace(/%2B/g, '+')
      .replace(/%2F/g, '/')
      .replace(/%3A/g, ':')
      .replace(/%3D/g, '=')
      .replace(/%26/g, '&');
    parameterString += `&passphrase=${encodedPassphrase}`;

    // Log to server
    fetch('/api/payfast/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'signature_generation',
        data: {
          raw_data: data,
          sorted_data: sortedData,
          parameter_string: parameterString,
          passphrase: {
            original: PAYFAST_PASSPHRASE,
            encoded: encodedPassphrase
          }
        }
      })
    }).catch(error => {
      console.error('Failed to log signature generation:', error);
    });

    // Generate MD5 hash
    const signature = createHash("md5")
      .update(parameterString)
      .digest("hex");

    // Log signature to server
    fetch('/api/payfast/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'signature_result',
        signature: signature,
        parameter_string: parameterString
      })
    }).catch(error => {
      console.error('Failed to log signature result:', error);
    });

    return signature;
  };

  const handlePayFastCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Log start of checkout
      await fetch('/api/payfast/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout_start',
          timestamp: new Date().toISOString()
        })
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found");
      }

      // Log user info
      await fetch('/api/payfast/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_info',
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name
          }
        })
      });

      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: selectedPlan,
          status: "pending",
          amount: PLANS[selectedPlan as keyof typeof PLANS].price,
          currency: "ZAR",
          created_at: new Date().toISOString(), 
        })
        .select()
        .single();

      if (subscriptionError) {
        throw subscriptionError;
      }
      if (!subscription || !subscription.id) {
        throw new Error("Subscription creation failed.");
      }

      // Log subscription info
      await fetch('/api/payfast/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription_created',
          subscription: subscription
        })
      });

      // Format the date as YYYY-MM-DD
      const today = new Date();
      const billingDate = today.toISOString().split('T')[0];

      // Create the data object with all required fields
      const data: Record<string, string> = {
        merchant_id: PAYFAST_MERCHANT_ID,
        merchant_key: PAYFAST_MERCHANT_KEY,
        return_url: `${BASE_URL}/dashboard`,
        cancel_url: `${BASE_URL}/pricing`,
        notify_url: `${BASE_URL}/api/payfast/webhook`,
        name_first: user.user_metadata?.full_name?.split(" ")[0]?.trim() || "Test",
        name_last: user.user_metadata?.full_name?.split(" ").slice(1).join(" ")?.trim() || "User",
        email_address: user.email!,
        m_payment_id: subscription.id.toString(),
        amount: PLANS[selectedPlan as keyof typeof PLANS].price.toFixed(2),
        item_name: `ApplyForMe ${PLANS[selectedPlan as keyof typeof PLANS].name} Plan`,
        payment_currency: "ZAR",
        payment_status: "pending",
        
        // Subscription fields
        subscription_type: "1",
        billing_date: billingDate,
        recurring_amount: PLANS[selectedPlan as keyof typeof PLANS].price.toFixed(2),
        frequency: "3", // Monthly
        cycles: "0", // Unlimited
        
        // Custom fields
        custom_str1: user.id, 
        custom_str2: selectedPlan,
      };
      
      if (PAYFAST_SANDBOX) {
        data.payment_method = "cc";
        data.cc_number = "4111111111111111";
        data.cc_expiry = "1225"; 
        data.cc_cvv = "123"; 
        data.cc_name = (user.user_metadata?.full_name || "Test User").trim();
      }

      // Log PayFast data
      await fetch('/api/payfast/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payfast_data',
          data: {
            ...data,
            passphrase: PAYFAST_PASSPHRASE
          }
        })
      });

      // Generate signature
      const signature = generatePayFastSignature(data);
      data.signature = signature;

      // Log final data
      await fetch('/api/payfast/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'final_data',
          data: {
            ...data,
            passphrase: PAYFAST_PASSPHRASE
          }
        })
      });

      // Create and submit the form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYFAST_SANDBOX ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process";

      // Add all fields to the form
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value.toString();
          form.appendChild(input);
        }
      });
      
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message);
      setLoading(false);

      // Log error
      await fetch('/api/payfast/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          error: err.message,
          stack: err.stack
        })
      });
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Start your journey with ApplyForMe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {!isAuthenticated && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label>Select your plan</Label>
              <RadioGroup
                value={selectedPlan}
                onValueChange={setSelectedPlan}
                className="grid grid-cols-2 gap-4"
              >
                {Object.entries(PLANS).map(([key, plan]) => (
                  <div key={key}>
                    <RadioGroupItem
                      value={key}
                      id={key}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={key}
                      className="flex flex-col items-start rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-semibold">{plan.name}</span>
                      <span className="text-sm text-muted-foreground">
                        R{plan.price.toLocaleString('en-ZA')}/month
                      </span>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <svg
                              className="h-4 w-4 mr-2 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                You'll be redirected to PayFast to complete your payment securely.
                Your subscription will automatically renew monthly.
                {PAYFAST_SANDBOX && (
                  <span className="block mt-1 text-yellow-600">
                    Note: You are currently in sandbox mode. No real payments will be processed.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                required
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={loading || !termsAccepted}
              onClick={isAuthenticated ? handlePayFastCheckout : handleSignup}
            >
              {loading
                ? "Processing..."
                : isAuthenticated
                ? `Subscribe to ${PLANS[selectedPlan as keyof typeof PLANS].name} Plan - R${PLANS[selectedPlan as keyof typeof PLANS].price.toLocaleString('en-ZA')}/month`
                : "Create account"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 