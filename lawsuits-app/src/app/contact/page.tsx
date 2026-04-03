"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-12">
          <header className="space-y-4">
             <motion.span 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-[10px] uppercase tracking-[0.5em] text-accent-yellow font-bold block"
             >
                Consulting
             </motion.span>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="font-serif text-5xl md:text-7xl text-black"
             >
               Get in <span className="italic">Touch</span>
             </motion.h1>
          </header>

          <section className="space-y-8">
             <div className="flex items-start gap-6">
                <MapPin className="w-5 h-5 text-accent-yellow mt-1" />
                <div>
                   <h3 className="text-black text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Our Atelier</h3>
                   <p className="text-zinc-600 font-light text-sm leading-relaxed">
                      Sector 1, Chandigarh, Punjab - 160001
                   </p>
                </div>
             </div>
             <div className="flex items-start gap-6">
                <Phone className="w-5 h-5 text-accent-yellow mt-1" />
                <div>
                   <h3 className="text-black text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Inquiries</h3>
                   <p className="text-zinc-600 font-light text-sm leading-relaxed">
                      +91 77779-55002
                   </p>
                </div>
             </div>
             <div className="flex items-start gap-6">
                <Mail className="w-5 h-5 text-accent-yellow mt-1" />
                <div>
                   <h3 className="text-black text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Electronic Mail</h3>
                   <p className="text-zinc-600 font-light text-sm leading-relaxed">
                      concierge@thedressoutfitters.com
                   </p>
                </div>
             </div>
          </section>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-black/5 p-12 space-y-8 shadow-xl"
        >
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold block mb-1">Full Name</label>
                 <input className="w-full bg-black/[0.03] border border-black/5 p-4 text-black font-light text-sm focus:border-accent-yellow outline-none transition-colors" placeholder="e.g. Adv. Aryan Singh" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold block mb-1">Email Address</label>
                 <input className="w-full bg-black/[0.03] border border-black/5 p-4 text-black font-light text-sm focus:border-accent-yellow outline-none transition-colors" placeholder="email@address.com" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold block mb-1">Message</label>
                 <textarea className="w-full bg-black/[0.03] border border-black/5 p-4 text-black font-light text-sm focus:border-accent-yellow outline-none transition-colors min-h-[120px]" placeholder="How may we assist you?" />
              </div>
           </div>
           <Button className="w-full h-14 bg-accent-yellow text-black font-bold uppercase tracking-[0.2em]">
              Send Inquiry
           </Button>
        </motion.div>
      </div>
    </main>
  );
}
