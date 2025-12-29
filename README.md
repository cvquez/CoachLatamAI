# 🎯 CoachLatamAI - Plataforma de Gestión de Coaching

> Plataforma integral para coaches profesionales con gestión de clientes, sesiones, planes SMART, tracking de progreso y más.

![Next.js](https://img.shields.io/badge/Next.js-13.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)

---

## 📖 DOCUMENTACIÓN DE INSTALACIÓN

### 🚀 Inicio Rápido

**Para instalar esta aplicación, lee en este orden:**

1. **[RESUMEN_INSTALACION.md](./RESUMEN_INSTALACION.md)** - Visión general en 1 página
2. **[GUIA_INSTALACION_COACHLATAM.md](./GUIA_INSTALACION_COACHLATAM.md)** - Guía completa paso a paso
3. **[CHECKLIST_INSTALACION.md](./CHECKLIST_INSTALACION.md)** - Lista de verificación

### 📋 Archivos de Configuración

- **[.env.local.example](./.env.local.example)** - Plantilla de variables de entorno
- **[SETUP_BASE_SCHEMA.sql](./SETUP_BASE_SCHEMA.sql)** - Script SQL para inicializar la base de datos

---

## ✨ Características Principales

### 🎯 Core Features (FASE 1 - Completada)

- ✅ **Gestión de Clientes** - Perfiles completos con información de coaching
- ✅ **Sesiones Avanzadas** - Registro pre/post con estado de ánimo y energía
- ✅ **Planes SMART** - Objetivos estructurados con tracking de progreso
- ✅ **Sistema de Logros** - Registro de victorias y momentos clave
- ✅ **Resultados Detallados** - Insights, acciones y compromisos por sesión
- ✅ **Dashboard Completo** - Métricas y visualizaciones en tiempo real

### 🔔 Advanced Features (FASE 2)

- ⏳ Notificaciones in-app
- ⏳ Recordatorios por email
- ⏳ Calendario interactivo
- ⏳ Evaluación de competencias
- ⏳ Tracking de comportamientos

### 🛍️ Marketplace (FASE 3)

- ⏳ Frameworks de coaching
- ⏳ Sistema de pagos
- ⏳ Búsqueda y filtros avanzados

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 13.5 (App Router)
- **UI Library**: React 18.2
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.3
- **Components**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **API**: Next.js API Routes

### Integraciones
- **IA**: OpenAI API (opcional)
- **Deployment**: Netlify/Vercel

---

## 📦 Instalación Rápida

### Requisitos

- Node.js 16+
- npm 8+
- Cuenta de Supabase (gratis)

### Pasos Básicos

```bash
# 1. Clonar o descargar el proyecto
cd CoachLatamAI

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
npm run dev

# Abre http://localhost:3000
```

**Para instrucciones detalladas, lee [GUIA_INSTALACION_COACHLATAM.md](./GUIA_INSTALACION_COACHLATAM.md)**

---

## 📂 Estructura del Proyecto

```
CoachLatamAI/
├── app/                    # Páginas y rutas (Next.js App Router)
│   ├── api/               # API endpoints
│   ├── clients/           # Gestión de clientes
│   ├── dashboard/         # Dashboard principal
│   ├── sessions/          # Sesiones de coaching
│   ├── marketplace/       # Marketplace de frameworks
│   └── settings/          # Configuración
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base (shadcn)
│   ├── sessions/         # Componentes de sesiones
│   ├── coaching-plan/    # Componentes de planes
│   └── progress/         # Tracking de progreso
├── lib/                  # Utilidades y helpers
│   ├── supabase/        # Cliente de Supabase
│   └── types/           # Types de TypeScript
├── supabase/            # Base de datos
│   └── migrations/      # Migraciones SQL
├── hooks/               # Custom React hooks
└── public/              # Archivos estáticos
```

---

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Perfiles de coaches |
| `clients` | Clientes de coaching |
| `sessions` | Sesiones agendadas |
| `session_results` | Resultados detallados |
| `coaching_plans` | Planes de coaching |
| `plan_objectives` | Objetivos SMART |
| `achievements` | Logros del cliente |
| `behaviors` | Tracking de comportamientos |
| `competencies` | Evaluación de competencias |
| `frameworks` | Frameworks de marketplace |

**Ver esquema completo en:** [SETUP_BASE_SCHEMA.sql](./SETUP_BASE_SCHEMA.sql)

---

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Políticas estrictas por coach_id
- ✅ Autenticación con Supabase Auth
- ✅ Variables de entorno para credenciales
- ✅ Validación de tipos con TypeScript

---

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm start            # Ejecutar build de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run typecheck    # Verificar tipos TypeScript
```

---

## 📚 Documentación de Fases

- **[FASE1_COACHING_CORE.md](./FASE1_COACHING_CORE.md)** - Sistema core de coaching (✅ Completada)
- **[FASE1_IMPLEMENTATION.md](./FASE1_IMPLEMENTATION.md)** - Detalles de implementación FASE 1
- **[FASE2_TRIGGER_ANALYSIS.md](./FASE2_TRIGGER_ANALYSIS.md)** - Análisis y notificaciones (⏳ Planificada)
- **[FASE3_MARKETPLACE.md](./FASE3_MARKETPLACE.md)** - Marketplace de frameworks (⏳ Planificada)

---

## 🎨 Características de UX/UI

- 🎨 Diseño responsive y moderno
- 🌙 Soporte para modo oscuro (next-themes)
- 📊 Gráficos interactivos (recharts)
- ✨ Animaciones suaves (Framer Motion)
- 🎯 Iconografía consistente (Lucide React)
- 📝 Editor Markdown integrado
- 🔔 Sistema de toasts y notificaciones
- ♿ Accesibilidad (WAI-ARIA)

---

## 🤝 Contribuciones

Este es un proyecto privado. Si necesitas acceso o tienes sugerencias, contacta al propietario.

---

## 📄 Licencia

Todos los derechos reservados © 2024

---

## 📞 Soporte

Para obtener ayuda con la instalación:

1. Lee la [Guía de Instalación](./GUIA_INSTALACION_COACHLATAM.md)
2. Consulta el [Checklist](./CHECKLIST_INSTALACION.md)
3. Revisa la tabla de problemas comunes en la guía
4. Consulta la [documentación de Supabase](https://supabase.com/docs)

---

## ⭐ Créditos

Desarrollado con:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**¿Listo para empezar?** 👉 Lee [RESUMEN_INSTALACION.md](./RESUMEN_INSTALACION.md)
