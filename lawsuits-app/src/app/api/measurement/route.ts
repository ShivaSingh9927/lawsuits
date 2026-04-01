import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/measurement - Get user's measurements
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_measurements")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ measurements: data });
}

// POST /api/measurement - Create/Update user's measurements
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { neck, chest, waist, hips, inseam, sleeve, shoulder, notes } = body;

  // Check if measurements exist
  const { data: existing } = await supabase
    .from("user_measurements")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from("user_measurements")
      .update({
        neck,
        chest,
        waist,
        hips,
        inseam,
        sleeve,
        shoulder,
        notes,
      })
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("user_measurements")
      .insert({
        user_id: user.id,
        neck,
        chest,
        waist,
        hips,
        inseam,
        sleeve,
        shoulder,
        notes,
      })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json({ measurements: result.data });
}
