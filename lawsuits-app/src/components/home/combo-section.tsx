"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Product } from "@/types";
import { ArrowRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export function ComboSection() {
  const [combos, setCombos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        // Fetch all products and filter for combos (SKU starting with TDO-PKG)
        const res = await fetch("/api/products?limit=50");
        const data = await res.json();
        const filtered = (data.products || []).filter((p: Product) => 
          p.category?.name === "Package Deals" || 
          p.category?.slug === "package-deals" ||
          p.name.toLowerCase().match(/piece|set|combo|package/) ||
          p.description?.toLowerCase().match(/piece|set|combo|package/)
        );
        setCombos(filtered);
      } catch (error) {
        console.error("Error fetching combos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  if (loading) {
    return (
      <section className="bg-black py-20">
        <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="aspect-[3/4] w-full bg-white/5" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (combos.length === 0) return null;

  return (
    <section className="bg-black py-32 overflow-hidden">
      <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
          <div className="max-w-3xl space-y-8">
             <div className="flex items-center gap-4">
                <span className="h-[1px] w-12 bg-accent-yellow/40" />
                <span className="text-sm uppercase tracking-[0.5em] text-accent-yellow font-black">Curated Ensembles</span>
             </div>
             <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.1]">
                Professional <br />
                <span className="italic text-accent-yellow/90">Combos</span>
             </h2>
             <p className="text-lg text-zinc-100 font-medium max-w-xl leading-relaxed">
                Elevate your presence with our meticulously paired multi-piece sets. 
                Designed for maximum impact and seamless coordination.
             </p>
          </div>
          <Link href="/shop?category=combos" className="group flex items-center gap-6 text-[11px] uppercase tracking-[0.5em] text-white font-black transition-all hover:text-accent-yellow">
             Explore All Packages
             <div className="relative flex h-12 w-12 items-center justify-center border border-white/20 rounded-full transition-all duration-500 group-hover:border-accent-yellow group-hover:bg-accent-yellow">
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:text-black group-hover:translate-x-1 text-white" />
             </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-4 md:gap-x-12 md:gap-y-24">
          {combos.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onDark={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
