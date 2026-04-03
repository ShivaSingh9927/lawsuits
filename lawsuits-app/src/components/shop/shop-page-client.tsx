"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");

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

  // Synchronize state with URL search parameters
  useEffect(() => {
    const category = searchParams.get("category");
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [searchParams, selectedCategory]);

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    // Remove search when category changes to avoid confusion
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    router.push(pathname, { scroll: false });
    setSelectedFit(null);
    setSelectedFabric(null);
    setPriceRange([0, 100000]);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let query = supabase.from("products").select("*, category:categories(*), images:product_images(*), variants:product_variants(*)").is("deleted_at", null).eq("is_visible", true);

        if (selectedFit) query = query.eq("fit", selectedFit);
        if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
        
        switch (sortBy) {
          case "price-asc": query = query.order("base_price", { ascending: true }); break;
          case "price-desc": query = query.order("base_price", { ascending: false }); break;
          case "oldest": query = query.order("created_at", { ascending: true }); break;
          default: query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query.limit(100);

        if (!error && data && data.length > 0) {
          setAllProducts(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Browser Supabase Fetch Error:", err);
      }
      setAllProducts(mockProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory, selectedFit, sortBy, searchQuery]);

  // Build a lookup: URL slug -> category name (from mockCategories which have correct URL slugs)
  const slugToName: Record<string, string> = {};
  mockCategories.forEach(c => { slugToName[c.slug] = c.name; });

  const filteredProducts = allProducts
    .filter((p) => p.is_visible && !p.deleted_at)
    .filter((p) => {
      if (selectedCategory) {
        const cat = (p as any).category;
        const isComboProduct = p.name.toLowerCase().match(/combo|set|piece|package/) || 
                               p.description?.toLowerCase().match(/combo|set|piece|package/);
        
        // Special handling: "combos" category shows package deal products
        if (selectedCategory === "combos") {
          return !!isComboProduct;
        }
        
        // For Men's Legal Attire, exclude combo/package products
        if (selectedCategory === "mens-legal-attire" && isComboProduct) {
          return false;
        }
        
        if (cat) {
          // Look up the expected category name from URL slug
          const expectedName = slugToName[selectedCategory];
          if (expectedName) {
            return cat.name === expectedName;
          }
          // Direct slug match as fallback
          if (cat.slug === selectedCategory) return true;
        }
        // Fallback for mock data (category_id based)
        const mockCat = mockCategories.find(c => c.slug === selectedCategory);
        if (mockCat) {
          return p.category_id === mockCat.id;
        }
        return false;
      }
      return true;
    })
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
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      return 0;
    });

  // Dynamic Page Title Logic
  const getPageTitle = () => {
    if (searchQuery) return `RESULTS FOR "${searchQuery.toUpperCase()}"`;
    if (selectedCategory) {
      if (selectedCategory === "mens-legal-attire") return "Men's Collection";
      if (selectedCategory === "womens-legal-attire") return "Women's Collection";
      if (selectedCategory === "accessories") return "Accessories Collection";
      if (selectedCategory === "combos") return "Package Deals";
      
      const category = categories.find(c => c.slug === selectedCategory);
      return category ? `${category.name} Collection` : "The Collection";
    }
    return "The Collection";
  };

  const pageTitleParts = getPageTitle().split(" ");
  const lastWord = pageTitleParts.length > 1 ? pageTitleParts.pop() : "";
  const firstPart = pageTitleParts.join(" ");

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedFit ? 1 : 0) +
    (selectedFabric ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

  const clearAllFilters = () => {
    handleClearFilters();
  };

  const FiltersContent = () => (
    <div className="space-y-16 pr-8">
      <div>
        <h3 className="mb-8 text-sm uppercase tracking-[0.4em] text-accent-yellow font-bold">Category</h3>
        <div className="space-y-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                handleCategoryChange(
                  selectedCategory === cat.slug ? null : cat.slug
                )
              }
              className={cn(
                "block w-full text-left text-base tracking-widest transition-all",
                selectedCategory === cat.slug
                  ? "font-semibold text-black translate-x-2"
                  : "text-zinc-500 hover:text-black"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] w-full bg-border/30" />

      <div>
        <h3 className="mb-8 text-sm uppercase tracking-[0.4em] text-accent-yellow font-bold">The Silhouette</h3>
        <div className="space-y-5">
          {fits.map((fit) => (
            <button
              key={fit}
              onClick={() =>
                setSelectedFit(selectedFit === fit ? null : fit)
              }
              className={cn(
                "block w-full text-left text-base capitalize tracking-widest transition-all",
                selectedFit === fit
                  ? "font-semibold text-black translate-x-2"
                  : "text-zinc-500 hover:text-black"
              )}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] w-full bg-border/30" />

      <div>
        <h3 className="mb-8 text-sm uppercase tracking-[0.4em] text-accent-yellow font-bold">Value</h3>
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs tracking-widest text-zinc-600 font-bold">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}+</span>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">Min</span>
              <Input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="h-12 border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 font-bold text-black"
              />
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">Max</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="h-12 border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 font-bold text-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="bg-[#FDFCFB] min-h-screen">
      <div className="mx-auto max-w-[1800px] px-8 lg:px-12 pt-24 pb-10">
        {/* Cinematic Header */}
        <div className="mb-0 flex flex-col items-center text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.6em] text-accent-yellow font-bold"
          >
            The Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-6xl font-light tracking-tight md:text-8xl"
          >
            {firstPart} <span className="italic text-accent-yellow">{lastWord}</span>
          </motion.h1>
        </div>

        {/* Toolbar */}
        <div className="mb-20 flex flex-wrap items-center justify-between gap-12 border-y border-border/40 py-10">
          <div className="flex items-center gap-16">
            <Sheet>
              <SheetTrigger
                asChild
              >
                <button className="flex items-center gap-4 text-sm uppercase tracking-[0.4em] transition-opacity hover:opacity-70 font-semibold">
                  <SlidersHorizontal className="h-5 w-5 stroke-[1px]" />
                  Filter Archives
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] bg-[#FDFCFB]">
                <SheetHeader className="mb-12 text-left">
                  <SheetTitle className="font-serif text-4xl font-light">Refine</SheetTitle>
                </SheetHeader>
                <FiltersContent />
              </SheetContent>
            </Sheet>

            <div className="hidden h-6 w-[1px] bg-border/40 md:block" />

            <div className="hidden items-center gap-6 md:flex">
                {activeFiltersCount > 0 && (
                  <>
                    <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Active:</span>
                    <div className="flex gap-6">
                      {selectedCategory && (
                        <button 
                          onClick={() => setSelectedCategory(null)}
                          className="text-xs uppercase tracking-widest hover:line-through font-semibold text-accent-yellow"
                        >
                          {selectedCategory}
                        </button>
                      )}
                      {selectedFit && (
                        <button 
                          onClick={() => setSelectedFit(null)}
                          className="text-xs uppercase tracking-widest hover:line-through font-semibold text-accent-yellow"
                        >
                          {selectedFit}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs uppercase tracking-[0.2em] text-foreground underline underline-offset-4 decoration-accent-yellow/50"
                    >
                      Reset
                    </button>
                  </>
                )}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <span className="hidden text-xs uppercase tracking-[0.4em] text-zinc-400 md:block font-bold">Sort :</span>
            <Select value={sortBy} onValueChange={(v: string | null) => setSortBy(v ?? "newest")}>
              <SelectTrigger className="w-56 border-0 bg-transparent p-0 text-xs uppercase tracking-[0.3em] focus:ring-0 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#FDFCFB] border-border/40">
                {sortOptions.map((opt) => (
                  <SelectItem 
                    key={opt.value} 
                    value={opt.value}
                    className="text-xs uppercase tracking-[0.2em] focus:bg-accent-yellow/10"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-24">
          <aside className="hidden w-80 flex-shrink-0 lg:block border-r border-border/20 pr-12 sticky top-32 h-fit">
            <FiltersContent />
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                 <div className="h-16 w-[1.5px] animate-pulse bg-accent-yellow" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 text-center">
                <h3 className="font-serif text-4xl font-light text-foreground/40">Void of Results</h3>
                <p className="mt-6 text-sm tracking-widest text-zinc-500 font-medium">
                  Your current criteria remains unfulfilled.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-16 text-xs uppercase tracking-[0.5em] text-accent-yellow underline underline-offset-8 transition-opacity hover:opacity-70 font-bold"
                >
                  Reset Archives
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
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
