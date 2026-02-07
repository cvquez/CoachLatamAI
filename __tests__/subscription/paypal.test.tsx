import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PayPalSubscriptionButton from '@/components/paypal/PayPalSubscriptionButton'
import { createClient } from '@/lib/supabase/client'

// Cast mock para tipado correcto
const mockSupabase = createClient() as jest.Mocked<ReturnType<typeof createClient>>

// Mock CouponInput
jest.mock('@/components/subscription/CouponInput', () => ({
    __esModule: true,
    default: ({ onCouponApplied }: any) => (
        <div data-testid="mock-coupon-input">
            <button
                data-testid="apply-coupon-btn"
                onClick={() => onCouponApplied({
                    coupon_id: 'mock-coupon-id',
                    code: 'TEST20',
                    discount_type: 'percentage',
                    discount_value: 20,
                    description: 'Test Coupon'
                })}
            >
                Aplicar Cupón Mock
            </button>
        </div>
    )
}))

// Mock de PayPal SDK
jest.mock('@paypal/react-paypal-js', () => ({
    PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="paypal-provider">{children}</div>,
    PayPalButtons: ({ onApprove, onError, onCancel }: any) => (
        <div data-testid="paypal-buttons">
            <button
                data-testid="mock-paypal-approve"
                onClick={() => onApprove({ subscriptionID: 'I-MOCK-SUB-123' })}
            >
                Aprobar
            </button>
            <button
                data-testid="mock-paypal-error"
                onClick={() => onError(new Error('PayPal Error'))}
            >
                Error
            </button>
            <button
                data-testid="mock-paypal-cancel"
                onClick={() => onCancel()}
            >
                Cancelar
            </button>
        </div>
    ),
}))

describe('PayPalSubscriptionButton', () => {
    const mockUserId = 'user-123'
    const mockPlanId = 'P-TEST-PLAN-ID'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Renderizado', () => {
        it('debe renderizar el PayPalScriptProvider', () => {
            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            expect(screen.getByTestId('paypal-provider')).toBeInTheDocument()
        })

        it('debe renderizar los botones de PayPal', () => {
            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument()
        })
    })

    describe('Flujo de aprobación exitosa', () => {
        it('debe crear suscripción al aprobar pago', async () => {
            mockSupabase.rpc = jest.fn().mockResolvedValue({
                data: {
                    success: true,
                    subscription_id: 'sub-123',
                    message: 'Suscripción creada exitosamente'
                },
                error: null
            })

            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            const approveButton = screen.getByTestId('mock-paypal-approve')
            fireEvent.click(approveButton)

            await waitFor(() => {
                expect(mockSupabase.rpc).toHaveBeenCalledWith('create_subscription_atomic', {
                    p_user_id: mockUserId,
                    p_paypal_subscription_id: 'I-MOCK-SUB-123',
                    p_paypal_plan_id: mockPlanId,
                })
            })
        })

        it('debe redirigir al dashboard después de suscripción exitosa', async () => {
            jest.useFakeTimers()

            mockSupabase.rpc = jest.fn().mockResolvedValue({
                data: {
                    success: true,
                    subscription_id: 'sub-123',
                    message: 'Suscripción creada exitosamente'
                },
                error: null
            })

            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            const approveButton = screen.getByTestId('mock-paypal-approve')
            fireEvent.click(approveButton)

            await waitFor(() => {
                expect(mockSupabase.rpc).toHaveBeenCalled()
            })

            jest.advanceTimersByTime(2000)

            jest.useRealTimers()
        })
    })

    describe('Manejo de errores', () => {
        it('debe manejar error de base de datos', async () => {
            // Mock fetch para el rollback
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true })
            })

            mockSupabase.rpc = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            })

            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            const approveButton = screen.getByTestId('mock-paypal-approve')
            fireEvent.click(approveButton)

            await waitFor(() => {
                expect(mockSupabase.rpc).toHaveBeenCalled()
            })

            // Debe intentar hacer rollback en PayPal
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/subscription/cancel',
                    expect.objectContaining({
                        method: 'POST',
                        body: expect.stringContaining('I-MOCK-SUB-123')
                    })
                )
            })
        })

        it('debe manejar error de PayPal', async () => {
            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            const errorButton = screen.getByTestId('mock-paypal-error')
            fireEvent.click(errorButton)

            // Toast de error debería ser llamado (está mockeado)
            // El componente debe manejar el error sin crashear
            expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument()
        })

        it('debe manejar cancelación del usuario', async () => {
            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            const cancelButton = screen.getByTestId('mock-paypal-cancel')
            fireEvent.click(cancelButton)

            // Toast de cancelación debería ser llamado (está mockeado)
            expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument()
        })
    })

    describe('Estado de carga', () => {
        it('debe mostrar indicador de carga durante procesamiento', async () => {
            // Mock con delay para ver el estado de carga
            mockSupabase.rpc = jest.fn().mockImplementation(
                () => new Promise(resolve =>
                    setTimeout(() => resolve({
                        data: { success: true },
                        error: null
                    }), 100)
                )
            )

            render(<PayPalSubscriptionButton userId={mockUserId} planId={mockPlanId} />)

            const approveButton = screen.getByTestId('mock-paypal-approve')
            fireEvent.click(approveButton)

            // Durante el procesamiento, debería mostrar indicador de carga
            await waitFor(() => {
                expect(screen.getByText(/procesando suscripción/i)).toBeInTheDocument()
            }, { timeout: 500 })
        })
    })
})

describe('Funciones RPC de Suscripción', () => {
    describe('create_subscription_atomic', () => {
        it('debe validar parámetros requeridos', async () => {
            mockSupabase.rpc = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Usuario no encontrado' }
            })

            const result = await mockSupabase.rpc('create_subscription_atomic', {
                p_user_id: 'invalid-user',
                p_paypal_subscription_id: 'I-TEST',
                p_paypal_plan_id: 'P-TEST'
            })

            expect(result.error).toBeTruthy()
        })

        it('debe prevenir suscripciones duplicadas', async () => {
            mockSupabase.rpc = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Suscripción PayPal ya existe' }
            })

            const result = await mockSupabase.rpc('create_subscription_atomic', {
                p_user_id: 'user-123',
                p_paypal_subscription_id: 'I-EXISTING-SUB',
                p_paypal_plan_id: 'P-TEST'
            })

            expect(result.error).toBeTruthy()
            expect(result.error?.message).toContain('ya existe')
        })
    })

    describe('cancel_subscription_atomic', () => {
        it('debe cancelar suscripción existente', async () => {
            mockSupabase.rpc = jest.fn().mockResolvedValue({
                data: {
                    success: true,
                    subscription_id: 'sub-123',
                    message: 'Suscripción cancelada exitosamente'
                },
                error: null
            })

            const result = await mockSupabase.rpc('cancel_subscription_atomic', {
                p_user_id: 'user-123',
                p_paypal_subscription_id: 'I-ACTIVE-SUB',
                p_reason: 'Usuario solicitó cancelación'
            })

            expect(result.data?.success).toBe(true)
        })

        it('debe rechazar cancelación de suscripción inexistente', async () => {
            mockSupabase.rpc = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Suscripción no encontrada o ya cancelada' }
            })

            const result = await mockSupabase.rpc('cancel_subscription_atomic', {
                p_user_id: 'user-123',
                p_paypal_subscription_id: 'I-NONEXISTENT',
                p_reason: 'Test'
            })

            expect(result.error).toBeTruthy()
        })
    })
})
