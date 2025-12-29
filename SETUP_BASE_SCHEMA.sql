-- ============================================================================
-- COACHLATAM AI - ESQUEMA BASE DE DATOS
-- Script consolidado para inicializar la base de datos en Supabase
-- ============================================================================

-- Paso 1: Crear tablas base
-- ============================================================================

-- Tabla de usuarios (coaches)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'coach' CHECK (role IN ('coach', 'admin', 'client')),
  coaching_type TEXT[] DEFAULT '{}',
  coaching_method TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  certifications TEXT[],
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/Asuncion',
  languages TEXT[] DEFAULT '{}',
  website TEXT,
  linkedin_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  coaching_focus TEXT[] DEFAULT '{}',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'paused')),
  notes TEXT,
  avatar_url TEXT,
  timezone TEXT,
  preferred_language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER,
  title TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  session_type TEXT DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'workshop', 'assessment')),
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  -- Campos de estado de ánimo y energía
  pre_session_mood TEXT,
  post_session_mood TEXT,
  energy_level_start INTEGER CHECK (energy_level_start BETWEEN 1 AND 10),
  energy_level_end INTEGER CHECK (energy_level_end BETWEEN 1 AND 10),
  -- Contenido de la sesión
  session_focus TEXT[] DEFAULT '{}',
  techniques_used TEXT[] DEFAULT '{}',
  insights JSONB DEFAULT '[]',
  breakthrough_moments TEXT[] DEFAULT '{}',
  challenges_discussed TEXT[] DEFAULT '{}',
  homework_assigned JSONB DEFAULT '[]',
  -- Feedback
  client_feedback TEXT,
  coach_observations TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  -- Media
  recording_url TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Habilitar Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Paso 3: Crear políticas de seguridad
-- ============================================================================

-- Políticas para users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para clients
DROP POLICY IF EXISTS "Coaches can view own clients" ON public.clients;
CREATE POLICY "Coaches can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can insert own clients" ON public.clients;
CREATE POLICY "Coaches can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can update own clients" ON public.clients;
CREATE POLICY "Coaches can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can delete own clients" ON public.clients;
CREATE POLICY "Coaches can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = coach_id);

-- Políticas para sessions
DROP POLICY IF EXISTS "Coaches can view own sessions" ON public.sessions;
CREATE POLICY "Coaches can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can insert own sessions" ON public.sessions;
CREATE POLICY "Coaches can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can update own sessions" ON public.sessions;
CREATE POLICY "Coaches can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can delete own sessions" ON public.sessions;
CREATE POLICY "Coaches can delete own sessions" ON public.sessions
  FOR DELETE USING (auth.uid() = coach_id);

-- Paso 4: Crear índices para mejor rendimiento
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON public.clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_sessions_coach_id ON public.sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_date ON public.sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);

-- Paso 5: Crear función para actualizar updated_at automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Paso 6: Crear función para manejar registro de nuevos usuarios
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario en public.users cuando se registra en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIN DEL SCRIPT DE ESQUEMA BASE
-- ============================================================================

-- Verificación
SELECT 'Esquema base creado exitosamente!' as status;
SELECT 'Tablas creadas:' as info, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'clients', 'sessions');
