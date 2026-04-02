"use client";
import React from "react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { ProductCard } from "./product-card";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  className?: string;
}

export function ProductCarousel({ 
  title, 
  subtitle, 
  products, 
  className 
}: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className={className}>
      <div className="flex flex-col mb-12">
        {subtitle && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 block text-xs uppercase tracking-[0.4em] text-accent-yellow"
          >
            {subtitle}
          </motion.span>
        )}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-3xl font-light tracking-tight sm:text-4xl"
        >
          {title}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
