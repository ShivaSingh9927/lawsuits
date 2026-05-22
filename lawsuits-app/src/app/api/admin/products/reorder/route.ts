import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/admin/products/reorder
// Body: { items: Array<{ id: string; display_order: number }> }
// Bulk-updates the curated display_order for a set of products.
// Uses the service-role admin client to bypass RLS.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: Array<{ id: string; display_order: number }> = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items[] is required" },
        { status: 400 }
      );
    }

    // Validate shape
    for (const it of items) {
      if (
        typeof it?.id !== "string" ||
        typeof it?.display_order !== "number" ||
        !Number.isFinite(it.display_order)
      ) {
        return NextResponse.json(
          { error: "Each item needs { id: string, display_order: number }" },
          { status: 400 }
        );
      }
    }

    const supabase = await createAdminClient();

    // Run one UPDATE per row. The list is typically small (one category page).
    const results = await Promise.all(
      items.map((it) =>
        supabase
          .from("products")
          .update({ display_order: it.display_order })
          .eq("id", it.id)
      )
    );

    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      console.error("[reorder] update error:", firstError);
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    return NextResponse.json({ updated: items.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[reorder] exception:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
