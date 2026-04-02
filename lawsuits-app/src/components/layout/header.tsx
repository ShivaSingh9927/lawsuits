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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500 ease-in-out",
        scrolled
          ? "bg-[#FDFCFB]/98 backdrop-blur-xl py-4 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-border/40"
          : "bg-transparent py-6"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-12">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-serif text-2xl font-light tracking-[0.2em] transition-colors group-hover:text-accent-yellow">
              LAWSUITS<span className="text-accent-yellow">.</span>
            </span>
          </Link>
          
          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-xs uppercase tracking-[0.2em] transition-all hover:text-accent-yellow",
                  scrolled ? "text-foreground/80 font-medium" : "text-white/90"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn("flex items-center gap-2", scrolled ? "text-foreground" : "text-white")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="h-9 w-9 opacity-80 hover:opacity-100"
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>
            
            <Button variant="ghost" size="icon" asChild className="hidden h-9 w-9 opacity-80 hover:opacity-100 sm:flex">
              <Link href="/account">
                <Heart className="h-[18px] w-[18px]" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 opacity-80 hover:opacity-100">
              <Link href="/account">
                <User className="h-[18px] w-[18px]" />
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 opacity-80 hover:opacity-100"
              onClick={toggleCart}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-yellow text-[9px] font-bold text-black ring-2 ring-background">
                  {itemCount}
                </span>
              )}
            </Button>

            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden" />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-[#FDFCFB]">
                <SheetHeader>
                  <SheetTitle className="font-serif text-2xl tracking-[0.1em]">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-12 flex flex-col gap-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
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
            className="absolute left-0 top-full w-full border-b border-border bg-[#FDFCFB] shadow-xl"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-6 px-12 py-8">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search our collections..."
                className="flex-1 bg-transparent font-serif text-2xl font-light outline-none placeholder:text-muted-foreground/30"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
