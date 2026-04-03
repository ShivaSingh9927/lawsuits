"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import { 
  Upload, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  Loader2, 
  Search,
  ArrowLeft,
  Star
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
}

interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
  is_primary: boolean;
  alt: string;
}

export default function AdminImagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, base_price")
      .is("deleted_at", null)
      .order("name");
    
    if (data) setProducts(data);
    setLoading(false);
  };

  const fetchProductImages = async (productId: string) => {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("position");
    
    if (data) setProductImages(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchProductImages(selectedProductId);
    } else {
      setProductImages([]);
    }
  }, [selectedProductId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedProductId) return;

    setUploading(true);
    const product = products.find(p => p.id === selectedProductId);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedProductId}/${Date.now()}-${i}.${fileExt}`;
      const filePath = `products/${fileName}`;

      try {
        // 1. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // 3. Save to Database
        const { error: dbError } = await supabase
          .from("product_images")
          .insert({
            product_id: selectedProductId,
            url: publicUrl,
            alt: product?.name || "Product Image",
            position: productImages.length + i,
            is_primary: productImages.length === 0 && i === 0,
          });

        if (dbError) throw dbError;

      } catch (error: any) {
        alert(`Error uploading ${file.name}: ${error.message}`);
      }
    }

    await fetchProductImages(selectedProductId);
    setUploading(false);
  };

  const setPrimaryImage = async (imageId: string) => {
    if (!selectedProductId) return;

    // Reset all images to not primary
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", selectedProductId);

    // Set selected image to primary
    await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    await fetchProductImages(selectedProductId);
  };

  const deleteImage = async (image: ProductImage) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // 1. Delete from Database
      const { error: dbError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", image.id);

      if (dbError) throw dbError;

      // 2. Try to extract filepath and delete from Storage
      // (This is approximate depending on your URL structure)
      const urlParts = image.url.split("/product-images/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("product-images").remove([filePath]);
      }

      await fetchProductImages(selectedProductId!);
    } catch (error: any) {
      alert(`Error deleting image: ${error.message}`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-accent-yellow/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link href="/admin" className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="font-serif text-4xl font-bold tracking-tight">Atelier Asset Manager</h1>
            <p className="mt-2 text-muted-foreground italic">Manage professional photography for judicial ensembles</p>
          </div>
          <div className="hidden md:block">
            <div className="rounded-full bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C5A059]">Asset Mode</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Product Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 shadow-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border-white/10 pl-10 focus-visible:ring-accent-yellow/50"
                />
              </div>

              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-accent-yellow" />
                    <p className="text-sm text-muted-foreground">Scoping collection...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground italic">No products matched</p>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full group rounded-xl p-4 text-left transition-all duration-300 border ${
                        selectedProductId === product.id 
                          ? "bg-accent-yellow text-black border-accent-yellow shadow-[0_0_20px_rgba(197,160,89,0.3)]" 
                          : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <p className="font-medium truncate">{product.name}</p>
                      <p className={`text-xs mt-1 ${selectedProductId === product.id ? "text-black/60" : "text-muted-foreground"}`}>
                        SKU: {product.slug.toUpperCase().slice(0, 8)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Asset Workshop Area */}
          <div className="lg:col-span-2">
            {!selectedProductId ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-center">
                <div className="rounded-full bg-white/5 p-6 mb-4">
                  <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-serif text-muted-foreground">Select an ensemble to manage its visuals</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">Click a product from the sidebar to begin uploading professional photography</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Active Product Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-accent-yellow/20 to-transparent p-8 border border-accent-yellow/10">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <Badge className="bg-accent-yellow text-black hover:bg-accent-yellow mb-4">Active Asset Editor</Badge>
                      <h2 className="font-serif text-3xl font-bold">
                        {products.find(p => p.id === selectedProductId)?.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Base Price</p>
                        <p className="text-lg font-bold">₹{products.find(p => p.id === selectedProductId)?.base_price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Action Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl">
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-lg font-serif">Image Gallery</h3>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        id="master-upload"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button 
                        asChild
                        disabled={uploading}
                        className="bg-white text-black hover:bg-accent-yellow hover:text-black transition-all duration-500"
                      >
                        <label htmlFor="master-upload" className="cursor-pointer flex items-center gap-2">
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {uploading ? "Ingesting..." : "Upload New Assets"}
                        </label>
                      </Button>
                    </div>
                  </div>

                  {/* Visual Grid */}
                  <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                    <AnimatePresence>
                      {productImages.map((img, index) => (
                        <motion.div 
                          key={img.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`group relative aspect-[3/4] overflow-hidden rounded-xl border transition-all duration-500 ${
                            img.is_primary 
                              ? "border-accent-yellow ring-4 ring-accent-yellow/20" 
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Image 
                            src={img.url} 
                            alt={img.alt} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col items-center justify-center gap-3">
                            {!img.is_primary && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setPrimaryImage(img.id)}
                                className="bg-accent-yellow/10 border-accent-yellow/50 text-accent-yellow hover:bg-accent-yellow hover:text-black"
                              >
                                Set as Primary
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              disabled={img.is_primary}
                              onClick={() => deleteImage(img)}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>

                          {/* Status Badges */}
                          <div className="absolute left-3 top-3 flex flex-col gap-2">
                            {img.is_primary && (
                              <Badge className="bg-accent-yellow text-black font-bold flex items-center gap-1 shadow-lg">
                                <Star className="h-3 w-3 fill-black" /> PRIMARY
                              </Badge>
                            )}
                            <Badge className="bg-black/60 backdrop-blur-md text-white border-white/20">
                              Angle {index + 1}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {productImages.length === 0 && !uploading && (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="h-16 w-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                         <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground italic">No visuals found for this ensemble</p>
                      <label htmlFor="master-upload" className="mt-4 text-accent-yellow cursor-pointer text-sm underline-offset-4 hover:underline">
                        Upload the first asset
                      </label>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(197, 160, 89, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(197, 160, 89, 0.5);
        }
      `}</style>
    </div>
  );
}
