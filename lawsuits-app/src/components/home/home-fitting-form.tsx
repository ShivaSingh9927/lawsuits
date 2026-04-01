"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
import { MapPin, Calendar, Clock, Check } from "lucide-react";

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
      // Handle payment/booking
      console.log("Booking submitted:", formData);
    }
  };

  return (
    <section
      id="home-fitting"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            The At-Home Atelier
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our Master Tailor brings the showroom to your chambers. Experience
            premium bespoke tailoring without leaving your home.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Expert measurement at your doorstep",
              "Touch & feel premium fabrics",
              "30+ years of tailoring experience",
              "Free fitting consultation included",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-yellow/20">
                  <Check className="h-4 w-4 text-accent-yellow" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-border bg-card p-8 shadow-lg"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold">
              Book Home Measurement
            </h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    s <= step ? "bg-accent-yellow" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label>Select Your Interest</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v: string | null) =>
                      setFormData({ ...formData, category: v ?? "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose suit category" />
                    </SelectTrigger>
                    <SelectContent>
                      {suitCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label>Fitting Address</Label>
                  <Input
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label>Preferred Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Time Slot</Label>
                  <Select
                    value={formData.timeSlot}
                    onValueChange={(v: string | null) =>
                      setFormData({ ...formData, timeSlot: v ?? "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label>Your Name</Label>
                  <Input
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-accent-yellow text-black hover:bg-accent-yellow/90"
              >
                {step === 4 ? "Pay & Book" : "Next"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
