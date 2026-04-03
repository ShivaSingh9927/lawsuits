import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import { ComboSection } from "@/components/home/combo-section";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";


async function getCombos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .is("deleted_at", null)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) return [];

  // Filter for combos: Category name or slug containing 'package' or name including 'piece'
  return (data || []).filter((p: any) => 
    p.category?.name === "Package Deals" || 
    p.category?.slug === "package-deals" ||
    p.name.toLowerCase().includes("piece")
  );
}

export default async function CombosPage() {
  const combos = await getCombos();

  return (
    <main className="pt-20 bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[url('/advocate_dress_coat.webp')] bg-cover bg-center opacity-30 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        
        <div className="relative z-10 text-center space-y-8 px-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="h-[1px] w-12 bg-accent-yellow/40" />
            <span className="text-xs uppercase tracking-[0.6em] text-accent-yellow font-black">Curated Legal Ensembles</span>
            <span className="h-[1px] w-12 bg-accent-yellow/40" />
          </div>
          <h1 className="font-serif text-6xl sm:text-8xl text-white font-light tracking-tight leading-none">
            Combo <span className="italic text-accent-yellow/90">Packages</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto uppercase tracking-widest leading-loose font-medium">
            Meticulously coordinated multi-piece sets for the distinguished legal professional.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
            {combos.map((product) => {
              const lowestPrice = product.variants?.reduce(
                (min: number, v: any) => (v.price < min ? v.price : min),
                Infinity
              ) || product.base_price;

              const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col items-center text-center space-y-10 p-10 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden shadow-2xl">
                    <Image 
                      src={primaryImage?.url || "/placeholder-suit.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover scale-110 transition-transform duration-1000 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl text-white font-light tracking-tight group-hover:text-accent-yellow transition-colors min-h-[4rem] flex items-center justify-center">
                      {product.name}
                    </h3>
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-black">Executive Ensemble</p>
                       <span className="font-serif text-2xl text-white font-light">
                          ₹{lowestPrice.toLocaleString()}
                       </span>
                    </div>
                  </div>

                  <Link 
                    href={`/product/${product.slug}`}
                    className="w-full py-5 border border-white/20 text-[10px] uppercase tracking-[0.5em] text-white font-black hover:bg-white hover:text-black transition-all duration-500"
                  >
                    Configure Suit
                  </Link>
                  
                  <div className="absolute -bottom-1 left-0 h-[3px] w-0 bg-accent-yellow transition-all duration-1000 group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Atelier Banner */}
      <section className="py-32 border-t border-white/10">
         <div className="mx-auto max-w-screen-xl px-6 text-center space-y-12">
            <h2 className="font-serif text-4xl text-white font-light italic">The Atelier Difference</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-[0.4em] max-w-3xl mx-auto leading-loose font-bold">
               Every combo package represents a curated selection by our master tailors. 
               We ensure that fabrics, textures, and silhouettes are perfectly harmonized for a 
               commanding presence in high-stakes environments.
            </p>
            <div className="flex justify-center gap-8 pt-8">
               <Link href="/about" className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow font-black border-b border-accent-yellow/40 pb-2">Our Heritage</Link>
               <Link href="/contact" className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow font-black border-b border-accent-yellow/40 pb-2">Bespoke Inquiry</Link>
            </div>
         </div>
      </section>
    </main>
  );
}
