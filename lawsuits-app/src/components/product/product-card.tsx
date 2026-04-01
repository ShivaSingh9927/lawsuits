"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Eye } from "lucide-react";
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("group relative", className)}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/product/${product.slug}`}>
          <Image
            src={primaryImage?.url || "/placeholder-suit.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "object-cover transition-all duration-500",
              hovered ? "scale-110 opacity-0" : "scale-100 opacity-100"
            )}
          />
          <Image
            src={secondaryImage?.url || primaryImage?.url || "/placeholder-suit.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            loading="lazy"
            className={cn(
              "object-cover transition-all duration-500",
              hovered ? "scale-100 opacity-100" : "scale-100 opacity-0"
            )}
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {hasDiscount && (
            <Badge className="bg-accent-yellow text-black">
              Sale
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            Home Fitting Available
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-3 top-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm transition-opacity",
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
              "h-4 w-4",
              wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )}
          />
        </Button>

        <div
          className={cn(
            "absolute inset-x-3 bottom-3 transition-all duration-300",
            hovered
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          )}
        >
          <Button
            className="w-full bg-background/90 text-foreground backdrop-blur-sm hover:bg-background"
            size="sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            Quick View
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-sm font-medium leading-tight hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">₹{lowestPrice.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.compare_at_price?.toLocaleString()}
            </span>
          )}
        </div>
        {product.category && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {product.category.name}
          </p>
        )}
      </div>
    </motion.div>
  );
}
