"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Product } from "@/types";

import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products?featured=true");
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#1A1512] py-20 border-y border-white/5">
        <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
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

  return (
    <section className="bg-[#1A1512] py-32 border-y border-white/5">
      <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
        <div className="mb-20 flex flex-col items-center text-center space-y-6" id="best-products">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 block text-sm uppercase tracking-[0.4em] text-accent-yellow bg-white/5 px-6 py-2 font-semibold"
          >
            CURATED EXCELLENCE
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-3xl font-light tracking-tight sm:text-6xl text-white"
          >
            BEST <span className="italic">PRODUCTS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-sm font-light leading-relaxed text-white/90"
          >
            A collection of our most distinguished silhouettes, 
            handcrafted for the modern advocate who demands nothing less than perfection.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-4 md:gap-x-12 md:gap-y-24">
          {featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 8).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDark={true}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500 font-light italic opacity-50">
                Discovering your unique collection...
            </div>
          )}
        </div>

        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 flex justify-center"
        >
          <Link href="/shop" className="group relative px-12 py-5 text-[11px] font-black uppercase tracking-[0.5em] text-black transition-all">
            <div className="absolute inset-0 bg-accent-yellow rounded-none transition-transform duration-300 group-hover:scale-105" />
            <span className="relative z-10">EXPLORE FULL COLLECTION</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
