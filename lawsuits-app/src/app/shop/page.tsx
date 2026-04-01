import React, { Suspense } from "react";
import { ShopPageClient } from "@/components/shop/shop-page-client";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
      <ShopPageClient />
    </Suspense>
  );
}
