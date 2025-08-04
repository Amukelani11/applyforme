import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request, context: { params: { id: string } }) {
  const supabase = createClient()
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "candidate";
    const id = context.params.id;
    let data, error;

    if (type === "candidate") {
      ({ data, error } = await supabase
        .from("candidate_applications")
        .select("*")
        .eq("id", id)
        .single());
    } else {
      ({ data, error } = await supabase
        .from("public_applications")
        .select("*")
        .eq("id", id)
        .single());
    }
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 