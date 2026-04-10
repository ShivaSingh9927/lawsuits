"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Category } from "@/types";

import { Skeleton } from "@/components/ui/skeleton";

export function CategoryGrid() {
  return (
    <section className="bg-white py-32 overflow-hidden border-y border-border/40">
      <div className="mx-auto max-w-screen-2xl px-8 py-20 lg:px-32 text-center items-center">
        <div className="mb-12 sm:mb-24 flex flex-col items-center text-center">
          {/* <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 block text-sm uppercase tracking-[0.4em] text-black bg-black/5 px-6 py-2 font-semibold"
          >
            LEGAL ATTIRE
          </motion.span> */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-3xl font-light tracking-tight sm:text-6xl"
          >
            ADVOCATE DRESS <span className="italic text-accent-yellow">PRODUCTS</span>
          </motion.h2>
        </div>

        <div className="relative group/slider">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
          >
            {[
              { name: "Men", slug: "mens-legal-attire", image: "/Category Images/MLA-2026.jpg" },
              { name: "Women", slug: "womens-legal-attire", image: "/Category Images/WLA-2026.jpeg" },
              { name: "Accessories", slug: "accessories", image: "/Category Images/LA-2026.png" },
              { name: "Combos", slug: "combos", image: "/Category Images/PKD-2026.jpg" },
            ].map((cat, index) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="w-full flex-shrink-0"
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted transition-transform duration-700 group-hover:-translate-y-3">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 280px, 320px"
                      className="object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                  </div>
                  
                  <div className="mt-10 text-center">
                    <h3 className="font-serif text-xl tracking-tight text-black transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold">
                      EXPLORE COLLECTION
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
