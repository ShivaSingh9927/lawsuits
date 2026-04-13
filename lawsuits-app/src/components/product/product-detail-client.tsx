"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import { useCartStore, useRecentlyViewedStore, useWishlistStore } from "@/store";
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
  
  const isBundle = product.is_bundle || (product.bundle_config?.length || 0) > 0 || (product.package_items?.length || 0) > 0;
  const bundleConfig = product.bundle_config || [];
  
  const sortedPackageItems = useMemo(() => {
    if (!product.package_items) return [];
    return [...product.package_items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [product.package_items]);

  const topLabel = product.sku?.includes("-CO-WC-") || product.name.toLowerCase().includes("coat and waistcoat") ? "Coat and Waistcoat Size" :
    product.sku?.includes("-CO-") || product.name.toLowerCase().includes("coat") ? "Coat Size" :
      product.sku?.includes("-WC-") || product.name.toLowerCase().includes("waistcoat") ? "Waistcoat Size" :
        isShirtCombo ? "Shirt Size" : "Top Size";

  // Dynamic Size Calculation from Database Variants
  const getDynamicSizes = (type: string, customVariants?: ProductVariant[]) => {
    const variantsToUse = customVariants || product.variants || [];
    if (variantsToUse.length === 0) return [];

    const availableSet = new Set<string | number>();
    const allNumericSizes = [36, 38, 40, 42, 44, 46, 48, 50, 52];
    const allShirtSizes = ["S", "M", "L", "XL", "XXL"];
    const allPantSizes = [28, 30, 32, 34, 36, 38, 40, 42];

    variantsToUse.forEach(v => {
      const vSize = String(v.size || v.sku).toUpperCase();

      if (type.includes("shirt") || type === "shirt") {
        // Find shirt sizes
        const foundShirtSizes = ["S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL", "5XL"].filter(s =>
          vSize === s || vSize.includes(`-${s}`) || vSize.includes(` ${s}`)
        );
        foundShirtSizes.forEach(s => availableSet.add(s));
        if (vSize.includes("46-50")) [46, 48, 50].forEach(n => availableSet.add(n));
        if (vSize.includes("52")) availableSet.add(52);
      } else if (type === "bottom") {
        // For pants
        const matches = vSize.match(/\d+/g);
        if (matches) matches.forEach(m => {
          const n = parseInt(m);
          if (n >= 26 && n <= 54) availableSet.add(n);
        });
      } else if (type === "fabric" || type === "option") {
        const val = v.metadata?.label || v.color || (v.sku.includes("-") ? v.sku.split("-")[3] : v.sku);
        if (val) availableSet.add(val);
      } else {
        // DEFAULT: Search for any numbers in the variant size/sku (covers "top", "outerwear", etc)
        const matches = vSize.match(/\d+/g);
        if (matches) matches.forEach(m => {
          const n = parseInt(m);
          if (n >= 28 && n <= 60) availableSet.add(n);
        });
      }
    });

    // Final fallback: If nothing found but it's a known type, provide standard range
    if (availableSet.size === 0) {
      if (type === "bottom") [28, 30, 32, 34, 36, 38, 40, 42].forEach(n => availableSet.add(n));
      else if (type === "top") [36, 38, 40, 42, 44, 46, 48, 50].forEach(n => availableSet.add(n));
    }

    return Array.from(availableSet).sort((a, b) => {
      const valA = typeof a === 'number' ? a : parseInt(String(a).replace(/\D/g, ''));
      const valB = typeof b === 'number' ? b : parseInt(String(b).replace(/\D/g, ''));

      // Numeric sort
      if (!isNaN(valA) && !isNaN(valB) && valA !== 0 && valB !== 0) return valA - valB;

      // Shirt size sort
      const shirtOrder = ["S", "M", "L", "XL", "XXL", "XXXL"];
      const idxA = shirtOrder.indexOf(String(a).toUpperCase());
      const idxB = shirtOrder.indexOf(String(b).toUpperCase());

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;

      return String(a).localeCompare(String(b));
    });
  };

  // Dynamic image gallery logic
  const topSizes = getDynamicSizes("top");
  const bottomSizes = getDynamicSizes("bottom");

  // Dynamic Color Extraction for products with explicit color variants (like Pant Cloth)
  const colorOptions = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const colors = new Set<string>();
    product.variants.forEach(v => {
      if (v.color && v.color.trim() !== "" && v.color !== "EMPTY" && v.color.toLowerCase() !== "null") {
        colors.add(v.color.trim());
      }
    });
    return Array.from(colors);
  }, [product.variants]);

  // Dynamic Fabric Extraction
  const fabricOptions = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const fabrics = new Set<string>();
    product.variants.forEach(v => {
      if (v.fabric && v.fabric.trim() !== "" && v.fabric !== "EMPTY" && v.fabric.toLowerCase() !== "null") {
        fabrics.add(v.fabric.trim());
      }
    });
    return Array.from(fabrics);
  }, [product.variants]);



  // Extract Unique Sizes for Individual Products
  const commonColors = ["BLACK", "WHITE", "GREY", "GRAY", "BLUE", "NAVY", "DARK", "LIGHT", "BROWN"];
  const uniqueSizes = Array.from(new Set(
    (product.variants || [])
      .filter(v => {
        const s = String(v.size || "").toUpperCase();
        return (
          s && 
          s !== "EMPTY" && 
          s !== "NULL" &&
          !colorOptions.some(c => c.toLowerCase() === s.toLowerCase()) &&
          !fabricOptions.some(f => f.toLowerCase() === s.toLowerCase()) &&
          !commonColors.includes(s)
        );
      })
      .map(v => v.size)
  ));

  // Use the provided demo image as fallback if no images exist
  const displayImages = product.images?.length > 0
    ? [...product.images]
    : [{ id: "fallback-1", product_id: product.id, url: "/product-image/demo.webp", thumbnail_url: "/product-image/demo.webp", medium_url: "/product-image/demo.webp", alt: product.name, position: 0, is_primary: true }];

  if (isCombo && displayImages.length < 2) {
    displayImages.push({
      id: "fallback-2",
      product_id: product.id,
      url: "/advocate_dress_coat.webp",
      thumbnail_url: "/advocate_dress_coat.webp",
      medium_url: "/advocate_dress_coat.webp",
      alt: "Detail view",
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

  // Sort variants by size numerically
  const sortedVariants = [...(product.variants || [])].sort((a, b) => {
    const sizeA = parseInt(String(a.size).replace(/\D/g, '')) || 0;
    const sizeB = parseInt(String(b.size).replace(/\D/g, '')) || 0;

    // If both are numeric sizes (e.g., 36, 46)
    if (sizeA !== 0 && sizeB !== 0) return sizeA - sizeB;

    // Fallback for non-numeric sizes (e.g., S, M, L)
    const shirtSizeOrder = ["S", "M", "L", "XL", "XXL", "XXXL"];
    const idxA = shirtSizeOrder.indexOf(String(a.size).toUpperCase());
    const idxB = shirtSizeOrder.indexOf(String(b.size).toUpperCase());

    if (idxA !== -1 && idxB !== -1) return idxA - idxB;

    // Alphabetical fallback
    return String(a.size).localeCompare(String(b.size));
  });

  // 1. State Declarations
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    sortedVariants[0] || { id: 'base', price: product.base_price, compare_at_price: product.compare_at_price, size: 'Standard', stock_quantity: 5 } as any
  );
  const [selectedSize, setSelectedSize] = useState<string | number>(
    uniqueSizes[0] || ""
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedTopSize, setSelectedTopSize] = useState<string | number>(
    topSizes[0] || (isShirtCombo ? "S" : 40)
  );
  const [selectedBottomSize, setSelectedBottomSize] = useState<string | number>(
    bottomSizes[0] || 32
  );
  const [bundleSelections, setBundleSelections] = useState<Record<string, string | number>>({});
  const [selectedImage, setSelectedImage] = useState(0);

  // 2. Memoized Values
  const availableColorsForSelection = useMemo(() => {
    // Determine which size to filter by
    const currentSize = isCombo ? selectedTopSize : (uniqueSizes.length > 0 ? selectedSize : null);
    
    if (!currentSize) return colorOptions;
    const colors = new Set<string>();
    product.variants?.forEach(v => {
      const vSize = String(v.size || v.sku).toUpperCase();
      const strSize = String(currentSize).toUpperCase();
      
      const matchesSize = vSize.includes(strSize) || v.sku.includes(strSize);
      if (matchesSize && v.color && v.color.trim() !== "" && v.color !== "EMPTY" && v.color.toLowerCase() !== "null") {
        colors.add(v.color.trim());
      }
    });
    return Array.from(colors);
  }, [product.variants, selectedTopSize, selectedSize, colorOptions, isCombo, uniqueSizes]);

  // Fabrics available for the currently selected size
  const availableFabricsForSelection = useMemo(() => {
    const currentSize = isCombo ? selectedTopSize : (uniqueSizes.length > 0 ? selectedSize : null);
    if (!currentSize) return fabricOptions;
    const fabrics = new Set<string>();
    product.variants?.forEach(v => {
      const vSize = String(v.size || v.sku).toUpperCase();
      const strSize = String(currentSize).toUpperCase();
      const matchesSize = vSize.includes(strSize) || v.sku.includes(strSize);
      if (matchesSize && v.fabric && v.fabric.trim() !== "" && v.fabric !== "EMPTY" && v.fabric.toLowerCase() !== "null") {
        fabrics.add(v.fabric.trim());
      }
    });
    return Array.from(fabrics);
  }, [product.variants, selectedTopSize, selectedSize, fabricOptions, isCombo, uniqueSizes]);

  // 3. Effects
  // Sync selectedColor with availability for the current size
  useEffect(() => {
    if (availableColorsForSelection.length > 0) {
      if (!selectedColor || !availableColorsForSelection.includes(selectedColor)) {
        setSelectedColor(availableColorsForSelection[0]);
      }
    } else {
      setSelectedColor(null);
    }
  }, [availableColorsForSelection, selectedColor]);

  // Sync selectedFabric with availability for the current size
  useEffect(() => {
    if (availableFabricsForSelection.length > 0) {
      if (!selectedFabric || !availableFabricsForSelection.includes(selectedFabric)) {
        setSelectedFabric(availableFabricsForSelection[0]);
      }
    } else {
      setSelectedFabric(null);
    }
  }, [availableFabricsForSelection, selectedFabric]);

  // Initialize bundle selections from config OR relational package items
  useEffect(() => {
    const initial: Record<string, string | number> = {};
    if ((product.package_items?.length || 0) > 0) {
      product.package_items?.forEach((item) => {
        const variants = item.component?.variants || [];
        const type = item.label.toLowerCase().includes("pant") ? "bottom" : "top";
        const sizes = getDynamicSizes(type, variants);
        initial[item.id] = sizes[0] || "";
      });
      setBundleSelections(initial);
    } else if (isBundle && bundleConfig.length > 0) {
      bundleConfig.forEach(config => {
        const sizes = getDynamicSizes(config.type);
        initial[config.id] = sizes[0] || "";
      });
      setBundleSelections(initial);
    }
  }, [product.id, product.bundle_config, product.package_items]);
  const { addItem, toggleCart } = useCartStore();
  const { addItem: addRecentlyViewed, items: recentlyViewedIds } = useRecentlyViewedStore();
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  // Hyper-Resilient Variant Matching for Combo Packages and Bundles
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) {
      if (!selectedVariant) setSelectedVariant({ id: 'base', price: product.base_price, compare_at_price: product.compare_at_price, size: 'Standard', stock_quantity: 5 } as any);
      return;
    }

    // 0. Bundle Matching (Refined: First item in config acts as price controller)
    if (isBundle && Object.keys(bundleSelections).length > 0) {
      const firstConfig = bundleConfig[0];
      const primarySelection = bundleSelections[firstConfig?.id];
      const primaryType = firstConfig?.type;

      if (primarySelection) {
        const primaryNum = parseInt(String(primarySelection).replace(/\D/g, ''));
        const matched = product.variants.find(v => {
          const vSize = String(v.size || v.sku).toUpperCase();
          const vColor = (v.color || "").toLowerCase();

          // 1. Size Range Match
          const rangeMatch = vSize.match(/(\d+)\s*-\s*(\d+)/);
          const sizeMatch = 
            vSize === String(primarySelection).toUpperCase() ||
            (rangeMatch && !isNaN(primaryNum) && (
              primaryNum >= parseInt(rangeMatch[1]) && 
              primaryNum <= parseInt(rangeMatch[2])
            ));
          
          // 2. Fabric/Color Match
          const fabricMatch = primaryType === "fabric" ? vColor === String(primarySelection).toLowerCase() : true;
          return sizeMatch && fabricMatch;
        });

        if (matched) {
          setSelectedVariant(matched);
          return;
        }
      }
    }

    // 3. Individual Product Variation Matching (New Logic)
    if (!isBundle && !isCombo) {
      const matched = product.variants.find(v => {
        const sizeMatch = selectedSize ? String(v.size) === String(selectedSize) : true;
        
        let colorMatch = true;
        if (selectedColor) {
           const vColor = (v.color || "").toLowerCase();
           colorMatch = vColor === selectedColor.toLowerCase();
        }

        let fabricMatch = true;
        if (selectedFabric) {
           const vFabric = (v.fabric || "").toLowerCase();
           fabricMatch = vFabric === selectedFabric.toLowerCase();
        }
        
        return sizeMatch && colorMatch && fabricMatch;
      });

      if (matched) {
        setSelectedVariant(matched);
        return;
      }
    }

    // Legacy Fallback (Always ensure something is selected)
    if (!selectedVariant && sortedVariants.length > 0) {
      setSelectedVariant(sortedVariants[0]);
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
        // Dynamic Strategy: Match exact size OR find a range [min-max] that includes topNum
        matched = product.variants.find(v => {
          const vSize = String(v.size || v.sku).toUpperCase();

          // Try Exact Match
          if (vSize.trim() === String(selectedTopSize).trim() || v.sku.endsWith(`-${selectedTopSize}`)) {
            return true;
          }

          // Try Range Match (e.g., "36-44", "46-52")
          const rangeMatch = vSize.match(/(\d+)\s*-\s*(\d+)/);
          if (rangeMatch) {
            const min = parseInt(rangeMatch[1]);
            const max = parseInt(rangeMatch[2]);
            return topNum >= min && topNum <= max;
          }

          return false;
        });

        // Tier C: Price Position Fallback (Standard vs Premium Brackets)
        if (!matched && product.variants.length >= 2) {
          const sorted = [...product.variants].sort((a, b) => a.price - b.price);
          // If we can't find a match, use price sorting as a heuristic
          matched = topNum <= 44 ? sorted[0] : sorted[sorted.length - 1];
        }
      }

      // Final Variant Activation
      // Enhanced Matching: Consider color even in combos if color variations exist
      let finalMatched = matched || product.variants[0];

      if (selectedColor || selectedFabric) {
        const matchingCriteria = product.variants.find(v => {
          const matchesColor = selectedColor ? v.color === selectedColor : true;
          const matchesFabric = selectedFabric ? v.fabric === selectedFabric : true;
          const matchesSize = v.size.includes(String(selectedTopSize)) || v.sku.includes(String(selectedTopSize));
          return matchesColor && matchesFabric && matchesSize;
        });
        
        if (matchingCriteria) {
          finalMatched = matchingCriteria;
        } else {
          finalMatched = matched || product.variants[0];
        }
      }

      if (finalMatched && (!selectedVariant || finalMatched.id !== selectedVariant.id || finalMatched.price !== selectedVariant.price)) {
        setSelectedVariant(finalMatched);
      }
    } else if (selectedColor) {
      // Non-combo color matching logic
      const matched = product.variants.find(v => v.color === selectedColor);
      }
  }, [selectedTopSize, selectedBottomSize, selectedColor, selectedFabric, selectedSize, bundleSelections, isCombo, isShirtCombo, isBundle, product.variants]);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  const handleAddToCart = () => {
    const metadata = isBundle ? bundleSelections : {
      size: selectedTopSize || selectedSize,
      waist: isCombo ? selectedBottomSize : undefined,
      color: selectedColor || undefined,
      fabric: selectedFabric || undefined
    };

    addItem({
      id: `${product.id}-${selectedVariant.id}-${JSON.stringify(metadata)}`,
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity: 1,
      product,
      variant: selectedVariant,
      metadata,
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
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
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
            <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-[#F5F3F1] shadow-2xl rounded-sm group/main">
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

              {/* Persistent Wishlist Heart on Main Image */}
              <button
                className="absolute right-6 top-6 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-black/5 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                onClick={(e) => {
                  e.preventDefault();
                  if (isWishlisted(product.id)) {
                    removeFromWishlist(product.id);
                  } else {
                    addToWishlist({
                      id: product.id,
                      user_id: "",
                      product_id: product.id,
                      created_at: new Date().toISOString(),
                      product,
                    });
                  }
                }}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isWishlisted(product.id) ? "fill-accent-yellow text-accent-yellow scale-110" : "text-zinc-400"
                  )}
                />
              </button>
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

              {(selectedVariant?.stock_quantity || 0) <= 3 && (
                <div className="mt-6 flex items-center gap-6 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border-t border-zinc-100 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Available: <span className="text-foreground">{selectedVariant?.stock_quantity}</span></span>
                  </div>
                </div>
              )}
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

              {isBundle ? (
                <div className="space-y-8">
                  {sortedPackageItems.length > 0 ? (
                    // 1. Relational Bundle Strategy
                    sortedPackageItems.map((item) => {
                      const variants = item.component?.variants || [];
                      const type = item.label.toLowerCase().includes("pant") ? "bottom" : "top";
                      const sizes = getDynamicSizes(type, variants);
                      const selected = bundleSelections[item.id] || sizes[0];
                      
                      return (
                        <div key={item.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                              {item.label.toUpperCase()} : <span className="text-foreground">{selected}</span>
                            </p>
                            {selected && (
                              <p className={cn(
                                "text-[10px] uppercase tracking-widest font-bold",
                                (variants.find(v => String(v.size || v.sku).includes(String(selected)))?.stock_quantity || 0) > 0 
                                  ? "text-emerald-600" 
                                  : "text-red-500"
                              )}>
                                {(variants.find(v => String(v.size || v.sku).includes(String(selected)))?.stock_quantity || 0) > 0 
                                  ? "In Stock" 
                                  : "Out of Stock"}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                            {sizes.map((size) => {
                              const isSizeMatch = (vSize: string, s: string | number) => {
                                const strVSize = String(vSize).toUpperCase();
                                const strS = String(s).toUpperCase();
                                // Exact match or contains as word
                                return strVSize === strS || 
                                       strVSize.includes(`-${strS}`) || 
                                       strVSize.includes(` ${strS}`) ||
                                       strVSize.startsWith(`${strS} `) ||
                                       strVSize.endsWith(` ${strS}`);
                              };

                              const v = variants.find(v => isSizeMatch(v.size || v.sku, size));
                              const isOutOfStock = v ? (v.is_out_of_stock || (v.stock_quantity !== undefined && v.stock_quantity <= 0)) : false;
                              
                              return (
                                <button
                                  key={size}
                                  disabled={isOutOfStock}
                                  onClick={() => {
                                    setBundleSelections(prev => {
                                      const next = { ...prev, [item.id]: size };
                                      
                                      // AUTO-SYNC sizes between Coat and Waistcoat
                                      const currentLabel = item.label.toLowerCase();
                                      if ((currentLabel.includes("coat") || currentLabel.includes("court")) && !currentLabel.includes("waist")) {
                                        const waistcoatItem = product.package_items!.find(p => {
                                          const l = p.label.toLowerCase();
                                          return l.includes("waistcoat") || l.includes("waist court") || l.includes("waist coat");
                                        });
                                        if (waistcoatItem) {
                                          const wcVariant = waistcoatItem.component?.variants?.find(v => isSizeMatch(v.size || v.sku, size));
                                          if (wcVariant && !wcVariant.is_out_of_stock && (wcVariant.stock_quantity === undefined || wcVariant.stock_quantity > 0)) {
                                            next[waistcoatItem.id] = size;
                                          }
                                        }
                                      } else if (currentLabel.includes("waist")) {
                                        // Sync Waistcoat back to Coat
                                        const coatItem = product.package_items!.find(p => {
                                          const l = p.label.toLowerCase();
                                          return (l.includes("coat") || l.includes("court")) && !l.includes("waist");
                                        });
                                        if (coatItem) {
                                          const cVariant = coatItem.component?.variants?.find(v => isSizeMatch(v.size || v.sku, size));
                                          if (cVariant && !cVariant.is_out_of_stock && (cVariant.stock_quantity === undefined || cVariant.stock_quantity > 0)) {
                                            next[coatItem.id] = size;
                                          }
                                        }
                                      }
                                      
                                      return next;
                                    });
                                  }}
                                  className={cn(
                                    "flex h-10 w-full items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                                    selected === size
                                      ? "border-black bg-black text-white shadow-lg"
                                      : "border-zinc-200 text-zinc-600 hover:border-black",
                                    isOutOfStock && "opacity-20 cursor-not-allowed grayscale border-zinc-100"
                                  )}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // 2. Legacy Bundle Strategy
                    bundleConfig.map((config) => {
                      const sizes = getDynamicSizes(config.type);
                      const selected = bundleSelections[config.id] || sizes[0];
                      
                      return (
                        <div key={config.id} className="space-y-4">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                            {config.label} : <span className="text-foreground">{selected}</span>
                          </p>
                          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                            {sizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => setBundleSelections(prev => ({ ...prev, [config.id]: size }))}
                                className={cn(
                                  "flex h-10 w-full items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                                  selected === size
                                    ? "border-black bg-black text-white shadow-lg"
                                    : "border-zinc-200 hover:border-black text-zinc-600"
                                )}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : isCombo ? (
                <div className="space-y-8">
                  {/* Top Selection */}
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                      {topLabel.toUpperCase()} : <span className="text-foreground">{selectedTopSize}</span>
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {topSizes.length > 0 ? topSizes.map((size) => (
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
                      )) : (
                        <button className="flex h-10 w-full items-center justify-center border border-black bg-black text-white text-[10px] tracking-widest font-black">
                          STANDARD
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pant Selection */}
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                      PANT SIZE : <span className="text-foreground">{selectedBottomSize}</span>
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {bottomSizes.length > 0 ? bottomSizes.map((size) => (
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
                      )) : (
                        <button className="flex h-10 w-full items-center justify-center border border-black bg-black text-white text-[10px] tracking-widest font-black">
                          STANDARD
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color/Variation Selection for Combos */}
                  {availableColorsForSelection.length > 0 && (
                    <div className="space-y-4 pt-8 border-t border-black/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                        FABRIC SELECTION : <span className="text-foreground">{selectedColor}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableColorsForSelection.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                              "flex h-10 px-6 items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                              selectedColor === color
                                ? "border-black bg-black text-white shadow-lg"
                                : "border-zinc-200 hover:border-black text-zinc-600"
                            )}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fabric Selection for Combos */}
                  {availableFabricsForSelection.length > 0 && (
                    <div className="space-y-4 pt-8 border-t border-black/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                        FINISH SELECTION : <span className="text-foreground">{selectedFabric}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableFabricsForSelection.map((fabric) => (
                          <button
                            key={fabric}
                            onClick={() => setSelectedFabric(fabric)}
                            className={cn(
                              "flex h-10 px-6 items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                              selectedFabric === fabric
                                ? "border-black bg-black text-white shadow-lg"
                                : "border-zinc-200 hover:border-black text-zinc-600"
                            )}
                          >
                            {fabric}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Size Selection for Individual Products */}
                  {uniqueSizes.length > 0 && !(uniqueSizes.length === 1 && uniqueSizes[0] === "Standard") && (
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                        SIZE : <span className="text-foreground tracking-widest">{selectedSize || "Standard"}</span>
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {uniqueSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "flex h-12 items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-500",
                              selectedSize === size
                                ? "border-black bg-black text-white shadow-lg"
                                : "border-border hover:border-foreground/40 text-zinc-600"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection for Individual Products */}
                  {availableColorsForSelection.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                        COLOR / FABRIC : <span className="text-foreground tracking-widest">{selectedColor}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableColorsForSelection.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                              "flex h-10 px-6 items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                              selectedColor === color
                                ? "border-black bg-black text-white shadow-lg"
                                : "border-border hover:border-black text-zinc-600"
                            )}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fabric Selection for Individual Products */}
                  {availableFabricsForSelection.length > 0 && (
                    <div className="space-y-4 pt-8 border-t border-black/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                        FABRIC TYPE : <span className="text-foreground tracking-widest">{selectedFabric}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableFabricsForSelection.map((fabric) => (
                          <button
                            key={fabric}
                            onClick={() => setSelectedFabric(fabric)}
                            className={cn(
                              "flex h-10 px-6 items-center justify-center border text-[10px] tracking-widest font-black transition-all duration-300",
                              selectedFabric === fabric
                                ? "border-black bg-black text-white shadow-lg"
                                : "border-border hover:border-black text-zinc-600"
                            )}
                          >
                            {fabric}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Experience Services */}
            <div className="space-y-8">

              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  className="w-full h-16 rounded-none bg-accent-yellow text-black hover:bg-accent-yellow/90 uppercase tracking-[0.5em] text-xs font-black shadow-lg"
                  onClick={handleAddToCart}
                  disabled={selectedVariant?.is_out_of_stock}
                >
                  {selectedVariant?.is_out_of_stock ? "Out of Stock" : "Add to Cart"}
                </Button>
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
