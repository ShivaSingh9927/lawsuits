"use client";
import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className={cn(
        "relative flex min-h-screen w-full items-center justify-start overflow-hidden bg-background transition-all duration-700",
        !mounted && "opacity-0"
      )}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <Image
            src="/heroimage.jpeg"
            alt="Tailored Suit Detail"
            fill
            priority
            quality={80}
            className="object-cover object-center opacity"
            sizes="100vw"
          />
          {/* Deep dark overlay for cinematic legibility */}
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
          <div className="absolute inset-0" />
        </div>
      </div>

      <div className="relative flex h-full max-w-screen-2xl flex-col justify-center px-12 lg:px-32">
        <div className="max-w-4xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="space-y-4"
          >
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.4em] text-accent-yellow drop-shadow-sm sm:text-sm sm:tracking-[0.5em]">
              Established Excellence
            </span>
            <h1 className="font-serif text-[2rem] font-light leading-[0.9] tracking-tight text-white sm:text-5xl lg:text-7xl">
              THE DRESS<br />
              Outfitters
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl text-sm font-medium leading-relaxed text-zinc-200 drop-shadow-sm sm:text-xl"
          >
            Defining the apex of professional attire for the modern advocate. 
            Excellence in every stitch, power in every profile.
          </motion.p>


          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-6 flex flex-col items-start justify-start gap-8 sm:flex-row sm:items-center"
          >
            <Link 
              href="/#home-fitting"
              className="group relative px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-black transition-all"
            >
              <div className="absolute inset-0 bg-accent-yellow rounded-full transition-transform duration-300 group-hover:scale-105" />
              <span className="relative z-10 text-black transition-colors">Book In Home Trial</span>
            </Link>
            
            <Link 
              href="/shop"
              className="group flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
            >
              <span>Explore Collection</span>
              <span className="text-2xl transition-transform duration-300 group-hover:translate-x-3 text-accent-yellow">→</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Elegant scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold"></span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
