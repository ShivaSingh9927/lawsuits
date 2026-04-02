"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, User, Search, X, ChevronRight, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Collection", href: "/shop" },
  { name: "Atelier", href: "/atelier" },
  { name: "Heritage", href: "/heritage" },
  { name: "Appointments", href: "/checkout" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items } = useCartStore();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 bg-[#0F0A07] border-b border-white/5"
    >
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link 
              href="/" 
              className="group relative z-10 flex items-center"
            >
              <Image 
                src="/TDO-black-logo-transp-01.webp" 
                alt="THE DRESS OUTFITTERS" 
                width={160} 
                height={45} 
                className="h-8 md:h-10 w-auto invert brightness-200" 
              />
              <div className="absolute -bottom-2 left-0 h-[1px] w-0 bg-accent-yellow transition-all duration-500 group-hover:w-full" />
            </Link> 


            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300",
                    pathname === item.href 
                      ? "text-accent-yellow" 
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-2 left-0 right-0 h-[1px] bg-accent-yellow"
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-zinc-500 mr-4 font-bold">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-accent-yellow" />
                <span>Sector 1, Chandigarh, Punjab - 160001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-accent-yellow" />
                <span>+91 77779-55002</span>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="transition-colors text-white hover:bg-white/10">
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/account">
              <Button variant="ghost" size="icon" className="transition-colors text-white hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Button 
                variant="ghost" 
                size="icon" 
                className="relative transition-colors text-white hover:bg-white/10"
                onClick={() => useCartStore.getState().toggleCart()}
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {mounted && cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-yellow text-[10px] font-bold text-black"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Sheet>
              <SheetTrigger
                asChild
              >
                <Button variant="ghost" size="icon" className="md:hidden transition-colors text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-80 bg-white border-black/5">
                <SheetHeader className="text-left border-b border-black/5 pb-8">
                  <SheetTitle className="font-serif text-3xl font-light tracking-[0.1em] text-black italic">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full py-12">
                  <div className="flex flex-col gap-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between text-sm uppercase tracking-[0.2em] font-bold transition-colors py-2 border-b border-black/5",
                          pathname === item.href ? "text-accent-yellow" : "text-black/70 hover:text-black"
                        )}
                      >
                        {item.name}
                        <ChevronRight className="h-4 w-4 opacity-30" />
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-auto space-y-8 pt-12 border-t border-black/5">
                      <div className="space-y-6">
                          <div className="flex items-start gap-4 text-black/70">
                              <MapPin className="h-4 w-4 text-accent-yellow mt-1 shrink-0" />
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-black leading-tight">Punjab and Haryana High Court</span>
                                <span className="text-[10px] uppercase tracking-widest font-medium">Sector 1, Chandigarh, Punjab - 160001</span>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 text-black/70">
                              <Phone className="h-4 w-4 text-accent-yellow" />
                              <span className="text-[10px] uppercase tracking-widest font-bold text-black">+91 77779-55002</span>
                          </div>
                      </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
