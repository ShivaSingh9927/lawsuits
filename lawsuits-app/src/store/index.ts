import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, User, UserMeasurements, WishlistItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
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
    { name: "dress-outfitters-cart" }
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
    { name: "dress-outfitters-auth" }
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
    { name: "dress-outfitters-wishlist" }
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
    { name: "dress-outfitters-recently-viewed" }
  )
);
