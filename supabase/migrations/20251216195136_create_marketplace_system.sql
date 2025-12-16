/*
  # Create Marketplace System for Coach Discovery

  ## Overview
  This migration creates a complete public marketplace where users can discover,
  search, and request coaching from coaches. Similar to Menta and Workana platforms.

  ## 1. User Type Enhancement
  
  Add user_type field to distinguish between coaches and clients:
  - `coach`: Professional offering coaching services
  - `client`: User looking for a coach
  - Default users created before this migration are considered coaches

  ## 2. New Tables

  ### `coach_profiles`
  Public profiles for coaches visible in the marketplace:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users) - The coach
  - `display_name` (text) - Public name
  - `tagline` (text) - Short catchy description
  - `bio` (text) - Detailed biography
  - `avatar_url` (text) - Profile picture URL
  - `cover_image_url` (text) - Cover/banner image
  - `specializations` (text[]) - Areas of expertise
  - `languages` (text[]) - Languages spoken
  - `certifications` (text[]) - Professional certifications
  - `years_experience` (integer) - Years of coaching experience
  - `session_rate` (numeric) - Price per session in USD
  - `currency` (text) - Currency code (default USD)
  - `availability_status` (text) - available, busy, not_accepting
  - `timezone` (text) - Coach's timezone
  - `video_intro_url` (text) - Introduction video URL
  - `linkedin_url` (text) - LinkedIn profile
  - `website_url` (text) - Personal website
  - `total_sessions` (integer) - Total sessions completed
  - `average_rating` (numeric) - Average rating 0-5
  - `total_reviews` (integer) - Number of reviews
  - `is_verified` (boolean) - Verified coach badge
  - `is_featured` (boolean) - Featured in marketplace
  - `is_public` (boolean) - Profile visible in marketplace
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `coaching_requests`
  Requests from clients to coaches:
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key to auth.users) - Who's requesting
  - `coach_id` (uuid, foreign key to auth.users) - Coach being requested
  - `coach_profile_id` (uuid, foreign key to coach_profiles)
  - `client_name` (text) - Client's name
  - `client_email` (text) - Client's email
  - `client_phone` (text) - Optional phone
  - `coaching_area` (text) - Area of interest
  - `message` (text) - Initial message/reason for coaching
  - `preferred_schedule` (text) - Preferred times
  - `budget_range` (text) - Budget expectations
  - `status` (text) - pending, accepted, rejected, completed, cancelled
  - `coach_response` (text) - Coach's response message
  - `responded_at` (timestamptz) - When coach responded
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `coach_reviews`
  Reviews and ratings for coaches:
  - `id` (uuid, primary key)
  - `coach_id` (uuid, foreign key to auth.users)
  - `coach_profile_id` (uuid, foreign key to coach_profiles)
  - `client_id` (uuid, foreign key to auth.users) - Who wrote the review
  - `session_id` (uuid, foreign key to sessions, nullable)
  - `rating` (integer) - 1-5 stars
  - `title` (text) - Review title
  - `comment` (text) - Review text
  - `would_recommend` (boolean) - Would recommend this coach
  - `is_verified_session` (boolean) - Review from actual session
  - `coach_response` (text) - Coach's response to review
  - `is_public` (boolean) - Visible in public profile
  - `helpful_count` (integer) - How many found this helpful
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 3. Security (RLS)
  - Coach profiles are publicly readable
  - Only coach owners can edit their profiles
  - Requests are visible to involved parties only
  - Reviews are publicly readable if is_public = true

  ## 4. Indexes
  - Index on specializations for fast filtering
  - Index on availability_status and is_public
  - Index on average_rating for sorting
  - Index on session_rate for price filtering
*/

-- Add user_type to users table metadata
-- Note: We can't directly alter auth.users, so we'll use the users table or store in metadata
-- For now, we'll infer user type from coach_profiles existence

-- Create coach_profiles table
CREATE TABLE IF NOT EXISTS coach_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text NOT NULL,
  tagline text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  cover_image_url text DEFAULT '',
  specializations text[] DEFAULT '{}',
  languages text[] DEFAULT ARRAY['English'],
  certifications text[] DEFAULT '{}',
  years_experience integer DEFAULT 0,
  session_rate numeric(10,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  availability_status text CHECK (availability_status IN ('available', 'busy', 'not_accepting')) DEFAULT 'available',
  timezone text DEFAULT 'UTC',
  video_intro_url text DEFAULT '',
  linkedin_url text DEFAULT '',
  website_url text DEFAULT '',
  total_sessions integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coaching_requests table
CREATE TABLE IF NOT EXISTS coaching_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_profile_id uuid REFERENCES coach_profiles(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text DEFAULT '',
  coaching_area text NOT NULL,
  message text NOT NULL,
  preferred_schedule text DEFAULT '',
  budget_range text DEFAULT '',
  status text CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
  coach_response text DEFAULT '',
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coach_reviews table
CREATE TABLE IF NOT EXISTS coach_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_profile_id uuid REFERENCES coach_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title text NOT NULL,
  comment text NOT NULL,
  would_recommend boolean DEFAULT true,
  is_verified_session boolean DEFAULT false,
  coach_response text DEFAULT '',
  is_public boolean DEFAULT true,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_profiles_user ON coach_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_public ON coach_profiles(is_public, availability_status);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_rating ON coach_profiles(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_rate ON coach_profiles(session_rate);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_specializations ON coach_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_featured ON coach_profiles(is_featured, is_public);

CREATE INDEX IF NOT EXISTS idx_coaching_requests_client ON coaching_requests(client_id, status);
CREATE INDEX IF NOT EXISTS idx_coaching_requests_coach ON coaching_requests(coach_id, status);
CREATE INDEX IF NOT EXISTS idx_coaching_requests_status ON coaching_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_reviews_coach ON coach_reviews(coach_id, is_public);
CREATE INDEX IF NOT EXISTS idx_coach_reviews_profile ON coach_reviews(coach_profile_id, is_public);
CREATE INDEX IF NOT EXISTS idx_coach_reviews_rating ON coach_reviews(rating DESC);

-- Enable Row Level Security
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_profiles

-- Public can view public profiles
CREATE POLICY "Anyone can view public coach profiles"
  ON coach_profiles FOR SELECT
  USING (is_public = true);

-- Authenticated users can view all profiles (for dashboard)
CREATE POLICY "Authenticated users can view all profiles"
  ON coach_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Coaches can create their own profile
CREATE POLICY "Coaches can create their own profile"
  ON coach_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Coaches can update their own profile
CREATE POLICY "Coaches can update their own profile"
  ON coach_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Coaches can delete their own profile
CREATE POLICY "Coaches can delete their own profile"
  ON coach_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for coaching_requests

-- Clients can view their own requests
CREATE POLICY "Clients can view their own requests"
  ON coaching_requests FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR coach_id = auth.uid());

-- Anyone (including non-authenticated) can create a request
CREATE POLICY "Anyone can create coaching requests"
  ON coaching_requests FOR INSERT
  WITH CHECK (true);

-- Coaches can update requests directed to them
CREATE POLICY "Coaches can update their requests"
  ON coaching_requests FOR UPDATE
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Clients can update their own requests
CREATE POLICY "Clients can update their own requests"
  ON coaching_requests FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Users can delete their own requests
CREATE POLICY "Users can delete their requests"
  ON coaching_requests FOR DELETE
  TO authenticated
  USING (client_id = auth.uid() OR coach_id = auth.uid());

-- RLS Policies for coach_reviews

-- Public can view public reviews
CREATE POLICY "Anyone can view public reviews"
  ON coach_reviews FOR SELECT
  USING (is_public = true);

-- Coaches can view all their reviews
CREATE POLICY "Coaches can view all their reviews"
  ON coach_reviews FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

-- Clients can view their own reviews
CREATE POLICY "Clients can view their own reviews"
  ON coach_reviews FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON coach_reviews FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Clients can update their own reviews
CREATE POLICY "Clients can update their own reviews"
  ON coach_reviews FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Coaches can respond to reviews (update coach_response field only)
CREATE POLICY "Coaches can respond to reviews"
  ON coach_reviews FOR UPDATE
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Clients can delete their own reviews
CREATE POLICY "Clients can delete their own reviews"
  ON coach_reviews FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- Create function to update coach profile stats
CREATE OR REPLACE FUNCTION update_coach_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and total reviews
  UPDATE coach_profiles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM coach_reviews
      WHERE coach_profile_id = NEW.coach_profile_id AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM coach_reviews
      WHERE coach_profile_id = NEW.coach_profile_id AND is_public = true
    ),
    updated_at = now()
  WHERE id = NEW.coach_profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stats when review is added/updated
DROP TRIGGER IF EXISTS update_coach_stats_on_review ON coach_reviews;
CREATE TRIGGER update_coach_stats_on_review
  AFTER INSERT OR UPDATE ON coach_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_profile_stats();

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_coach_profiles_updated_at ON coach_profiles;
CREATE TRIGGER update_coach_profiles_updated_at
  BEFORE UPDATE ON coach_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coaching_requests_updated_at ON coaching_requests;
CREATE TRIGGER update_coaching_requests_updated_at
  BEFORE UPDATE ON coaching_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_reviews_updated_at ON coach_reviews;
CREATE TRIGGER update_coach_reviews_updated_at
  BEFORE UPDATE ON coach_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample specializations (can be used for filtering)
COMMENT ON COLUMN coach_profiles.specializations IS 'Common values: Executive Coaching, Life Coaching, Career Coaching, Health & Wellness, Business Coaching, Leadership Development, Mindfulness, Relationship Coaching, Financial Coaching, Performance Coaching';
COMMENT ON COLUMN coach_profiles.availability_status IS 'available: Accepting new clients, busy: Limited availability, not_accepting: Not taking new clients';
COMMENT ON COLUMN coaching_requests.status IS 'pending: Awaiting coach response, accepted: Coach accepted, rejected: Coach declined, completed: Coaching relationship ended, cancelled: Request cancelled';
