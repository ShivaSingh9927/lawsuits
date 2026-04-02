"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function FitTypes() {
  return (
    <section className="bg-white py-32 overflow-hidden">
      <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
        <div className="mb-24 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 block text-sm font-semibold uppercase tracking-[0.4em] text-accent-yellow bg-accent-yellow/10 px-6 py-2"
          >
            Make Our Most
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl"
          >
            Our Fit Types
          </motion.h2>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-24 lg:flex-row lg:gap-0">
          {/* Slim Fit */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col items-center text-center lg:items-end lg:text-right lg:pr-24"
          >
            <div className="relative mb-12 aspect-[2/3] w-full max-w-[450px] overflow-hidden rounded-sm bg-muted shadow-2xl">
              <Image
                src="/slim-fit.webp"
                alt="Slim Fit Model"
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-cover"
              />
            </div>
            <div className="max-w-md space-y-8">
              <h3 className="font-serif text-4xl font-light tracking-tight">Slim Fit</h3>
              <p className="text-base font-light leading-relaxed text-muted-foreground/90">
                The jacket is V-shaped with broader shoulders, a tapered waist, and less room between the jacket and your body.
                Pants have a straight waist and tapered leg that's slimmer in the hip/thigh/butt.
              </p>
              <div className="space-y-2 text-sm uppercase tracking-widest text-accent-yellow font-semibold">
                <p>Slim Fit coats available in sizes 34-50</p>
                <p>Slim Fit trousers available in waist sizes 28-42</p>
              </div>
            </div>
          </motion.div>

          {/* VS Divider */}
          <div className="z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted font-serif text-base italic text-muted-foreground shadow-inner lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            vs
          </div>

          {/* Modern Fit */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left lg:pl-24"
          >
            <div className="relative mb-12 aspect-[2/3] w-full max-w-[450px] overflow-hidden rounded-sm bg-muted shadow-2xl">
              <Image
                src="/modern-fit.webp"
                alt="Modern Fit Model"
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-cover"
              />
            </div>
            <div className="max-w-md space-y-8">
              <h3 className="font-serif text-4xl font-light tracking-tight">Modern Fit</h3>
              <p className="text-base font-light leading-relaxed text-muted-foreground/90">
                The jacket has a straighter cut with more room in the waist and more room between the jacket and your body.
                Pants are cut with a contoured waistband and more room in the butt and thigh area with an easier fit through the leg.
              </p>
              <div className="space-y-2 text-sm uppercase tracking-widest text-accent-yellow font-semibold">
                <p>Modern fit jackets available in sizes 34-60</p>
                <p>Pants available in even sizes 28-54</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
