import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/razorpay/verify - Verify Razorpay payment
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } =
    body;

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpaySecret) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 500 }
    );
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", razorpaySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Update order
  const { data: order, error } = await admin
    .from("orders")
    .update({
      payment_status: "captured",
      status: "confirmed",
      razorpay_payment_id,
    })
    .eq("id", order_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    order,
    message: "Payment verified successfully",
  });
}
