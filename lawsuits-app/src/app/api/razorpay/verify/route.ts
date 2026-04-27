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
  const { sendOrderConfirmation } = await import("@/lib/mail");

  // Conditionally update order: only transition pending -> captured. This
  // makes the endpoint idempotent so a retried verify call cannot decrement
  // stock twice.
  const { data: order, error } = await admin
    .from("orders")
    .update({
      payment_status: "captured",
      status: "confirmed",
      razorpay_payment_id,
    })
    .eq("id", order_id)
    .neq("payment_status", "captured")
    .select(`
      *,
      items:order_items(*),
      user:users(email, full_name)
    `)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If no row was updated, the order was already captured previously. Fetch
  // it for the response and skip stock decrement.
  let finalOrder = order;
  let alreadyCaptured = false;
  if (!finalOrder) {
    alreadyCaptured = true;
    const { data: existing, error: fetchErr } = await admin
      .from("orders")
      .select(`
        *,
        items:order_items(*),
        user:users(email, full_name)
      `)
      .eq("id", order_id)
      .single();
    if (fetchErr || !existing) {
      return NextResponse.json(
        { error: fetchErr?.message || "Order not found" },
        { status: 404 }
      );
    }
    finalOrder = existing;
  }

  // Decrement stock now that payment is confirmed (only on first capture).
  // For bundles we decrement each component variant in addition to the parent
  // (component variant_ids live in order_items.metadata.components).
  if (!alreadyCaptured && Array.isArray(finalOrder.items)) {
    const decrementVariant = async (variantId: string, qty: number) => {
      const { data: variant, error: vErr } = await admin
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", variantId)
        .single();
      if (vErr || !variant) return;
      const nextStock = (variant.stock_quantity || 0) - qty;
      await admin
        .from("product_variants")
        .update({
          stock_quantity: nextStock,
          is_out_of_stock: nextStock <= 0,
        })
        .eq("id", variantId);
    };

    for (const item of finalOrder.items) {
      if (!item.quantity) continue;
      if (item.variant_id) {
        await decrementVariant(item.variant_id, item.quantity);
      }
      const components = item.metadata?.components;
      if (Array.isArray(components)) {
        for (const c of components) {
          if (c?.variant_id) {
            await decrementVariant(c.variant_id, item.quantity);
          }
        }
      }
    }
  }

  // Send confirmation email (fall back to guest_email for guest checkouts).
  // Skip when this is an idempotent re-verify of an already-captured order.
  if (!alreadyCaptured) {
    const recipientEmail: string | undefined =
      finalOrder.user?.email || finalOrder.guest_email || undefined;
    try {
      if (recipientEmail) {
        await sendOrderConfirmation(recipientEmail, {
          orderNumber: finalOrder.order_number,
          customerName: finalOrder.shipping_name,
          totalAmount: finalOrder.total,
          items: finalOrder.items,
          shippingAddress: `${finalOrder.shipping_address}, ${finalOrder.shipping_city}, ${finalOrder.shipping_state} ${finalOrder.shipping_postal_code}`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Continue despite email error to not break the successful transaction flow
    }
  }

  return NextResponse.json({
    success: true,
    order: finalOrder,
    message: "Payment verified successfully",
  });
}
