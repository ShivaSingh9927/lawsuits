import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/auth/check-existence
// Body: { email?: string, phone?: string }
// Response: { emailTaken: boolean, phoneTaken: boolean }
//
// Used by the checkout page to decide if the "Create account & save 5%"
// new-user discount is available, and to surface inline sign-in when a
// duplicate is detected. Reads from public.users which is kept in sync
// with auth.users by the on_auth_user_created trigger.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawPhone = typeof body.phone === "string" ? normalizePhone(body.phone) : "";

    const admin = await createAdminClient();

    let emailTaken = false;
    let phoneTaken = false;

    if (rawEmail) {
      const { data, error } = await admin
        .from("users")
        .select("id")
        .ilike("email", rawEmail)
        .limit(1)
        .maybeSingle();
      if (error && error.code !== "PGRST116") {
        console.error("check-existence email error", error);
      }
      emailTaken = !!data;
    }

    if (rawPhone) {
      // Match on normalized suffix (last 10 digits) to handle +91 / spaces.
      const suffix = rawPhone.slice(-10);
      const { data, error } = await admin
        .from("users")
        .select("id, phone")
        .ilike("phone", `%${suffix}`)
        .limit(1)
        .maybeSingle();
      if (error && error.code !== "PGRST116") {
        console.error("check-existence phone error", error);
      }
      phoneTaken = !!data;
    }

    return NextResponse.json({ emailTaken, phoneTaken });
  } catch (err) {
    console.error("check-existence failed", err);
    return NextResponse.json(
      { emailTaken: false, phoneTaken: false, error: "check_failed" },
      { status: 200 }
    );
  }
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D+/g, "");
}
