"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, CreditCard, Smartphone, Building2, ShieldCheck, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store";
import { supabase } from "@/lib/supabase/client";

const timeSlots = [
  "9am-12pm",
  "12pm-3pm",
  "3pm-6pm",
];

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 5000 ? 0 : 299;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    appointmentDate: "",
    timeSlot: "",
    couponCode: "",
    discount: 0,
  });

  const handleApplyCoupon = async () => {
    if (!formData.couponCode) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setFormData({ ...formData, discount: data.coupon.discount });
      } else {
        alert(data.message);
      }
    } catch {
      alert("Failed to validate coupon");
    }
  };

  const handleTestPayment = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      // Prepare order items
      const orderItems = items.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      }));

      // Create order via API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          shipping: {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
          },
          coupon_code: formData.couponCode || null,
          appointment_date: formData.appointmentDate || null,
          time_slot: formData.timeSlot || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Simulate successful payment
      await supabase
        .from("orders")
        .update({
          payment_status: "captured",
          status: "confirmed",
          payment_method: "test_mode",
          razorpay_payment_id: "test_" + Date.now(),
        })
        .eq("id", data.order.id);

      setOrderNumber(data.order.order_number);
      setOrderComplete(true);
      clearCart();
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  if (orderComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        </motion.div>
        <h1 className="mt-6 font-serif text-3xl font-bold">Order Confirmed!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Order number: <span className="font-semibold text-foreground">{orderNumber}</span>
        </p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Thank you for your order. Our team will contact you shortly to confirm
          your home fitting appointment.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/account">View Orders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="font-serif text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Add items to proceed to checkout
        </p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shop">
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>

      {/* Test Mode Banner */}
      <div className="mb-6 rounded-lg border border-accent-yellow/50 bg-accent-yellow/10 p-4">
        <p className="text-sm font-medium">
          🧪 <strong>Test Mode</strong> - No real payment will be processed. Click "Place Order (Test)" to complete checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-serif text-2xl font-bold">Checkout</h1>

          <div className="mt-6 space-y-8">
            {/* Contact & Shipping */}
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                1. Contact & Shipping
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address *</Label>
                  <Input
                    placeholder="Flat/House No., Building, Street"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Postal Code *</Label>
                  <Input
                    placeholder="400001"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appointment */}
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                2. Home Fitting Appointment (Optional)
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Preferred Date</Label>
                  <Input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appointmentDate: e.target.value })
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
                      <SelectValue placeholder="Select time slot" />
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
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Our master tailor will visit your address for final measurements
                and fitting adjustments.
              </p>
            </div>

            {/* Payment (Test Mode) */}
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                3. Payment
              </h2>
              <div className="rounded-lg bg-muted p-4 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Test Mode Active</p>
                <p className="text-xs text-muted-foreground">
                  No real payment will be processed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border p-6">
            <h2 className="font-serif text-lg font-semibold">Order Summary</h2>

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div key={item.variant_id} className="flex gap-3">
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.product.images?.[0]?.url || "/placeholder-suit.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {item.variant.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    ₹{(item.variant.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={formData.couponCode}
                onChange={(e) =>
                  setFormData({ ...formData, couponCode: e.target.value })
                }
              />
              <Button variant="outline" onClick={handleApplyCoupon}>
                Apply
              </Button>
            </div>
            {formData.discount > 0 && (
              <p className="mt-2 text-sm text-green-600">
                Coupon applied! -₹{formData.discount.toLocaleString()}
              </p>
            )}

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {formData.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{formData.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="font-serif text-xl">
                ₹{(total - formData.discount).toLocaleString()}
              </span>
            </div>

            <Button
              className="mt-6 w-full bg-accent-yellow text-black hover:bg-accent-yellow/90"
              size="lg"
              onClick={handleTestPayment}
              disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.postalCode}
            >
              {loading ? "Processing..." : "Place Order (Test)"}
            </Button>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Test mode - No real payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
