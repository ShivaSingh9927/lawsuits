import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// GET /api/reviews?product_id=xxx - Get reviews for a product
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json(
      { error: "product_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      user:users(full_name, avatar_url)
    `
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const avgRating = data.length
    ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
    : 0;

  return NextResponse.json({
    reviews: data,
    stats: {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: data.length,
    },
  });
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { product_id, order_id, rating, comment } = body;

  if (!product_id || !rating) {
    return NextResponse.json(
      { error: "product_id and rating are required" },
      { status: 400 }
    );
  }

  // Check if user purchased this product
  const { data: userOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", user.id);

  const orderIds = userOrders?.map((o) => o.id) || [];

  let isVerified = false;
  if (orderIds.length > 0) {
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", product_id)
      .in("order_id", orderIds)
      .single();

    isVerified = !!orderItem;
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id,
      user_id: user.id,
      order_id,
      rating,
      comment,
      is_verified_purchase: isVerified,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}
