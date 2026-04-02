"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Eye, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { useWishlistStore } from "@/store";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { isWishlisted, addItem, removeItem } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const secondaryImage = product.images?.[1] || primaryImage;
  const lowestPrice = product.variants?.reduce(
    (min, v) => (v.price < min ? v.price : min),
    Infinity
  ) ?? product.base_price;
  const hasDiscount = product.compare_at_price && product.compare_at_price > lowestPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FDFCFB]">
        <Link href={`/product/${product.slug}`}>
          <div className="absolute inset-0 z-10 transition-colors group-hover:bg-black/5" />
          <Image
            src={primaryImage?.url || "/placeholder-suit.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
            priority={priority}
            className={cn(
              "object-cover transition-all duration-1000 ease-in-out",
              hovered ? "scale-105 opacity-50 blur-[2px]" : "scale-100 opacity-100"
            )}
          />
          <Image
            src={secondaryImage?.url || primaryImage?.url || "/placeholder-suit.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-all duration-1000 ease-in-out",
              hovered ? "scale-100 opacity-100" : "scale-105 opacity-0"
            )}
          />
        </Link>

        {/* Subtle Luxury Badges */}
        <div className="absolute left-6 top-6 z-20 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-black px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
              Limited
            </span>
          )}
          {product.category?.name === "Bespoke" && (
            <span className="border border-black/10 bg-white/50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] backdrop-blur-md">
              Atelier
            </span>
          )}
        </div>

        <button
          className={cn(
            "absolute right-6 top-6 z-20 h-5 w-5 transition-all duration-500",
            hovered ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => {
            e.preventDefault();
            wishlisted
              ? removeItem(product.id)
              : addItem({
                  id: product.id,
                  user_id: "",
                  product_id: product.id,
                  created_at: new Date().toISOString(),
                  product,
                });
          }}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wishlisted ? "fill-black text-black" : "text-black/30 hover:text-black"
            )}
          />
        </button>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 p-6 transition-all duration-700",
            hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <Link
            href={`/product/${product.slug}`}
            className="flex w-full items-center justify-center bg-black py-4 text-[10px] uppercase tracking-[0.4em] text-white transition-opacity hover:opacity-90"
          >
            Explore Detail
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-serif text-xl tracking-tight text-foreground transition-colors group-hover:text-accent-yellow">
                {product.name}
              </h3>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              {product.category?.name || "Bespoke Collection"}
            </p>
          </div>
          <div className="text-right">
            <span className="font-serif text-lg font-light tracking-tighter">
              ₹{lowestPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground/40 line-through">
                ₹{product.compare_at_price?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="h-[1px] w-0 bg-accent-yellow transition-all duration-700 group-hover:w-full" />
      </div>
    </motion.div>
  );
}
