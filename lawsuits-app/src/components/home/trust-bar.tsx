"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const firms = [
  "Khaitan & Co",
  "AZB & Partners",
  "Cyril Amarchand Mangaldas",
  "Shardul Amarchand Mangaldas",
  "Trilegal",
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-muted/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm uppercase tracking-wider text-muted-foreground">
          Trusted by Partners at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {firms.map((firm, index) => (
            <motion.div
              key={firm}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="font-serif text-sm font-medium text-muted-foreground transition-opacity hover:opacity-100 sm:text-base"
            >
              {firm}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
