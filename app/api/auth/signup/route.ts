import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sign up the user first - Supabase auth will handle duplicate email checks
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      // Check if it's a duplicate email error
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: authError.status || 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user profile only if auth user was created successfully
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        subscription_status: "trial",
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // If profile creation fails but auth user exists, we should still return success
      // as the user can complete their profile later
      console.warn("User authenticated but profile creation failed. User can complete profile later.");
    }

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
} 