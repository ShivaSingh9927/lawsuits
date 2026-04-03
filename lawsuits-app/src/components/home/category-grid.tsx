"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Category } from "@/types";

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="bg-white py-32 h-[400px] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
    </div>;
  }

  return (
    <section className="bg-white py-32 overflow-hidden border-y border-border/40">
      <div className="mx-auto max-w-screen-2xl px-8 py-20 lg:px-32 text-center items-center">
        <div className="mb-12 sm:mb-24 flex flex-col items-center text-center">
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
            className="font-serif text-3xl font-light tracking-tight sm:text-6xl"
          >
            Advocate Dress <span className="italic text-accent-yellow">Products</span>
          </motion.h2>
        </div>

        <div className="relative group/slider">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex gap-8 overflow-x-auto pb-12 no-scrollbar snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-start"
                >
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.slug)}`}
                    className="group flex flex-col items-center"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted transition-transform duration-700 group-hover:-translate-y-3">
                      <Image
                        src={category.image_url || "/product-image/demo.webp"}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 280px, 320px"
                        className="object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                    </div>
                    
                    <div className="mt-10 text-center">
                      <h3 className="font-serif text-xl tracking-tight text-black transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold">
                        Explore Collection
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
                <div className="w-full py-12 text-zinc-400 font-light italic">
                    Opening the archives...
                </div>
            )}
          </motion.div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="h-[1px] w-32 bg-black/5 relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-accent-yellow w-1/3"
                animate={{ x: ["0%", "200%", "0%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
