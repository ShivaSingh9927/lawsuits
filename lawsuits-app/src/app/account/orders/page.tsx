"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Truck, 
  ArrowLeft, 
  ShoppingBag,
  ExternalLink,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Order } from "@/types";
import { supabase } from "@/lib/supabase/client";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*),
          appointment:service_appointments(*),
          coupon:coupons(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-50 border-green-100";
      case "shipped": return "text-blue-600 bg-blue-50 border-blue-100";
      case "delivered": return "text-green-700 bg-green-100 border-green-200";
      case "cancelled": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-yellow-600 bg-yellow-50 border-yellow-100";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-accent-yellow"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB] pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <header className="mb-16">
          <Link href="/account" className="group mb-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Atelier Account
          </Link>
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-8">
            <div>
               <h1 className="font-serif text-5xl font-light tracking-tight text-foreground sm:text-6xl">
                 Your Archive
               </h1>
               <p className="mt-4 text-sm font-medium uppercase tracking-[0.4em] text-accent-yellow italic">
                 Order History & Curation
               </p>
            </div>
            
            <div className="relative w-full sm:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
               <Input 
                 placeholder="ID OR SELECTION..." 
                 className="h-12 pl-12 rounded-none border-border/20 bg-black/[0.02] text-[10px] font-black tracking-widest uppercase placeholder:text-muted-foreground/30 focus-visible:ring-accent-yellow/20"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>
        </header>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-sm border border-dashed border-border/40">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-8" />
            <h2 className="font-serif text-2xl font-light italic">No orders in archive</h2>
            <p className="mt-2 text-sm text-muted-foreground/60 uppercase tracking-widest">Your collection begins with your first selection.</p>
            <Button className="mt-10 bg-black text-white hover:bg-black/9 groups rounded-none h-14 px-10 uppercase tracking-[0.3em] text-[11px] font-black" asChild>
              <Link href="/shop">Explore Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-sm border border-border/30 bg-white transition-all duration-500 hover:border-accent-yellow/40 hover:shadow-2xl hover:shadow-accent-yellow/5"
              >
                <div className="flex flex-col lg:flex-row items-stretch">
                   {/* Meta Section */}
                   <div className="lg:w-72 border-b lg:border-b-0 lg:border-r border-border/10 p-8 bg-black/[0.01]">
                      <div className="flex flex-row lg:flex-col justify-between items-start gap-4">
                         <div className="space-y-4">
                            <Badge className={`rounded-none border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] bg-white ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">REFERENCE</p>
                               <p className="text-sm font-bold text-foreground">#{order.order_number}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">DATE</p>
                               <p className="text-sm font-bold text-foreground">
                                 {new Date(order.created_at).toLocaleDateString('en-IN', {
                                   day: '2-digit',
                                   month: 'short',
                                   year: 'numeric'
                                 })}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Items & Actions */}
                   <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="space-y-8">
                         {order.items.map((item) => (
                           <div key={item.id} className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-6">
                                 <div className="h-16 w-12 bg-black/5 rounded-none overflow-hidden relative grayscale transition-all duration-500 group-hover:grayscale-0">
                                   {/* If we had img_url in order_items we'd use it here */}
                                   <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/30 font-black tracking-widest uppercase">Suit</div>
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">{item.product_name}</h4>
                                    <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Size: {item.variant_size} × {item.quantity}</p>
                                 </div>
                              </div>
                              <span className="font-serif text-lg font-light italic">₹{item.net_price.toLocaleString()}</span>
                           </div>
                         ))}
                      </div>

                      <div className="mt-12 flex flex-col sm:flex-row items-end sm:items-center justify-between border-t border-border/10 pt-8 gap-6">
                         <div className="flex items-center gap-10">
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">INVESTMENT</p>
                               <p className="text-xl font-serif text-accent-yellow italic">₹{order.total.toLocaleString()}</p>
                            </div>
                            {order.appointment && (
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">FITTING</p>
                                  <p className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                     <CheckCircle className="h-3 w-3 text-accent-yellow" />
                                     Scheduled
                                  </p>
                               </div>
                            )}
                         </div>

                         <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button variant="outline" className="flex-1 sm:flex-none rounded-none border-border/20 h-12 uppercase tracking-[0.2em] text-[10px] font-black hover:bg-black/5" asChild>
                               <Link href={`/checkout/success?order_id=${order.id}`}>
                                 Details
                                 <ChevronRight className="ml-2 h-3.5 w-3.5" />
                               </Link>
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
