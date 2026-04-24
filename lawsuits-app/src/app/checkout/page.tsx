"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ShieldCheck, CheckCircle, Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store";
import { supabase } from "@/lib/supabase/client";
import { computeOrderTotals, AppliedCoupon } from "@/lib/pricing";

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
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}



type AuthMode = "guest" | "signup" | "login" | "authenticated";

function CheckoutContent() {
  const router = useRouter();
  const { items, clearCart, updateQuantity, removeItem } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("guest");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);
  const [existence, setExistence] = useState<{ emailTaken: boolean; phoneTaken: boolean }>({
    emailTaken: false,
    phoneTaken: false,
  });
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
    couponCode: "",
  });
  // Full coupon metadata returned by /api/coupons/validate. We keep the
  // type+value (not just the computed discount) so that totals recompute
  // correctly when the cart changes after applying a percentage coupon.
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [previousAddresses, setPreviousAddresses] = useState<any[]>([]);

  // Soft auth detection: prefill if logged-in, otherwise default to guest.
  // Never redirects; guests can finish checkout without an account.
  const loadSignedInUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let targetUser = session?.user || null;
      if (!targetUser) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUser = user;
      }
      if (!targetUser) {
        setAuthMode("guest");
        setAuthLoading(false);
        return;
      }

      const user = targetUser;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      const [fName, ...lNames] = fullName.split(" ");
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: fName || prev.firstName,
        lastName: lNames.join(" ") || prev.lastName,
        phone: user.user_metadata?.phone || prev.phone,
      }));
      setAuthMode("authenticated");
      setAuthLoading(false);

      // Previous addresses (auth only)
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        const uniqueAddresses: any[] = [];
        const seen = new Set();
        data.orders.forEach((order: any) => {
          const addrKey = `${order.shipping_address}-${order.shipping_postal_code}`;
          if (!seen.has(addrKey)) {
            seen.add(addrKey);
            uniqueAddresses.push({
              name: order.shipping_name,
              phone: order.shipping_phone,
              address: order.shipping_address,
              city: order.shipping_city,
              state: order.shipping_state,
              postalCode: order.shipping_postal_code,
            });
          }
        });
        setPreviousAddresses(uniqueAddresses.slice(0, 3));
      }
    } catch (err) {
      console.error("Auth check failed", err);
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadSignedInUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced existence check when signing up for the 5% reward.
  useEffect(() => {
    if (authMode !== "signup") {
      setExistence({ emailTaken: false, phoneTaken: false });
      return;
    }
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    if (!email && !phone) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-existence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone }),
        });
        const data = await res.json();
        setExistence({
          emailTaken: !!data.emailTaken,
          phoneTaken: !!data.phoneTaken,
        });
        if (data.emailTaken || data.phoneTaken) {
          setAuthMode("login");
          setAccountError(
            "This email or phone already has an account. Sign in to continue."
          );
        }
      } catch (err) {
        console.error("existence check failed", err);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [authMode, formData.email, formData.phone]);

  const eligibleForNewUserDiscount =
    authMode === "signup" && !existence.emailTaken && !existence.phoneTaken;

  // Coupon preview shown in the order summary when the user toggles to
  // "Create account & save 5%". Server is still authoritative at order time.
  const previewCoupon = useMemo<AppliedCoupon | null>(
    () => (eligibleForNewUserDiscount ? { type: "percentage", value: 5 } : null),
    [eligibleForNewUserDiscount]
  );

  const totals = useMemo(
    () =>
      computeOrderTotals(
        items.map((item) => ({
          name: item.product.name,
          unitPrice: item.variant.price,
          qty: item.quantity,
        })),
        appliedCoupon ?? previewCoupon
      ),
    [items, appliedCoupon, previewCoupon]
  );
  const { subtotal, discount, shipping, tax, total } = totals;

  const handleSelectPreviousAddress = (addr: any) => {
    const [fName, ...lNames] = (addr.name || "").split(" ");
    setFormData({
      ...formData,
      firstName: fName || "",
      lastName: lNames.join(" ") || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
    });
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
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
        setAppliedCoupon({ type: data.coupon.type, value: data.coupon.value });
      } else {
        setAppliedCoupon(null);
        alert(data.message);
      }
    } catch {
      alert("Failed to validate coupon");
    }
  };

  const createOrderAndPay = async () => {
    setLoading(true);
    setAccountError(null);
    try {
      // Branch on authMode: may need to sign the user up or in first.
      let { data: { user } } = await supabase.auth.getUser();
      let newUserSignup = false;

      if (!user && authMode === "signup") {
        if (!accountPassword || accountPassword.length < 6) {
          setAccountError("Please enter a password with at least 6 characters.");
          setLoading(false);
          return;
        }
        // 1. Create user via admin route (confirmed, no email round-trip)
        const signupRes = await fetch("/api/auth/signup-at-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: accountPassword,
            fullName: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone.trim(),
          }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          if (signupRes.status === 409) {
            setAuthMode("login");
            setExistence({
              emailTaken: !!signupData.emailTaken,
              phoneTaken: !!signupData.phoneTaken,
            });
            setAccountError(
              "An account with this email or phone already exists. Please sign in to continue."
            );
          } else {
            setAccountError(signupData.error || "Signup failed. Please try again.");
          }
          setLoading(false);
          return;
        }
        // 2. Sign in to establish session
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: accountPassword,
        });
        if (signInErr) {
          setAccountError(signInErr.message);
          setLoading(false);
          return;
        }
        const { data: refreshed } = await supabase.auth.getUser();
        user = refreshed.user;
        setAuthMode("authenticated");
        newUserSignup = true;
      } else if (!user && authMode === "login") {
        if (!accountPassword) {
          setAccountError("Please enter your password to sign in.");
          setLoading(false);
          return;
        }
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: accountPassword,
        });
        if (signInErr) {
          setAccountError("Invalid email or password.");
          setLoading(false);
          return;
        }
        const { data: refreshed } = await supabase.auth.getUser();
        user = refreshed.user;
        setAuthMode("authenticated");
      }

      const isGuestCheckout = !user && authMode === "guest";

      // Final validation before payment
      if (!/^\d{6}$/.test(formData.postalCode)) {
        alert("Please enter a valid 6-digit Indian pincode.");
        setLoading(false);
        return;
      }

      // Prepare order items
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        metadata: item.metadata,
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
          guest: isGuestCheckout,
          new_user_signup: newUserSignup,
          // What the customer saw on screen. The API will recompute from DB
          // and reject the request if these disagree, so the charged amount
          // is guaranteed to match the displayed amount.
          expected: { subtotal, discount, shipping, tax, total },
          appointment_date: null,
          time_slot: null,
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
        name: "THE DRESS OUTFITTERS",
        description: `Order ${orderData.order.order_number}`,
        order_id: razorpayData.orderId,
        handler: async function (response: RazorpayResponse) {
          try {
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
            if (verifyRes.ok) {
              clearCart();
              router.push(`/checkout/success?order_id=${orderData.order.order_number}`);
            } else {
              router.push(`/checkout/failed?reason=${encodeURIComponent(verifyData.error || "Verification failed")}`);
            }
          } catch (err) {
            console.error("Verification error:", err);
            router.push("/checkout/failed?reason=Verification terminal error");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
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


  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-yellow mb-4"></div>
        <p className="text-zinc-500 font-serif lowercase italic">verifying your counsel status...</p>
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
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
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
            {/* Account: guest / signup / login (hidden when already signed in) */}
            {authMode !== "authenticated" && (
              <div className="rounded-lg border border-border p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg font-semibold">Account</h2>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                  {([
                    { key: "guest", label: "Continue as Guest", sub: "No account needed" },
                    { key: "signup", label: "Create account · Save 5%", sub: "New-member reward" },
                    { key: "login", label: "Sign in", sub: "Existing customer" },
                  ] as { key: AuthMode; label: string; sub: string }[]).map((opt) => {
                    const active = authMode === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setAuthMode(opt.key);
                          setAccountError(null);
                          setAccountPassword("");
                        }}
                        className={`text-left p-3 rounded border transition-all focus:outline-none ${
                          active
                            ? "border-accent-yellow bg-accent-yellow/10"
                            : "border-border bg-white hover:border-accent-yellow/60"
                        }`}
                      >
                        <p className="text-xs font-bold uppercase tracking-wide">{opt.label}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{opt.sub}</p>
                      </button>
                    );
                  })}
                </div>

                {authMode === "signup" && (
                  <div className="space-y-3">
                    <div className="rounded border border-accent-yellow/40 bg-accent-yellow/5 p-3 text-[12px] text-zinc-700">
                      <span className="font-bold">Save 5% on this order</span> when you create an account as a
                      first-time customer. Offer is verified at checkout; if your email or phone already has an
                      account, we'll ask you to sign in instead (no reward).
                    </div>
                    <div>
                      <Label>Password (min 6 chars) *</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        minLength={6}
                        autoComplete="new-password"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      We'll use the name, email and phone from the shipping section below for your account.
                    </p>
                  </div>
                )}

                {authMode === "login" && (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-600">
                      Sign in to continue checkout. Your saved addresses will be available after sign-in.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          autoComplete="email"
                        />
                      </div>
                      <div>
                        <Label>Password *</Label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          autoComplete="current-password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {accountError && (
                  <p className="mt-3 text-xs text-red-600">{accountError}</p>
                )}
              </div>
            )}

            {/* Contact & Shipping */}
            <div className="rounded-lg border border-border p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-lg font-semibold">1. Contact & Shipping</h2>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Secure Delivery</span>
              </div>

              {previousAddresses.length > 0 && (
                <div className="mb-8 p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-accent-yellow font-bold mb-3">Saved Addresses</p>
                  <div className="flex flex-wrap gap-3">
                    {previousAddresses.map((addr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPreviousAddress(addr)}
                        className="text-left p-3 border border-border bg-white hover:border-accent-yellow hover:bg-accent-yellow/5 transition-all rounded text-xs max-w-[240px] group relative focus:outline-none"
                      >
                        <p className="font-bold text-black truncate">{addr.name}</p>
                        <p className="text-zinc-500 truncate mt-0.5">{addr.address}</p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle className="h-3 w-3 text-accent-yellow" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                  <Label>Postal Code (6 Digits) *</Label>
                  <Input
                    placeholder="400001"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                    className={formData.postalCode && !isPincodeValid ? "border-red-500" : ""}
                  />
                  {formData.postalCode && !isPincodeValid && (
                    <p className="mt-1 text-xs text-red-500">Must be exactly 6 digits</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">2. Payment</h2>
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
                <div key={item.id} className="flex gap-4 items-start group">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted border border-border">
                    <Image src={item.product.images?.[0]?.url || "/placeholder-suit.jpg"} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-serif font-semibold">{item.product.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Size: {item.variant.size}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-border rounded-none p-1 bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-zinc-100 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-zinc-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold">₹{(item.variant.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Input placeholder="Coupon code" value={formData.couponCode} onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })} />
              <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
            </div>
            {discount > 0 && (
              <p className="mt-2 text-sm text-green-600">Coupon applied! -₹{discount.toLocaleString()}</p>
            )}
            {appliedCoupon?.type === "free_shipping" && (
              <p className="mt-2 text-sm text-green-600">Free shipping applied!</p>
            )}

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  GST
                  {/* <span className="ml-1 text-[10px] text-muted-foreground/70">(per item)</span> */}
                </span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="font-serif text-xl">₹{total.toLocaleString()}</span>
            </div>

            <Button
              className="mt-6 w-full bg-accent-yellow text-black hover:bg-accent-yellow/90"
              size="lg"
              onClick={createOrderAndPay}
              disabled={loading || !isFormValid}
            >
              {loading ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-yellow"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
