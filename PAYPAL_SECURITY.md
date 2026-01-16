# 🔐 Guía de Seguridad PayPal - CoachLatamAI

## ⚠️ ACCIÓN INMEDIATA REQUERIDA

Si actualmente tienes credenciales de PayPal en tu archivo `.env.local` y has commiteado ese archivo a Git alguna vez:

### 🚨 Pasos Urgentes:

1. **Verificar historial de Git:**
   ```bash
   git log --all --full-history --source -- "*.env*"
   ```

2. **Si encuentras archivos .env en el historial:**
   - ✅ Considera las credenciales **COMPROMETIDAS**
   - ✅ Rota TODAS las credenciales INMEDIATAMENTE
   - ✅ Revisa logs de PayPal para actividad sospechosa

3. **Rotar credenciales de PayPal:**
   - Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Elimina las apps comprometidas
   - Crea nuevas apps con nuevas credenciales
   - Actualiza tus variables de entorno

---

## 📋 Tabla de Contenidos

1. [Configuración Segura](#configuración-segura)
2. [Verificación de Webhooks](#verificación-de-webhooks)
3. [Manejo de Transacciones](#manejo-de-transacciones)
4. [Migración de Base de Datos](#migración-de-base-de-datos)
5. [Monitoreo y Alertas](#monitoreo-y-alertas)
6. [Checklist de Producción](#checklist-de-producción)

---

## 1. Configuración Segura

### Variables de Entorno

**✅ HACER:**
- Usar credenciales de Sandbox en desarrollo
- Configurar variables en plataforma de hosting (Vercel/Netlify)
- Separar credenciales por entorno (dev/staging/prod)
- Habilitar verificación de webhook en producción

**❌ NO HACER:**
- Commitear archivos .env a Git
- Usar credenciales de producción en desarrollo
- Compartir credenciales por email/chat
- Hardcodear secrets en código

### Archivo .env.local (Desarrollo)

```bash
# DESARROLLO - SANDBOX
NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_sandbox_client_id
PAYPAL_CLIENT_SECRET=tu_sandbox_client_secret
NEXT_PUBLIC_PAYPAL_PLAN_ID=P-SANDBOX-PLAN-ID
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=tu_sandbox_webhook_id

# Permitir bypass de verificación solo en desarrollo
PAYPAL_WEBHOOK_BYPASS=true
```

### Variables en Producción (Vercel/Netlify)

```bash
# PRODUCCIÓN - LIVE
NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_live_client_id
PAYPAL_CLIENT_SECRET=tu_live_client_secret
NEXT_PUBLIC_PAYPAL_PLAN_ID=P-LIVE-PLAN-ID
PAYPAL_API_BASE=https://api-m.paypal.com
PAYPAL_WEBHOOK_ID=tu_live_webhook_id

# IMPORTANTE: NO incluir PAYPAL_WEBHOOK_BYPASS o establecerlo en false
# PAYPAL_WEBHOOK_BYPASS=false
```

---

## 2. Verificación de Webhooks

### ¿Por qué es crítico?

Sin verificación, un atacante puede:
- Enviar webhooks falsos a tu endpoint
- Activar suscripciones sin pagar
- Cancelar suscripciones de otros usuarios
- Modificar estados de facturación

### Implementación

El webhook ahora verifica la firma de PayPal usando el API oficial:

```typescript
// app/api/webhooks/paypal/route.ts

// ✅ Verificación real implementada
const isValid = await verifyPayPalWebhook(
  request.headers,
  body,
  process.env.PAYPAL_WEBHOOK_ID!
)

if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

### Configuración del Webhook en PayPal

1. **Ir a Dashboard:**
   - [Sandbox](https://developer.paypal.com/dashboard/applications/sandbox)
   - [Live](https://developer.paypal.com/dashboard/applications/live)

2. **Crear Webhook:**
   - Apps & Credentials > Tu App > Webhooks
   - URL: `https://tu-dominio.com/api/webhooks/paypal`
   - Seleccionar eventos:
     - `BILLING.SUBSCRIPTION.CREATED`
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.UPDATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `BILLING.SUBSCRIPTION.SUSPENDED`
     - `BILLING.SUBSCRIPTION.EXPIRED`
     - `PAYMENT.SALE.COMPLETED`

3. **Copiar Webhook ID:**
   - Guardar el ID en `PAYPAL_WEBHOOK_ID`

### Testing del Webhook

```bash
# Usar PayPal Webhook Simulator
# https://developer.paypal.com/dashboard/webhooks/simulate

# O usar curl para testing local (solo desarrollo con BYPASS habilitado)
curl -X POST https://tu-app.com/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
    "resource": {
      "id": "I-SUBSCRIPTION-ID"
    }
  }'
```

---

## 3. Manejo de Transacciones

### Funciones RPC Atómicas

Para prevenir race conditions y inconsistencias de datos, se crearon funciones SQL que ejecutan operaciones en transacciones atómicas:

#### `create_subscription_atomic`

```sql
-- Crea suscripción y actualiza usuario en una sola transacción
SELECT create_subscription_atomic(
  'user-uuid',
  'I-PAYPAL-SUBSCRIPTION-ID',
  'P-PLAN-ID'
);
```

**Garantías:**
- ✅ Ambas tablas se actualizan o ninguna
- ✅ Previene duplicados (índice único en paypal_subscription_id)
- ✅ Rollback automático en caso de error
- ✅ Logging de auditoría

#### `cancel_subscription_atomic`

```sql
-- Cancela suscripción y actualiza usuario atómicamente
SELECT cancel_subscription_atomic(
  'user-uuid',
  'I-PAYPAL-SUBSCRIPTION-ID',
  'User requested cancellation'
);
```

#### `update_subscription_status_webhook`

```sql
-- Solo para webhooks (service role)
SELECT update_subscription_status_webhook(
  'I-PAYPAL-SUBSCRIPTION-ID',
  'cancelled',
  NULL
);
```

### Flujo de Creación de Suscripción

```
1. Usuario aprueba en PayPal
   ↓
2. Frontend recibe callback onApprove
   ↓
3. Llama a create_subscription_atomic
   ↓
4. Si falla la BD, cancela en PayPal (rollback)
   ↓
5. Si todo OK, redirige a dashboard
```

### Flujo de Cancelación

```
1. Usuario solicita cancelación
   ↓
2. Backend cancela en PayPal primero
   ↓
3. Si falla PayPal, retorna error (no actualiza BD)
   ↓
4. Si OK, llama a cancel_subscription_atomic
   ↓
5. Si falla BD, intenta reactivar en PayPal (rollback)
```

---

## 4. Migración de Base de Datos

### Aplicar la Migración

**Opción 1: Supabase CLI**
```bash
# Navegar a la carpeta del proyecto
cd coachlatamai

# Aplicar migración
supabase db push

# O aplicar archivo específico
supabase db execute --file supabase/migrations/20260113_add_subscription_security.sql
```

**Opción 2: Supabase Dashboard**
1. Ir a SQL Editor
2. Copiar contenido de `supabase/migrations/20260113_add_subscription_security.sql`
3. Ejecutar

**Opción 3: Manual desde psql**
```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f supabase/migrations/20260113_add_subscription_security.sql
```

### Verificar la Migración

```sql
-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'subscriptions';

-- Verificar políticas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'subscriptions';

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'subscriptions';

-- Verificar funciones RPC
SELECT proname, prokind, prosecdef
FROM pg_proc
WHERE proname LIKE '%subscription%';
```

### Rollback (si es necesario)

```sql
-- Deshabilitar RLS
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

-- Eliminar índices
DROP INDEX IF EXISTS idx_subscriptions_paypal_id;
DROP INDEX IF EXISTS idx_subscriptions_user_status;
DROP INDEX IF EXISTS idx_subscriptions_next_billing;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.create_subscription_atomic;
DROP FUNCTION IF EXISTS public.cancel_subscription_atomic;
DROP FUNCTION IF EXISTS public.update_subscription_status_webhook;

-- Eliminar tabla de auditoría
DROP TABLE IF EXISTS public.admin_audit_log;
```

---

## 5. Monitoreo y Alertas

### Logs de Auditoría

Todas las operaciones de suscripción se registran en `admin_audit_log`:

```sql
-- Ver últimas operaciones
SELECT
  operation,
  user_id,
  details,
  timestamp
FROM admin_audit_log
ORDER BY timestamp DESC
LIMIT 50;

-- Operaciones sospechosas
SELECT
  operation,
  COUNT(*) as count,
  MIN(timestamp) as first_occurrence,
  MAX(timestamp) as last_occurrence
FROM admin_audit_log
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY operation;
```

### Monitoreo de PayPal

1. **Dashboard de PayPal:**
   - Revisar transacciones diarias
   - Verificar disputas/chargebacks
   - Monitorear webhooks fallidos

2. **Alertas Recomendadas:**
   - Email en cada nueva suscripción
   - Email en cada cancelación
   - Alerta si webhook falla 3+ veces
   - Alerta si hay más de 10 suscripciones en 1 hora (posible fraude)

### Consultas SQL Útiles

```sql
-- Suscripciones activas
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';

-- Suscripciones sin usuario (inconsistencia)
SELECT * FROM subscriptions s
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = s.user_id);

-- Usuarios con múltiples suscripciones activas (debería ser 0)
SELECT user_id, COUNT(*) as count
FROM subscriptions
WHERE status = 'active'
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Suscripciones próximas a renovar
SELECT
  s.user_id,
  u.email,
  s.paypal_subscription_id,
  s.next_billing_date
FROM subscriptions s
JOIN users u ON u.id = s.user_id
WHERE s.status = 'active'
  AND s.next_billing_date <= NOW() + INTERVAL '7 days'
ORDER BY s.next_billing_date;
```

---

## 6. Checklist de Producción

### Antes de Lanzar

- [ ] **Credenciales rotadas** (si se commitearon a Git)
- [ ] **Variables de entorno** configuradas en plataforma de hosting
- [ ] **Migración de BD** aplicada y verificada
- [ ] **RLS habilitado** en tabla subscriptions
- [ ] **Webhook configurado** en PayPal Live
- [ ] **Verificación de webhook** habilitada (PAYPAL_WEBHOOK_BYPASS no presente o false)
- [ ] **Testing completo** de flujos de suscripción
- [ ] **Testing de webhooks** con PayPal Simulator
- [ ] **Logs de auditoría** funcionando
- [ ] **Alertas configuradas** (email/Slack)

### Configuración de Producción

```bash
# .env.production (configurar en hosting)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AZK6MSzW...  # Live Client ID
PAYPAL_CLIENT_SECRET=ENBKtAsU...          # Live Client Secret
NEXT_PUBLIC_PAYPAL_PLAN_ID=P-79V996...   # Live Plan ID
PAYPAL_API_BASE=https://api-m.paypal.com # Live API
PAYPAL_WEBHOOK_ID=6YL85...                # Live Webhook ID

# NO incluir:
# PAYPAL_WEBHOOK_BYPASS=false  # Debe estar ausente o false
```

### Testing Post-Deployment

```bash
# 1. Verificar que webhook está accesible
curl -I https://tu-dominio.com/api/webhooks/paypal

# 2. Probar con PayPal Webhook Simulator
# Dashboard > Webhooks > Tu webhook > Simulate

# 3. Crear suscripción de prueba con tarjeta de sandbox
# 4. Verificar en BD que se creó correctamente
# 5. Cancelar suscripción de prueba
# 6. Verificar que se actualizó en BD
```

### Monitoreo Post-Lanzamiento

**Primeras 24 horas:**
- Revisar logs cada 2 horas
- Verificar que webhooks llegan correctamente
- Monitorear tabla admin_audit_log
- Verificar que no hay errores 500 en logs

**Primera semana:**
- Revisar logs diariamente
- Verificar consistencia de datos (SQL queries arriba)
- Revisar disputas en PayPal Dashboard
- Verificar que las renovaciones automáticas funcionan

**Mantenimiento continuo:**
- Revisar logs semanalmente
- Rotar credenciales cada 90 días
- Actualizar dependencias mensualmente
- Revisar logs de auditoría mensualmente

---

## 🆘 Resolución de Problemas

### Webhook no recibe eventos

**Causas comunes:**
1. URL incorrecta en PayPal
2. SSL/HTTPS no configurado
3. Firewall bloqueando IPs de PayPal
4. Endpoint retorna error (verificar logs)

**Solución:**
```bash
# Verificar URL accesible
curl -I https://tu-dominio.com/api/webhooks/paypal

# Ver logs de webhook en PayPal Dashboard
# Applications > Tu App > Webhooks > Tu webhook > Recent deliveries
```

### Verificación de firma falla

**Causas:**
1. PAYPAL_WEBHOOK_ID incorrecto
2. Credenciales no coinciden con entorno
3. Timestamp del servidor desincronizado

**Solución:**
```bash
# Verificar que webhook ID es correcto
echo $PAYPAL_WEBHOOK_ID

# Sincronizar reloj del servidor
sudo ntpdate pool.ntp.org
```

### Suscripción en PayPal pero no en BD

**Causa:** Fallo en create_subscription_atomic

**Solución:**
```sql
-- 1. Buscar en admin_audit_log
SELECT * FROM admin_audit_log
WHERE details->>'paypal_subscription_id' = 'I-SUBSCRIPTION-ID';

-- 2. Si no existe, crear manualmente
SELECT create_subscription_atomic(
  'user-uuid',
  'I-SUBSCRIPTION-ID',
  'P-PLAN-ID'
);
```

### Suscripción cancelada en PayPal pero activa en BD

**Causa:** Webhook no llegó o falló

**Solución:**
```sql
-- Actualizar manualmente (como service role)
SELECT update_subscription_status_webhook(
  'I-SUBSCRIPTION-ID',
  'cancelled'
);
```

---

## 📚 Referencias

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Webhooks Guide](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [PayPal Subscription API](https://developer.paypal.com/docs/subscriptions/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)

---

## 🔐 Contacto de Emergencia

Si detectas actividad sospechosa o comprometimiento de credenciales:

1. **Rota credenciales inmediatamente** en PayPal Dashboard
2. **Suspende webhooks** temporalmente
3. **Revisa logs** de transacciones en PayPal
4. **Contacta soporte PayPal** si hay transacciones no autorizadas
5. **Revisa admin_audit_log** para actividad anómala

---

**Última actualización:** 2026-01-13
**Versión:** 1.0.0
