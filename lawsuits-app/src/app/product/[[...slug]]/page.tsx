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
  const slug = Array.isArray(slugArray) ? slugArray.join(" ") : slugArray || "";
  console.log("DEBUG: ProductPage hitting with slug:", slug);
  
  // 1. Try static data first for speed (if it exists there)
  let product = staticProducts.find((p) => p.slug === slug);
  
  // 2. If not found in static data, fetch from Supabase
  if (!product) {
    const supabase = await createClient();
    const decodedSlug = decodeURIComponent(slug);
    
    // First try exact match
    let { data: dbProduct, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq("slug", slug)
      .is("deleted_at", null)
      .eq("is_visible", true)
      .single();

    // If exact match fails, try case-insensitive and hyphen-check
    if (!dbProduct || error) {
      const { data: fuzzyProduct } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .or(`slug.ilike.${slug},slug.ilike.${decodedSlug},slug.ilike.${decodedSlug.replace(/ /g, "-")},slug.ilike.${decodedSlug.toLowerCase().replace(/ /g, "-")}`)
        .is("deleted_at", null)
        .eq("is_visible", true)
        .limit(1)
        .single();
      
      dbProduct = fuzzyProduct;
    }

    if (dbProduct && !error) {
      // Basic normalization if needed, or use as is
      product = dbProduct as any;
    }
  }

  if (!product) {
    redirect("/shop");
  }

  return <ProductDetailClient product={product} />;
}
