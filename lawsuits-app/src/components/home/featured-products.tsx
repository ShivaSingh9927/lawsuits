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
        // Fetch featured products first
        let res = await fetch("/api/products?featured=true&limit=20");
        let data = await res.json();
        let products = data.products || [];

        // If we have few featured products or want more diversity, fetch more and mix
        if (products.length < 4) {
          const resAll = await fetch("/api/products?limit=50");
          const dataAll = await resAll.json();
          const allProducts = dataAll.products || [];
          
          // Use a Map to ensure category diversity
          const categoryMap = new Map();
          
          // First add existing featured products
          products.forEach((p: Product) => {
            if (p.category_id) categoryMap.set(p.category_id, [...(categoryMap.get(p.category_id) || []), p]);
          });

          // Then add from all products to fill gaps
          allProducts.forEach((p: Product) => {
            if (p.category_id && !categoryMap.has(p.category_id)) {
              categoryMap.set(p.category_id, [p]);
            } else if (p.category_id) {
              const list = categoryMap.get(p.category_id);
              if (list.length < 2) list.push(p);
            }
          });

          // Flatten and pick top products
          const diverseList: Product[] = [];
          const iterators = Array.from(categoryMap.values());
          let i = 0;
          while (diverseList.length < 12 && diverseList.length < allProducts.length + products.length) {
             const list = iterators[i % iterators.length];
             const item = list.shift();
             if (item) diverseList.push(item);
             i++;
             if (i > 100) break; // safety
          }
          products = diverseList;
        }

        setFeaturedProducts(products);
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
            className="font-serif text-3xl font-light tracking-tight sm:text-6xl text-white uppercase"
          >
            BEST <span className="italic">PRODUCTS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-[10px] uppercase tracking-[0.3em] leading-relaxed text-white/50"
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
                  onDark={true}
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
          <Link href="/shop" className="group relative px-12 py-5 text-[11px] font-black uppercase tracking-[0.5em] text-black transition-all">
            <div className="absolute inset-0 bg-accent-yellow rounded-none transition-transform duration-300 group-hover:scale-105" />
            <span className="relative z-10">EXPLORE FULL COLLECTION</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
