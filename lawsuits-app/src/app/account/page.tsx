"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Ruler, Package, Heart, LogOut } from "lucide-react";

const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-03-15",
    status: "delivered",
    total: 45000,
    items: [{ name: "The Barrister's Charcoal Three-Piece", size: "40R", qty: 1 }],
  },
  {
    id: "ORD-002",
    date: "2024-04-01",
    status: "processing",
    total: 38500,
    items: [
      { name: "The Solicitor's Navy Two-Piece", size: "42R", qty: 1 },
      { name: "Silk Navy Tie", size: "Standard", qty: 1 },
    ],
  },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">The Lawyer&apos;s Vault</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, Counselor
          </p>
        </div>
        <Button variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="measurements">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements">
            <Ruler className="mr-2 h-4 w-4" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="mt-6">
          <div className="rounded-lg border border-border p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold">
                Measurement Profile
              </h2>
              <Badge variant="secondary">Not Verified</Badge>
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

            <Button className="mt-6 bg-accent-yellow text-black hover:bg-accent-yellow/90">
              Save Measurements
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-border p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      order.status === "delivered" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {order.status}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.name} ({item.size}) × {item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    Total: ₹{order.total.toLocaleString()}
                  </span>
                  <Button variant="outline" size="sm">
                    Re-order this Fit
                  </Button>
                </div>
              </div>
            ))}
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
  );
}
