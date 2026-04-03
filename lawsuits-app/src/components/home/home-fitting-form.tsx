"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ArrowRight, Plus, Minus, Trash2 } from "lucide-react";
import { Product } from "@/types";

const timeSlots = [
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM",
  "3:00 PM - 6:00 PM",
];

export function HomeFittingForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date: "",
    timeSlot: "",
    requestedProducts: [
      { productId: "", size: "" },
      { productId: "", size: "" },
      { productId: "", size: "" },
      { productId: "", size: "" },
      { productId: "", size: "" },
      { productId: "", size: "" },
    ],
  });
  
  // Import mockProducts for fallback
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?limit=100");
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data.products || []);
        } else {
          // Fallback to mock data if API fails
          import("@/lib/data").then(module => {
            setAllProducts(module.products);
          });
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // Fallback to mock data on error
        import("@/lib/data").then(module => {
          setAllProducts(module.products);
        });
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (index: number, field: "productId" | "size", value: string) => {
    const updatedProducts = [...formData.requestedProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setFormData({ ...formData, requestedProducts: updatedProducts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Filter out empty product selections
    const filledProducts = formData.requestedProducts.filter(p => p.productId);
    if (filledProducts.length === 0) {
      setError("Please select at least one product.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/fitting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          category: filledProducts.map(p => {
             const prod = allProducts.find(ap => ap.id === p.productId);
             return `${prod?.name} (Size: ${p.size || "N/A"})`;
          }).join(", "),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to send request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="home-fitting" className="bg-background py-32">
      <div className="mx-auto max-w-screen-2xl px-12 lg:px-32">
        <div className="grid grid-cols-1 gap-20 xl:grid-cols-5">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="xl:col-span-2 flex flex-col justify-center"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow">Premium Experience</span>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              In-home trial <br /> <span className="italic">within tri-city</span>
            </h2>
            <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-muted-foreground/80">
              Select up to 6 products and our Master Tailor will bring them to your doorstep for a professional fitting session.
            </p>
            
            <div className="mt-12 space-y-6">
              {[
                "Personalized try-on session at home",
                "Wide selection of legal attire",
                "On-the-spot adjustments and advice",
                "No obligation to purchase",
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-4 text-sm tracking-tight text-foreground/80"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-accent-yellow/30 text-accent-yellow">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="xl:col-span-3 relative overflow-hidden bg-[#EAE0D5]/20 p-8 md:p-12 backdrop-blur-sm border border-black/5 rounded-2xl"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full min-h-[500px] flex-col items-center justify-center text-center"
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-yellow/10 text-accent-yellow">
                    <Check className="h-10 w-10" />
                  </div>
                  <h3 className="font-serif text-3xl font-light italic">Request Secured</h3>
                  <p className="mt-4 text-muted-foreground max-w-xs">
                    Our concierge will reach out via phone to finalize your trial schedule within 24 hours.
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-12 uppercase tracking-[0.3em] text-[10px] font-bold"
                    onClick={() => setSubmitted(false)}
                  >
                    Modify or submit new request
                  </Button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit} 
                  className="space-y-16"
                >
                  {/* Step 1: Product Selection */}
                  <div className="space-y-10">
                    <div className="flex items-center justify-between border-b border-black/5 pb-4">
                      <h3 className="font-serif text-2xl tracking-tight text-black italic">1. Select Products</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      {formData.requestedProducts.map((p, idx) => (
                        <div key={idx} className="space-y-4">
                          <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Product {idx + 1}</Label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Select
                                value={p.productId}
                                onValueChange={(v) => handleProductChange(idx, "productId", v || "")}
                              >
                                <SelectTrigger className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus:ring-0 rounded-none h-10 font-medium">
                                  <SelectValue placeholder="SELECT ITEM">
                                    {p.productId 
                                      ? allProducts.find((prod) => prod.id === p.productId)?.name 
                                      : "SELECT ITEM"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  {allProducts.map((prod) => (
                                    <SelectItem key={prod.id} value={prod.id} className="text-xs">
                                      {prod.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-24">
                              <Input
                                placeholder="SIZE"
                                value={p.size}
                                onChange={(e) => handleProductChange(idx, "size", e.target.value)}
                                className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 rounded-none h-10 font-bold uppercase placeholder:font-normal"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Location & Scheduling */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-10">
                      <h3 className="font-serif text-2xl tracking-tight text-black italic border-b border-black/5 pb-4">2. Logistics</h3>
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Location <span className="text-zinc-400 capitalize">(Optional)</span></Label>
                          <Input
                            className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 rounded-none"
                            placeholder="Home, Office or Chambers"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Trial Date</Label>
                              <Input
                                required
                                type="date"
                                className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 rounded-none h-10"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Window</Label>
                              <Select
                                required
                                value={formData.timeSlot}
                                onValueChange={(v) => setFormData({ ...formData, timeSlot: v || "" })}
                              >
                                <SelectTrigger className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus:ring-0 rounded-none h-10">
                                  <SelectValue placeholder="TIME" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map((slot) => (
                                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-10">
                       <h3 className="font-serif text-2xl tracking-tight text-black italic border-b border-black/5 pb-4">3. Personal Details</h3>
                       <div className="space-y-8">
                          <div className="space-y-3">
                             <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Full Name</Label>
                             <Input
                               required
                               className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 rounded-none"
                               placeholder="Counsel Name"
                               value={formData.name}
                               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                             />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Contact Email</Label>
                             <Input
                               required
                               type="email"
                               className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 rounded-none"
                               placeholder="counsel@chambers.com"
                               value={formData.email}
                               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                             />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Phone Number</Label>
                             <Input
                               required
                               type="tel"
                               className="border-0 border-b border-black/10 bg-transparent px-0 text-sm focus-visible:ring-0 rounded-none"
                               placeholder="+91 XXXXX XXXXX"
                               value={formData.phone}
                               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                             />
                          </div>
                       </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-destructive/5 text-[10px] uppercase tracking-widest text-destructive text-center font-bold">{error}</div>
                  )}

                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex h-16 w-full items-center justify-center bg-black text-[11px] font-bold uppercase tracking-[0.5em] text-white transition-all hover:bg-black/90 disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center gap-6">
                        {loading ? "PROCESSING REQUEST..." : "REQUEST TRIAL SESSION"}
                        {!loading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-3" />}
                      </span>
                    </button>
                    <p className="mt-4 text-[9px] text-center uppercase tracking-widest text-zinc-400 font-medium">Valid for tri-city area only (Chandigarh, Mohali, Panchkula)</p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
