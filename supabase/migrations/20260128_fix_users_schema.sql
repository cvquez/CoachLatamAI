-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- Update RLS policies if needed (usually existing policies cover all columns)

-- Verify that the columns exist (Metadata refresh)
NOTIFY pgrst, 'reload schema';
