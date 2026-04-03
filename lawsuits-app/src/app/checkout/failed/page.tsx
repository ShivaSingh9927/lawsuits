"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, Mail, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "The payment transaction was not successfully completed.";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-red-500/10 p-8 md:p-16 text-center shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-8"
          >
            <XCircle className="w-10 h-10 text-red-500" />
          </motion.div>

          <h1 className="font-serif text-4xl md:text-6xl text-black mb-6">
            Payment <span className="italic">Incomplete</span>
          </h1>
          
          <p className="text-zinc-600 text-lg mb-12 font-light leading-relaxed max-w-xl mx-auto">
            We encountered a discrepancy during the payment process. 
            No funds have been permanently captured for this transaction.
          </p>

          <div className="bg-red-500/5 p-6 rounded-sm border border-red-500/10 text-left mb-16">
            <span className="text-[10px] uppercase tracking-[0.2em] text-red-500/50 block mb-2 font-bold italic">Technical Brief</span>
            <p className="text-zinc-800 text-sm font-medium leading-relaxed">
              {reason}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/checkout" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-black hover:bg-black/90 text-white font-bold uppercase tracking-[0.2em] px-10 h-14">
                Retry Payment
                <RefreshCw className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-20 pt-12 border-t border-white/5 grid grid-cols-2 gap-8">
             <div className="text-left">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4 font-bold">Support</h4>
                <div className="space-y-3">
                   <a href="mailto:support@lawsuits.app" className="flex items-center gap-3 text-zinc-600 hover:text-black transition-colors text-xs font-light">
                      <Mail className="w-3 h-3 text-accent-yellow" />
                      Email Assistant
                   </a>
                   <a href="tel:+917777955002" className="flex items-center gap-3 text-zinc-600 hover:text-black transition-colors text-xs font-light">
                      <Phone className="w-3 h-3 text-accent-yellow" />
                      Call Atelier
                   </a>
                </div>
             </div>
             <div className="text-right">
                <Link href="/shop" className="inline-flex items-center gap-2 group text-accent-yellow text-[10px] uppercase tracking-[0.2em] font-bold">
                   Return to Catalog
                   <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
             </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
