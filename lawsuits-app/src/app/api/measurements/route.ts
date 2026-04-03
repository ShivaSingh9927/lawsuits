import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: measurements, error } = await supabase
    .from("user_measurements")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is 'no rows returned'
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ measurements: measurements || null });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { 
    neck, 
    chest, 
    waist, 
    hips, 
    inseam, 
    sleeve, 
    shoulder, 
    notes 
  } = body;

  const { data: measurements, error } = await supabase
    .from("user_measurements")
    .upsert({
      user_id: user.id,
      neck: neck ? parseFloat(neck) : null,
      chest: chest ? parseFloat(chest) : null,
      waist: waist ? parseFloat(waist) : null,
      hips: hips ? parseFloat(hips) : null,
      inseam: inseam ? parseFloat(inseam) : null,
      sleeve: sleeve ? parseFloat(sleeve) : null,
      shoulder: shoulder ? parseFloat(shoulder) : null,
      notes,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ measurements });
}
