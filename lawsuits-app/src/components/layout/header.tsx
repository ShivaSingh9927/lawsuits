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
import { supabase } from "@/lib/supabase/client";


const navItems = [
  {
    name: "Collection",
    href: "#",
    dropdown: [
      { name: "MEN", href: "/shop?category=mens-legal-attire" },
      { name: "WOMEN", href: "/shop?category=womens-legal-attire" },
      { name: "ACCESSORIES", href: "/shop?category=accessories" },
      { name: "COMBOS", href: "/shop?category=combos" },
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
  const [user, setUser] = useState<any>(null);
  const { items } = useCartStore();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const fetchSession = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabaseClient = createClient();
      
      const { data } = await supabaseClient.auth.getSession();
      setUser(data.session?.user ?? null);

      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null);
      });

      return subscription;
    };

    let subscription: { unsubscribe: () => void } | undefined;
    
    fetchSession().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);


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

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
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
              onClick={handleLogoClick}
              className="group relative z-10 flex items-center cursor-pointer"
            >
              <Image
                src="/TDO-black-logo-transp-01.webp"
                alt="THE DRESS OUTFITTERS"
                width={180}
                height={65}
                className="h-12 md:h-16 w-auto invert brightness-0 invert"
              />
              <div className="absolute -bottom-2 left-0 h-[1px] w-0 bg-accent-yellow transition-all duration-500 group-hover:w-full" />
            </Link>


            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {!isSearchOpen && navItems.map((item) => (
                <div key={item.name} className="relative group/nav">
                  {item.dropdown ? (
                    <>
                      <button
                        className={cn(
                          "flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 py-2",
                          pathname.startsWith("/shop") ? "text-accent-yellow" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {item.name}
                        <ChevronDown className="h-3 w-3 opacity-50 group-hover/nav:rotate-180 transition-transform" />
                      </button>
                      
                      <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-300 z-50">
                        <div className="bg-black border border-white/10 p-2 min-w-[200px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block w-full px-4 py-3 text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
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
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Advanced Search Bar relocated for proximity */}
            <AnimatePresence mode="wait">
              {isSearchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "350px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="relative flex items-center overflow-hidden"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="SEARCH COLLECTION..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-accent-yellow/30 py-1 pr-8 text-[10px] uppercase tracking-[0.3em] font-bold text-white focus:outline-none focus:border-accent-yellow transition-colors placeholder:text-zinc-800"
                  />
                  <button type="submit" className="absolute right-0 text-accent-yellow hover:text-white transition-colors">
                    <Search className="h-4 w-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

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

            {user ? (
              <Link href="/account" className="transition-all hover:scale-110 active:scale-95">
                <Button variant="ghost" size="icon" className="transition-colors text-white hover:bg-white/10">
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center">
                <Button 
                  className="hidden md:flex bg-accent-yellow hover:bg-white text-black text-[10px] uppercase tracking-[0.2em] font-black h-9 px-6 rounded-md border-none transition-all shadow-lg hover:shadow-accent-yellow/20"
                >
                  LOGIN / SIGNUP
                </Button>
                {/* Mobile version icon */}
                <Button variant="ghost" size="icon" className="md:hidden transition-colors text-white hover:bg-white/10">
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            )}


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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
