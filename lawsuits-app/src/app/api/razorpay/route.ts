import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// POST /api/razorpay - Create Razorpay order
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { order_id } = body;

  // Get order from DB
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
          user_id: user.id,
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
  const admin = await createAdminClient();
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
