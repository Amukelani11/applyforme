"use server"

import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function submitPublicApplication(jobId: number, formData: FormData) {
  try {
    const supabase = createClient()
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const cvFile = formData.get("cv") as File;

    if (!fullName || !email || !cvFile) {
      return { success: false, error: "Missing required fields." };
    }
    
    // 1. Upload CV to storage
    const fileExtension = cvFile.name.split(".").pop();
    const cvFileName = `${nanoid()}.${fileExtension}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(`public/${cvFileName}`, cvFile);

    if (uploadError) {
      console.error("Error uploading CV:", uploadError);
      return { success: false, error: "Failed to upload CV." };
    }
    
    const cvUrl = supabase.storage.from("documents").getPublicUrl(uploadData.path).data.publicUrl;

    // Insert into documents table after CV upload
    await supabase.from('documents').insert({
      user_id: email,
      name: cvFile.name,
      type: 'cv',
      url: uploadData.path,
    });

    // 2. Call the atomic function to insert the application
    const { data, error } = await supabase.rpc(
      "increment_public_app_count_and_insert",
      {
        p_job_id: jobId,
        p_full_name: fullName,
        p_email: email,
        p_cv_url: cvUrl,
      }
    );

    if (error) {
      console.error("Error submitting application:", error);
      // Check for the specific error message from the function
      if (error.message.includes("Application limit reached")) {
        return { success: false, error: "This job is no longer accepting public applications." };
      }
      return { success: false, error: "Failed to submit application." };
    }
    
    revalidatePath(`/jobs/public/`); // Revalidate relevant paths
    return { success: true, data };

  } catch (error) {
    console.error("Unexpected error in submitPublicApplication:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
} 