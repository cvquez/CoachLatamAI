-- ============================================================================
-- FIX: Repair Role Constraints
-- Run this if you encounter "violates check constraint users_role_check" errors
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Find and Drop ALL check constraints on the 'users' table regarding 'role'
    -- This handles case sensitivity and auto-generated names
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.users'::regclass
        AND contype = 'c' -- Check constraint
        AND (
            pg_get_constraintdef(oid) LIKE '%role%' -- Constraints checking the role column
            OR conname = 'users_role_check'         -- Explicitly named constraint
        )
    ) LOOP
        RAISE NOTICE 'Dropping constraint: %', r.conname;
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Add the correct constraint cleanly
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('coach', 'admin', 'super_admin', 'client'));

-- 3. Verify it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check' 
        AND conrelid = 'public.users'::regclass
    ) THEN
        RAISE EXCEPTION 'Failed to create users_role_check constraint';
    END IF;
    RAISE NOTICE 'Constraint users_role_check successfully updated.';
END $$;
