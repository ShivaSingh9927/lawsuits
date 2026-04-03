import React from "react";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { products as staticProducts } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // 1. Try static data first for speed (if it exists there)
  let product = staticProducts.find((p) => p.slug === slug);
  
  // 2. If not found in static data, fetch from Supabase
  if (!product) {
    const supabase = await createClient();
    const { data: dbProduct, error } = await supabase
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

    if (dbProduct && !error) {
      // Basic normalization if needed, or use as is
      product = dbProduct as any;
    }
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
