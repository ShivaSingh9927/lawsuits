import React from "react";
import { redirect } from "next/navigation";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { products as staticProducts } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug;
  const rawSlug = Array.isArray(slugArray) ? slugArray.join(" ") : slugArray || "";
  const slug = decodeURIComponent(rawSlug);
  

  // 1. Try fetching from Supabase first
  const supabase = await createClient();
  const decodedSlug = decodeURIComponent(slug);
  let product: any = null;

  try {
    // First try exact match
    const { data: dbProduct, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*),
        package_items:package_deals!package_deals_main_product_id_fkey(
          *,
          component:products!package_deals_component_id_fkey(
            *,
            variants:product_variants(*)
          )
        )
      `)
      .eq("slug", slug)
      .is("deleted_at", null)
      .eq("is_visible", true)
      .single();

    if (dbProduct && !error) {
      product = dbProduct;
    } else {
      // If exact match fails, try fuzzy match

      const { data: fuzzyProduct, error: fuzzyError } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          package_items:package_deals!package_deals_main_product_id_fkey(
            *,
            component:products!package_deals_component_id_fkey(
              *,
              variants:product_variants(*)
            )
          )
        `)
        .or(`slug.ilike."${slug}",slug.ilike."${decodedSlug}",slug.ilike."${decodedSlug.replace(/ /g, "-")}",slug.ilike."${decodedSlug.toLowerCase().replace(/ /g, "-")}"`)
        .is("deleted_at", null)
        .eq("is_visible", true)
        .limit(1)
        .maybeSingle();

      if (fuzzyProduct) {
        product = fuzzyProduct;
      }
    }
  } catch (err) {
    console.error("Supabase catch-all error:", err);
  }

  // 2. Fallback to static data if not found in database
  if (!product) {
    product = staticProducts.find((p) => p.slug === slug);
  }

  if (!product) {
    redirect("/shop");
  }

  return <ProductDetailClient product={product} />;
}
