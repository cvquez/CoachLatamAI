-- ============================================================================
-- MIGRATION: Sistema de Cupones y Planes de Suscripción
-- Fecha: 2026-01-26
-- Descripción: Añade tablas para cupones de descuento y planes de suscripción
-- ============================================================================

-- 1. TABLA DE PLANES DE SUSCRIPCIÓN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_plan_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly')) DEFAULT 'monthly',
  trial_days INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  max_clients INTEGER DEFAULT NULL, -- NULL = ilimitado
  max_sessions_per_month INTEGER DEFAULT NULL,
  ai_credits_per_month INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para planes
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.subscription_plans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_plans_paypal ON public.subscription_plans(paypal_plan_id);

-- 2. TABLA DE CUPONES DE DESCUENTO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER DEFAULT NULL, -- NULL = sin límite
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT NULL, -- NULL = sin expiración
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  applicable_plans UUID[] DEFAULT '{}', -- array vacío = aplica a todos
  first_time_only BOOLEAN DEFAULT FALSE, -- solo para nuevos usuarios
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para cupones
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active, valid_from, valid_until);

-- 3. TABLA DE USO DE CUPONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  discount_applied DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id) -- Un usuario solo puede usar un cupón una vez
);

-- Índice para uso de cupones
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON public.coupon_usage(user_id);

-- 4. HABILITAR RLS
-- ============================================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS PARA PLANES
-- ============================================================================

-- Todos pueden ver planes activos
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = TRUE);

-- Solo admins pueden modificar planes
DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
CREATE POLICY "Admins can manage plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 6. POLÍTICAS RLS PARA CUPONES
-- ============================================================================

-- Usuarios autenticados pueden ver cupones activos (para validar)
DROP POLICY IF EXISTS "Users can view active coupons" ON public.coupons;
CREATE POLICY "Users can view active coupons" ON public.coupons
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_active = TRUE
  );

-- Admins pueden gestionar todos los cupones
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 7. POLÍTICAS RLS PARA USO DE CUPONES
-- ============================================================================

-- Usuarios pueden ver su propio uso de cupones
DROP POLICY IF EXISTS "Users can view own coupon usage" ON public.coupon_usage;
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

-- El sistema puede insertar uso de cupones (vía RPC)
DROP POLICY IF EXISTS "System can insert coupon usage" ON public.coupon_usage;
CREATE POLICY "System can insert coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. FUNCIÓN PARA VALIDAR CUPÓN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_user_id UUID,
  p_plan_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
  v_already_used BOOLEAN;
  v_is_first_time BOOLEAN;
  v_result JSONB;
BEGIN
  -- Buscar cupón
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object(
      'valid', FALSE,
      'error', 'Cupón no válido, expirado o sin usos disponibles'
    );
  END IF;

  -- Verificar si ya fue usado por este usuario
  SELECT EXISTS (
    SELECT 1 FROM public.coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id
  ) INTO v_already_used;

  IF v_already_used THEN
    RETURN jsonb_build_object(
      'valid', FALSE,
      'error', 'Ya has utilizado este cupón anteriormente'
    );
  END IF;

  -- Verificar si es solo para primera suscripción
  IF v_coupon.first_time_only THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = p_user_id
    ) INTO v_is_first_time;

    IF NOT v_is_first_time THEN
      RETURN jsonb_build_object(
        'valid', FALSE,
        'error', 'Este cupón es solo para nuevos suscriptores'
      );
    END IF;
  END IF;

  -- Verificar si aplica al plan seleccionado
  IF p_plan_id IS NOT NULL AND array_length(v_coupon.applicable_plans, 1) > 0 THEN
    IF NOT (p_plan_id = ANY(v_coupon.applicable_plans)) THEN
      RETURN jsonb_build_object(
        'valid', FALSE,
        'error', 'Este cupón no aplica al plan seleccionado'
      );
    END IF;
  END IF;

  -- Cupón válido
  RETURN jsonb_build_object(
    'valid', TRUE,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'description', v_coupon.description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNCIÓN PARA APLICAR CUPÓN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.apply_coupon(
  p_coupon_id UUID,
  p_user_id UUID,
  p_subscription_id UUID,
  p_discount_applied DECIMAL(10,2)
) RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
BEGIN
  -- Verificar que el cupón existe
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
    AND is_active = TRUE;

  IF v_coupon IS NULL THEN
    RAISE EXCEPTION 'Cupón no encontrado o inactivo';
  END IF;

  -- Registrar uso del cupón
  INSERT INTO public.coupon_usage (
    coupon_id,
    user_id,
    subscription_id,
    discount_applied
  ) VALUES (
    p_coupon_id,
    p_user_id,
    p_subscription_id,
    p_discount_applied
  );

  -- Incrementar contador de usos
  UPDATE public.coupons
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = p_coupon_id;

  -- Registrar en audit log
  INSERT INTO public.admin_audit_log (operation, user_id, details)
  VALUES (
    'coupon_applied',
    p_user_id,
    jsonb_build_object(
      'coupon_id', p_coupon_id,
      'coupon_code', v_coupon.code,
      'subscription_id', p_subscription_id,
      'discount_applied', p_discount_applied
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Cupón aplicado exitosamente'
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Este cupón ya fue aplicado'
    );
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error aplicando cupón: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. TRIGGERS PARA UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS update_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.validate_coupon TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_coupon TO authenticated;

-- 12. DATOS INICIALES (PLANES EJEMPLO)
-- ============================================================================

INSERT INTO public.subscription_plans (paypal_plan_id, name, description, price, billing_interval, trial_days, features, display_order)
VALUES 
  ('P-BASIC-PLAN', 'Plan Básico', 'Perfecto para coaches que inician', 29.00, 'monthly', 7, 
   '["Hasta 10 clientes", "50 sesiones/mes", "AI Assistant básico", "Soporte por email"]'::jsonb, 1),
  ('P-PRO-PLAN', 'Plan Profesional', 'Para coaches establecidos', 59.00, 'monthly', 7,
   '["Clientes ilimitados", "Sesiones ilimitadas", "AI Assistant avanzado", "Marketplace visible", "Soporte prioritario"]'::jsonb, 2),
  ('P-ENTERPRISE-PLAN', 'Plan Empresa', 'Para equipos de coaching', 149.00, 'monthly', 14,
   '["Todo del Plan Pro", "Multi-usuario", "Analytics avanzados", "API access", "Account manager dedicado"]'::jsonb, 3)
ON CONFLICT (paypal_plan_id) DO NOTHING;

-- Cupón de bienvenida de ejemplo
INSERT INTO public.coupons (code, description, discount_type, discount_value, valid_until, first_time_only)
VALUES 
  ('BIENVENIDO20', 'Descuento de bienvenida para nuevos coaches', 'percentage', 20, NOW() + INTERVAL '1 year', TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================

COMMENT ON TABLE public.subscription_plans IS 'Planes de suscripción disponibles';
COMMENT ON TABLE public.coupons IS 'Cupones de descuento para suscripciones';
COMMENT ON TABLE public.coupon_usage IS 'Registro de uso de cupones por usuario';
COMMENT ON FUNCTION public.validate_coupon IS 'Valida si un código de cupón es válido para un usuario y plan';
COMMENT ON FUNCTION public.apply_coupon IS 'Registra el uso de un cupón en una suscripción';
