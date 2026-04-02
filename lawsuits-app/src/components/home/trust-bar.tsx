"use client";
import React from "react";
import { motion } from "framer-motion";

const firms = [
  "Khaitan & Co",
  "AZB & Partners",
  "Cyril Amarchand Mangaldas",
  "Shardul Amarchand Mangaldas",
  "Trilegal",
];

export function TrustBar() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-12 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60"
        >
          Trusted by the Nation's Preeminent Counsel
        </motion.p>
        
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
          {firms.map((firm, index) => (
            <motion.div
              key={firm}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              whileInView={{ opacity: 0.4, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 1 }}
              whileHover={{ opacity: 0.8 }}
              className="font-serif text-sm font-medium tracking-tight text-foreground transition-all duration-300 sm:text-base"
            >
              {firm}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
