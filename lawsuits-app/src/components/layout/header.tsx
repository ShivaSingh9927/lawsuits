"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { useCartStore } from "@/store";

const navLinks = [
  { label: "Suits", href: "/shop?category=suits" },
  { label: "Shirts", href: "/shop?category=shirts" },
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "The Atelier", href: "/#home-fitting" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { getItemCount, toggleCart } = useCartStore();
  const itemCount = getItemCount();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500 ease-in-out",
        scrolled
          ? "bg-zinc-950/98 backdrop-blur-xl py-4 shadow-xl border-b border-white/5"
          : "bg-zinc-950 py-6"
      )}
    >
      <nav className="flex w-full items-center justify-between px-12 lg:px-32">
        <div className="flex items-center gap-16">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-serif text-2xl font-light tracking-[0.2em] transition-colors text-zinc-100 group-hover:text-accent-yellow">
              THE DRESS OUTFITTERS<span className="text-accent-yellow">.</span>
            </span>
          </Link>
          
          <div className="hidden items-center gap-12 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm uppercase tracking-[0.25em] transition-all hover:text-accent-yellow",
                  "text-zinc-400 font-medium hover:text-zinc-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-zinc-400">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="h-10 w-10 opacity-80 hover:opacity-100 hover:text-zinc-100 hover:bg-white/5"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" asChild className="hidden h-10 w-10 opacity-80 hover:opacity-100 sm:flex hover:text-zinc-100 hover:bg-white/5">
              <Link href="/account">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            
            {mounted && (
              <div className="hidden lg:flex items-center gap-6 mr-4 border-r border-white/10 pr-6">
                <Link href="/login" className="text-xs uppercase tracking-[0.3em] text-zinc-400 hover:text-accent-yellow transition-all font-bold">
                  Log In
                </Link>
                <Link href="/login?mode=signup" className="text-xs uppercase tracking-[0.3em] text-zinc-100 hover:text-accent-yellow transition-all font-bold">
                  Sign Up
                </Link>
              </div>
            )}

            <Button variant="ghost" size="icon" asChild className="h-10 w-10 opacity-80 hover:opacity-100 hover:text-zinc-100 hover:bg-white/5">
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 opacity-80 hover:opacity-100 hover:text-zinc-100 hover:bg-white/5"
              onClick={toggleCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent-yellow text-[10px] font-bold text-black ring-2 ring-zinc-950">
                  {itemCount}
                </span>
              )}
            </Button>

            <Sheet>
              <SheetTrigger
                asChild
              >
                <Button variant="ghost" size="icon" className="md:hidden text-zinc-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-zinc-950 border-white/5">
                <SheetHeader>
                  <SheetTitle className="font-serif text-2xl tracking-[0.1em] text-zinc-100">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-12 flex flex-col gap-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-accent-yellow"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 top-full w-full border-b border-white/5 bg-zinc-950 shadow-2xl"
          >
            <div className={cn(
              "flex w-full max-w-screen-2xl items-center gap-6 px-12 lg:px-32 py-10",
              !mounted && "mx-auto"
            )}>
              <Search className="h-6 w-6 text-zinc-500" />
              <input
                type="text"
                placeholder="Search our collections..."
                className="flex-1 bg-transparent font-serif text-3xl font-light outline-none text-zinc-100 placeholder:text-zinc-700"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
