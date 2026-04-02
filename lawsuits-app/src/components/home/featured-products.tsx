"use client";
import React from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data";

export function FeaturedProducts() {
  const featuredProducts = products.filter((p) => p.is_featured);

  return (
    <section className="bg-[#FDFCFB] py-32">
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="mb-20 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-4">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] uppercase tracking-[0.5em] text-accent-yellow"
            >
              Curated Excellence
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-serif text-5xl font-light leading-tight tracking-tight text-foreground md:text-6xl"
            >
              Best <br /> <span className="italic">Products</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-xs text-sm font-light leading-relaxed text-muted-foreground"
          >
            A collection of our most distinguished silhouettes, 
            handcrafted for the modern advocate who demands nothing less than perfection.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              className={index === 1 ? "md:translate-y-20" : ""}
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
