"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Courtroom Classics",
    description: "Timeless pieces for the advocate",
    image: "/hunters-race-MYbhN8KaaEc-unsplash.jpg",
    slug: "courtroom-classics",
  },
  {
    name: "The Boardroom",
    description: "Power dressing for the executive",
    image: "/nussbaum-law-IOvsEAEjnDE-unsplash.jpg",
    slug: "boardroom",
  },
  {
    name: "Formal Galas",
    description: "Elegant evening wear",
    image: "/pexels-ekaterina-bolovtsova-6077961.jpg",
    slug: "formal-galas",
  },
  {
    name: "Executive Accessories",
    description: "Complete the look",
    image: "/pexels-karola-g-7876289.jpg",
    slug: "accessories",
  },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold sm:text-4xl">
          Shop by Category
        </h2>
        <p className="mt-2 text-muted-foreground">
          Curated collections for every occasion
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <motion.a
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              quality={80}
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-serif text-xl font-bold text-white">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-white/70">
                {category.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-accent-yellow">
                <span className="text-sm font-medium">Shop Now</span>
                <motion.span
                  className="inline-block"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
