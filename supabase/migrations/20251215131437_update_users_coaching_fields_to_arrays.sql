/*
  # Update users table to support multiple coaching types and methods

  1. Changes
    - Change coaching_type from text to text array
    - Change coaching_method from text to text array
  
  2. Notes
    - This allows coaches to select multiple coaching types and methods
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'coaching_type' AND data_type = 'text'
  ) THEN
    ALTER TABLE users ALTER COLUMN coaching_type TYPE text[] USING ARRAY[coaching_type]::text[];
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'coaching_method' AND data_type = 'text'
  ) THEN
    ALTER TABLE users ALTER COLUMN coaching_method TYPE text[] USING ARRAY[coaching_method]::text[];
  END IF;
END $$;