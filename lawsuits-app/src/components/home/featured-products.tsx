"use client";
import React from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data";

export function FeaturedProducts() {
  const featuredProducts = products.filter((p) => p.is_featured);

  return (
    <section className="bg-[#1A1512] py-32 border-y border-white/5">
      <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
        <div className="mb-20 flex flex-col items-center text-center space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 block text-sm uppercase tracking-[0.4em] text-accent-yellow bg-white/5 px-6 py-2 font-semibold"
          >
            Curated Excellence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-3xl font-light tracking-tight sm:text-6xl text-white"
          >
            Best <span className="italic">Products</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-sm font-light leading-relaxed text-zinc-400"
          >
            A collection of our most distinguished silhouettes, 
            handcrafted for the modern advocate who demands nothing less than perfection.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-4 md:gap-x-12 md:gap-y-24">
          {featuredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </div>

        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 flex justify-center"
        >
          <button className="group flex items-center gap-6 text-[10px] uppercase tracking-[0.6em] transition-opacity hover:opacity-70">
            View All Collections
            <span className="h-[1px] w-12 bg-foreground transition-all duration-500 group-hover:w-20" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
