import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    if (!file || !userId || !name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the user is uploading for themselves
    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(`${userId}/${file.name}`, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(`${userId}/${file.name}`);

    const { data: documentData, error: documentError } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        name,
        type,
        url: urlData.publicUrl,
      })
      .select();

    if (documentError) throw documentError;

    return NextResponse.json(documentData);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 