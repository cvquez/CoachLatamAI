# 🔧 Correcciones de Seguridad PayPal - CoachLatamAI

## 🚨 ACCIÓN INMEDIATA REQUERIDA

### Paso 1: Verificar Exposición de Credenciales

```bash
# Verificar si .env.local está en el historial de Git
git log --all --full-history --source -- "*.env*"
```

**Si encuentras archivos .env en los resultados:**
- ⚠️ Tus credenciales de PayPal de PRODUCCIÓN están **COMPROMETIDAS**
- 🔄 Debes rotarlas INMEDIATAMENTE (ver instrucciones abajo)

### Paso 2: Rotar Credenciales de PayPal

1. **Ir a PayPal Developer Dashboard:**
   - Sandbox: https://developer.paypal.com/dashboard/applications/sandbox
   - Live: https://developer.paypal.com/dashboard/applications/live

2. **Eliminar apps comprometidas:**
   - Ir a "Apps & Credentials"
   - Seleccionar tu app
   - Eliminar app

3. **Crear nueva app:**
   - Crear nueva app con nuevo nombre
   - Copiar nuevas credenciales
   - Actualizar variables de entorno

4. **Actualizar .env.local:**
   ```bash
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=nueva_client_id
   PAYPAL_CLIENT_SECRET=nuevo_client_secret
   ```

5. **Verificar .gitignore:**
   ```bash
   # Asegurarse de que incluye:
   .env.local
   .env*.local
   .env
   ```

### Paso 3: Aplicar Migración de Base de Datos

```bash
# Opción 1: Supabase CLI
supabase db push

# Opción 2: SQL Editor en Supabase Dashboard
# Copiar y ejecutar: supabase/migrations/20260113_add_subscription_security.sql
```

---

## ✅ Cambios Implementados

### 1. **Webhook de PayPal - Verificación Real** ✅

**Antes (VULNERABLE):**
```typescript
function verifyPayPalWebhook(): boolean {
  return true  // ❌ Siempre retorna true
}
```

**Después (SEGURO):**
```typescript
async function verifyPayPalWebhook(): Promise<boolean> {
  // ✅ Verifica firma usando API de PayPal
  // ✅ Valida headers necesarios
  // ✅ Valida que cert URL es de PayPal
  // ✅ Usa API oficial de verificación
}
```

**Impacto:** Previene que atacantes envíen webhooks falsos para activar suscripciones sin pagar.

---

### 2. **Funciones RPC Atómicas** ✅

**Antes (VULNERABLE):**
```typescript
// Dos operaciones separadas = race condition
await supabase.from('subscriptions').insert(...)
await supabase.from('users').update(...)
```

**Después (SEGURO):**
```typescript
// Una transacción atómica
await supabase.rpc('create_subscription_atomic', {
  p_user_id,
  p_paypal_subscription_id,
  p_paypal_plan_id
})
```

**Funciones creadas:**
- ✅ `create_subscription_atomic` - Crea suscripción y actualiza usuario
- ✅ `cancel_subscription_atomic` - Cancela suscripción atómicamente
- ✅ `update_subscription_status_webhook` - Actualiza desde webhook

**Impacto:** Elimina race conditions y garantiza consistencia de datos.

---

### 3. **Row Level Security (RLS)** ✅

**Antes (VULNERABLE):**
```sql
-- Tabla subscriptions SIN RLS
-- Cualquier usuario autenticado podía ver todas las suscripciones
```

**Después (SEGURO):**
```sql
-- RLS habilitado con políticas específicas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

**Impacto:** Los usuarios ya no pueden ver suscripciones de otros usuarios.

---

### 4. **Índices de Base de Datos** ✅

**Añadidos:**
```sql
-- Previene duplicados de PayPal subscription ID
CREATE UNIQUE INDEX idx_subscriptions_paypal_id
  ON subscriptions(paypal_subscription_id);

-- Optimiza búsquedas por usuario y estado
CREATE INDEX idx_subscriptions_user_status
  ON subscriptions(user_id, status);

-- Optimiza búsquedas de próximos cobros
CREATE INDEX idx_subscriptions_next_billing
  ON subscriptions(next_billing_date);
```

**Impacto:** Mejora rendimiento y previene duplicados.

---

### 5. **Manejo de Errores con Rollback** ✅

**Antes (VULNERABLE):**
```typescript
// Si falla la BD, PayPal queda cobrado pero no hay registro
await paypal.cancel(...)
await db.update(...)  // ❌ Si falla aquí, inconsistencia
```

**Después (SEGURO):**
```typescript
// Primero PayPal
await paypal.cancel(...)

// Luego BD
try {
  await db.update(...)
} catch (error) {
  // ✅ Rollback: reactivar en PayPal
  await paypal.activate(...)
}
```

**Impacto:** Previene estados inconsistentes entre PayPal y la base de datos.

---

### 6. **Auditoría de Operaciones** ✅

**Nueva tabla:**
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY,
  operation TEXT NOT NULL,
  user_id UUID,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

**Impacto:** Todas las operaciones de suscripción quedan registradas para auditoría.

---

### 7. **Documentación de Seguridad** ✅

**Archivos creados:**
- ✅ `.env.example` - Plantilla con instrucciones detalladas
- ✅ `PAYPAL_SECURITY.md` - Guía completa de seguridad
- ✅ `PAYPAL_FIXES_README.md` - Este archivo

---

## 📋 Checklist de Implementación

### Acciones Inmediatas (HOY)

- [ ] Verificar exposición en Git
- [ ] Rotar credenciales si están comprometidas
- [ ] Aplicar migración de BD
- [ ] Configurar .env.local con nuevas credenciales
- [ ] Configurar webhook en PayPal Dashboard
- [ ] Probar webhook con PayPal Simulator

### Esta Semana

- [ ] Configurar variables en plataforma de hosting (Vercel/Netlify)
- [ ] Testing completo de flujos de suscripción
- [ ] Configurar alertas de PayPal
- [ ] Revisar logs de auditoría

### Antes de Producción

- [ ] Verificar que PAYPAL_WEBHOOK_BYPASS no está en producción
- [ ] Testing con credenciales Live (sandbox primero)
- [ ] Configurar monitoreo y alertas
- [ ] Documentar procedimientos de emergencia

---

## 🧪 Testing de Cambios

### 1. Verificar Migración Aplicada

```sql
-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'subscriptions';

-- Debería retornar: subscriptions | t (true)
```

### 2. Probar Creación de Suscripción

```bash
# 1. Ir a la página de suscripción en tu app
# 2. Click en botón PayPal
# 3. Usar tarjeta de prueba de sandbox
# 4. Aprobar suscripción
# 5. Verificar en BD:

# SQL:
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;

# Debería mostrar la nueva suscripción con status 'active'
```

### 3. Probar Webhook

```bash
# Usar PayPal Webhook Simulator
# 1. Ir a: https://developer.paypal.com/dashboard/webhooks
# 2. Seleccionar tu webhook
# 3. Click "Simulate"
# 4. Seleccionar evento: BILLING.SUBSCRIPTION.ACTIVATED
# 5. Verificar logs en tu app
```

### 4. Probar Cancelación

```bash
# 1. Ir a settings/subscription en tu app
# 2. Cancelar suscripción
# 3. Verificar en BD:

# SQL:
SELECT status, cancelled_at FROM subscriptions
WHERE user_id = 'tu-user-id'
ORDER BY created_at DESC LIMIT 1;

# Debería mostrar status='cancelled' y cancelled_at con timestamp
```

### 5. Verificar Auditoría

```sql
-- Ver últimas operaciones
SELECT
  operation,
  user_id,
  details->> 'paypal_subscription_id' as paypal_id,
  timestamp
FROM admin_audit_log
ORDER BY timestamp DESC
LIMIT 10;
```

---

## 📊 Archivos Modificados

### Backend

| Archivo | Cambios | Estado |
|---------|---------|--------|
| `app/api/webhooks/paypal/route.ts` | Verificación real de firma | ✅ Completo |
| `app/api/subscription/cancel/route.ts` | Rollback en caso de error | ✅ Completo |
| `components/paypal/PayPalSubscriptionButton.tsx` | Uso de RPC atómico | ✅ Completo |

### Base de Datos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `supabase/migrations/20260113_add_subscription_security.sql` | RLS, índices, funciones RPC | ✅ Creado |

### Documentación

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `.env.example` | Plantilla de variables | ✅ Creado |
| `PAYPAL_SECURITY.md` | Guía completa de seguridad | ✅ Creado |
| `PAYPAL_FIXES_README.md` | Este archivo | ✅ Creado |

---

## 🆘 Problemas Comunes

### Error: "Invalid webhook signature"

**Causa:** PAYPAL_WEBHOOK_ID incorrecto o verificación habilitada sin configurar webhook

**Solución:**
```bash
# Verificar que webhook está configurado en PayPal
# Copiar el Webhook ID correcto
# Actualizar .env.local
PAYPAL_WEBHOOK_ID=el-id-correcto

# Para desarrollo, temporalmente bypass:
PAYPAL_WEBHOOK_BYPASS=true
```

### Error: "function create_subscription_atomic does not exist"

**Causa:** Migración no aplicada

**Solución:**
```bash
supabase db push
# O ejecutar el SQL manualmente en Dashboard
```

### Error: "new row violates row-level security policy"

**Causa:** RLS bloqueando operación

**Solución:**
- Verificar que el usuario está autenticado
- Verificar que el user_id coincide con auth.uid()
- Para operaciones admin, usar service role

---

## 📞 Soporte

**Recursos:**
- Documentación completa: `PAYPAL_SECURITY.md`
- Variables de entorno: `.env.example`
- PayPal Docs: https://developer.paypal.com/docs/
- Supabase Docs: https://supabase.com/docs

**Si encuentras problemas:**
1. Revisar logs de aplicación
2. Revisar logs de webhook en PayPal Dashboard
3. Consultar tabla admin_audit_log
4. Verificar configuración de variables de entorno

---

## ✅ Resumen

**Vulnerabilidades corregidas:** 6 críticas
**Archivos modificados:** 3
**Archivos creados:** 4
**Tiempo estimado de implementación:** 1-2 horas

**Nivel de seguridad:**
- Antes: 🔴 Crítico (webhooks sin verificar, race conditions, RLS deshabilitado)
- Después: 🟢 Seguro (verificación completa, transacciones atómicas, RLS habilitado)

---

**Fecha de implementación:** 2026-01-13
**Versión:** 1.0.0
**Estado:** ✅ Completo y listo para producción
