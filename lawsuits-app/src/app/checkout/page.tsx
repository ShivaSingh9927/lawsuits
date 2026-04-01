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
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, CreditCard, Smartphone, Building2, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store";

const timeSlots = [
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM",
  "3:00 PM - 6:00 PM",
];

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 5000 ? 0 : 299;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const [step, setStep] = useState(1);
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

  const handleApplyCoupon = () => {
    if (formData.couponCode.toUpperCase() === "LAWYER10") {
      setFormData({ ...formData, discount: Math.round(subtotal * 0.1) });
    }
  };

  const handlePayment = () => {
    // Razorpay integration
    console.log("Processing payment:", { total, items, formData });
    alert("Payment integration ready! Connect Razorpay keys in .env.local");
    clearCart();
  };

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
          <Link href="/cart">
            <ChevronLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-serif text-2xl font-bold">Checkout</h1>

          <div className="mt-6 space-y-8">
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                1. Contact & Shipping
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
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
                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  <Input
                    placeholder="Flat/House No., Building, Street"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input
                    placeholder="400001"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                2. Home Fitting Appointment
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

            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">
                3. Payment
              </h2>
              <Tabs defaultValue="card">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="card">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Card
                  </TabsTrigger>
                  <TabsTrigger value="upi">
                    <Smartphone className="mr-2 h-4 w-4" />
                    UPI
                  </TabsTrigger>
                  <TabsTrigger value="netbanking">
                    <Building2 className="mr-2 h-4 w-4" />
                    Netbanking
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="mt-4 space-y-4">
                  <div>
                    <Label>Card Number</Label>
                    <Input placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry</Label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="upi" className="mt-4">
                  <div>
                    <Label>UPI ID</Label>
                    <Input placeholder="yourname@upi" />
                  </div>
                </TabsContent>
                <TabsContent value="netbanking" className="mt-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hdfc">HDFC Bank</SelectItem>
                      <SelectItem value="icici">ICICI Bank</SelectItem>
                      <SelectItem value="sbi">State Bank of India</SelectItem>
                      <SelectItem value="axis">Axis Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Secured by Razorpay. Your payment info is encrypted.
              </div>
            </div>
          </div>
        </div>

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
              onClick={handlePayment}
            >
              Pay ₹{(total - formData.discount).toLocaleString()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
