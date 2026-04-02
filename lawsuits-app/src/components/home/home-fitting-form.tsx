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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: "",
    date: "",
    timeSlot: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      console.log("Booking submitted:", formData);
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
            className="relative overflow-hidden bg-white/50 p-10 backdrop-blur-sm border border-border/50"
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Step {step} of 4</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-[2px] w-8 transition-all duration-500 ${
                      s <= step ? "bg-accent-yellow" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="space-y-8"
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <h3 className="font-serif text-2xl tracking-tight text-foreground">What style defines you?</h3>
                      <div className="space-y-4 text-left">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Select Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(v) => setFormData({ ...formData, category: v ?? "" })}
                        >
                          <SelectTrigger className="border-0 border-b border-border bg-transparent px-0 text-lg focus:ring-0">
                            <SelectValue placeholder="Choose your preference" />
                          </SelectTrigger>
                          <SelectContent>
                            {suitCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <h3 className="font-serif text-2xl tracking-tight text-foreground">Where shall we meet?</h3>
                      <div className="space-y-4 text-left">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Fitting Address</Label>
                        <Input
                          className="border-0 border-b border-border bg-transparent px-0 text-lg focus-visible:ring-0"
                          placeholder="Your chambers or residence"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <h3 className="font-serif text-2xl tracking-tight text-foreground">Choose a moment</h3>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="space-y-4 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Date</Label>
                          <Input
                            type="date"
                            className="border-0 border-b border-border bg-transparent px-0 text-lg focus-visible:ring-0"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-4 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Time Slot</Label>
                          <Select
                            value={formData.timeSlot}
                            onValueChange={(v) => setFormData({ ...formData, timeSlot: v ?? "" })}
                          >
                            <SelectTrigger className="border-0 border-b border-border bg-transparent px-0 text-lg focus:ring-0">
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
                  )}

                  {step === 4 && (
                    <div className="space-y-8">
                      <h3 className="font-serif text-2xl tracking-tight text-foreground">Final Details</h3>
                      <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-1 text-left">
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</Label>
                          <Input
                            className="border-0 border-b border-border bg-transparent px-0 text-lg focus-visible:ring-0"
                            placeholder="John Doe, Esq."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                          <div className="space-y-1 text-left">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</Label>
                            <Input
                              type="email"
                              className="border-0 border-b border-border bg-transparent px-0 text-lg focus-visible:ring-0"
                              placeholder="counsel@chambers.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone</Label>
                            <Input
                              type="tel"
                              className="border-0 border-b border-border bg-transparent px-0 text-lg focus-visible:ring-0"
                              placeholder="+91 00000 00000"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-12 flex gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex h-14 w-14 items-center justify-center border border-border transition-colors hover:bg-black/5"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="group relative flex h-14 flex-1 items-center justify-center bg-black text-[10px] font-medium uppercase tracking-[0.4em] text-white transition-all hover:bg-black/90"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {step === 4 ? "Complete Invitation" : "Next Movement"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
