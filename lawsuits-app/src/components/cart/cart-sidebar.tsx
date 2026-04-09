"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store";
import { cn } from "@/lib/utils";

export function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getSubtotal, qualifiesForFreeFitting, amountForFreeFitting } = useCartStore();
  const subtotal = getSubtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={toggleCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#FDFCFB] shadow-2xl border-l border-black/5"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-black" />
                <h2 className="font-serif text-lg font-semibold text-black tracking-tight">Your Cart</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {!qualifiesForFreeFitting() && (
              <div className="border-b border-black/5 bg-accent-yellow/5 px-6 py-4">
                <p className="text-xs uppercase tracking-widest text-zinc-600 font-bold">
                  Add ₹{amountForFreeFitting().toLocaleString()} more for{" "}
                  <span className="font-semibold text-accent-yellow">free Home Fitting</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent-yellow/20">
                  <motion.div
                    className="h-full bg-accent-yellow"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (subtotal / 5000) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {qualifiesForFreeFitting() && (
              <div className="border-b border-border bg-green-500/10 px-6 py-3">
                <p className="text-sm font-medium text-green-600">
                  You qualify for free Home Fitting!
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                  <p className="mt-4 text-lg font-medium">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Discover our curated collection
                  </p>
                  <Button className="mt-6" onClick={toggleCart} asChild>
                    <Link href="/shop">Explore Collection</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li
                      key={item.variant_id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4"
                    >
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={item.product.images?.[0]?.url || "/placeholder-suit.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-serif text-black">{item.product.name}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                            Size: {item.variant.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.variant_id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.variant_id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-bold text-black font-mono">
                            ₹{(item.variant.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 self-start"
                        onClick={() => removeItem(item.variant_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Subtotal</span>
                  <span className="font-serif text-2xl font-light text-black">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Shipping & taxes calculated at checkout
                </p>
                <Button 
                  className="mt-4 w-full h-14 rounded-none bg-black text-white hover:bg-black/90 uppercase tracking-[0.3em] text-[10px] font-bold" 
                  asChild
                  onClick={toggleCart}
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="mt-2 w-full"
                  onClick={toggleCart}
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
