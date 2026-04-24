import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/auth/signup-at-checkout
// Body: { email, password, fullName, phone }
// Creates a confirmed auth user (no email verification round-trip) so the
// shopper can complete their order immediately. Client should follow this
// with supabase.auth.signInWithPassword(...) to establish the session.
//
// Returns 409 with { emailTaken?: boolean, phoneTaken?: boolean } if the
// account already exists; the client will switch to inline Sign In.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const admin = await createAdminClient();

    // Uniqueness check (server-authoritative)
    let emailTaken = false;
    let phoneTaken = false;

    {
      const { data } = await admin
        .from("users")
        .select("id")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();
      emailTaken = !!data;
    }

    if (phone) {
      const suffix = phone.replace(/\D+/g, "").slice(-10);
      if (suffix) {
        const { data } = await admin
          .from("users")
          .select("id")
          .ilike("phone", `%${suffix}`)
          .limit(1)
          .maybeSingle();
        phoneTaken = !!data;
      }
    }

    if (emailTaken || phoneTaken) {
      return NextResponse.json(
        {
          error: "An account with this email or phone already exists",
          emailTaken,
          phoneTaken,
        },
        { status: 409 }
      );
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });

    if (error || !data.user) {
      console.error("signup-at-checkout createUser failed", error);
      return NextResponse.json(
        { error: error?.message || "Failed to create account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ userId: data.user.id, email: data.user.email });
  } catch (err) {
    console.error("signup-at-checkout failed", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
