"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Star, Heart, ShoppingBag, Truck, Shield, RotateCcw, Check, ChevronRight } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/store";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-foreground">
          {product.category?.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative h-20 w-16 overflow-hidden rounded-md border-2 transition-all",
                  selectedImage === index
                    ? "border-accent-yellow"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.images[selectedImage]?.url || "/placeholder-suit.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.compare_at_price && (
              <Badge className="absolute left-4 top-4 bg-accent-yellow text-black">
                Sale
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category?.name}
            </Badge>
            <h1 className="font-serif text-3xl font-bold">{product.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < 4 ? "fill-accent-yellow text-accent-yellow" : "text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.8 (120 reviews)</span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold">
                ₹{selectedVariant.price.toLocaleString()}
              </span>
              {selectedVariant.compare_at_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{selectedVariant.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Or 3 interest-free payments of ₹
              {Math.round(selectedVariant.price / 3).toLocaleString()}
            </p>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="mb-3 text-sm font-semibold">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  disabled={variant.is_out_of_stock}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    "flex h-11 min-w-[4rem] items-center justify-center rounded-md border px-3 text-sm font-medium transition-all",
                    selectedVariant.id === variant.id
                      ? "border-accent-yellow bg-accent-yellow/10 text-foreground"
                      : variant.is_out_of_stock
                      ? "cursor-not-allowed border-border bg-muted text-muted-foreground line-through"
                      : "border-border hover:border-foreground"
                  )}
                >
                  {variant.size}
                </button>
              ))}
            </div>
            <button className="mt-2 text-sm text-accent-yellow underline">
              Size Guide
            </button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    wantsHomeFitting ? "bg-accent-yellow" : "bg-muted"
                  )}
                >
                  <Check
                    className={cn(
                      "h-5 w-5",
                      wantsHomeFitting ? "text-black" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Home Measurement & Sample Viewing</p>
                  <p className="text-xs text-muted-foreground">
                    +₹999 - Refundable on purchase
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWantsHomeFitting(!wantsHomeFitting)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  wantsHomeFitting ? "bg-accent-yellow" : "bg-muted"
                )}
              >
                <motion.div
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  animate={{ x: wantsHomeFitting ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <Button
              size="lg"
              className="w-full bg-accent-yellow text-black hover:bg-accent-yellow/90"
              onClick={handleAddToCart}
              disabled={selectedVariant.is_out_of_stock}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {selectedVariant.is_out_of_stock ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Button variant="outline" size="lg" className="w-full">
              <Heart className="mr-2 h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: Truck, text: "Free Shipping" },
              { icon: Shield, text: "1 Year Warranty" },
              { icon: RotateCcw, text: "Easy Returns" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 text-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="fabric">Fabric</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Fit: <span className="capitalize">{product.fit}</span></li>
                <li>• Color: {product.color}</li>
                <li>• Half-canvas construction</li>
                <li>• Horn buttons</li>
                <li>• Bemberg lining</li>
              </ul>
            </TabsContent>
            <TabsContent value="fabric" className="mt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Crafted from {product.fabric}. This premium fabric offers
                exceptional breathability, wrinkle resistance, and a luxurious
                hand feel. Each piece is hand-cut and sewn by our master tailors.
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <p className="text-sm text-muted-foreground">
                120 verified reviews with an average rating of 4.8/5.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
