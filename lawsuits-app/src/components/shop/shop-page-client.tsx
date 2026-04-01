"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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
import { X, SlidersHorizontal } from "lucide-react";
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
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
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

  // Fetch from API if available
  useEffect(() => {
    const fetchProducts = async () => {
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
            return;
          }
        }
      } catch {
        // API not available, use mock data
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
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.slug ? null : cat.slug
                )
              }
              className={cn(
                "block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                selectedCategory === cat.slug
                  ? "bg-accent-yellow/20 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold">Fit</h3>
        <div className="space-y-2">
          {fits.map((fit) => (
            <button
              key={fit}
              onClick={() =>
                setSelectedFit(selectedFit === fit ? null : fit)
              }
              className={cn(
                "block w-full rounded-md px-3 py-1.5 text-left text-sm capitalize transition-colors",
                selectedFit === fit
                  ? "bg-accent-yellow/20 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold">Fabric</h3>
        <div className="space-y-2">
          {fabrics.map((fabric) => (
            <button
              key={fabric}
              onClick={() =>
                setSelectedFabric(selectedFabric === fabric ? null : fabric)
              }
              className={cn(
                "block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                selectedFabric === fabric
                  ? "bg-accent-yellow/20 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {fabric}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold">Price Range</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([Number(e.target.value), priceRange[1]])
            }
            className="h-9"
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="h-9"
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-yellow border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">All Products</h1>
        <p className="mt-1 text-muted-foreground">
          {filteredProducts.length} products found
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.slug === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedFit && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {selectedFit}
              <button onClick={() => setSelectedFit(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedFabric && (
            <Badge variant="secondary" className="gap-1">
              {selectedFabric}
              <button onClick={() => setSelectedFabric(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="sm" className="lg:hidden" />
              }
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0">
                  {activeFiltersCount}
                </Badge>
              )}
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-serif">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={(v: string | null) => setSortBy(v ?? "newest")}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <FiltersContent />
        </aside>

        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
              <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
