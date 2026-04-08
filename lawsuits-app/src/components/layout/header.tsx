"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const navItems = [
  {
    name: "Collection",
    href: "#",
    dropdown: [
      { name: "Men's", href: "/shop?category=mens-legal-attire" },
      { name: "Women's", href: "/shop?category=womens-legal-attire" },
      { name: "Accessories", href: "/shop?category=accessories" },
      { name: "Package", href: "/shop?category=combos" },
    ]
  },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Appointments", href: "/#home-fitting" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileCollectionOpen, setIsMobileCollectionOpen] = useState(false);
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-black border-b border-white/5"
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
                width={180}
                height={65}
                className="h-12 md:h-16 w-auto invert"
              />
              <div className="absolute -bottom-2 left-0 h-[1px] w-0 bg-accent-yellow transition-all duration-500 group-hover:w-full" />
            </Link>


            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {!isSearchOpen && navItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.dropdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 py-2",
                            pathname.startsWith("/shop") ? "text-accent-yellow" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          {item.name}
                          <ChevronDown className="h-3 w-3 opacity-50 group-hover:rotate-180 transition-transform" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black border border-white/10 p-2 min-w-[200px]">
                        {item.dropdown.map((subItem) => (
                          <DropdownMenuItem key={subItem.name} className="p-0 !bg-transparent !focus:bg-zinc-900 cursor-pointer group/sub">
                            <Link
                              href={subItem.href}
                              className="block w-full px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400 transition-colors group-hover/sub:!text-white group-focus/sub:!text-white hover:!text-white"
                            >
                              {subItem.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 py-2",
                        pathname === item.href ? "text-accent-yellow" : "text-zinc-400 hover:text-white"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Advanced Search Bar */}
              <AnimatePresence mode="wait">
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "400px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="relative flex items-center ml-4"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="SEARCH THE ARCHIVES..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-b border-accent-yellow/30 py-1 text-[10px] uppercase tracking-[0.3em] font-bold text-white focus:outline-none focus:border-accent-yellow transition-colors placeholder:text-zinc-700"
                    />
                    <button type="submit" className="absolute right-0 text-accent-yellow hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-zinc-500 mr-4 font-bold">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-accent-yellow" />
                <span className="text-zinc-400">Punjab and Haryana High Court, Sector 1, Chandigarh, Punjab - 160001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-accent-yellow" />
                <span className="text-zinc-400">+91 7777955002</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                "hidden md:inline-flex transition-all duration-300",
                isSearchOpen ? "text-accent-yellow bg-white/5" : "text-white hover:bg-white/10"
              )}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
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

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger
                asChild
              >
                <Button variant="ghost" size="icon" className="md:hidden transition-colors text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-80 bg-black border-l border-white/10 p-0 overflow-hidden">
                <div className="flex flex-col h-full">
                  <SheetHeader className="text-left border-b border-white/10 p-8">
                    <SheetTitle className="font-serif text-3xl font-light tracking-[0.1em] text-white italic">Menu</SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="mb-8 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-yellow" />
                      <input
                        type="text"
                        placeholder="SEARCH PRODUCTS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-none py-3 pl-10 pr-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white focus:outline-none focus:border-accent-yellow transition-all placeholder:text-zinc-600"
                      />
                    </form>

                    <div className="flex flex-col gap-2 text-zinc-400">
                      {navItems.map((item) => (
                        <div key={item.name} className="flex flex-col">
                          {item.dropdown ? (
                            <>
                              <button
                                onClick={() => setIsMobileCollectionOpen(!isMobileCollectionOpen)}
                                className={cn(
                                  "flex items-center justify-between text-[11px] uppercase tracking-[0.2em] font-bold transition-colors py-5 border-b border-white/5",
                                  isMobileCollectionOpen ? "text-accent-yellow" : "text-zinc-400 hover:text-white"
                                )}
                              >
                                {item.name}
                                <ChevronDown className={cn("h-4 w-4 text-accent-yellow transition-transform duration-300", isMobileCollectionOpen && "rotate-180")} />
                              </button>
                              <AnimatePresence>
                                {isMobileCollectionOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-white/[0.02]"
                                  >
                                    {item.dropdown.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-between pl-6 pr-4 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500 border-b border-white/5 hover:text-accent-yellow transition-colors"
                                      >
                                        {subItem.name}
                                        <ChevronRight className="h-3 w-3 opacity-30" />
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={cn(
                                "flex items-center justify-between text-[11px] uppercase tracking-[0.2em] font-bold transition-colors py-5 border-b border-white/5",
                                pathname === item.href ? "text-accent-yellow" : "text-zinc-400 hover:text-white"
                              )}
                            >
                              {item.name}
                              <ChevronRight className="h-4 w-4 text-accent-yellow/50" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 p-8 border-t border-white/10 bg-white/5">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 text-zinc-400">
                        <MapPin className="h-4 w-4 text-accent-yellow mt-1 shrink-0" />
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-white leading-tight">Punjab and Haryana High Court</span>
                          <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-500">Sector 1, Chandigarh, Punjab - 160001</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-zinc-400">
                        <Phone className="h-4 w-4 text-accent-yellow" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white">+91 77779-55002</span>
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
