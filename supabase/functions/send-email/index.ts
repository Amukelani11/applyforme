import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// You can use any email service here. This example uses Resend
// Install with: npm install resend
// Or use SendGrid, Mailgun, etc.

interface EmailRequest {
  to: string
  subject: string
  html: string
  text: string
  from?: string
}

serve(async (req) => {
  try {
    const { to, subject, html, text, from }: EmailRequest = await req.json()

    if (!to || !subject || !html || !text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Use Resend for sending emails
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured")
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || "Talio <noreply@applyforme.co.za>",
        to: [to],
        subject: subject,
        html: html,
        text: text,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Resend API error:", result)
      throw new Error(result.message || "Failed to send email")
    }

    console.log("Email sent successfully via Resend:", {
      to,
      subject,
      id: result.id
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        data: result
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}) 