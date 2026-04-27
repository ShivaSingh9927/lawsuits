import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/orders/[id]/cancel
// Marks a still-pending order as cancelled (e.g. user dismissed the
// Razorpay modal or the payment failed verification). Stock is never
// touched here because stock is now decremented only on successful
// payment verification. Idempotent: only transitions when the order is
// currently pending.
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("orders")
    .update({
      status: "cancelled",
      payment_status: "failed",
    })
    .eq("id", id)
    .eq("payment_status", "pending")
    .select("id, status, payment_status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    cancelled: !!data,
    order: data,
  });
}
