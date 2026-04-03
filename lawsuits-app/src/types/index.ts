export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category_id: string;
  base_price: number;
  compare_at_price: number | null;
  cost_per_item: number;
  fabric: string;
  fit: "slim" | "modern" | "classic";
  color: string;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  thumbnail_url: string;
  medium_url: string;
  alt: string;
  position: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  stock_quantity: number;
  price: number;
  compare_at_price: number | null;
  is_out_of_stock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  product_count?: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin" | "staff";
  created_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface UserMeasurements {
  id: string;
  user_id: string;
  neck: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  inseam: number | null;
  sleeve: number | null;
  shoulder: number | null;
  notes: string | null;
  is_verified_by_tailor: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  shipping_cost: number;
  tax: number;
  total: number;
  coupon_id: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  payment_status: PaymentStatus;
  user?: { email: string };
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  coupon: Coupon | null;
  appointment: ServiceAppointment | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_size: string;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  net_price: number;
  image_url: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  min_purchase_amount: number;
  max_uses: number | null;
  current_uses: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface ServiceAppointment {
  id: string;
  order_id: string;
  user_id: string;
  status: AppointmentStatus;
  scheduled_date: string;
  time_slot: string;
  address: UserAddress;
  assigned_staff_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_staff: Staff | null;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  is_available: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  user: Pick<User, "full_name" | "avatar_url">;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: Product;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "tailoring"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export type AppointmentStatus =
  | "pending"
  | "assigned"
  | "out_for_fitting"
  | "completed"
  | "cancelled";
