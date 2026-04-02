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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [wantsHomeFitting, setWantsHomeFitting] = useState(false);
  const { addItem, toggleCart } = useCartStore();
  const { addItem: addRecentlyViewed, items: recentlyViewedIds } = useRecentlyViewedStore();

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
    <main className="bg-[#FDFCFB] min-h-screen pt-20 pb-24">
      <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 py-12 lg:px-20">
        {/* Breadcrumbs */}
        <nav className="mb-12 sm:mb-20 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-sm uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold overflow-x-auto whitespace-nowrap pb-4 scrollbar-hide">
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

        <div className="grid grid-cols-1 gap-24 lg:grid-cols-12 items-start">
          {/* Visual Presentation */}
          <div className="lg:col-span-7 flex flex-col-reverse gap-8 md:flex-row">
            {/* Thumbnails */}
            <div className="flex flex-row gap-6 md:flex-col">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative aspect-[3/4] w-24 overflow-hidden border transition-all duration-700",
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
                    src={product.images[selectedImage]?.url || "/placeholder-suit.jpg"}
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
          <div className="lg:col-span-5 flex flex-col space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="h-[1px] w-12 bg-accent-yellow/40" />
                <p className="text-sm uppercase tracking-[0.5em] text-accent-yellow font-bold">
                  {product.category?.name} Catalog
                </p>
              </div>
              <h1 className="font-serif text-3xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-8">
                <span className="font-serif text-3xl sm:text-4xl font-light tracking-tighter text-foreground">
                  ₹{selectedVariant.price.toLocaleString()}
                </span>
                {selectedVariant.compare_at_price && (
                  <span className="text-xl sm:text-2xl text-muted-foreground/30 line-through font-light">
                    ₹{selectedVariant.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="mt-6 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground/70 leading-relaxed font-bold">
                Complimentary seasonal tailoring included
              </p>
            </motion.div>

            <Separator className="bg-border/30" />

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm uppercase tracking-[0.4em] text-accent-yellow font-bold">Indian Standard Size</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-xs uppercase tracking-widest text-muted-foreground underline underline-offset-4 decoration-accent-yellow/40 hover:text-foreground transition-colors font-semibold">
                      Size Guide
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-[#FDFCFB] border-border/20 rounded-none sm:p-12">
                    <DialogHeader className="mb-12">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="h-[1px] w-12 bg-accent-yellow/40" />
                        <p className="text-sm uppercase tracking-[0.5em] text-accent-yellow font-bold">Measurements</p>
                      </div>
                      <DialogTitle className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground text-left">
                        Size Guide
                      </DialogTitle>
                    </DialogHeader>
                    <Table className="border-t border-border/20">
                      <TableHeader className="bg-black/5">
                        <TableRow className="border-border/10 hover:bg-transparent">
                          <TableHead className="py-6 text-[11px] uppercase tracking-[0.2em] font-black text-foreground">Size</TableHead>
                          <TableHead className="py-6 text-[11px] uppercase tracking-[0.2em] font-black text-foreground text-center">Chest</TableHead>
                          <TableHead className="py-6 text-[11px] uppercase tracking-[0.2em] font-black text-foreground text-center">Waist</TableHead>
                          <TableHead className="py-6 text-[11px] uppercase tracking-[0.2em] font-black text-foreground text-right">Hips</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { size: "XS", chest: 34, waist: 28, hips: 34 },
                          { size: "S", chest: 36, waist: 30, hips: 36 },
                          { size: "M", chest: 38, waist: 32, hips: 38 },
                          { size: "L", chest: 40, waist: 34, hips: 40 },
                          { size: "XL", chest: 42, waist: 36, hips: 42 },
                          { size: "2XL", chest: 44, waist: 38, hips: 44 },
                        ].map((row) => (
                          <TableRow key={row.size} className="border-border/10 hover:bg-black/[0.02]">
                            <TableCell className="py-6 text-sm font-black text-foreground tracking-widest">{row.size}</TableCell>
                            <TableCell className="py-6 text-sm text-muted-foreground/80 text-center font-medium">{row.chest}</TableCell>
                            <TableCell className="py-6 text-sm text-muted-foreground/80 text-center font-medium">{row.waist}</TableCell>
                            <TableCell className="py-6 text-sm text-muted-foreground/80 text-right font-medium">{row.hips}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-12 py-8 border-t border-border/10">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 leading-loose italic">
                        * All measurements are in inches. For the best fit, we recommend our <span className="text-accent-yellow font-black">In-Home Fitting Experience</span> or visiting an Atelier boutique.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    disabled={variant.is_out_of_stock}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      "flex h-16 items-center justify-center border text-sm tracking-widest transition-all duration-500",
                      selectedVariant.id === variant.id
                        ? "border-accent-yellow bg-accent-yellow/5 text-foreground ring-1 ring-accent-yellow/50 font-bold"
                        : variant.is_out_of_stock
                        ? "opacity-20 cursor-not-allowed border-border line-through"
                        : "border-border hover:border-foreground/40 hover:bg-black/[0.02]"
                    )}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Atelier Services */}
            <div className="space-y-10">
              <div 
                onClick={() => setWantsHomeFitting(!wantsHomeFitting)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between border border-border/20 p-8 rounded-sm transition-all duration-700",
                  wantsHomeFitting ? "bg-accent-yellow/10 border-accent-yellow/40" : "hover:bg-accent-yellow/5"
                )}
              >
                <div className="flex items-center gap-8">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center border-2 rounded-full transition-all duration-700",
                    wantsHomeFitting ? "border-accent-yellow bg-accent-yellow" : "border-border group-hover:border-accent-yellow"
                  )}>
                    {wantsHomeFitting && <Check className="h-4 w-4 text-black stroke-[3px]" />}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base uppercase tracking-widest text-foreground font-bold leading-none">In-Home Fitting Experience</h3>
                    <p className="mt-3 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground/70 font-semibold">
                      Bespoke curation at your residence — +₹999
                    </p>
                  </div>
                </div>
                <Info className={cn(
                    "h-5 w-5 transition-colors",
                    wantsHomeFitting ? "text-accent-yellow" : "text-muted-foreground/30"
                )} />
              </div>

              <div className="flex flex-col gap-6">
                <Button
                  size="lg"
                  className="w-full h-20 rounded-none bg-accent-yellow text-black hover:bg-accent-yellow/90 uppercase tracking-[0.5em] text-sm font-black shadow-2xl shadow-accent-yellow/20"
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
                <p className="text-base leading-loose tracking-wide text-muted-foreground/90 font-light">
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
                <p className="text-base leading-loose tracking-wide text-muted-foreground/90 font-light">
                  Crafted with precision from <span className="text-foreground font-medium">{product.fabric}</span>. This selection represents the pinnacle of 
                  textile engineering, offering a natural drape that matures with the wearer over generations.
                </p>
              </TabsContent>
              <TabsContent value="reviews" className="mt-12">
                <div className="space-y-6">
                    <p className="text-base leading-loose tracking-wide text-muted-foreground/90 font-light border-l-2 border-accent-yellow/20 pl-6 italic">
                      "The attention to detail in the canvas lining is unparalleled. It feels like a second skin rather than a suit."
                    </p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-bold">— Patron Recommendation</p>
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
