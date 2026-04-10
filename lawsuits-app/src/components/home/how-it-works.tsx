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
    <section className="bg-white py-32 text-black overflow-hidden border-y border-zinc-100">
      <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
        <div className="mb-24 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
            viewport={{ once: true }}
            className="mb-6 block text-sm font-semibold uppercase tracking-[0.4em] text-accent-yellow bg-accent-yellow/[0.05] px-6 py-2"
          >
            The Dress Outfitters
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-5xl font-normal tracking-tight sm:text-6xl text-zinc-900"
          >
            How it works
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-20 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 transition-transform hover:scale-110">
                <step.icon className="h-12 w-12 stroke-[1px] text-accent-yellow" />
              </div>
              <h3 className="mb-6 font-serif text-3xl font-normal tracking-tight text-zinc-900">
                {step.title}
              </h3>
              <p className="text-base font-normal leading-relaxed text-zinc-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
