"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
        // Fetch products and filter for combos
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
    <section className="bg-black py-32 overflow-hidden border-y border-white/5">
      <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-32">
        <div className="mb-24 flex flex-col items-center text-center space-y-8">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="flex flex-col items-center gap-4"
           >
              <span className="text-sm uppercase tracking-[0.4em] text-accent-yellow bg-white/5 px-6 py-2 font-semibold">CURATED ENSEMBLES</span>
           </motion.div>
           
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="font-serif text-4xl sm:text-4xl lg:text-6xl text-white font-light tracking-tight leading-[1.1] uppercase"
           >
              PROFESSIONAL <span className="italic text-accent-yellow/90">COMBOS</span>
           </motion.h2>

           <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.4 }}
             className="text-base sm:text-lg text-zinc-100/70 font-light max-w-2xl leading-relaxed uppercase tracking-[0.2em] text-xs sm:text-sm"
           >
              Elevate your presence with our meticulously paired multi-piece sets. 
              Designed for maximum impact and seamless coordination within the court.
           </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-4 md:gap-x-12 md:gap-y-24">
          {combos.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard 
                product={product} 
                onDark={true}
              />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 flex justify-center"
        >
          <Link href="/shop?category=combos" className="group relative px-12 py-5 text-[11px] font-black uppercase tracking-[0.5em] text-black transition-all">
            <div className="absolute inset-0 bg-accent-yellow rounded-none transition-transform duration-300 group-hover:scale-105" />
            <span className="relative z-10 flex items-center gap-4">
               EXPLORE ALL PACKAGES
               <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}