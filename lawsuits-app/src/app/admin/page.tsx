"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { products } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Package,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

const mockAppointments = [
  {
    id: "APT-001",
    customer: "Rahul Sharma",
    date: "2024-04-15",
    timeSlot: "10:00 AM - 1:00 PM",
    address: "Andheri West, Mumbai",
    status: "pending",
    staff: null,
  },
  {
    id: "APT-002",
    customer: "Priya Patel",
    date: "2024-04-15",
    timeSlot: "2:00 PM - 5:00 PM",
    address: "Bandra East, Mumbai",
    status: "assigned",
    staff: "Vikram (Tailor)",
  },
  {
    id: "APT-003",
    customer: "Amit Kumar",
    date: "2024-04-16",
    timeSlot: "10:00 AM - 1:00 PM",
    address: "Powai, Mumbai",
    status: "completed",
    staff: "Raj (Tailor)",
  },
];

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your products and appointments
          </p>
        </div>
        <Button className="bg-accent-yellow text-black hover:bg-accent-yellow/90">
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Products", value: products.length, icon: Package },
          {
            label: "Pending Appointments",
            value: mockAppointments.filter((a) => a.status === "pending").length,
            icon: Calendar,
          },
          { label: "Revenue (This Month)", value: "₹2,45,000", icon: BarChart3 },
          { label: "Active Orders", value: "12", icon: Settings },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-2 font-serif text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="mb-4 flex items-center gap-4">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="suits">Suits</SelectItem>
                <SelectItem value="shirts">Shirts</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + v.stock_quantity,
                    0
                  );
                  const outOfStock = product.variants.every(
                    (v) => v.is_out_of_stock || v.stock_quantity === 0
                  );

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-12 w-10 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={
                              product.images?.[0]?.url || "/placeholder-suit.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.id}
                        </p>
                      </TableCell>
                      <TableCell>{product.category?.name}</TableCell>
                      <TableCell>
                        ₹{product.base_price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            totalStock === 0
                              ? "destructive"
                              : totalStock < 5
                              ? "secondary"
                              : "default"
                          }
                        >
                          {totalStock} units
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.is_visible ? (
                          <Badge variant="default">Visible</Badge>
                        ) : (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {product.is_visible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.id}</TableCell>
                    <TableCell>{apt.customer}</TableCell>
                    <TableCell>
                      {new Date(apt.date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>{apt.timeSlot}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {apt.address}
                    </TableCell>
                    <TableCell>{apt.staff || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          apt.status === "completed"
                            ? "default"
                            : apt.status === "assigned"
                            ? "secondary"
                            : "destructive"
                        }
                        className="capitalize"
                      >
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="rounded-lg border border-border p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-medium">Order management coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect your Supabase database to track orders
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
