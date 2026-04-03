"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Ruler, Package, Heart, LogOut, ChevronRight } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="bg-[#FDFCFB] min-h-screen pt-40 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black tracking-tight underline underline-offset-8 decoration-accent-yellow/30">The Lawyer&apos;s Vault</h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
            Welcome back, Counselor
          </p>
        </div>
        <Button variant="outline" className="border-black/10 text-black hover:bg-black/5 uppercase tracking-widest text-[10px] font-black h-12 px-6">
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
              <h2 className="font-serif text-2xl font-light text-black">
                Measurement Profile
              </h2>
              <Badge className="bg-zinc-100 text-zinc-600 rounded-none border-none uppercase tracking-widest text-[9px] font-black px-3 py-1">Not Verified</Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Neck", unit: "cm" },
                { label: "Chest", unit: "cm" },
                { label: "Waist", unit: "cm" },
                { label: "Hips", unit: "cm" },
                { label: "Inseam", unit: "cm" },
                { label: "Sleeve", unit: "cm" },
                { label: "Shoulder", unit: "cm" },
              ].map(({ label, unit }) => (
                <div key={label}>
                  <Label>{label} ({unit})</Label>
                  <Input type="number" placeholder={`Enter ${label.toLowerCase()}`} />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Label>Notes</Label>
              <textarea
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Any specific preferences or notes for the tailor..."
              />
            </div>

            <Button className="mt-12 bg-accent-yellow text-black hover:bg-accent-yellow/90 rounded-none h-14 px-10 uppercase tracking-[0.3em] text-[10px] font-black shadow-xl shadow-accent-yellow/10">
              Save Measurements
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-border/40 bg-black/[0.01]">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-6" />
            <h2 className="font-serif text-2xl font-light italic">Your Order Archive</h2>
            <p className="mt-2 text-sm text-muted-foreground/60 uppercase tracking-widest max-w-xs">Access your complete history of commissions and tailoring.</p>
            <Button className="mt-10 bg-black text-white hover:bg-black/9 group rounded-none h-14 px-10 uppercase tracking-[0.3em] text-[11px] font-black" asChild>
              <Link href="/account/orders">
                View Detailed History
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          <div className="rounded-lg border border-border p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-medium">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Save items you love for later
            </p>
            <Button className="mt-4" asChild>
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="rounded-lg border border-border p-6">
            <h2 className="mb-6 font-serif text-xl font-semibold">
              Profile Settings
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="Your full name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>
            <Button className="mt-6">Save Changes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}
