"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, HelpCircle, AlertCircle, ShoppingBag, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function FailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="mx-auto max-w-4xl px-6 py-24 sm:px-10 lg:px-16 text-center">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <XCircle className="h-20 w-20 text-red-500" />
        </motion.div>
        
        <h1 className="mt-8 font-serif text-4xl font-light tracking-tight sm:text-5xl">
          Order Suspended
        </h1>
        <p className="mt-4 text-xl text-muted-foreground font-light italic">
          There was a complication with the payment processing.
        </p>

        {orderId && (
          <div className="mt-6 inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-[10px] font-black tracking-widest text-red-600 uppercase">
            Order Reference: #{orderId.slice(0, 8)}
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
        <div className="rounded-sm border border-border/40 p-10 bg-black/[0.01]">
           <HelpCircle className="h-6 w-6 text-accent-yellow mb-6" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Possible Causes</h3>
           <ul className="space-y-4 text-sm text-muted-foreground font-medium">
             <li className="flex items-start gap-3">
               <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow mt-1.5" />
               Transaction limit reached on your card.
             </li>
             <li className="flex items-start gap-3">
               <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow mt-1.5" />
               Network latency during verification.
             </li>
             <li className="flex items-start gap-3">
               <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow mt-1.5" />
               Validation error from the financial institution.
             </li>
           </ul>
        </div>

        <div className="rounded-sm border border-border/40 p-10 bg-black/[0.01]">
           <AlertCircle className="h-6 w-6 text-accent-yellow mb-6" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Next Steps</h3>
           <p className="text-sm text-muted-foreground font-medium leading-relaxed">
             Our atelier retains your selection. Please attempt the transaction again or reach out to our concierge for manual coordination.
           </p>
           <p className="mt-6 text-xs font-black uppercase tracking-widest text-foreground underline decoration-accent-yellow underline-offset-4">
             concierge@lawsuits.in
           </p>
        </div>
      </div>

      <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
        <Button className="bg-black text-white hover:bg-black/9 groups rounded-none h-16 px-10 uppercase tracking-[0.3em] text-[11px] font-black" asChild>
          <Link href="/checkout">
            <RefreshCw className="mr-3 h-4 w-4" />
            Retry Transaction
          </Link>
        </Button>
        <Button variant="outline" className="rounded-none h-16 px-10 border-border uppercase tracking-[0.3em] text-[11px] font-black" asChild>
          <Link href="/shop">
            <ShoppingBag className="mr-3 h-4 w-4" />
            Explore Collection
          </Link>
        </Button>
      </div>
      
      <p className="mt-12 text-[10px] uppercase tracking-widest text-muted-foreground/50 flex flex-center justify-center items-center gap-3">
        <ArrowLeft className="h-3 w-3" />
        Return to Atelier
      </p>
    </div>
  );
}

export default function OrderFailurePage() {
  return (
    <Suspense fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
             <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-accent-yellow"></div>
        </div>
      }>
      <FailureContent />
    </Suspense>
  );
}
