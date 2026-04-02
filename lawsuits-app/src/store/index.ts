import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, User, UserMeasurements, WishlistItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  qualifiesForFreeFitting: () => boolean;
  amountForFreeFitting: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.variant_id === item.variant_id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.variant_id === item.variant_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variant_id !== variantId) });
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variant_id === variantId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        ),
      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      qualifiesForFreeFitting: () => get().getSubtotal() >= 5000,
      amountForFreeFitting: () => Math.max(0, 5000 - get().getSubtotal()),
    }),
    { name: "lawsuits-cart" }
  )
);

interface AuthState {
  user: User | null;
  measurements: UserMeasurements | null;
  setUser: (user: User | null) => void;
  setMeasurements: (measurements: UserMeasurements | null) => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      measurements: null,
      setUser: (user) => set({ user }),
      setMeasurements: (measurements) => set({ measurements }),
      isLoggedIn: () => !!get().user,
    }),
    { name: "lawsuits-auth" }
  )
);

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (!get().isWishlisted(item.product_id)) {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product_id !== productId) });
      },
      isWishlisted: (productId) =>
        get().items.some((i) => i.product_id === productId),
    }),
    { name: "lawsuits-wishlist" }
  )
);

interface FilterState {
  category: string | null;
  fit: string | null;
  fabric: string | null;
  priceRange: [number, number];
  sortBy: string;
  setFilter: (key: string, value: unknown) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  category: null,
  fit: null,
  fabric: null,
  priceRange: [0, 100000],
  sortBy: "newest",
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  resetFilters: () =>
    set({
      category: null,
      fit: null,
      fabric: null,
      priceRange: [0, 100000],
      sortBy: "newest",
    }),
}));

interface RecentlyViewedState {
  items: string[]; // array of product IDs
  addItem: (productId: string) => void;
  clearRecentlyViewed: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        const items = get().items;
        // Keep unique items, moved to front
        const filtered = items.filter((id) => id !== productId);
        set({ items: [productId, ...filtered].slice(0, 10) });
      },
      clearRecentlyViewed: () => set({ items: [] }),
    }),
    { name: "lawsuits-recently-viewed" }
  )
);
