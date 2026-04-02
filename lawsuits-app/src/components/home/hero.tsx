"use client";
import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background"
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

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="mb-6 block text-xs font-medium uppercase tracking-[0.5em] text-accent-yellow"
          >
            The Art of the Suit
          </motion.span>

          <h1 className="font-serif text-5xl font-light leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Precision <br /> 
            <span className="italic">Meets</span> Purpose
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-8 mx-auto max-w-xl text-lg font-light leading-relaxed text-white/90"
          >
            Exquisite bespoke tailoring for the modern legal professional. 
            Experience our master-crafted garments in the comfort of your own chambers.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link 
              href="/#home-fitting"
              className="group relative px-8 py-4 text-sm font-medium uppercase tracking-widest text-black transition-all"
            >
              <div className="absolute inset-0 bg-accent-yellow transition-transform duration-300 group-hover:scale-105" />
              <span className="relative z-10">Book a Fitting</span>
            </Link>
            
            <Link 
              href="/shop"
              className="group flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white transition-opacity hover:opacity-80"
            >
              <span>Explore Collection</span>
              <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">→</span>
            </Link>
          </motion.div>
        </motion.div>
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
