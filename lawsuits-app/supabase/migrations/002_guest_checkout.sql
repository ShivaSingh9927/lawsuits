-- ============================================
-- GUEST CHECKOUT + NEW-USER WELCOME DISCOUNT
-- Run this in Supabase SQL Editor after 001_initial_schema.sql
-- ============================================

-- 1. Allow orders without a user (guest checkout)
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Guest identity columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- 3. Integrity: a row must have either user_id OR guest contact info
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_or_guest_chk'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_user_or_guest_chk
      CHECK (
        user_id IS NOT NULL
        OR (is_guest = TRUE AND guest_email IS NOT NULL AND guest_phone IS NOT NULL)
      );
  END IF;
END$$;

-- 4. Helpful lookup indexes for guest orders
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON public.orders(guest_email) WHERE guest_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_is_guest ON public.orders(is_guest) WHERE is_guest = TRUE;

-- 5. Seed the internal WELCOME5 new-user coupon (applied server-side only)
INSERT INTO public.coupons (code, type, value, min_purchase_amount, is_active)
VALUES ('WELCOME5', 'percentage', 5, 0, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 6. Helpful index for phone-based existence checks during signup-at-checkout
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone) WHERE phone IS NOT NULL;

-- 7. Ensure public.users.phone is populated from auth metadata on signup so
--    the uniqueness check during signup-at-checkout works reliably.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 8. Backfill phone from auth.users.raw_user_meta_data for existing rows
UPDATE public.users u
SET phone = au.raw_user_meta_data->>'phone'
FROM auth.users au
WHERE u.id = au.id
  AND u.phone IS NULL
  AND au.raw_user_meta_data->>'phone' IS NOT NULL;
