import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'
import { createClient } from '@/lib/supabase/client'

// Cast mock para tipado correcto
const mockSupabase = createClient() as jest.Mocked<ReturnType<typeof createClient>>

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Renderizado', () => {
        it('debe renderizar el formulario de login correctamente', () => {
            render(<LoginPage />)

            expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
        })

        it('debe mostrar el logo de CoachLatam', () => {
            render(<LoginPage />)

            expect(screen.getByText(/coachlatam/i)).toBeInTheDocument()
        })

        it('debe tener link a registro de coach y cliente', () => {
            render(<LoginPage />)

            expect(screen.getByText(/busco un coach/i)).toBeInTheDocument()
            expect(screen.getByText(/soy coach/i)).toBeInTheDocument()
        })

        it('debe tener link de olvidé contraseña', () => {
            render(<LoginPage />)

            expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument()
        })
    })

    describe('Validación de campos', () => {
        it('debe requerir email', async () => {
            render(<LoginPage />)

            const emailInput = screen.getByLabelText(/email/i)
            expect(emailInput).toBeRequired()
        })

        it('debe requerir contraseña', async () => {
            render(<LoginPage />)

            const passwordInput = screen.getByLabelText(/contraseña/i)
            expect(passwordInput).toBeRequired()
        })

        it('debe tener tipo email en el campo email', () => {
            render(<LoginPage />)

            const emailInput = screen.getByLabelText(/email/i)
            expect(emailInput).toHaveAttribute('type', 'email')
        })

        it('debe tener tipo password en el campo contraseña', () => {
            render(<LoginPage />)

            const passwordInput = screen.getByLabelText(/contraseña/i)
            expect(passwordInput).toHaveAttribute('type', 'password')
        })
    })

    describe('Interacción del formulario', () => {
        it('debe permitir escribir en los campos', async () => {
            render(<LoginPage />)

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })

            expect(emailInput).toHaveValue('test@example.com')
            expect(passwordInput).toHaveValue('password123')
        })

        it('debe deshabilitar campos durante carga', async () => {
            // Mock de login exitoso pero con delay
            mockSupabase.auth.signInWithPassword = jest.fn().mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 1000))
            )

            render(<LoginPage />)

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)
            const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
            })
        })
    })

    describe('Manejo de errores', () => {
        it('debe manejar credenciales inválidas', async () => {
            mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Invalid login credentials' }
            })

            render(<LoginPage />)

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)
            const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

            fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
            fireEvent.click(submitButton)

            // El toast mock será llamado con el error
            await waitFor(() => {
                expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
                    email: 'wrong@example.com',
                    password: 'wrongpassword',
                })
            })
        })

        it('debe manejar email no confirmado', async () => {
            mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Email not confirmed' }
            })

            render(<LoginPage />)

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)
            const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

            fireEvent.change(emailInput, { target: { value: 'unconfirmed@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled()
            })
        })
    })

    describe('Login exitoso', () => {
        it('debe llamar a signInWithPassword con credenciales correctas', async () => {
            mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
                data: {
                    user: { id: 'user-123', email: 'test@example.com' },
                    session: { access_token: 'token' }
                },
                error: null
            })

            // Mock para obtener perfil de usuario
            const mockFrom = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { user_type: 'coach', role: 'coach', full_name: 'Test User' },
                            error: null
                        })
                    })
                })
            })
            mockSupabase.from = mockFrom

            render(<LoginPage />)

            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)
            const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'password123',
                })
            })
        })
    })
})
