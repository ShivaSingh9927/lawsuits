import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// GET /api/products/[slug] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*),
      reviews:reviews(
        *,
        user:users(full_name, avatar_url)
      )
    `
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const avgRating = data.reviews?.length
    ? data.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / data.reviews.length
    : 0;

  return NextResponse.json({
    product: data,
    stats: {
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: data.reviews?.length || 0,
    },
  });
}

// PATCH /api/products/[slug] - Update product (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await createAdminClient();
  const { slug } = await params;
  const body = await request.json();

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data, error } = await admin
    .from("products")
    .update(body)
    .eq("id", product.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ product: data });
}

// DELETE /api/products/[slug] - Soft delete product (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await createAdminClient();
  const { slug } = await params;

  const { error } = await admin
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
