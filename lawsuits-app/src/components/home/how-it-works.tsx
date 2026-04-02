"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shirt, Ruler, Package } from "lucide-react";

const steps = [
  {
    title: "Suit Customization",
    description:
      "Our advocate suits are crafted with precision and elegance, starting from premium fabric selection to final styling. Choose from classic black coats, waistcoats, trousers, and shirts tailored to reflect authority and professionalism. Each piece is designed to deliver a sharp courtroom presence while ensuring all-day comfort.",
    icon: Shirt,
  },
  {
    title: "Measurement & Fitting",
    description:
      "Accurate body measurements are taken by our expert tailoring team to ensure a perfect fit. You can visit our store for personalized fitting or opt for guided self-measurement support online. Our goal is to create a silhouette that enhances confidence and maintains the formal standards required in legal attire.",
    icon: Ruler,
  },
  {
    title: "Production & Delivery",
    description:
      "Once your design and measurements are finalized, our skilled craftsmen begin the tailoring process using high-quality materials and modern techniques. Every suit undergoes strict quality checks before delivery. We ensure timely dispatch so you are always prepared for court appearances and professional commitments.",
    icon: Package,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#1C2333] py-32 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="mb-24 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
            viewport={{ once: true }}
            className="mb-6 block text-xs font-medium uppercase tracking-[0.4em] text-accent-yellow bg-accent-yellow/10 px-4 py-1"
          >
            The Dress Outfitters
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-4xl font-light tracking-tight sm:text-5xl"
          >
            How it works
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform hover:scale-110">
                <step.icon className="h-10 w-10 stroke-[1px] text-accent-yellow" />
              </div>
              <h3 className="mb-6 font-serif text-2xl font-light tracking-tight">
                {step.title}
              </h3>
              <p className="text-[13px] font-light leading-relaxed text-white/60">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
