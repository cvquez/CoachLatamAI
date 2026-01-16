-- ============================================================================
-- MIGRATION: Seguridad de Suscripciones PayPal
-- Fecha: 2026-01-13
-- Descripción: Añade RLS, índices y funciones RPC para manejo seguro de suscripciones
-- ============================================================================

-- 1. HABILITAR RLS EN TABLA SUBSCRIPTIONS
-- ============================================================================
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. CREAR POLÍTICAS RLS PARA SUBSCRIPTIONS
-- ============================================================================

-- Los usuarios pueden ver solo sus propias suscripciones
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar solo sus propias suscripciones
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar solo sus propias suscripciones
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índice único para PayPal subscription ID (previene duplicados)
DROP INDEX IF EXISTS idx_subscriptions_paypal_id;
CREATE UNIQUE INDEX idx_subscriptions_paypal_id
  ON public.subscriptions(paypal_subscription_id);

-- Índice para búsquedas por usuario y status
DROP INDEX IF EXISTS idx_subscriptions_user_status;
CREATE INDEX idx_subscriptions_user_status
  ON public.subscriptions(user_id, status)
  WHERE status IN ('active', 'suspended');

-- Índice para búsquedas por fecha de siguiente cobro
DROP INDEX IF EXISTS idx_subscriptions_next_billing;
CREATE INDEX idx_subscriptions_next_billing
  ON public.subscriptions(next_billing_date)
  WHERE status = 'active' AND next_billing_date IS NOT NULL;

-- 4. CREAR TABLA DE AUDITORÍA PARA OPERACIONES ADMIN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT
);

-- Habilitar RLS en audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Solo super admins pueden ver el audit log
CREATE POLICY "Only admins can view audit log" ON public.admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- 5. FUNCIÓN RPC PARA CREAR SUSCRIPCIÓN (TRANSACCIÓN ATÓMICA)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_subscription_atomic(
  p_user_id UUID,
  p_paypal_subscription_id TEXT,
  p_paypal_plan_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_subscription_id UUID;
  v_result JSONB;
BEGIN
  -- Validar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  -- Validar que no exista ya una suscripción activa para este PayPal ID
  IF EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE paypal_subscription_id = p_paypal_subscription_id
  ) THEN
    RAISE EXCEPTION 'Suscripción PayPal ya existe';
  END IF;

  -- Insertar suscripción
  INSERT INTO public.subscriptions (
    user_id,
    paypal_subscription_id,
    paypal_plan_id,
    status,
    start_date,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_paypal_subscription_id,
    p_paypal_plan_id,
    'active',
    NOW(),
    NOW(),
    NOW()
  ) RETURNING id INTO v_subscription_id;

  -- Actualizar estado de suscripción del usuario
  UPDATE public.users
  SET
    subscription_status = 'active',
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log de auditoría
  INSERT INTO public.admin_audit_log (operation, user_id, details)
  VALUES (
    'create_subscription',
    p_user_id,
    jsonb_build_object(
      'subscription_id', v_subscription_id,
      'paypal_subscription_id', p_paypal_subscription_id,
      'paypal_plan_id', p_paypal_plan_id
    )
  );

  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'subscription_id', v_subscription_id,
    'message', 'Suscripción creada exitosamente'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback automático por el manejo de excepciones de PostgreSQL
    RAISE EXCEPTION 'Error creando suscripción: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCIÓN RPC PARA CANCELAR SUSCRIPCIÓN (TRANSACCIÓN ATÓMICA)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cancel_subscription_atomic(
  p_user_id UUID,
  p_paypal_subscription_id TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_subscription_id UUID;
  v_result JSONB;
BEGIN
  -- Verificar que la suscripción existe y pertenece al usuario
  SELECT id INTO v_subscription_id
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND paypal_subscription_id = p_paypal_subscription_id
    AND status = 'active';

  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Suscripción no encontrada o ya cancelada';
  END IF;

  -- Actualizar suscripción
  UPDATE public.subscriptions
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = v_subscription_id;

  -- Actualizar estado del usuario
  UPDATE public.users
  SET
    subscription_status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log de auditoría
  INSERT INTO public.admin_audit_log (operation, user_id, details)
  VALUES (
    'cancel_subscription',
    p_user_id,
    jsonb_build_object(
      'subscription_id', v_subscription_id,
      'paypal_subscription_id', p_paypal_subscription_id,
      'reason', p_reason
    )
  );

  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'subscription_id', v_subscription_id,
    'message', 'Suscripción cancelada exitosamente'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error cancelando suscripción: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN RPC PARA ACTUALIZAR ESTADO DE SUSCRIPCIÓN (WEBHOOK)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_subscription_status_webhook(
  p_paypal_subscription_id TEXT,
  p_status TEXT,
  p_next_billing_date TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_subscription_id UUID;
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Validar que el status sea válido
  IF p_status NOT IN ('active', 'cancelled', 'suspended', 'expired') THEN
    RAISE EXCEPTION 'Status inválido: %', p_status;
  END IF;

  -- Buscar la suscripción
  SELECT id, user_id INTO v_subscription_id, v_user_id
  FROM public.subscriptions
  WHERE paypal_subscription_id = p_paypal_subscription_id;

  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Suscripción no encontrada: %', p_paypal_subscription_id;
  END IF;

  -- Actualizar suscripción
  UPDATE public.subscriptions
  SET
    status = p_status,
    next_billing_date = COALESCE(p_next_billing_date, next_billing_date),
    cancelled_at = CASE
      WHEN p_status IN ('cancelled', 'expired') THEN NOW()
      ELSE cancelled_at
    END,
    updated_at = NOW()
  WHERE id = v_subscription_id;

  -- Actualizar estado del usuario
  UPDATE public.users
  SET
    subscription_status = p_status,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Log de auditoría
  INSERT INTO public.admin_audit_log (operation, user_id, details)
  VALUES (
    'webhook_update_subscription',
    v_user_id,
    jsonb_build_object(
      'subscription_id', v_subscription_id,
      'paypal_subscription_id', p_paypal_subscription_id,
      'new_status', p_status,
      'next_billing_date', p_next_billing_date
    )
  );

  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'subscription_id', v_subscription_id,
    'user_id', v_user_id,
    'message', 'Suscripción actualizada exitosamente'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error actualizando suscripción: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. GRANTS Y PERMISOS
-- ============================================================================

-- Permitir ejecución de funciones RPC a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.create_subscription_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_subscription_atomic TO authenticated;

-- La función de webhook solo debe ser ejecutable por service role
GRANT EXECUTE ON FUNCTION public.update_subscription_status_webhook TO service_role;
REVOKE EXECUTE ON FUNCTION public.update_subscription_status_webhook FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_subscription_status_webhook FROM anon;

-- 9. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON FUNCTION public.create_subscription_atomic IS
  'Crea una suscripción de manera atómica, actualizando tanto subscriptions como users en una sola transacción';

COMMENT ON FUNCTION public.cancel_subscription_atomic IS
  'Cancela una suscripción de manera atómica, verificando ownership y actualizando ambas tablas';

COMMENT ON FUNCTION public.update_subscription_status_webhook IS
  'Actualiza el estado de una suscripción desde un webhook de PayPal. SOLO PARA SERVICE ROLE.';

COMMENT ON TABLE public.admin_audit_log IS
  'Registro de auditoría para operaciones administrativas sensibles';
