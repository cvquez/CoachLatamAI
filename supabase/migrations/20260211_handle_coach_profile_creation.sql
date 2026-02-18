/*
  # Handle Coach Profile Creation

  1. Changes
    - Update handle_new_user function to create coach_profiles automatically
    - Use metadata from auth.users to populate profile fields
    - Use ON CONFLICT DO NOTHING to ensure idempotency

  2. Security
    - Function is SECURITY DEFINER, modifying public tables bypassing RLS
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_type text;
  v_role text;
BEGIN
  -- Extract user type and role from metadata, defaulting to 'coach'
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'coach');
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'coach');

  -- Insert into public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    user_type,
    subscription_plan,
    subscription_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    v_role,
    v_user_type,
    'starter',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- If user is a coach, create coach profile
  IF v_user_type = 'coach' THEN
    INSERT INTO public.coach_profiles (
      user_id,
      display_name,
      tagline,
      bio,
      specializations,
      languages,
      years_experience,
      session_rate,
      currency,
      linkedin_url,
      is_public,
      availability_status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.raw_user_meta_data->>'tagline', ''),
      COALESCE(NEW.raw_user_meta_data->>'bio', ''),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'specializations', '[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'languages', '[]'::jsonb))),
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::integer, 0),
      COALESCE((NEW.raw_user_meta_data->>'session_rate')::numeric, 0),
      COALESCE(NEW.raw_user_meta_data->>'currency', 'USD'),
      COALESCE(NEW.raw_user_meta_data->>'linkedin_url', ''),
      COALESCE((NEW.raw_user_meta_data->>'is_public')::boolean, true),
      COALESCE(NEW.raw_user_meta_data->>'availability_status', 'available'),
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
