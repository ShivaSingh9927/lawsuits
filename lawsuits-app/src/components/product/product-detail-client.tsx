"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  Shield, 
  RotateCcw, 
  Check, 
  ChevronRight,
  ArrowRight,
  Info
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product, ProductVariant } from "@/types";
import { useCartStore, useRecentlyViewedStore } from "@/store";
import { products } from "@/lib/data";
import { ProductCarousel } from "./product-carousel";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Combo Logic - Broadened detection
  const isCombo = 
    product.sku?.startsWith("TDO-PKG") || 
    product.id?.includes("PKG") || 
    product.category?.slug === "package-deals" ||
    product.name.toLowerCase().includes("piece") ||
    product.name.toLowerCase().includes("combo") ||
    product.name.toLowerCase().includes("package");

  const isShirtCombo = product.sku?.includes("-SH-") || product.name.toLowerCase().includes("shirt");
  const topLabel = product.sku?.includes("-CO-WC-") || product.name.toLowerCase().includes("coat and waistcoat") ? "Coat and Waistcoat Size" : 
                   product.sku?.includes("-CO-") || product.name.toLowerCase().includes("coat") ? "Coat Size" :
                   product.sku?.includes("-WC-") || product.name.toLowerCase().includes("waistcoat") ? "Waistcoat Size" :
                   isShirtCombo ? "Shirt Size" : "Top Size";

  // Dynamic Size Calculation from Database Variants
  const getDynamicSizes = (type: "top" | "bottom") => {
    if (!product.variants || product.variants.length === 0) return [];
    
    const availableSet = new Set<string | number>();
    const allNumericSizes = [36, 38, 40, 42, 44, 46, 48, 50];
    const allShirtSizes = ["S", "M", "L", "XL", "XXL"];
    const allPantSizes = [28, 30, 32, 34, 36, 38];

    product.variants.forEach(v => {
      const vSize = String(v.size || v.sku).toUpperCase();
      
      if (isShirtCombo && type === "top") {
        allShirtSizes.forEach(s => { if (vSize.includes(s)) availableSet.add(s); });
      } else if (!isShirtCombo && type === "top") {
        // Handle Range Expansion (e.g. "36-44" -> 36, 38, 40, 42, 44)
        if (vSize.includes("36-44")) [36,38,40,42,44].forEach(n => availableSet.add(n));
        if (vSize.includes("46-50")) [46,48,50].forEach(n => availableSet.add(n));
        // Handle Individual Numeric (e.g. "Size 40")
        const matches = vSize.match(/\d+/g);
        if (matches) matches.forEach(m => {
          const n = parseInt(m);
          if (allNumericSizes.includes(n)) availableSet.add(n);
        });
      } else if (type === "bottom") {
        allPantSizes.forEach(n => availableSet.add(n)); // Pants are usually standard ranges in combos
      }
    });

    return Array.from(availableSet).sort((a,b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
  };

  // Dynamic image gallery logic
  const topSizes = getDynamicSizes("top");
  const bottomSizes = getDynamicSizes("bottom");

  // Use the provided demo image as fallback if no images exist
  const displayImages = product.images?.length > 0 
    ? [...product.images] 
    : [{ id: "fallback-1", product_id: product.id, url: "/product-image/demo.webp", thumbnail_url: "/product-image/demo.webp", medium_url: "/product-image/demo.webp", alt: product.name, position: 0, is_primary: true }];

  // Multi-angle Fallback for Combos
  if (isCombo && displayImages.length < 2) {
    displayImages.push({
       id: "fallback-2",
       product_id: product.id,
       url: "/advocate_dress_coat.webp",
       thumbnail_url: "/advocate_dress_coat.webp",
       medium_url: "/advocate_dress_coat.webp",
       alt: "Detail view from Atelier",
       position: 1,
       is_primary: false
    });
    displayImages.push({
       id: "fallback-3",
       product_id: product.id,
       url: "/pexels-pavel-danilyuk-8112126.webp",
       thumbnail_url: "/pexels-pavel-danilyuk-8112126.webp",
       medium_url: "/pexels-pavel-danilyuk-8112126.webp",
       alt: "Fabric texture and finish",
       position: 2,
       is_primary: false
    });
  }

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedTopSize, setSelectedTopSize] = useState<string | number>(
    topSizes[0] || (isShirtCombo ? "S" : 40)
  );
  const [selectedBottomSize, setSelectedBottomSize] = useState<string | number>(
    bottomSizes[0] || 32
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [wantsHomeFitting, setWantsHomeFitting] = useState(false);
  const { addItem, toggleCart } = useCartStore();
  const { addItem: addRecentlyViewed, items: recentlyViewedIds } = useRecentlyViewedStore();

  // Match variant based on combo selections
  // Enhanced Matching Logic for Combo Packages
  // Hyper-Resilient Variant Matching for Combo Packages
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) {
      if (!selectedVariant) setSelectedVariant({ id: 'base', price: product.base_price, compare_at_price: product.compare_at_price, size: 'Standard', stock_quantity: 5 } as any);
      return;
    }

    if (isCombo) {
      const topNum = parseInt(String(selectedTopSize).replace(/\D/g, ''));
      let matched: ProductVariant | undefined;

      // 1. Shirt Combo Strategy (S, M, L, XL, XXL)
      if (isShirtCombo) {
        const topStr = String(selectedTopSize).toLowerCase().trim();
        matched = product.variants.find(v => 
          v.size.toLowerCase().includes(topStr) || 
          v.sku.toLowerCase().includes(topStr)
        );
      } 
      // 2. Suit/Package Strategy (Numeric 36-50)
      else if (!isNaN(topNum)) {
        const bracket = topNum <= 44 ? "36-44" : "46-50";
        
        // Tier A: Direct Size Match (e.g., v.size is "46" precisely)
        matched = product.variants.find(v => 
          v.size.trim() === String(selectedTopSize).trim() || 
          v.sku.endsWith(`-${selectedTopSize}`)
        );

        // Tier B: Named Bracket Match (e.g., v.size contains "46-50")
        if (!matched) {
          matched = product.variants.find(v => 
            v.size.includes(bracket) || 
            v.sku.includes(bracket)
          );
        }

        // Tier C: Price Position Fallback (Standard vs Premium Brackets)
        if (!matched && product.variants.length >= 2) {
          const sorted = [...product.variants].sort((a, b) => a.price - b.price);
          // If top size is 46+, force the most expensive variant (Premium tier)
          matched = topNum <= 44 ? sorted[0] : sorted[sorted.length - 1];
        }
      }

      // Final Variant Activation
      const finalMatched = matched || product.variants[0];
      if (finalMatched && (!selectedVariant || finalMatched.id !== selectedVariant.id || finalMatched.price !== selectedVariant.price)) {
        setSelectedVariant(finalMatched);
      }
    }
  }, [selectedTopSize, selectedBottomSize, isCombo, isShirtCombo, product.variants]);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity: 1,
      product,
      variant: selectedVariant,
    });
    toggleCart();
  };

  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="bg-[#FDFCFB] min-h-screen pt-24 pb-12">
      <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 py-4 lg:px-20">
        {/* Breadcrumbs */}
        <nav className="mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">Atelier</Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 stroke-[1px] shrink-0" />
          <Link href="/shop" className="hover:text-foreground transition-colors shrink-0">Collection</Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 stroke-[1px] shrink-0" />
          <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-foreground transition-colors shrink-0">
            {product.category?.name}
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 stroke-[1px] shrink-0" />
          <span className="text-foreground shrink-0">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Visual Presentation */}
          <div className="lg:col-span-6 flex flex-col-reverse gap-6 md:flex-row">
            {/* Thumbnails */}
            <div className="flex flex-row gap-4 md:flex-col">
              {displayImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative aspect-[3/4] w-16 overflow-hidden border transition-all duration-700",
                    selectedImage === index
                      ? "border-accent-yellow scale-105 shadow-xl ring-1 ring-accent-yellow/20"
                      : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage */}
            <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-[#F5F3F1] shadow-2xl rounded-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={displayImages[selectedImage]?.url || "/placeholder-suit.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 800px"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Configuration & Details */}
          <div className="lg:col-span-6 flex flex-col space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="h-[1px] w-12 bg-accent-yellow/40" />
                <p className="text-xs uppercase tracking-[0.5em] text-accent-yellow font-bold">
                  {product.category?.name} Catalog
                </p>
              </div>
              <h1 className="font-serif text-3xl font-light tracking-tight sm:text-4xl md:text-5xl lg:text-5xl mb-6 leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6 min-h-[2.5rem]">
                <div key={selectedVariant?.id} className="flex items-baseline gap-4">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={selectedVariant?.price}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="font-serif text-3xl sm:text-4xl font-light tracking-tighter text-foreground"
                    >
                      ₹{selectedVariant?.price?.toLocaleString() || product.base_price.toLocaleString()}
                    </motion.span>
                  </AnimatePresence>
                  
                  {selectedVariant?.compare_at_price && selectedVariant.compare_at_price > (selectedVariant.price || 0) && (
                    <span className="text-xl sm:text-2xl text-zinc-300 line-through font-light">
                      ₹{selectedVariant.compare_at_price.toLocaleString()}
                    </span>
                  )}
                </div>

                {isCombo && !isShirtCombo && (
                  <Badge variant="outline" className="rounded-none border-accent-yellow/30 text-accent-yellow font-bold tracking-widest text-[10px] py-1 px-3 uppercase bg-accent-yellow/5 h-fit self-center">
                    {Number(selectedTopSize) <= 44 ? "Standard Bracket (36-44)" : "Premium Bracket (46-50)"}
                  </Badge>
                )}
              </div>
              
              <div className="mt-6 flex items-center gap-6 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border-t border-zinc-100 pt-6">
                 <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span>Available: <span className="text-foreground">{selectedVariant?.stock_quantity || 5}</span></span>
                 </div>
                 <span className="h-3 w-[1px] bg-zinc-200" />
                 <span>Sold: <span className="text-foreground">42</span></span>
                 <span className="h-3 w-[1px] bg-zinc-200" />
                 <span className="text-accent-yellow">Limited Edition</span>
              </div>
            </motion.div>

            <Separator className="bg-border/30" />

            {/* Size Selection */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.4em] text-accent-yellow font-bold">Standard Size Curation</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-[10px] uppercase tracking-widest text-muted-foreground underline underline-offset-4 decoration-accent-yellow/40 hover:text-foreground transition-colors font-semibold">
                      Size Guide
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-[#FDFCFB] border-border/20 rounded-none sm:p-12">
                    <DialogHeader className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="h-[1px] w-12 bg-accent-yellow/40" />
                        <p className="text-[10px] uppercase tracking-[0.5em] text-accent-yellow font-bold">Measurements</p>
                      </div>
                      <DialogTitle className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground text-left">
                        Size Guide
                      </DialogTitle>
                    </DialogHeader>
                    <Table className="border-t border-border/20">
                      <TableHeader className="bg-black/5">
                        <TableRow className="border-border/10 hover:bg-transparent">
                          <TableHead className="py-4 text-[11px] uppercase tracking-[0.2em] font-black text-foreground">Size</TableHead>
                          <TableHead className="py-4 text-[11px] uppercase tracking-[0.2em] font-black text-foreground text-center">Chest</TableHead>
                          <TableHead className="py-4 text-[11px] uppercase tracking-[0.2em] font-black text-foreground text-center">Waist</TableHead>
                          <TableHead className="py-4 text-[11px] uppercase tracking-[0.2em] font-black text-foreground text-right">Hips</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { size: "S", chest: 36, waist: 30, hips: 36 },
                          { size: "M", chest: 38, waist: 32, hips: 38 },
                          { size: "L", chest: 40, waist: 34, hips: 40 },
                          { size: "XL", chest: 42, waist: 36, hips: 42 },
                          { size: "2XL", chest: 44, waist: 38, hips: 44 },
                        ].map((row) => (
                          <TableRow key={row.size} className="border-border/10 hover:bg-black/[0.02]">
                            <TableCell className="py-4 text-xs font-black text-foreground tracking-widest">{row.size}</TableCell>
                            <TableCell className="py-4 text-xs text-muted-foreground/80 text-center font-medium">{row.chest}</TableCell>
                            <TableCell className="py-4 text-xs text-muted-foreground/80 text-center font-medium">{row.waist}</TableCell>
                            <TableCell className="py-4 text-xs text-muted-foreground/80 text-right font-medium">{row.hips}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DialogContent>
                </Dialog>
              </div>
              
              {isCombo ? (
                <div className="space-y-8">
                   {/* Top Selection */}
                   <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                         {topLabel} : <span className="text-foreground">{selectedTopSize}</span>
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                         {topSizes.map((size) => (
                            <button
                               key={size}
                               onClick={() => setSelectedTopSize(size)}
                               className={cn(
                                  "flex h-10 w-full items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                                  selectedTopSize === size
                                     ? "border-black bg-black text-white shadow-lg"
                                     : "border-zinc-200 hover:border-black text-zinc-600"
                               )}
                            >
                               {size}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Pant Selection */}
                   <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                         Pant Size : <span className="text-foreground">{selectedBottomSize}</span>
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                         {bottomSizes.map((size) => (
                            <button
                               key={size}
                               onClick={() => setSelectedBottomSize(size)}
                               className={cn(
                                  "flex h-10 w-full items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                                  selectedBottomSize === size
                                     ? "border-black bg-black text-white shadow-lg"
                                     : "border-zinc-200 hover:border-black text-zinc-600"
                               )}
                            >
                               {size}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      disabled={variant.is_out_of_stock}
                      onClick={() => setSelectedVariant(variant)}
                      className={cn(
                        "flex h-12 items-center justify-center border text-[10px] tracking-widest transition-all duration-500",
                        selectedVariant.id === variant.id
                          ? "border-accent-yellow bg-accent-yellow/5 text-foreground font-bold"
                          : variant.is_out_of_stock
                          ? "opacity-20 cursor-not-allowed border-border line-through"
                          : "border-border hover:border-foreground/40"
                      )}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Atelier Services */}
            <div className="space-y-8">
              <div 
                onClick={() => setWantsHomeFitting(!wantsHomeFitting)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between border border-border/20 p-5 rounded-sm transition-all duration-700",
                  wantsHomeFitting ? "bg-accent-yellow/10 border-accent-yellow/40" : "hover:bg-accent-yellow/5"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center border-2 rounded-full transition-all duration-700",
                    wantsHomeFitting ? "border-accent-yellow bg-accent-yellow" : "border-border group-hover:border-accent-yellow"
                  )}>
                    {wantsHomeFitting && <Check className="h-3 w-3 text-black stroke-[3px]" />}
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-foreground font-bold leading-none">In-Home Fitting</h3>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold italic">
                      +₹999 Premium Curation
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  className="w-full h-16 rounded-none bg-accent-yellow text-black hover:bg-accent-yellow/90 uppercase tracking-[0.5em] text-xs font-black shadow-lg"
                  onClick={handleAddToCart}
                  disabled={selectedVariant.is_out_of_stock}
                >
                   {selectedVariant.is_out_of_stock ? "Exhausted" : "Add to Cart"}
                </Button>

                <div className="flex gap-6">
                   <Button variant="outline" className="flex-1 h-16 rounded-none border-border/30 uppercase tracking-[0.4em] text-xs font-bold hover:bg-black/5 hover:border-foreground transition-all">
                      <Heart className="mr-3 h-4 w-4 font-bold" />
                      Add to Archive
                   </Button>
                   <Button variant="outline" className="flex-1 h-16 rounded-none border-border/30 uppercase tracking-[0.4em] text-xs font-bold hover:bg-black/5 hover:border-foreground transition-all">
                      <ShoppingBag className="mr-3 h-4 w-4 font-bold" />
                      Gift Curation
                   </Button>
                </div>
              </div>
            </div>

            {/* Product Story */}
            <Tabs defaultValue="details" className="w-full pt-8">
              <div className="w-full overflow-x-auto scrollbar-hide border-b border-border/20">
                <TabsList className="inline-flex w-max justify-start rounded-none bg-transparent p-0 gap-8 sm:gap-12">
                  <TabsTrigger 
                    value="details" 
                    className="rounded-none border-b-2 border-transparent px-2 pb-6 text-[10px] sm:text-sm uppercase tracking-[0.4em] data-[state=active]:border-accent-yellow data-[state=active]:bg-transparent font-bold"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="fabric" 
                    className="rounded-none border-b-2 border-transparent px-2 pb-6 text-[10px] sm:text-sm uppercase tracking-[0.4em] data-[state=active]:border-accent-yellow data-[state=active]:bg-transparent font-bold"
                  >
                    Textile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="rounded-none border-b-2 border-transparent px-2 pb-6 text-[10px] sm:text-sm uppercase tracking-[0.4em] data-[state=active]:border-accent-yellow data-[state=active]:bg-transparent font-bold"
                  >
                    Legacy
                  </TabsTrigger>
                </TabsList>
              </div>
               <TabsContent value="details" className="mt-12">
                <p className="text-base leading-loose tracking-wide text-zinc-700 font-medium">
                  {product.description}
                </p>
                <div className="mt-12 grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <span className="text-sm uppercase tracking-widest text-accent-yellow font-bold">Construction</span>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Half-Canvas Interior</p>
                   </div>
                   <div className="space-y-4">
                      <span className="text-sm uppercase tracking-widest text-accent-yellow font-bold">Silhouette</span>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{product.fit}</p>
                   </div>
                </div>
              </TabsContent>
               <TabsContent value="fabric" className="mt-12">
                <p className="text-base leading-loose tracking-wide text-zinc-700 font-medium">
                  Crafted with precision from <span className="text-black font-bold underline underline-offset-4 decoration-accent-yellow/30">{product.fabric}</span>. This selection represents the pinnacle of 
                  textile engineering, offering a natural drape that matures with the wearer over generations.
                </p>
              </TabsContent>
               <TabsContent value="reviews" className="mt-12">
                <div className="space-y-6">
                    <p className="text-base leading-loose tracking-wide text-zinc-800 font-medium border-l-2 border-accent-yellow/40 pl-6 italic">
                      "The attention to detail in the canvas lining is unparalleled. It feels like a second skin rather than a suit."
                    </p>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-black">— Patron Recommendation</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* New Sections */}
        <div className="mt-32 space-y-32">
          <ProductCarousel 
            title="You May Also Like"
            subtitle="Related Curations"
            products={relatedProducts}
          />
          
          <ProductCarousel 
            title="Recently Viewed"
            subtitle="Your History"
            products={recentlyViewedProducts}
          />
        </div>
      </div>
    </main>
  );
}
