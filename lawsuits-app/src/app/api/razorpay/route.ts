import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// POST /api/razorpay - Create Razorpay order (supports guest checkout)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { order_id } = body;

  // Fetch the order via admin so guest orders (user_id IS NULL) are visible.
  // We still scope it: signed-in users may only pay their own pending orders;
  // unauthenticated callers may only pay a pending is_guest order.
  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_status && order.payment_status !== "pending") {
    return NextResponse.json({ error: "Order already processed" }, { status: 400 });
  }

  if (user) {
    if (order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized for this order" }, { status: 403 });
    }
  } else {
    if (!order.is_guest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Create Razorpay order
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpaySecret) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 500 }
    );
  }

  const auth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString(
    "base64"
  );

  const razorpayResponse = await fetch(
    "https://api.razorpay.com/v1/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(order.total * 100), // Razorpay uses paise
        currency: "INR",
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          user_id: user?.id ?? "",
          is_guest: order.is_guest ? "true" : "false",
        },
      }),
    }
  );

  const razorpayOrder = await razorpayResponse.json();

  if (!razorpayResponse.ok) {
    return NextResponse.json(
      { error: razorpayOrder.error?.description || "Failed to create payment" },
      { status: 400 }
    );
  }

  // Update order with Razorpay order ID
  await admin
    .from("orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", order_id);

  return NextResponse.json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: razorpayKeyId,
  });
}
