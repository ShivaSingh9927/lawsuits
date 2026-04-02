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
    <main className="bg-[#FDFCFB] min-h-screen pt-12 pb-32">
      <div className="mx-auto max-w-7xl px-8 py-12 lg:px-12">
        {/* Breadcrumbs */}
        <nav className="mb-12 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
          <Link href="/" className="hover:text-foreground">Atelier</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-foreground">Collection</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-foreground">
            {product.category?.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Visual Presentation */}
          <div className="lg:col-span-7 flex flex-col-reverse gap-6 md:flex-row">
            {/* Thumbnails */}
            <div className="flex flex-row gap-4 md:flex-col">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative aspect-[3/4] w-20 overflow-hidden border transition-all duration-500",
                    selectedImage === index
                      ? "border-accent-yellow scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage */}
            <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-[#F5F3F1] shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={product.images[selectedImage]?.url || "/placeholder-suit.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 600px"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Configuration & Details */}
          <div className="lg:col-span-5 flex flex-col space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-accent-yellow mb-4 font-semibold">
                {product.category?.name} Catalog
              </p>
              <h1 className="font-serif text-4xl font-light tracking-tight md:text-5xl lg:text-6xl mb-6">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-6">
                <span className="font-serif text-3xl font-light">
                  ₹{selectedVariant.price.toLocaleString()}
                </span>
                {selectedVariant.compare_at_price && (
                  <span className="text-lg text-muted-foreground/40 line-through font-light">
                    ₹{selectedVariant.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>
              
              <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground/60 leading-relaxed font-medium">
                Complimentary seasonal tailoring included
              </p>
            </motion.div>

            <Separator className="bg-border/40" />

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs uppercase tracking-[0.3em] text-accent-yellow font-semibold">Select Silhouette</h3>
                <button className="text-[10px] uppercase tracking-widest text-muted-foreground underline hover:text-foreground transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    disabled={variant.is_out_of_stock}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      "flex h-14 items-center justify-center border text-[11px] tracking-widest transition-all duration-300",
                      selectedVariant.id === variant.id
                        ? "border-accent-yellow bg-accent-yellow/5 text-foreground ring-1 ring-accent-yellow font-semibold"
                        : variant.is_out_of_stock
                        ? "opacity-20 cursor-not-allowed border-border line-through"
                        : "border-border hover:border-foreground"
                    )}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Atelier Services */}
            <div className="space-y-6">
              <div 
                onClick={() => setWantsHomeFitting(!wantsHomeFitting)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between border-y border-border/40 py-8 transition-all duration-500",
                  wantsHomeFitting ? "bg-accent-yellow/5" : "hover:bg-accent-yellow/5"
                )}
              >
                <div className="flex items-start gap-6 px-2">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center border rounded-full transition-all duration-500",
                    wantsHomeFitting ? "border-accent-yellow bg-accent-yellow" : "border-border group-hover:border-accent-yellow"
                  )}>
                    {wantsHomeFitting && <Check className="h-3 w-3 text-black" />}
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-foreground font-semibold">In-Home Fitting Experience</h3>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                      Bespoke curation at your residence — +₹999
                    </p>
                  </div>
                </div>
                <Info className="h-4 w-4 text-muted-foreground/40 mr-2" />
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  className="w-full h-16 rounded-none bg-accent-yellow text-black hover:bg-accent-yellow/90 uppercase tracking-[0.4em] text-[11px] font-bold shadow-lg shadow-accent-yellow/10"
                  onClick={handleAddToCart}
                  disabled={selectedVariant.is_out_of_stock}
                >
                   {selectedVariant.is_out_of_stock ? "Exhausted" : "Reserve for Atelier"}
                </Button>

                <div className="flex gap-4">
                   <Button variant="outline" className="flex-1 h-14 rounded-none border-border/40 uppercase tracking-[0.3em] text-[10px] font-medium hover:bg-transparent hover:border-foreground">
                      <Heart className="mr-2 h-3.5 w-3.5" />
                      Add to Archive
                   </Button>
                   <Button variant="outline" className="flex-1 h-14 rounded-none border-border/40 uppercase tracking-[0.3em] text-[10px] font-medium hover:bg-transparent hover:border-foreground">
                      <ShoppingBag className="mr-2 h-3.5 w-3.5" />
                      Gift Curation
                   </Button>
                </div>
              </div>
            </div>

            {/* Product Story */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border/40 bg-transparent p-0">
                <TabsTrigger 
                  value="details" 
                  className="rounded-none border-b-2 border-transparent px-8 pb-4 text-xs uppercase tracking-[0.3em] data-[state=active]:border-accent-yellow data-[state=active]:bg-transparent font-semibold"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="fabric" 
                  className="rounded-none border-b-2 border-transparent px-8 pb-4 text-xs uppercase tracking-[0.3em] data-[state=active]:border-accent-yellow data-[state=active]:bg-transparent font-semibold"
                >
                  Textile
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="rounded-none border-b-2 border-transparent px-8 pb-4 text-xs uppercase tracking-[0.3em] data-[state=active]:border-accent-yellow data-[state=active]:bg-transparent font-semibold"
                >
                  Legacy
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-8">
                <p className="text-sm leading-relaxed tracking-wide text-muted-foreground/80 font-light">
                  {product.description}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="space-y-4">
                      <span className="text-xs uppercase tracking-widest text-accent-yellow font-semibold">Construction</span>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Half-Canvas Interior</p>
                   </div>
                   <div className="space-y-4">
                      <span className="text-xs uppercase tracking-widest text-accent-yellow font-semibold">Silhouette</span>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{product.fit}</p>
                   </div>
                </div>
              </TabsContent>
              <TabsContent value="fabric" className="mt-8">
                <p className="text-sm leading-relaxed tracking-wide text-muted-foreground/80 font-light">
                  Crafted with precision from {product.fabric}. This selection represents the pinnacle of 
                  textile engineering, offering a natural drape that matures with the wearer.
                </p>
              </TabsContent>
              <TabsContent value="reviews" className="mt-8">
                <p className="text-sm leading-relaxed tracking-wide text-muted-foreground/80 font-light">
                  Refined by our patrons. 120 curated endorsements with an average distinction of 4.8.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* New Sections */}
        <div className="mt-40 space-y-40">
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
