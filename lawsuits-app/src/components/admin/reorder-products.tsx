"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowUpToLine, ArrowDownToLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ReorderProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  display_order: number | null;
  is_visible: boolean;
  images?: { url: string; is_primary: boolean }[];
}

interface SortableRowProps {
  product: ReorderProduct;
  index: number;
  onTop: (id: string) => void;
  onBottom: (id: string) => void;
}

function SortableRow({ product, index, onTop, onBottom }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const primary =
    product.images?.find((i) => i.is_primary)?.url ||
    product.images?.[0]?.url ||
    "/TDO-black-logo-transp-01.webp";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 border border-border/50 bg-white px-4 py-3 hover:bg-zinc-50"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-zinc-400 hover:text-black"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="w-10 text-center text-xs font-bold tabular-nums text-zinc-500">
        {index + 1}
      </span>

      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden bg-zinc-100">
        <Image src={primary} alt={product.name} fill sizes="56px" className="object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-semibold">{product.name}</div>
        <div className="text-[11px] uppercase tracking-widest text-zinc-400">
          ₹{product.base_price?.toLocaleString?.() ?? product.base_price}
          {!product.is_visible && (
            <span className="ml-2 text-amber-600">• hidden</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Move to top"
          onClick={() => onTop(product.id)}
        >
          <ArrowUpToLine className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Move to bottom"
          onClick={() => onBottom(product.id)}
        >
          <ArrowDownToLine className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ReorderProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [products, setProducts] = useState<ReorderProduct[]>([]);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load categories once
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_visible", true)
        .order("position", { ascending: true });
      if (!active) return;
      if (!error && data) {
        setCategories(data);
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id);
        }
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load products of selected category
  useEffect(() => {
    if (!selectedCategoryId) return;
    let active = true;
    setLoading(true);
    setMessage(null);
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, base_price, display_order, is_visible, images:product_images(url, is_primary)"
        )
        .eq("category_id", selectedCategoryId)
        .is("deleted_at", null)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setMessage(`Failed to load products: ${error.message}`);
        setProducts([]);
      } else if (data) {
        const list = data as unknown as ReorderProduct[];
        setProducts(list);
        setOriginalOrder(list.map((p) => p.id));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [selectedCategoryId]);

  const isDirty = useMemo(() => {
    if (products.length !== originalOrder.length) return true;
    return products.some((p, i) => p.id !== originalOrder[i]);
  }, [products, originalOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setProducts((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const moveToTop = (id: string) => {
    setProducts((items) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx <= 0) return items;
      return arrayMove(items, idx, 0);
    });
  };

  const moveToBottom = (id: string) => {
    setProducts((items) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx < 0 || idx === items.length - 1) return items;
      return arrayMove(items, idx, items.length - 1);
    });
  };

  const handleReset = () => {
    if (originalOrder.length === 0) return;
    const byId = new Map(products.map((p) => [p.id, p]));
    const restored = originalOrder
      .map((id) => byId.get(id))
      .filter(Boolean) as ReorderProduct[];
    setProducts(restored);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setMessage(null);
    try {
      const items = products.map((p, i) => ({ id: p.id, display_order: i + 1 }));
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to save");
      }
      setOriginalOrder(items.map((i) => i.id));
      setProducts((curr) =>
        curr.map((p, i) => ({ ...p, display_order: i + 1 }))
      );
      setMessage(`Saved order for ${json.updated} products.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessage(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[240px]">
          <label className="mb-2 block text-[10px] uppercase tracking-widest font-bold text-zinc-500">
            Category
          </label>
          <Select
            value={selectedCategoryId}
            onValueChange={(v: string | null) => setSelectedCategoryId(v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || saving}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save order
          </Button>
        </div>
      </div>

      {message && (
        <div className="border border-border/60 bg-zinc-50 px-4 py-2 text-sm">
          {message}
        </div>
      )}

      <div className="text-[11px] uppercase tracking-widest text-zinc-400">
        Drag rows to reorder. Position 1 appears first on the shop page for this
        category. Sequence numbers are hidden from customers.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-border/60 px-6 py-16 text-center text-sm text-zinc-500">
          No products in this category.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={products.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {products.map((p, i) => (
                <SortableRow
                  key={p.id}
                  product={p}
                  index={i}
                  onTop={moveToTop}
                  onBottom={moveToBottom}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
