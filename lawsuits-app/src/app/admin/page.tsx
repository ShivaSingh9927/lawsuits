"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import {
  Package,
  Calendar,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: number;
  compare_at_price: number | null;
  fabric: string;
  fit: string;
  color: string;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  category?: { name: string };
  variants?: { stock_quantity: number }[];
  images?: { url: string; is_primary: boolean }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const mockAppointments = [
  {
    id: "APT-001",
    customer: "Rahul Sharma",
    date: "2026-04-15",
    timeSlot: "10:00 AM - 1:00 PM",
    address: "Andheri West, Mumbai",
    status: "pending",
    staff: null,
  },
  {
    id: "APT-002",
    customer: "Priya Patel",
    date: "2026-04-15",
    timeSlot: "2:00 PM - 5:00 PM",
    address: "Bandra East, Mumbai",
    status: "assigned",
    staff: "Vikram (Tailor)",
  },
];

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    base_price: "",
    compare_at_price: "",
    fabric: "",
    fit: "modern",
    color: "",
    is_visible: true,
    is_featured: false,
    sizes: [{ size: "38R", stock: "10" }, { size: "40R", stock: "15" }, { size: "42R", stock: "10" }],
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      console.log("Using empty products");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/products");
      // Fetch categories from supabase directly
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("position");
      if (data) setCategories(data);
    } catch {
      setCategories([
        { id: "a1b2c3d4-0001-0001-0001-000000000001", name: "Suits", slug: "suits" },
        { id: "a1b2c3d4-0001-0001-0001-000000000002", name: "Shirts", slug: "shirts" },
        { id: "a1b2c3d4-0001-0001-0001-000000000003", name: "Accessories", slug: "accessories" },
      ]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const productData = {
      name: formData.name,
      slug: slug + "-" + Date.now(),
      description: formData.description,
      category_id: formData.category_id,
      base_price: parseFloat(formData.base_price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      fabric: formData.fabric,
      fit: formData.fit,
      color: formData.color,
      is_visible: formData.is_visible,
      is_featured: formData.is_featured,
    };

    try {
      const { data: product, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      // Add variants
      if (product && formData.sizes.length > 0) {
        const variants = formData.sizes.map((s) => ({
          product_id: product.id,
          sku: `${slug.toUpperCase().slice(0, 3)}-${s.size}-${Date.now()}`,
          size: s.size,
          stock_quantity: parseInt(s.stock) || 0,
          price: parseFloat(formData.base_price),
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        }));

        await supabase.from("product_variants").insert(variants);
      }

      alert("Product added successfully!");
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      base_price: "",
      compare_at_price: "",
      fabric: "",
      fit: "modern",
      color: "",
      is_visible: true,
      is_featured: false,
      sizes: [{ size: "38R", stock: "10" }, { size: "40R", stock: "15" }, { size: "42R", stock: "10" }],
    });
    setEditingProduct(null);
  };

  const toggleVisibility = async (product: Product) => {
    await supabase
      .from("products")
      .update({ is_visible: !product.is_visible })
      .eq("id", product.id);
    fetchProducts();
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", product.id);
    fetchProducts();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = products.reduce(
    (sum, p) => sum + (p.variants?.reduce((s, v) => s + v.stock_quantity, 0) || 0),
    0
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-accent-yellow text-black hover:bg-accent-yellow/90"
              onClick={() => { resetForm(); setDialogOpen(true); }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Product Name</Label>
                  <Input
                    placeholder="e.g., The Barrister's Charcoal Three-Piece"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v: string | null) => setFormData({ ...formData, category_id: v ?? "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fabric</Label>
                  <Input
                    placeholder="e.g., Super 120s Italian Wool"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Base Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="45000"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Compare At Price (₹) - Optional</Label>
                  <Input
                    type="number"
                    placeholder="55000"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fit</Label>
                  <Select
                    value={formData.fit}
                    onValueChange={(v: string | null) => setFormData({ ...formData, fit: v ?? "modern" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim Fit</SelectItem>
                      <SelectItem value="modern">Modern Fit</SelectItem>
                      <SelectItem value="classic">Classic Fit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    placeholder="e.g., Charcoal"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-semibold">Sizes & Stock</Label>
                <div className="mt-2 space-y-2">
                  {formData.sizes.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder="Size"
                        value={s.size}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[i].size = e.target.value;
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="w-1/3"
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={s.stock}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[i].stock = e.target.value;
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="w-1/3"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newSizes = formData.sizes.filter((_, idx) => idx !== i);
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        sizes: [...formData.sizes, { size: "", stock: "0" }],
                      })
                    }
                  >
                    + Add Size
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  />
                  <span className="text-sm">Visible on store</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span className="text-sm">Featured product</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent-yellow text-black hover:bg-accent-yellow/90"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Products", value: products.length, icon: Package },
          {
            label: "Total Stock",
            value: totalStock,
            icon: Package,
          },
          { label: "Revenue (This Month)", value: "₹0", icon: BarChart3 },
          { label: "Appointments", value: "0", icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-6">
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
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="mb-4">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-yellow border-t-transparent mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : (
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
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No products found. Click "Add New Product" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const totalStock = product.variants?.reduce(
                        (sum, v) => sum + v.stock_quantity,
                        0
                      ) || 0;
                      const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="relative h-12 w-10 overflow-hidden rounded-md bg-muted">
                              {primaryImage ? (
                                <Image
                                  src={primaryImage.url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{product.name}</p>
                          </TableCell>
                          <TableCell>{product.category?.name || "-"}</TableCell>
                          <TableCell>₹{product.base_price.toLocaleString()}</TableCell>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleVisibility(product)}
                              >
                                {product.is_visible ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => deleteProduct(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.id}</TableCell>
                    <TableCell>{apt.customer}</TableCell>
                    <TableCell>{apt.date}</TableCell>
                    <TableCell>{apt.timeSlot}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {apt.address}
                    </TableCell>
                    <TableCell>{apt.staff || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {apt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
