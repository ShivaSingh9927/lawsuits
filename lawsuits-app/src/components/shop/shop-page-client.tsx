"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { products as mockProducts, categories as mockCategories } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Product, Category } from "@/types";

const fits = ["slim", "modern", "classic"];
const fabrics = [
  "Super 120s Italian Wool",
  "Merino Wool Blend",
  "Super 130s Wool",
  "Super 140s Italian Wool",
  "Egyptian Cotton",
  "100% Mulberry Silk",
  "Sterling Silver",
  "Full-Grain Leather",
];
const sortOptions = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Curated Selection" },
];

export function ShopPageClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory
  );
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState("newest");
  const [allProducts, setAllProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedFit) params.set("fit", selectedFit);
        if (sortBy) params.set("sort", sortBy);
        params.set("limit", "100");

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products?.length > 0) {
            setAllProducts(data.products);
            setLoading(false);
            return;
          }
        }
      } catch {
        // API not available
      }
      setAllProducts(mockProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory, selectedFit, sortBy]);

  const filteredProducts = allProducts
    .filter((p) => p.is_visible && !p.deleted_at)
    .filter((p) => {
      if (selectedFabric) return p.fabric === selectedFabric;
      return true;
    })
    .filter((p) => p.base_price >= priceRange[0] && p.base_price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.base_price - b.base_price;
      if (sortBy === "price-desc") return b.base_price - a.base_price;
      if (sortBy === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return 0;
    });

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedFit ? 1 : 0) +
    (selectedFabric ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedFit(null);
    setSelectedFabric(null);
    setPriceRange([0, 100000]);
  };

  const FiltersContent = () => (
    <div className="space-y-12 pr-8">
      <div>
        <h3 className="mb-6 text-[10px] uppercase tracking-[0.4em] text-accent-yellow">Category</h3>
        <div className="space-y-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.slug ? null : cat.slug
                )
              }
              className={cn(
                "block w-full text-left text-xs tracking-widest transition-all",
                selectedCategory === cat.slug
                  ? "font-medium text-foreground translate-x-2"
                  : "text-muted-foreground/60 hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] w-full bg-border/50" />

      <div>
        <h3 className="mb-6 text-[10px] uppercase tracking-[0.4em] text-accent-yellow">The Silhouette</h3>
        <div className="space-y-4">
          {fits.map((fit) => (
            <button
              key={fit}
              onClick={() =>
                setSelectedFit(selectedFit === fit ? null : fit)
              }
              className={cn(
                "block w-full text-left text-xs capitalize tracking-widest transition-all",
                selectedFit === fit
                  ? "font-medium text-foreground translate-x-2"
                  : "text-muted-foreground/60 hover:text-foreground"
              )}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] w-full bg-border/50" />

      <div>
        <h3 className="mb-6 text-[10px] uppercase tracking-[0.4em] text-accent-yellow">Value</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between text-[10px] tracking-widest text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}+</span>
          </div>
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="h-10 border-0 border-b border-border bg-transparent px-0 text-xs focus-visible:ring-0"
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="h-10 border-0 border-b border-border bg-transparent px-0 text-xs focus-visible:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="bg-[#FDFCFB] min-h-screen">
      <div className="mx-auto max-w-7xl px-8 py-24 lg:px-12">
        {/* Cinematic Header */}
        <div className="mb-24 flex flex-col items-center text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] text-accent-yellow"
          >
            The Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-light tracking-tight md:text-7xl"
          >
            Distinctive <span className="italic">Tailoring</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="h-[1px] w-24 bg-accent-yellow/30"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-xl text-sm font-light leading-relaxed text-muted-foreground"
          >
            Explore our curated range of professional attire, 
            where every piece is an intersection of heritage and modern power.
          </motion.p>
        </div>

        {/* Toolbar */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-8 border-y border-border/40 py-8">
          <div className="flex items-center gap-12">
            <Sheet>
              <SheetTrigger
                render={
                  <button className="flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] transition-opacity hover:opacity-70">
                    <SlidersHorizontal className="h-4 w-4 stroke-[1px]" />
                    Filter Archives
                  </button>
                }
              />
              <SheetContent side="left" className="w-[350px] bg-[#FDFCFB]">
                <SheetHeader className="mb-12 text-left">
                  <SheetTitle className="font-serif text-3xl font-light">Refine</SheetTitle>
                </SheetHeader>
                <FiltersContent />
              </SheetContent>
            </Sheet>

            <div className="hidden h-4 w-[1px] bg-border md:block" />

            <div className="hidden items-center gap-4 md:flex">
                {activeFiltersCount > 0 && (
                  <>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Active:</span>
                    <div className="flex gap-4">
                      {selectedCategory && (
                        <button 
                          onClick={() => setSelectedCategory(null)}
                          className="text-[10px] uppercase tracking-widest hover:line-through"
                        >
                          {selectedCategory}
                        </button>
                      )}
                      {selectedFit && (
                        <button 
                          onClick={() => setSelectedFit(null)}
                          className="text-[10px] uppercase tracking-widest hover:line-through"
                        >
                          {selectedFit}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-[10px] uppercase tracking-[0.2em] text-accent-yellow"
                    >
                      Reset
                    </button>
                  </>
                )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60 md:block">Sort :</span>
            <Select value={sortBy} onValueChange={(v: string | null) => setSortBy(v ?? "newest")}>
              <SelectTrigger className="w-48 border-0 bg-transparent p-0 text-[10px] uppercase tracking-[0.3em] focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#FDFCFB] border-border/40">
                {sortOptions.map((opt) => (
                  <SelectItem 
                    key={opt.value} 
                    value={opt.value}
                    className="text-[10px] uppercase tracking-[0.2em] focus:bg-accent-yellow/10"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-16">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <FiltersContent />
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                 <div className="h-10 w-[1px] animate-pulse bg-accent-yellow" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <h3 className="font-serif text-2xl font-light">Void of Results</h3>
                <p className="mt-4 text-xs tracking-widest text-muted-foreground">
                  Your current criteria remains unfulfilled.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-12 text-[10px] uppercase tracking-[0.5em] text-accent-yellow underline transition-opacity hover:opacity-70"
                >
                  Reset Archives
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-12 gap-y-24 sm:grid-cols-2">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
