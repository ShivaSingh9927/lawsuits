import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const fit = searchParams.get("fit");
  const fabric = searchParams.get("fabric");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `,
      { count: "exact" }
    )
    .is("deleted_at", null)
    .eq("is_visible", true);

  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (fit) query = query.eq("fit", fit);
  if (fabric) query = query.ilike("fabric", `%${fabric}%`);
  if (minPrice) query = query.gte("base_price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("base_price", parseFloat(maxPrice));
  if (featured === "true") query = query.eq("is_featured", true);
  if (search) query = query.ilike("name", `%${search}%`);

  switch (sort) {
    case "price-asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  console.log(`[API /api/products] Executing Supabase query for ${limit} items...`);
  const startTime = Date.now();
  
  try {
    const { data, error, count } = await query;
    console.log(`[API /api/products] Supabase query returned in ${Date.now() - startTime}ms. Error: ${error?.message || 'None'}, Data: ${data?.length || 0} items`);

    if (error) {
      console.error("[API /api/products] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      products: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error(`[API /api/products] CRITICAL FATAL EXCEPTION after ${Date.now() - startTime}ms:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products - Create product (admin)
export async function POST(request: NextRequest) {
  const admin = await createAdminClient();

  const body = await request.json();
  const { name, description, category_id, base_price, compare_at_price, cost_per_item, fabric, fit, color, variants, images } = body;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data: product, error } = await admin
    .from("products")
    .insert({
      name,
      slug,
      description,
      category_id,
      base_price,
      compare_at_price,
      cost_per_item,
      fabric,
      fit,
      color,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (variants?.length) {
    await admin.from("product_variants").insert(
      variants.map((v: Record<string, unknown>) => ({
        ...v,
        product_id: product.id,
      }))
    );
  }

  if (images?.length) {
    await admin.from("product_images").insert(
      images.map((img: Record<string, unknown>, i: number) => ({
        ...img,
        product_id: product.id,
        position: i,
        is_primary: i === 0,
      }))
    );
  }

  return NextResponse.json({ product }, { status: 201 });
}
