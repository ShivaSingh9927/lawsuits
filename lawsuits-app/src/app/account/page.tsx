"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { User, Ruler, Package, Heart, LogOut, ChevronRight, Loader2, CheckCircle2, AlertCircle, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [measurements, setMeasurements] = useState<any>({
    neck: "",
    chest: "",
    waist: "",
    hips: "",
    inseam: "",
    sleeve: "",
    shoulder: "",
    notes: ""
  });
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setProfile({
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
            email: session.user.email || "",
            phone: session.user.user_metadata?.phone || ""
          });
        }

        const res = await fetch("/api/measurements");
        if (res.ok) {
          const data = await res.json();
          if (data.measurements) {
            setMeasurements(data.measurements);
          }
        }
      } catch (error) {
        console.error("Error fetching user data/measurements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: profile.name,
          phone: profile.phone
        }
      });

      if (error) throw error;
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMeasurements = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(measurements)
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Measurements saved successfully." });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save measurements." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setMeasurements((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-[#FDFCFB] min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="font-serif text-4xl lg:text-5xl font-light text-black tracking-tight uppercase leading-tight">
            Welcome Back, <span className="italic font-normal text-accent-yellow">{profile.name.split(' ')[0] || 'Counselor'}</span>
          </h1>
          <div className="h-[2px] w-16 bg-accent-yellow/40" />
        </div>
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          className="border-black/10 text-black hover:bg-black/5 uppercase tracking-widest text-[10px] font-black h-12 px-6"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="measurements">
        <TabsList className="grid w-full grid-cols-4 bg-black/5 rounded-none h-16 p-1">
          <TabsTrigger value="measurements" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
            <Ruler className="mr-2 h-4 w-4" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="mt-6">
          <div className="rounded-none border border-black/5 bg-white p-8 md:p-12 shadow-sm">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-light text-black uppercase">
                Measurement Profile
              </h2>
              <Badge className={cn(
                "rounded-none border-none uppercase tracking-widest text-[9px] font-black px-3 py-1",
                measurements.is_verified_by_tailor 
                  ? "bg-green-100 text-green-600" 
                  : "bg-zinc-100 text-zinc-600"
              )}>
                {measurements.is_verified_by_tailor ? "Verified by Tailor" : "Not Verified"}
              </Badge>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent-yellow" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Neck", key: "neck" },
                    { label: "Chest", key: "chest" },
                    { label: "Waist", key: "waist" },
                    { label: "Hips", key: "hips" },
                    { label: "Inseam", key: "inseam" },
                    { label: "Sleeve", key: "sleeve" },
                    { label: "Shoulder", key: "shoulder" },
                  ].map(({ label, key }) => (
                    <div key={label} className="space-y-2">
                      <Label htmlFor={key} className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{label} (cm)</Label>
                      <Input 
                        id={key}
                        type="number" 
                        step="0.01"
                        placeholder={`Enter ${label.toLowerCase()}`} 
                        value={measurements[key] || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="rounded-none border-0 border-b border-black/10 focus:border-accent-yellow transition-colors bg-transparent px-0"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <Label htmlFor="notes" className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Professional Tailoring Notes</Label>
                  <textarea
                    id="notes"
                    className="mt-4 w-full rounded-none border-0 border-b border-black/10 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-accent-yellow transition-all"
                    rows={4}
                    placeholder="Any specific preferences or notes for the tailor..."
                    value={measurements.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>

                {message && (
                  <div className={cn(
                    "mt-8 p-4 flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold",
                    message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}>
                    {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                  </div>
                )}

                <Button 
                  onClick={handleSaveMeasurements}
                  disabled={saving}
                  className="mt-12 bg-black text-white hover:bg-zinc-800 rounded-none h-14 px-10 uppercase tracking-[0.3em] text-[10px] font-black shadow-xl"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Measurements Profile"}
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-none border-border/40 bg-zinc-50 border">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-6" />
            <h2 className="font-serif text-2xl font-light italic text-black">Your Order Archive</h2>
            <p className="mt-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest max-w-xs font-bold leading-relaxed">Access your complete history of commissions and tailoring.</p>
            <Button className="mt-10 bg-black text-white hover:bg-zinc-800 group rounded-none h-14 px-10 uppercase tracking-[0.3em] text-[11px] font-black" asChild>
              <Link href="/account/orders">
                View Detailed History
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          <div className="rounded-none border border-black/5 bg-white p-8 md:p-12 shadow-sm min-h-[400px]">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-light text-black uppercase">
                Your Selection Archive
              </h2>
              <Badge className="bg-accent-yellow/10 text-accent-yellow rounded-none border-none uppercase tracking-widest text-[9px] font-black px-3 py-1">
                {wishlistItems.length} Saved Items
              </Badge>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Heart className="mb-6 h-12 w-12 text-zinc-100" />
                <p className="font-serif text-xl font-light italic text-zinc-400">Your selection is currently empty</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold max-w-xs">
                  Save distinguished attire to your archive for future commissions.
                </p>
                <Button variant="outline" className="mt-10 border-black/10 text-black hover:bg-black/5 uppercase tracking-widest text-[10px] font-black h-12 px-8" asChild>
                  <Link href="/shop">Explore Collection</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="group relative border border-black/5 overflow-hidden transition-all hover:border-accent-yellow/30">
                    <Link href={`/product/${item.product.slug}`} className="block aspect-[3/4] relative bg-zinc-50 overflow-hidden">
                      <Image 
                        src={item.product.images?.[0]?.url || "/product-image/demo.webp"} 
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    </Link>
                    <div className="p-6">
                      <h4 className="font-serif text-lg font-light tracking-tight text-black line-clamp-2">{item.product.name}</h4>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-serif text-lg text-accent-yellow italic">₹{item.product.base_price.toLocaleString()}</span>
                        <div className="flex gap-2">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-300 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromWishlist(item.product_id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-black transition-colors" asChild>
                            <Link href={`/product/${item.product.slug}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="rounded-none border border-black/5 bg-white p-8 md:p-12 shadow-sm">
            <h2 className="mb-10 font-serif text-2xl font-light text-black uppercase">
              Profile Settings
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Full Name</Label>
                <Input 
                   value={profile.name} 
                   onChange={(e) => handleProfileChange("name", e.target.value)}
                   className="rounded-none border-0 border-b border-black/10 focus:border-accent-yellow transition-colors bg-transparent px-0 text-base" 
                   placeholder="Counsel Name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Email Address</Label>
                <Input 
                   type="email" 
                   value={profile.email} 
                   readOnly
                   className="rounded-none border-0 border-b border-black/10 transition-colors bg-zinc-50/50 px-0 text-base text-zinc-400 cursor-not-allowed" 
                   placeholder="counsel@chambers.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Phone Number</Label>
                <Input 
                   type="tel" 
                   value={profile.phone} 
                   onChange={(e) => handleProfileChange("phone", e.target.value)}
                   className="rounded-none border-0 border-b border-black/10 focus:border-accent-yellow transition-colors bg-transparent px-0 text-base" 
                   placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            
            {message && (
                  <div className={cn(
                    "mt-8 p-4 flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold",
                    message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}>
                    {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                  </div>
            )}

            <Button 
               onClick={handleSaveProfile}
               disabled={saving}
               className="mt-12 bg-black text-white hover:bg-zinc-800 rounded-none h-14 px-10 uppercase tracking-[0.3em] text-[10px] font-black shadow-xl"
            >
               {saving ? (
                <>
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : "Update Profile Information"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}
