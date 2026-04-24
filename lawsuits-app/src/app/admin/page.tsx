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
  ClipboardList,
  CreditCard,
  Truck,
  CheckCircle2,
  FileText,
  User as UserIcon,
  ShoppingBag,
  History,
  MoreHorizontal
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types";

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
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<{ url: string; file?: File }[]>([]);
  
  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

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
    // ... categories fetch ...
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, paymentStatus })
      });
      if (res.ok) {
        fetchOrders(); // Refresh
        if (selectedOrder?.id === orderId) {
          const updated = await res.json();
          setSelectedOrder(updated.order);
        }
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    const newImages: { url: string; file?: File }[] = [];

    for (const file of Array.from(files)) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newImages.push({ url: previewUrl, file });
    }

    setImages([...images, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const uploadImagesToStorage = async (productId: string) => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.file) {
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, img.file);

        if (!error) {
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);
          uploadedUrls.push(urlData.publicUrl);
        }
      } else {
        uploadedUrls.push(img.url);
      }
    }

    // Save to product_images table
    if (uploadedUrls.length > 0) {
      const imageRecords = uploadedUrls.map((url, i) => ({
        product_id: productId,
        url: url,
        alt: formData.name,
        position: i,
        is_primary: i === 0,
      }));

      await supabase.from("product_images").insert(imageRecords);
    }
  };

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

      // Upload images
      if (images.length > 0) {
        await uploadImagesToStorage(product.id);
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
    setImages([]);
    setEditingProduct(null);
  };

  const toggleVisibility = async (product: Product) => {
    await supabase
      .from("products")
      .update({ is_visible: !product.is_visible })
      .eq("id", product.id);
    fetchProducts();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-50 border-green-100";
      case "processing": return "text-blue-600 bg-blue-50 border-blue-100";
      case "tailoring": return "text-purple-600 bg-purple-50 border-purple-100 font-serif italic";
      case "shipped": return "text-indigo-600 bg-indigo-50 border-indigo-100";
      case "delivered": return "text-green-700 bg-green-100 border-green-200";
      case "cancelled": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-yellow-600 bg-yellow-50 border-yellow-100";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "captured": return "text-green-600 bg-green-50 border-green-100";
      case "authorized": return "text-blue-600 bg-blue-50 border-blue-100";
      case "failed": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-yellow-600 bg-yellow-50 border-yellow-100";
    }
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

                {/* Image Upload */}
                <div className="col-span-2">
                  <Label>Product Images</Label>
                  <div className="mt-2 rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-muted p-3">
                          <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Click to upload images
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border">
                          <img
                            src={img.url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-accent-yellow py-0.5 text-center text-[10px] font-medium text-black">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
        <TabsList className="bg-black/5 rounded-none p-1 h-14 mb-8">
          <TabsTrigger value="products" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
             <Package className="mr-2 h-3.5 w-3.5" />
             Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
             <ClipboardList className="mr-2 h-3.5 w-3.5" />
             Orders
          </TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
             <Calendar className="mr-2 h-3.5 w-3.5" />
             Appointments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] uppercase tracking-widest font-black">
             <BarChart3 className="mr-2 h-3.5 w-3.5" />
             Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
           <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ORDER</TableHead>
                    <TableHead>CUSTOMER</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>TOTAL</TableHead>
                    <TableHead>PAYMENT</TableHead>
                    <TableHead>FULFILLMENT</TableHead>
                    <TableHead className="text-right">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-20 text-center text-muted-foreground/50 italic font-serif">
                         The archive is currently empty.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id} className="group hover:bg-black/[0.01]">
                        <TableCell className="font-bold text-[11px] tracking-widest uppercase">#{order.order_number}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-bold text-sm">{(order as any).user?.full_name || "N/A"}</span>
                              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">{(order as any).user?.email}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="font-serif italic text-base font-medium">₹{order.total.toLocaleString()}</TableCell>
                        <TableCell>
                           <Badge className={`rounded-none border-none py-1 px-3 text-[9px] font-black uppercase tracking-widest ${getPaymentStatusColor(order.payment_status)}`}>
                             {order.payment_status}
                           </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge className={`rounded-none border py-1 px-3 text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                             {order.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="rounded-none hover:bg-accent-yellow/10"
                             onClick={() => { setSelectedOrder(order); setOrderDialogOpen(true); }}
                           >
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
           </div>
        </TabsContent>
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
      {/* Order Details Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border-none p-0 bg-[#FDFCFB]">
           {selectedOrder && (
             <div className="flex flex-col md:flex-row h-full">
                {/* Left Panel: Invoice & Items */}
                <div className="flex-1 p-10 border-r border-border/10">
                   <div className="flex items-center justify-between mb-12">
                      <div className="space-y-4">
                         <h2 className="font-serif text-3xl font-light italic text-accent-yellow">Commission Receipt</h2>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Reference #{selectedOrder.order_number}</p>
                      </div>
                      <Badge className={`rounded-none border-none py-2 px-4 text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                        {(selectedOrder as Order).status}
                      </Badge>
                   </div>

                   <div className="space-y-8 mb-16">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 border-b border-border/10 pb-4 mb-8">Ensemble Items</h3>
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="flex gap-8 group">
                           <div className="h-24 w-16 bg-black/5 rounded-none relative overflow-hidden shrink-0">
                              {item.image_url ? (
                                <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center opacity-10"><ShoppingBag className="h-6 w-6" /></div>
                              )}
                           </div>
                           <div className="flex-1 py-1">
                              <div className="flex justify-between items-start">
                                 <h4 className="font-bold text-sm uppercase tracking-widest">{item.product_name}</h4>
                                 <p className="font-serif italic text-lg">₹{item.net_price.toLocaleString()}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Selection: {item.variant_size} × {item.quantity}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-2 gap-12 pt-12 border-t border-border/10">
                      <div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-6">Advocate Logistics</h4>
                         <div className="space-y-2 text-xs font-medium uppercase tracking-[0.1em]">
                            <p className="font-black">{(selectedOrder as Order).shipping_name}</p>
                            <p>{(selectedOrder as Order).shipping_address}</p>
                            <p>{(selectedOrder as Order).shipping_city}, {(selectedOrder as Order).shipping_state} {(selectedOrder as Order).shipping_postal_code}</p>
                         </div>
                      </div>
                      <div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-6">Investment Summary</h4>
                         <div className="space-y-3">
                            <div className="flex justify-between text-xs uppercase tracking-widest font-black opacity-40">
                               <span>Subtotal</span>
                               <span>₹{(selectedOrder as Order).subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs uppercase tracking-widest font-black text-accent-yellow">
                               <span>GST</span>
                               <span>₹{(selectedOrder as Order).tax.toLocaleString()}</span>
                            </div>
                            <Separator className="my-2 bg-border/10" />
                            <div className="flex justify-between text-xl font-serif italic text-foreground pt-2">
                               <span>Total Commission</span>
                               <span>₹{(selectedOrder as Order).total.toLocaleString()}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right Panel: Workflow Controls */}
                <div className="w-full md:w-80 bg-white p-10 flex flex-col justify-between">
                   <div className="space-y-12">
                      <div>
                         <div className="flex items-center gap-3 mb-8">
                            <History className="h-4 w-4 text-accent-yellow" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Workflow Control</h3>
                         </div>
                         
                         <div className="space-y-8">
                            <div className="space-y-3">
                               <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Fulfillment Status</Label>
                               <Select 
                                 value={selectedOrder.status} 
                                 onValueChange={(v) => v && updateOrderStatus((selectedOrder as Order).id, v as OrderStatus)}
                               >
                                  <SelectTrigger className="rounded-none border-border/20 text-[10px] font-black tracking-widest uppercase h-12">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-none border-none shadow-2xl">
                                     <SelectItem value="pending">PENDING</SelectItem>
                                     <SelectItem value="confirmed">CONFIRMED</SelectItem>
                                     <SelectItem value="tailoring" className="font-serif italic capitalize">Tailoring</SelectItem>
                                     <SelectItem value="processing">PROCESSING</SelectItem>
                                     <SelectItem value="shipped">SHIPPED</SelectItem>
                                     <SelectItem value="delivered">DELIVERED</SelectItem>
                                     <SelectItem value="cancelled">CANCELLED</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>

                            <div className="space-y-3">
                               <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Payment Status</Label>
                               <Select 
                                 value={selectedOrder.payment_status} 
                                 onValueChange={(v) => v && updateOrderStatus((selectedOrder as Order).id, (selectedOrder as any).status, v as PaymentStatus)}
                               >
                                  <SelectTrigger className="rounded-none border-border/20 text-[10px] font-black tracking-widest uppercase h-12">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-none border-none shadow-2xl">
                                     <SelectItem value="pending">PENDING</SelectItem>
                                     <SelectItem value="authorized">AUTHORIZED</SelectItem>
                                     <SelectItem value="captured">CAPTURED</SelectItem>
                                     <SelectItem value="failed">FAILED</SelectItem>
                                     <SelectItem value="refunded">REFUNDED</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                         </div>
                      </div>

                      {selectedOrder.appointment && (
                        <div className="rounded-sm border border-accent-yellow/20 bg-accent-yellow/5 p-6 space-y-4">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-yellow">
                              <Calendar className="h-3 w-3" />
                              Fitting Scheduled
                           </div>
                           <p className="text-xs font-bold font-serif italic text-foreground opacity-80">
                              {new Date((selectedOrder.appointment as any).scheduled_date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                           </p>
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{(selectedOrder.appointment as any).time_slot}</p>
                        </div>
                      )}
                   </div>

                   <Button 
                     variant="outline" 
                     className="w-full rounded-none h-14 uppercase tracking-[0.2em] text-[10px] font-black border-border/20 hover:bg-black/5"
                     onClick={() => setOrderDialogOpen(false)}
                   >
                      CLOSE INSPECTOR
                   </Button>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
