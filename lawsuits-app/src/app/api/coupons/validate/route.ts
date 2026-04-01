import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { code, subtotal } = body;

  if (!code || !subtotal) {
    return NextResponse.json(
      { error: "Code and subtotal are required" },
      { status: 400 }
    );
  }

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    return NextResponse.json(
      { valid: false, message: "Invalid coupon code" },
      { status: 404 }
    );
  }

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({
      valid: false,
      message: "This coupon has expired",
    });
  }

  // Check start date
  if (new Date(coupon.starts_at) > new Date()) {
    return NextResponse.json({
      valid: false,
      message: "This coupon is not active yet",
    });
  }

  // Check min purchase
  if (subtotal < coupon.min_purchase_amount) {
    return NextResponse.json({
      valid: false,
      message: `Minimum purchase of ₹${coupon.min_purchase_amount.toLocaleString()} required`,
    });
  }

  // Check max uses
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return NextResponse.json({
      valid: false,
      message: "This coupon has been fully redeemed",
    });
  }

  // Calculate discount
  let discount = 0;
  switch (coupon.type) {
    case "percentage":
      discount = Math.round(subtotal * (coupon.value / 100));
      break;
    case "fixed":
      discount = coupon.value;
      break;
    case "free_shipping":
      discount = 0;
      break;
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      message:
        coupon.type === "percentage"
          ? `${coupon.value}% off applied`
          : coupon.type === "fixed"
          ? `₹${coupon.value} off applied`
          : "Free shipping applied",
    },
  });
}
