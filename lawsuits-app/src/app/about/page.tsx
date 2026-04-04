"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="text-center space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.6em] text-accent-yellow font-bold block"
          >
            Since 2026
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-8xl text-black"
          >
            The Dress <span className="italic">Outfitters</span>
          </motion.h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h2 className="font-serif text-3xl text-black italic">A Tradition of Precision</h2>
            <p className="text-zinc-600 font-light leading-relaxed">
              At The Dress Outfitters, we understand that courtroom attire is more than a uniform—it is a symbol of authority, 
              tradition, and unwavering commitment to justice. 
            </p>
            <p className="text-zinc-600 font-light leading-relaxed">
              Our master artisans combine centuries-old tailoring techniques with modern precision to create garments 
              that demand respect and provide unparalleled comfort throughout the longest of proceedings.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-[4/5] relative overflow-hidden group shadow-2xl"
          >
            <Image 
              src="/hero_alt.jpg" 
              alt="Crafting Excellence" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-transparent" />
          </motion.div>
        </section>
      </div>
    </main>
  );
}
