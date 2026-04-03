"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
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
          className="bg-white border border-black/5 p-8 md:p-16 text-center shadow-xl relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-yellow/10 border border-accent-yellow/20 mb-8"
          >
            <CheckCircle2 className="w-10 h-10 text-accent-yellow" />
          </motion.div>

          <h1 className="font-serif text-4xl md:text-6xl text-black mb-6">
            Order <span className="italic">Confirmed</span>
          </h1>
          
          <p className="text-zinc-600 text-lg mb-12 font-light leading-relaxed max-w-xl mx-auto">
            Your sartorial acquisition has been successfully registered. 
            A confirmation has been dispatched to your electronic mail.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <div className="bg-black/[0.03] p-6 rounded-sm border border-black/5 text-left">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block mb-2 font-bold">Order Reference</span>
              <code className="text-black font-mono text-sm">#{orderId || "GENERATING..."}</code>
            </div>
            <div className="bg-black/[0.03] p-6 rounded-sm border border-black/5 text-left">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block mb-2 font-bold">Estimated Delivery</span>
              <span className="text-black text-sm font-medium">5 - 7 Business Days</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-accent-yellow hover:bg-accent-yellow/90 text-black font-bold uppercase tracking-[0.2em] px-10 h-14">
                Continue Shopping
                <ShoppingBag className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="/orders" className="w-full sm:w-auto">
              <button className="group flex items-center gap-3 text-black/60 hover:text-black transition-colors text-[10px] uppercase tracking-[0.3em] font-bold">
                View My Orders
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </button>
            </Link>
          </div>
        </motion.div>

        <p className="mt-12 text-center text-zinc-600 text-xs uppercase tracking-[0.3em] font-bold">
          Assistance: +91 77779-55002
        </p>
      </div>
    </main>
  );
}
