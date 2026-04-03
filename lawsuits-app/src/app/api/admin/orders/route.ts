import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate the request
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Admin/Staff Role
    const { data: profile, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 3. Fetch Hydrated Orders (using Admin Client to bypass RLS if necessary, 
    // although the service role allows full access anyway)
    const adminSupabase = await createAdminClient();
    const { data: orders, error: fetchError } = await adminSupabase
      .from("orders")
      .select(`
        *,
        user:users(full_name, email),
        items:order_items(*),
        appointment:service_appointments(*),
        coupon:coupons(*)
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Admin Orders Fetch Error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Role Check
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Update Order Status
    const { orderId, status, paymentStatus } = await request.json();
    if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    const adminSupabase = await createAdminClient();
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.payment_status = paymentStatus;
    updateData.updated_at = new Date().toISOString();

    const { data: order, error: updateError } = await adminSupabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
