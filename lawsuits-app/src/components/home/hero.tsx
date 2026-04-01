"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] w-full items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Image
          src="/pexels-pavel-danilyuk-8112126.jpg"
          alt="Professional in sharp suit"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-white"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-yellow/20 px-4 py-1.5 text-sm font-medium text-accent-yellow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow" />
            Bespoke Tailoring for Legal Professionals
          </motion.div>

          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            The Verdict is In:
            <br />
            <span className="text-accent-yellow">Precision Tailoring</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-white/80">
            For the modern counsel who demands excellence. Our master tailors
            bring the showroom to your chambers with our exclusive Home
            Measurement service.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-accent-yellow text-black hover:bg-accent-yellow/90"
              asChild
            >
              <Link href="/#home-fitting">Book Home Measurement</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/shop">Explore Collection</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="hidden justify-center lg:flex"
        >
          <div className="relative h-[500px] w-[500px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-accent-yellow/30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-white/20"
            />
            <div className="absolute inset-8 rounded-full bg-accent-yellow/90 shadow-2xl" />
            <div className="absolute inset-12 overflow-hidden rounded-full">
              <Image
                src="/short-haired-man-business-suit-carrying-two-registers.jpg"
                alt="Professional in business suit"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
