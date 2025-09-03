import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    // Use service role client so anonymous users can submit even with RLS enabled
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      companyName,
      contactName,
      email,
      phone,
      monthlyJobs,
      teamSize,
      currentTools,
      requirements,
      timeline
    } = body

    // Validate required fields
    if (!companyName || !contactName || !email || !monthlyJobs || !teamSize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into database
    const { data, error } = await supabase
      .from('enterprise_contacts')
      .insert([
        {
          company_name: companyName,
          contact_name: contactName,
          email: email,
          phone: phone || null,
          monthly_jobs: monthlyJobs,
          team_size: teamSize,
          current_tools: currentTools || null,
          requirements: requirements || null,
          timeline: timeline || null,
          status: 'new',
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save contact request' },
        { status: 500 }
      )
    }

    // Send email notification to admin
    try {
      await EmailService.sendCustomEmail(
        { email: 'admin@talio.co.za', name: 'Admin' },
        'New Enterprise Contact Request',
        `
          <h2>New Enterprise Contact Request</h2>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Contact:</strong> ${contactName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Monthly Jobs:</strong> ${monthlyJobs}</p>
          <p><strong>Team Size:</strong> ${teamSize}</p>
          <p><strong>Current Tools:</strong> ${currentTools || 'Not specified'}</p>
          <p><strong>Requirements:</strong> ${requirements || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `
      )
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { success: true, message: 'Contact request submitted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 