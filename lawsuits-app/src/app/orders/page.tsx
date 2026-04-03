"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface OrderItem {
  product_name: string;
  variant_size: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  confirmed: { icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
  processing: { icon: RefreshCwIcon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  shipped: { icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10" },
  delivered: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

function RefreshCwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data);
        }
      }
      setLoading(false);
    }

    getOrders();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-yellow border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FDFCFB] pt-40 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-8">
            <AlertCircle className="w-10 h-10 text-zinc-500" />
          </div>
          <h1 className="font-serif text-3xl text-black mb-4">Authentication Required</h1>
          <p className="text-zinc-400 mb-12 font-light">Please sign in to view your sartorial acquisition history.</p>
          <Link href="/account">
            <Button className="bg-accent-yellow text-black font-bold uppercase tracking-widest px-12 h-14">
              Sign In
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow font-bold block mb-4"
          >
            Personal Archive
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl text-black"
          >
            Your <span className="italic">Orders</span>
          </motion.h1>
        </header>

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-black/5 p-16 text-center shadow-sm"
          >
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
            <p className="text-zinc-500 font-light italic mb-8">No collections have been registered yet.</p>
            <Link href="/shop">
              <Button variant="outline" className="border-black/10 text-black hover:bg-black/5 uppercase tracking-widest text-[10px] h-12 px-8">
                Begin Your Journey
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, idx) => {
              const status = statusConfig[order.status.toLowerCase()] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-black/5 overflow-hidden group shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Order Header */}
                  <div className="p-6 md:p-8 border-b border-black/5 flex flex-wrap items-center justify-between gap-6 bg-black/[0.02]">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Order Reference</span>
                      <h3 className="text-black font-mono text-sm tracking-tight">{order.order_number}</h3>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="hidden md:block space-y-1 text-right">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Date</span>
                        <p className="text-zinc-600 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Status</span>
                        <div className={`flex items-center gap-2 ${status.color} text-[10px] uppercase tracking-widest font-black`}>
                           <StatusIcon className="w-3 h-3" />
                           {order.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 md:p-8">
                    <div className="space-y-6">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-6 items-center">
                          <div className="relative h-20 w-16 bg-white/5 flex-shrink-0">
                             {item.image_url ? (
                               <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                             ) : (
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-zinc-800" />
                               </div>
                             )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-black text-sm font-serif">{item.product_name}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Size: {item.variant_size} • Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-black text-sm font-bold">₹{(item.unit_price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="p-6 md:p-8 bg-black/[0.03] flex items-center justify-between">
                    <Link href={`/orders/${order.id}`} className="text-[10px] uppercase tracking-[0.3em] text-accent-yellow font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                      View Details
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <p className="text-black">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mr-4 italic">Total Consideration</span>
                      <span className="text-xl font-serif">₹{order.total.toLocaleString()}</span>
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
