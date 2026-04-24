import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  computeOrderTotals,
  totalsMatch,
  AppliedCoupon,
} from "@/lib/pricing";

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
  const {
    items,
    shipping,
    coupon_code,
    expected,
    appointment_date,
    time_slot,
  } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Optimize: Batch fetch all variants in a single query
  const variantIds = items.map((i: any) => i.variant_id);
  const { data: allVariants, error: fetchError } = await admin
    .from("product_variants")
    .select(`*, product:products(*, images:product_images(*))`)
    .in("id", variantIds);

  if (fetchError) {
    return NextResponse.json({ error: "Failed to verify items" }, { status: 500 });
  }

  const fetchedVariantsMap = new Map(allVariants?.map(v => [v.id, v]));
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const currentVariant = fetchedVariantsMap.get(item.variant_id);
    const currentProduct = currentVariant?.product;

    if (!currentVariant || !currentProduct) {
      // Fallback for missing variant data but known product_id
      const { data: productData } = await admin
        .from("products")
        .select("*, images:product_images(*)")
        .eq("id", item.product_id)
        .single();
      
      if (!productData) {
        return NextResponse.json({ error: `Item ${item.product_name || "Bundle"} not found` }, { status: 404 });
      }

      const itemPrice = productData.base_price || item.unit_price || 0;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: productData.id,
        variant_id: item.variant_id,
        product_name: productData.name,
        variant_size: item.variant_size || "Standard",
        unit_price: itemPrice,
        quantity: item.quantity,
        discount_amount: 0,
        net_price: itemTotal,
        image_url: productData.images?.[0]?.url || "/product-image/demo.webp",
        metadata: item.metadata || {},
      });
      continue;
    }

    if (currentVariant.is_out_of_stock) {
      return NextResponse.json({ error: `Item ${currentProduct.name} is out of stock` }, { status: 400 });
    }

    const itemTotal = currentVariant.price * item.quantity;
    subtotal += itemTotal;

    const primaryImage = currentProduct.images?.find((img: any) => img.is_primary)?.url ||
      currentProduct.images?.[0]?.url ||
      "/product-image/demo.webp";

    orderItems.push({
      product_id: currentVariant.product_id,
      variant_id: currentVariant.id,
      product_name: currentProduct.name,
      variant_size: currentVariant.size,
      unit_price: currentVariant.price,
      quantity: item.quantity,
      discount_amount: 0,
      net_price: itemTotal,
      image_url: primaryImage,
      metadata: item.metadata || {},
    });
  }

  // Load + validate coupon (if provided). We only trust the coupon row from
  // the DB; the client cannot influence discount type or value.
  let couponId: string | null = null;
  let currentCoupon: any = null;
  let appliedCoupon: AppliedCoupon | null = null;

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
        couponId = coupon.id;
        currentCoupon = coupon;
        appliedCoupon = { type: coupon.type, value: coupon.value };
      }
    }
  }

  // Authoritative totals - computed from DB prices and DB coupon.
  const totals = computeOrderTotals(
    orderItems.map((i) => ({
      name: i.product_name,
      unitPrice: i.unit_price,
      qty: i.quantity,
    })),
    appliedCoupon
  );
  const {
    subtotal: computedSubtotal,
    discount: discountTotal,
    shipping: shippingCost,
    tax,
    total,
  } = totals;

  // If the client told us what it displayed, reject any mismatch. This
  // prevents both (a) silent overcharge when UI / API formulas drift and
  // (b) tampered requests that try to underpay.
  if (expected && !totalsMatch(expected, totals)) {
    return NextResponse.json(
      {
        error:
          "Pricing changed since you loaded this page. Please refresh and try again.",
        expected,
        actual: {
          subtotal: computedSubtotal,
          discount: discountTotal,
          shipping: shippingCost,
          tax,
          total,
        },
      },
      { status: 409 }
    );
  }

  // Ensure user exists in public.users to satisfy foreign key constraints
  const { error: userSyncError } = await admin.from("users").upsert({
    id: user.id,
    email: user.email || shipping.email,
    role: "customer"
  }, { onConflict: "id", ignoreDuplicates: true });

  if (userSyncError) {
    console.error("User sync error:", userSyncError);
  }

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
  // if (appointment_date && time_slot) {
  //   await admin.from("service_appointments").insert({
  //     order_id: order.id,
  //     user_id: user.id,
  //     status: "pending",
  //     scheduled_date: appointment_date,
  //     time_slot,
  //     notes: shipping.notes || null,
  //   });
  // }

  return NextResponse.json({ order }, { status: 201 });
}
