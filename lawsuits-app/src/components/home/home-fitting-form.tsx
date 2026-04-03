"use client";
import React, { useState } from "react";
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
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const suitCategories = [
  "Three-Piece Suit",
  "Two-Piece Suit",
  "Tuxedo",
  "Corporate Daily",
  "Wedding Suit",
];

const timeSlots = [
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM",
  "3:00 PM - 6:00 PM",
];

export function HomeFittingForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    date: "",
    timeSlot: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/fitting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col justify-center"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-accent-yellow">Personal Appointment</span>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              The <span className="italic">At-Home</span> <br /> Atelier
            </h2>
            <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-muted-foreground/80">
              Our Master Tailor brings the showroom to your chambers. Experience
              premium bespoke tailoring without leaving your professional sanctuary.
            </p>
            
            <div className="mt-12 space-y-6">
              {[
                "Expert measurement at your doorstep",
                "Touch & feel premium fabrics",
                "Legacy of master craftsmanship",
                "Complimentary style consultation",
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
            className="relative overflow-hidden bg-[#EAE0D5]/20 p-10 backdrop-blur-sm border border-black/5"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full min-h-[400px] flex-col items-center justify-center text-center"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-yellow/10 text-accent-yellow">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-3xl font-light">Invitation Received</h3>
                  <p className="mt-4 text-muted-foreground">
                    Our customer care team will coordinate with you shortly to finalize your fitting appointment.
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-8 uppercase tracking-widest text-[10px]"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another request
                  </Button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit} 
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Style Selection */}
                    <div className="space-y-6">
                      <h3 className="font-serif text-xl tracking-tight text-black">1. Style Selection</h3>
                      <div className="space-y-4 text-left">
                        <Label className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Category</Label>
                        <Select
                          required
                          value={formData.category}
                          onValueChange={(v) => setFormData({ ...formData, category: v ?? "" })}
                        >
                          <SelectTrigger className="border-0 border-b border-black/10 bg-transparent px-0 text-base focus:ring-0">
                            <SelectValue placeholder="Choose preference" />
                          </SelectTrigger>
                          <SelectContent>
                            {suitCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-6">
                      <h3 className="font-serif text-xl tracking-tight text-black">2. Location</h3>
                      <div className="space-y-4 text-left">
                        <Label className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Fitting Address</Label>
                        <Input
                          required
                          className="border-0 border-b border-black/10 bg-transparent px-0 text-base focus-visible:ring-0"
                          placeholder="Chambers or residence"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div className="space-y-6 lg:col-span-2">
                      <h3 className="font-serif text-xl tracking-tight text-black">3. Scheduling</h3>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="space-y-4 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Date</Label>
                          <Input
                            required
                            type="date"
                            className="border-0 border-b border-black/10 bg-transparent px-0 text-base focus-visible:ring-0"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-4 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Time Slot</Label>
                          <Select
                            required
                            value={formData.timeSlot}
                            onValueChange={(v) => setFormData({ ...formData, timeSlot: v ?? "" })}
                          >
                            <SelectTrigger className="border-0 border-b border-black/10 bg-transparent px-0 text-base focus:ring-0">
                              <SelectValue placeholder="Select time" />
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

                    {/* Personal Details */}
                    <div className="space-y-6 lg:col-span-2">
                      <h3 className="font-serif text-xl tracking-tight text-black">4. Personal Details</h3>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        <div className="space-y-1 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Full Name</Label>
                          <Input
                            required
                            className="border-0 border-b border-black/10 bg-transparent px-0 text-base focus-visible:ring-0"
                            placeholder="Name, Esq."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Email</Label>
                          <Input
                            required
                            type="email"
                            className="border-0 border-b border-black/10 bg-transparent px-0 text-base focus-visible:ring-0"
                            placeholder="counsel@chambers.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Phone</Label>
                          <Input
                            required
                            type="tel"
                            className="border-0 border-b border-black/10 bg-transparent px-0 text-base focus-visible:ring-0"
                            placeholder="+91 00000 00000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-destructive mt-4">{error}</div>
                  )}

                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex h-14 w-full items-center justify-center bg-black text-[10px] font-medium uppercase tracking-[0.4em] text-white transition-all hover:bg-black/90 disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center gap-4">
                        {loading ? "Sending Invitation..." : "Send Invitation"}
                        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />}
                      </span>
                    </button>
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
