"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ShieldCheck, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store";
import { supabase } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const timeSlots = ["9am-12pm", "12pm-3pm", "3pm-6pm"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 5000 ? 0 : 299;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  const createOrderAndPay = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?returnTo=/checkout");
        setLoading(false);
        return;
      }

      // Prepare order items
      const orderItems = items.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      }));

      // Create order in database
      const orderRes = await fetch("/api/orders", {
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

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // Create Razorpay order
      const razorpayRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderData.order.id }),
      });

      const razorpayData = await razorpayRes.json();
      if (!razorpayRes.ok) throw new Error(razorpayData.error);

      // Open Razorpay
      const options: RazorpayOptions = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency || "INR",
        name: "Suits",
        description: `Order ${orderData.order.order_number}`,
        order_id: razorpayData.orderId,
        handler: async function (response: RazorpayResponse) {
          // Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.order.id,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrderNumber(orderData.order.order_number);
            setOrderComplete(true);
            clearCart();
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#eab308",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
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
        <p className="mt-2 text-muted-foreground">Add items to proceed to checkout</p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    );
  }

  const isPincodeValid = /^\d{6}$/.test(formData.postalCode);

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.phone &&
    formData.address &&
    formData.city &&
    formData.state &&
    isPincodeValid;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shop">
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-serif text-2xl font-bold">Checkout</h1>

          <div className="mt-6 space-y-8">
            {/* Contact & Shipping */}
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">1. Contact & Shipping</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>First Name *</Label>
                  <Input placeholder="John" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input placeholder="Doe" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address *</Label>
                  <Input placeholder="Flat/House No., Building, Street" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input placeholder="Mumbai" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input placeholder="Maharashtra" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required />
                </div>
                <div>
                  <Label>Postal Code *</Label>
                  <Input placeholder="400001" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} required />
                </div>
              </div>
            </div>

            {/* Appointment */}
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">2. Home Fitting Appointment (Optional)</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Preferred Date</Label>
                  <Input type="date" value={formData.appointmentDate} onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })} />
                </div>
                <div>
                  <Label>Time Slot</Label>
                  <Select value={formData.timeSlot} onValueChange={(v: string | null) => setFormData({ ...formData, timeSlot: v ?? "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Our master tailor will visit your address for final measurements and fitting adjustments.
              </p>
            </div>

            {/* Payment */}
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">3. Payment</h2>
              <p className="text-sm text-muted-foreground">
                Secure payment powered by Razorpay. You&apos;ll be redirected to complete payment after clicking &quot;Pay Now&quot;.
              </p>
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
                    <Image src={item.product.images?.[0]?.url || "/placeholder-suit.jpg"} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Size: {item.variant.size} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{(item.variant.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Input placeholder="Coupon code" value={formData.couponCode} onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })} />
              <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
            </div>
            {formData.discount > 0 && (
              <p className="mt-2 text-sm text-green-600">Coupon applied! -₹{formData.discount.toLocaleString()}</p>
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
              <span className="font-serif text-xl">₹{(total - formData.discount).toLocaleString()}</span>
            </div>

            <Button
              className="mt-6 w-full bg-accent-yellow text-black hover:bg-accent-yellow/90"
              size="lg"
              onClick={createOrderAndPay}
              disabled={loading || !isFormValid}
            >
              {loading ? "Processing..." : `Pay ₹${(total - formData.discount).toLocaleString()}`}
            </Button>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Secured by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
