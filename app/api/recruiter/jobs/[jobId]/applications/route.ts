import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request, context: { params: { jobId: string } }) {
  try {
    const jobId = context.params.jobId;

    // Fetch candidate applications
    const { data: candidateApps, error: candidateError } = await supabase
      .from("candidate_applications")
      .select("*, user:users(full_name, email)")
      .eq("job_posting_id", jobId);

    if (candidateError) throw candidateError;

    // Fetch public/detailed applications
    const { data: publicApps, error: publicError } = await supabase
      .from("public_applications")
      .select("*")
      .eq("job_id", jobId);

    if (publicError) throw publicError;

    return NextResponse.json({
      candidateApplications: candidateApps || [],
      publicApplications: publicApps || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 