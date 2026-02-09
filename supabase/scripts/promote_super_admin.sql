-- ============================================================================
-- SCRIPT: Promote User to Super Admin
-- Usage: Run this in the Supabase SQL Editor
-- ============================================================================

DO $$
DECLARE
  target_email TEXT := 'YOUR_EMAIL_HERE'; -- REPLACE THIS WITH THE ACTUAL EMAIL
  target_user_id UUID;
BEGIN
  -- Find the user
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User % not found!', target_email;
    RETURN;
  END IF;

  -- Update public.users table (bypassing the trigger via direct SQL execution in dashboard which is usually postgres role)
  UPDATE public.users
  SET role = 'super_admin'
  WHERE id = target_user_id;

  RAISE NOTICE 'User % (ID: %) successfully promoted to super_admin', target_email, target_user_id;
  
  -- Verify
  PERFORM * FROM public.users WHERE id = target_user_id AND role = 'super_admin';
  IF FOUND THEN
     RAISE NOTICE 'Verification successful.';
  ELSE
     RAISE NOTICE 'Verification failed.';
  END IF;

END $$;
