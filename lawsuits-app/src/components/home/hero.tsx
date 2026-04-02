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
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background transition-all duration-700",
        !mounted && "opacity-0"
      )}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <Image
            src="/pexels-unique-bash-creative-1927464998-34850161.jpg"
            alt="Tailored Suit Detail"
            fill
            priority
            quality={100}
            className="object-cover object-center opacity-60 brightness-[0.7]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>
      </div>

      <div className="relative mx-auto flex h-full max-w-screen-2xl flex-col justify-center px-12 lg:px-32">
        <div className="max-w-4xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.5em] text-accent-yellow drop-shadow-sm">
              Established Excellence
            </span>
            <h1 className="font-serif text-6xl font-light leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-9xl">
              THE<br />
              <span className="italic">Dress</span> Outfitters
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl text-lg font-light leading-relaxed text-white/90 drop-shadow-sm sm:text-xl"
          >
            Defining the apex of professional attire for the modern advocate. 
            Excellence in every stitch, power in every profile.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 flex flex-col items-center justify-start gap-8 sm:flex-row"
          >
            <Link 
              href="/#home-fitting"
              className="group relative px-10 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all"
            >
              <div className="absolute inset-0 bg-accent-yellow transition-transform duration-300 group-hover:scale-105" />
              <span className="relative z-10">Book a Fitting</span>
            </Link>
            
            <Link 
              href="/shop"
              className="group flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
            >
              <span>Explore Collection</span>
              <span className="text-2xl transition-transform duration-300 group-hover:translate-x-3">→</span>
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
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
