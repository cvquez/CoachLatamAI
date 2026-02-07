import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ResetPasswordPage from '@/app/reset-password/page'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
    useToast: jest.fn(),
}))

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

const mockSupabase = createClient() as jest.Mocked<ReturnType<typeof createClient>>
const mockPush = jest.fn()
let mockToast: jest.Mock

describe('ResetPasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockToast = jest.fn()
            ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
            ; (useToast as jest.Mock).mockReturnValue({ toast: mockToast })

            // Default valid session
            ; (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: { access_token: 'valid-token' } },
                error: null
            })
    })

    it('renders correctly', async () => {
        render(<ResetPasswordPage />)

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /nueva contraseña/i })).toBeInTheDocument()
        })
    })

    it('validates short password', async () => {
        render(<ResetPasswordPage />)

        await waitFor(() => expect(screen.queryByText(/verificando/i)).not.toBeInTheDocument())

        const passInput = screen.getByLabelText(/^nueva contraseña$/i)
        const confirmInput = screen.getByLabelText(/confirmar contraseña/i)
        const submitBtn = screen.getByRole('button', { name: /restablecer/i })

        fireEvent.change(passInput, { target: { value: '123' } })
        fireEvent.change(confirmInput, { target: { value: '123' } })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled()
        })
    })

    it('validates password complexity (no number)', async () => {
        render(<ResetPasswordPage />)

        await waitFor(() => expect(screen.queryByText(/verificando/i)).not.toBeInTheDocument())

        fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'passwordlong' } })
        fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'passwordlong' } })
        fireEvent.click(screen.getByRole('button', { name: /restablecer/i }))

        await waitFor(() => {
            expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled()
        })
    })

    it('validates password mismatch', async () => {
        render(<ResetPasswordPage />)

        await waitFor(() => expect(screen.queryByText(/verificando/i)).not.toBeInTheDocument())

        fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'ValidPass1!' } })
        fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'DifferentPass1!' } })
        fireEvent.click(screen.getByRole('button', { name: /restablecer/i }))

        await waitFor(() => {
            expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled()
        })
    })

    it('calls updateUser on valid submission', async () => {
        (mockSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
            data: { user: {} },
            error: null
        })

        render(<ResetPasswordPage />)

        await waitFor(() => expect(screen.queryByText(/verificando/i)).not.toBeInTheDocument())

        fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'ValidPass1!' } })
        fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'ValidPass1!' } })
        fireEvent.click(screen.getByRole('button', { name: /restablecer/i }))

        await waitFor(() => {
            expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
                password: 'ValidPass1!'
            })
        })
    })
})
