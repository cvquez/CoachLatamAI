import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ForgotPasswordPage from '@/app/forgot-password/page'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Mock useToast - Standard pattern using jest.fn returned directly, then spying isn't easy via variable.
// Instead, we mock it to return a known mock function we can track?
// Best way:
const mockToastFn = jest.fn()
jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: mockToastFn })
}))
// Wait, hoisting prevents access to mockToastFn variable?
// YES.
// Solution:
/*
jest.mock('@/hooks/use-toast', () => {
    return {
        useToast: jest.fn(() => ({
            toast: jest.fn(),
        })),
    }
})
*/
// Then in test: import { useToast } from ...; (useToast() as any).toast... ?
// Simplified:
jest.mock('@/hooks/use-toast', () => ({
    useToast: jest.fn(),
}))

const mockSupabase = createClient() as jest.Mocked<ReturnType<typeof createClient>>
let mockToast: jest.Mock

describe('ForgotPasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockToast = jest.fn()
            ; (useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    })

    it('renders correctly', () => {
        render(<ForgotPasswordPage />)
        expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument()
    })

    it('validates invalid email', async () => {
        render(<ForgotPasswordPage />)

        const input = screen.getByLabelText(/email/i)
        const btn = screen.getByRole('button', { name: /enviar/i })

        fireEvent.change(input, { target: { value: 'invalid-email' } })
        fireEvent.click(btn)

        // Zod validation should prevent Supabase call
        await waitFor(() => {
            expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled()
        })

        expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled()
    })

    it('calls resetPasswordForEmail with correct redirect', async () => {
        (mockSupabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
            data: {},
            error: null
        })

        render(<ForgotPasswordPage />)

        const input = screen.getByLabelText(/email/i)
        const btn = screen.getByRole('button', { name: /enviar/i })

        fireEvent.change(input, { target: { value: 'valid@example.com' } })
        fireEvent.click(btn)

        await waitFor(() => {
            expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
                'valid@example.com',
                expect.objectContaining({
                    redirectTo: expect.stringContaining('/auth/callback?next=/reset-password')
                })
            )
        })
    })

    it('handles server error', async () => {
        (mockSupabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
            data: {},
            error: { message: 'Server error' }
        })

        render(<ForgotPasswordPage />)

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'valid@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

        await waitFor(() => {
            expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalled()
        })
    })
})
