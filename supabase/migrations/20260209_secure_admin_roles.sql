-- ============================================================================
-- SECURITY MIGRATION: Secure Admin Roles & Prevent Privilege Escalation
-- Date: 2026-02-09
-- Description: 
-- 1. Updates users table constraint to include 'super_admin'
-- 2. Implements column-level security via trigger to prevent self-promotion
-- ============================================================================

-- 1. Update Role Check Constraint
-- ============================================================================

-- Drop existing check constraint if it exists (handling different naming conventions)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE public.users DROP CONSTRAINT users_role_check;
  END IF;
END $$;

-- Add updated check constraint including 'super_admin'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('coach', 'admin', 'super_admin', 'client'));

-- 2. Prevent Sensitive Column Updates
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if it's a new record (INSERT)
  IF (TG_OP = 'INSERT') THEN
    RETURN NEW;
  END IF;

  -- Check if sensitive columns are being modified
  IF (OLD.role IS DISTINCT FROM NEW.role) OR 
     (OLD.subscription_status IS DISTINCT FROM NEW.subscription_status) OR
     (OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan) THEN
     
     -- Bypass check if the user is a super_admin or service_role
     -- Note: create_subscription_atomic uses SECURITY DEFINER, so it bypasses RLS
     -- but triggers still run as the original user unless we check current_setting
     
     IF (
       -- Check if acting user is super_admin
       EXISTS (
         SELECT 1 FROM public.users 
         WHERE id = auth.uid() 
         AND role = 'super_admin'
       ) OR 
       -- Allow service role (for webhooks/system functions)
       auth.role() = 'service_role'
     ) THEN
       RETURN NEW;
     END IF;

     RAISE EXCEPTION 'Unauthorized: You cannot modify sensitive fields (role, subscription status/plan). Contact an administrator.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS tr_prevent_sensitive_updates ON public.users;
CREATE TRIGGER tr_prevent_sensitive_updates
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_sensitive_updates();

-- 3. Update RLS Policies for Admin Actions
-- ============================================================================

-- Ensure admins/super_admins can manage users
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Double check: Regular users can currently update their own profile
-- The trigger above now prevents them from touching sensitive columns
-- within that update.
