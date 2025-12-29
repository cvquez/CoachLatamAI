# 🚀 Guía de Instalación - CoachLatamAI

Guía completa paso a paso para poner en funcionamiento la aplicación CoachLatamAI con Supabase.

---

## 📋 REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener instalado:

- ✅ Node.js (versión 16 o superior) - [Descargar](https://nodejs.org/)
- ✅ npm o yarn
- ✅ Git
- ✅ Una cuenta en Supabase - [Crear cuenta gratis](https://supabase.com/)
- ✅ (Opcional) Cuenta en OpenAI para funciones de IA - [Crear cuenta](https://platform.openai.com/)

---

## 🎯 ETAPA 1: CONFIGURAR PROYECTO SUPABASE

### Paso 1.1: Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com/](https://app.supabase.com/)
2. Click en **"New project"**
3. Completa los datos:
   - **Name**: CoachLatamAI (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡Guárdala!)
   - **Region**: Selecciona la más cercana a tu ubicación
   - **Plan**: Free (para empezar)
4. Click en **"Create new project"**
5. Espera 2-3 minutos mientras Supabase configura tu base de datos

### Paso 1.2: Obtener Credenciales de Supabase

Una vez creado el proyecto:

1. En el panel de Supabase, ve a **Settings** (⚙️ en la barra lateral izquierda)
2. Click en **API**
3. Anota estas dos credenciales (las necesitarás después):
   - **Project URL** (ejemplo: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (bajo "Project API keys")

**⚠️ IMPORTANTE**: Guarda estas credenciales en un lugar seguro. Las necesitarás en la ETAPA 3.

---

## 🗄️ ETAPA 2: CONFIGURAR BASE DE DATOS

### Paso 2.1: Crear Esquema Base

Primero necesitamos crear las tablas base del sistema. 

1. En Supabase, ve a **SQL Editor** (en la barra lateral)
2. Click en **"New query"**
3. Copia y pega el siguiente SQL:

```sql
-- Crear tabla de usuarios (coaches)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'coach' CHECK (role IN ('coach', 'admin')),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de clientes
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
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER,
  title TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  session_type TEXT DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'workshop')),
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  -- Campos adicionales de FASE 1
  pre_session_mood TEXT,
  post_session_mood TEXT,
  energy_level_start INTEGER CHECK (energy_level_start BETWEEN 1 AND 10),
  energy_level_end INTEGER CHECK (energy_level_end BETWEEN 1 AND 10),
  session_focus TEXT[] DEFAULT '{}',
  techniques_used TEXT[] DEFAULT '{}',
  insights JSONB DEFAULT '[]',
  breakthrough_moments TEXT[] DEFAULT '{}',
  challenges_discussed TEXT[] DEFAULT '{}',
  homework_assigned JSONB DEFAULT '[]',
  client_feedback TEXT,
  coach_observations TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas de seguridad para clients
CREATE POLICY "Coaches can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = coach_id);

-- Políticas de seguridad para sessions
CREATE POLICY "Coaches can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own sessions" ON public.sessions
  FOR DELETE USING (auth.uid() = coach_id);

-- Índices para mejor performance
CREATE INDEX idx_clients_coach_id ON public.clients(coach_id);
CREATE INDEX idx_sessions_coach_id ON public.sessions(coach_id);
CREATE INDEX idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX idx_sessions_scheduled_date ON public.sessions(scheduled_date);
```

4. Click en **"Run"** (o presiona `Ctrl + Enter`)
5. Deberías ver: "Success. No rows returned"

### Paso 2.2: Ejecutar Migraciones del Proyecto

Ahora vamos a ejecutar las 8 migraciones del proyecto en orden:

**Migración 1**: Ya está incluida en el esquema base arriba (update_users_coaching_fields_to_arrays)

**Migración 2**: Fix user registration
1. Nueva query en SQL Editor
2. Pega el contenido de: `supabase/migrations/20251215192717_fix_user_registration.sql`
3. Run

**Migración 3**: Enhance sessions and add results
1. Nueva query
2. Pega: `supabase/migrations/20251216023628_enhance_sessions_and_add_results.sql`
3. Run

**Migración 4**: Create coaching plans system
1. Nueva query
2. Pega: `supabase/migrations/20251216023702_create_coaching_plans_system.sql`
3. Run

**Migración 5**: Create progress tracking system
1. Nueva query
2. Pega: `supabase/migrations/20251216023736_create_progress_tracking_system.sql`
3. Run

**Migración 6**: Create competency evaluation system
1. Nueva query
2. Pega: `supabase/migrations/20251216112542_create_competency_evaluation_system.sql`
3. Run

**Migración 7**: Create behavior tracking system
1. Nueva query
2. Pega: `supabase/migrations/20251216113953_create_behavior_tracking_system.sql`
3. Run

**Migración 8**: Create marketplace system
1. Nueva query
2. Pega: `supabase/migrations/20251216195136_create_marketplace_system.sql`
3. Run

### Paso 2.3: Verificar Base de Datos

1. Ve a **Table Editor** en Supabase
2. Deberías ver todas estas tablas:
   - ✅ users
   - ✅ clients
   - ✅ sessions
   - ✅ session_results
   - ✅ coaching_plans
   - ✅ plan_objectives
   - ✅ plan_milestones
   - ✅ progress_entries
   - ✅ achievements
   - ✅ before_after_comparisons
   - ✅ competency_frameworks
   - ✅ competencies
   - ✅ competency_evaluations
   - ✅ evaluation_scores
   - ✅ behaviors
   - ✅ behavior_observations
   - ✅ frameworks (marketplace)
   - ✅ framework_purchases

---

## 💻 ETAPA 3: CONFIGURAR PROYECTO LOCAL

### Paso 3.1: Descargar/Clonar el Proyecto

Si ya tienes el ZIP:
```bash
# Ya lo tienes descomprimido
cd /ruta/a/CoachLatamAI-main
```

Si quieres clonarlo desde GitHub:
```bash
git clone https://github.com/AFornerod/CoachLatamAI.git
cd CoachLatamAI
```

### Paso 3.2: Crear Archivo de Variables de Entorno

1. En la raíz del proyecto, crea un archivo llamado `.env.local`
2. Agrega el siguiente contenido (reemplaza con tus valores):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# OpenAI Configuration (Opcional - solo si usarás funciones de IA)
OPENAI_API_KEY=tu-openai-api-key-aqui
```

**Cómo obtener cada valor:**

- `NEXT_PUBLIC_SUPABASE_URL`: De Supabase → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: De Supabase → Settings → API → anon public key
- `OPENAI_API_KEY`: De [OpenAI Platform](https://platform.openai.com/api-keys) → Create new secret key

**⚠️ IMPORTANTE**: 
- El archivo `.env.local` NO debe subirse a Git (ya está en .gitignore)
- Guarda una copia de respaldo de tus keys

### Paso 3.3: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias del proyecto (puede tardar 2-3 minutos).

---

## ✅ ETAPA 4: EJECUTAR LA APLICACIÓN

### Paso 4.1: Modo Desarrollo

```bash
npm run dev
```

Deberías ver algo como:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Paso 4.2: Abrir en el Navegador

1. Abre tu navegador
2. Ve a: `http://localhost:3000`
3. ¡Deberías ver la pantalla de login/registro de CoachLatamAI!

---

## 👤 ETAPA 5: CREAR TU PRIMER USUARIO

### Paso 5.1: Registro

1. En la página principal, click en **"Registrarse"** o **"Sign Up"**
2. Completa el formulario:
   - Email
   - Password (mínimo 6 caracteres)
   - Nombre completo
   - Tipo de coaching
   - Método de coaching
   - Etc.
3. Click en **"Crear cuenta"**

### Paso 5.2: Verificar Email (Importante)

Supabase envía un email de verificación:

1. Revisa tu bandeja de entrada
2. Si no llega, revisa SPAM
3. Click en el link de verificación

**Alternativa - Desactivar verificación de email (solo desarrollo):**

En Supabase:
1. Ve a **Authentication** → **Settings**
2. Busca "Email confirmation"
3. Desactiva "Enable email confirmations"
4. Ahora puedes registrarte sin verificar email

### Paso 5.3: Iniciar Sesión

1. Ve a `/login`
2. Ingresa tu email y password
3. ¡Listo! Deberías ver el dashboard

---

## 🎨 ETAPA 6: PROBAR FUNCIONALIDADES

### Crear un Cliente

1. En el Dashboard, click en **"Clientes"**
2. Click en **"Nuevo Cliente"**
3. Completa los datos
4. Guardar

### Agendar una Sesión

1. Ve a **"Sesiones"**
2. Click en **"Nueva Sesión"**
3. Selecciona cliente, fecha, hora
4. Guardar

### Crear un Plan de Coaching

1. Ve a la página de un cliente
2. Click en **"Plan de Coaching"**
3. Sigue el wizard de 4 pasos
4. Crear plan

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Missing Supabase environment variables"

**Solución:**
- Verifica que `.env.local` existe en la raíz del proyecto
- Verifica que las variables tienen el prefijo `NEXT_PUBLIC_`
- Reinicia el servidor de desarrollo (`Ctrl+C` y luego `npm run dev`)

### Error: "Failed to fetch" o "Network error"

**Solución:**
- Verifica que tu proyecto de Supabase está activo
- Verifica que la URL en `.env.local` es correcta
- Verifica tu conexión a internet

### Error: "row-level security policy violation"

**Solución:**
- Verifica que ejecutaste todas las migraciones
- Verifica que las políticas de RLS se crearon correctamente
- En Supabase, ve a Table Editor → tu tabla → Click en el escudo (🛡️) para ver las políticas

### La página no carga o muestra error 500

**Solución:**
```bash
# Limpia cache y reinstala
rm -rf .next node_modules
npm install
npm run dev
```

### Error de TypeScript al compilar

**Solución:**
```bash
# Verifica tipos
npm run typecheck

# Si hay errores, revisa los archivos indicados
```

---

## 🚀 ETAPA 7: COMPILAR PARA PRODUCCIÓN

Cuando estés listo para desplegar:

```bash
# Compilar
npm run build

# Ejecutar en modo producción
npm start
```

---

## 📚 PRÓXIMOS PASOS

Una vez que tengas la aplicación funcionando:

1. ✅ **Personaliza tu perfil** en Settings
2. ✅ **Agrega clientes** de prueba
3. ✅ **Crea sesiones** y prueba el workflow completo
4. ✅ **Explora el marketplace** de frameworks
5. ✅ **Configura OpenAI** para usar funciones de IA
6. ✅ **Lee la documentación** de las FASES 2 y 3

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa la consola del navegador (F12 → Console)
2. Revisa los logs del servidor en tu terminal
3. Verifica que todas las migraciones se ejecutaron exitosamente
4. Consulta la documentación de Supabase: https://supabase.com/docs

---

## ✨ FEATURES DISPONIBLES

- ✅ Autenticación y registro de coaches
- ✅ Gestión de clientes
- ✅ Agendamiento de sesiones
- ✅ Resultados detallados de sesiones
- ✅ Planes de coaching con objetivos SMART
- ✅ Tracking de progreso y logros
- ✅ Sistema de evaluación de competencias
- ✅ Tracking de comportamientos
- ✅ Marketplace de frameworks de coaching
- ✅ Dashboard con métricas
- ✅ Sistema de notificaciones (FASE 2)

---

¡Buena suerte con tu plataforma de coaching! 🎯
