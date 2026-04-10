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
        let res = await fetch("/api/products?limit=100");
        let data = await res.json();
        const allProducts = data.products || [];

        // Target exactly 4 specific categories: Coat, Gown, Waistcoat, Pant cloth
        const targetKeywords = ["coat", "gown", "waistcoat", "pant cloth"];
        
        const prioritized = targetKeywords.map(keyword => {
          return allProducts.find((p: Product) => 
            p.name.toLowerCase().includes(keyword) && 
            !p.name.toLowerCase().includes("combo") &&
            !p.name.toLowerCase().includes("suit")
          );
        }).filter(Boolean) as Product[];

        setFeaturedProducts(prioritized.slice(0, 4));
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
      <section className="bg-white py-20 border-y border-zinc-100">
        <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="aspect-[3/4] w-full bg-zinc-100" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-zinc-100" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-32 border-y border-zinc-100">
      <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
        <div className="mb-20 flex flex-col items-center text-center space-y-6" id="best-products">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-3xl font-light tracking-tight sm:text-6xl text-zinc-900 uppercase"
          >
            BEST <span className="italic font-normal">PRODUCTS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-[10px] uppercase tracking-[0.3em] leading-relaxed text-zinc-400"
          >
            A collection of our most distinguished silhouettes,
            handcrafted for the modern advocate who demands nothing less than perfection.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-3 lg:grid-cols-4 md:gap-x-12 md:gap-y-24">
          {featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 4).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onDark={false}
                />
              </motion.div>
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
          <Link href="/shop" className="group relative px-12 py-5 text-[11px] font-black uppercase tracking-[0.5em] text-white transition-all">
            <div className="absolute inset-0 bg-black rounded-none transition-transform duration-300 group-hover:scale-105" />
            <span className="relative z-10">EXPLORE FULL COLLECTION</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
