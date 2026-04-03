import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// GET /api/orders - List user's orders
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*),
      appointment:service_appointments(*),
      coupon:coupons(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { items, shipping, coupon_code, appointment_date, time_slot } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    // Fetch variant with product and its primary image
    const { data: variant, error: variantError } = await admin
      .from("product_variants")
      .select(`
        *,
        product:products(
          *,
          images:product_images(*)
        )
      `)
      .eq("id", item.variant_id)
      .single();

    if (variantError || !variant || variant.is_out_of_stock || variant.stock_quantity < item.quantity) {
      return NextResponse.json(
        { error: `Item ${variant?.product?.name || "unknown"} is out of stock` },
        { status: 400 }
      );
    }

    const itemTotal = variant.price * item.quantity;
    subtotal += itemTotal;

    // Find primary image URL or fallback to first image
    const primaryImage = (variant.product as any).images?.find((img: any) => img.is_primary)?.url || 
                         (variant.product as any).images?.[0]?.url || 
                         "/product-image/demo.webp";

    orderItems.push({
      product_id: variant.product_id,
      variant_id: variant.id,
      product_name: (variant.product as any).name,
      variant_size: variant.size,
      unit_price: variant.price,
      quantity: item.quantity,
      discount_amount: 0,
      net_price: itemTotal,
      image_url: primaryImage,
    });
  }

  // Apply coupon
  let discountTotal = 0;
  let couponId = null;
  let currentCoupon = null;

  if (coupon_code) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", coupon_code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (coupon) {
      const isValid =
        subtotal >= coupon.min_purchase_amount &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        (coupon.max_uses === null || coupon.current_uses < coupon.max_uses);

      if (isValid) {
        if (coupon.type === "percentage") {
          discountTotal = Math.round(subtotal * (coupon.value / 100));
        } else if (coupon.type === "fixed") {
          discountTotal = coupon.value;
        }
        couponId = coupon.id;
        currentCoupon = coupon;
      }
    }
  }

  const shippingCost = subtotal >= 5000 ? 0 : 299;
  const tax = Math.round((subtotal - discountTotal) * 0.18);
  const total = subtotal - discountTotal + shippingCost + tax;

  // Create order
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      subtotal,
      discount_total: discountTotal,
      shipping_cost: shippingCost,
      tax,
      total,
      coupon_id: couponId,
      shipping_name: shipping.name,
      shipping_phone: shipping.phone,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_state: shipping.state,
      shipping_postal_code: shipping.postalCode,
      shipping_country: "India",
      payment_status: "pending",
      notes: shipping.notes || null,
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  // Create order items
  await admin.from("order_items").insert(
    orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))
  );

  // Increment coupon usage
  if (couponId && currentCoupon) {
    await admin
      .from("coupons")
      .update({ current_uses: currentCoupon.current_uses + 1 })
      .eq("id", couponId);

    await admin.from("order_discounts").insert({
      order_id: order.id,
      coupon_id: couponId,
      applied_amount: discountTotal,
    });
  }

  // Create appointment if home fitting
  if (appointment_date && time_slot) {
    await admin.from("service_appointments").insert({
      order_id: order.id,
      user_id: user.id,
      status: "pending",
      scheduled_date: appointment_date,
      time_slot,
      notes: shipping.notes || null,
    });
  }

  return NextResponse.json({ order }, { status: 201 });
}
