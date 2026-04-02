"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { categories } from "@/lib/data";

export function CategoryGrid() {
  return (
    <section className="bg-white py-32 overflow-hidden border-y border-border/40">
      <div className="mx-auto max-w-screen-2xl px-12 lg:px-32 text-center items-center">
        <div className="mb-24 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 block text-sm uppercase tracking-[0.4em] text-black bg-black/5 px-6 py-2 font-semibold"
          >
            Legal Attire
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-4xl font-light tracking-tight sm:text-6xl"
          >
            Advocate Dress Products
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, staggerChildren: 0.1 }}
          className="grid grid-cols-2 gap-12 sm:grid-cols-3 lg:grid-cols-5"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
            >
              <Link
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="group flex flex-col items-center"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted transition-transform duration-700 group-hover:-translate-y-3">
                  <Image
                    src={category.image_url || "/placeholder-category.jpg"}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                </div>
                
                <div className="mt-10 text-center">
                  <h3 className="font-serif text-xl tracking-tight text-black transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-3 text-sm uppercase tracking-[0.1em] text-black/40 font-bold">
                    {category.product_count} products
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
