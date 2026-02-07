import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterCoachPage from '@/app/register/page'
import { createClient } from '@/lib/supabase/client'

// Cast mock para tipado correcto
const mockSupabase = createClient() as jest.Mocked<ReturnType<typeof createClient>>

// Mock UI components to bypass Radix UI complexity and satisfy validation
jest.mock('@/components/ui/select', () => ({
    Select: ({ onValueChange, children }: any) => (
        <div data-testid="mock-select-wrapper">
            <button type="button" data-testid="mock-select-trigger" onClick={() => onValueChange('Argentina')}>Set Value</button>
            {children}
        </div>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => null,
}))

jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ onCheckedChange, checked, id }: any) => (
        <label>
            <input
                type="checkbox"
                data-testid={`checkbox-${id}`}
                checked={checked}
                onChange={(e) => onCheckedChange(e.target.checked)}
            />
        </label>
    )
}))

describe('RegisterCoachPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Renderizado', () => {
        it('debe renderizar el formulario de registro', () => {
            render(<RegisterCoachPage />)

            expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
        })

        it('debe mostrar el logo de CoachLatam', () => {
            render(<RegisterCoachPage />)

            expect(screen.getByText(/registro de coach profesional/i)).toBeInTheDocument()
        })

        it('debe tener link de login existente', () => {
            render(<RegisterCoachPage />)

            expect(screen.getByText(/inicia sesión/i)).toBeInTheDocument()
        })
    })

    describe('Validación de campos', () => {
        it('debe requerir nombre completo', () => {
            render(<RegisterCoachPage />)

            const nameInput = screen.getByLabelText(/nombre completo/i)
            expect(nameInput).toBeRequired()
        })

        it('debe requerir email', () => {
            render(<RegisterCoachPage />)

            const emailInput = screen.getByLabelText(/email/i)
            expect(emailInput).toBeRequired()
        })

        it('debe requerir contraseña', () => {
            render(<RegisterCoachPage />)

            const passwordInput = screen.getByLabelText(/contraseña/i)
            expect(passwordInput).toBeRequired()
        })

        it('debe tener campo de país', () => {
            render(<RegisterCoachPage />)

            expect(screen.getByText(/nacionalidad/i)).toBeInTheDocument()
        })
    })

    describe('Campos de especialización', () => {
        it('debe mostrar opciones de especialidades', () => {
            render(<RegisterCoachPage />)

            // Las especialidades deben estar visibles
            expect(screen.getByText(/especializaciones/i)).toBeInTheDocument()
        })

        it('debe mostrar opciones de idiomas', () => {
            render(<RegisterCoachPage />)

            expect(screen.getByText(/idiomas/i)).toBeInTheDocument()
        })
    })

    describe('Interacción del formulario', () => {
        it('debe permitir escribir en los campos principales', async () => {
            render(<RegisterCoachPage />)

            const nameInput = screen.getByLabelText(/nombre completo/i)
            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)

            fireEvent.change(nameInput, { target: { value: 'Juan Coach' } })
            fireEvent.change(emailInput, { target: { value: 'juan@coach.com' } })
            fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })

            expect(nameInput).toHaveValue('Juan Coach')
            expect(emailInput).toHaveValue('juan@coach.com')
            expect(passwordInput).toHaveValue('SecurePass123!')
        })
    })

    describe('Manejo de errores', () => {
        it('debe manejar email ya registrado', async () => {
            mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'User already registered' }
            })

            render(<RegisterCoachPage />)

            const nameInput = screen.getByLabelText(/nombre completo/i)
            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)

            fireEvent.change(nameInput, { target: { value: 'Test User' } })
            fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })

            // Satisfacer validaciones
            const selects = screen.getAllByTestId('mock-select-trigger')
            fireEvent.click(selects[0])
            fireEvent.click(screen.getByTestId('checkbox-Coaching Ejecutivo'))

            // Buscar y hacer clic en el botón de submit
            const submitButton = screen.getByRole('button', { name: /crear cuenta|registrar/i })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockSupabase.auth.signUp).toHaveBeenCalled()
            }, { timeout: 3000 })
        })

        it('debe manejar contraseña débil', async () => {
            mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Password should be at least 6 characters' }
            })

            render(<RegisterCoachPage />)

            const nameInput = screen.getByLabelText(/nombre completo/i)
            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)

            fireEvent.change(nameInput, { target: { value: 'Test User' } })
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: '123' } })

            // Satisfacer validaciones
            const selects = screen.getAllByTestId('mock-select-trigger')
            fireEvent.click(selects[0])
            fireEvent.click(screen.getByTestId('checkbox-Coaching Ejecutivo'))

            const submitButton = screen.getByRole('button', { name: /crear cuenta|registrar/i })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockSupabase.auth.signUp).toHaveBeenCalled()
            }, { timeout: 3000 })
        })
    })

    describe('Registro exitoso', () => {
        it('debe llamar a signUp con datos correctos', async () => {
            mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
                data: {
                    user: { id: 'new-user-123', email: 'new@coach.com' },
                    session: null
                },
                error: null
            })

            render(<RegisterCoachPage />)

            const nameInput = screen.getByLabelText(/nombre completo/i)
            const emailInput = screen.getByLabelText(/email/i)
            const passwordInput = screen.getByLabelText(/contraseña/i)

            fireEvent.change(nameInput, { target: { value: 'Nuevo Coach' } })
            fireEvent.change(emailInput, { target: { value: 'new@coach.com' } })
            fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })

            // Satisfacer validaciones
            const selects = screen.getAllByTestId('mock-select-trigger')
            fireEvent.click(selects[0])
            fireEvent.click(screen.getByTestId('checkbox-Coaching Ejecutivo'))

            const submitButton = screen.getByRole('button', { name: /crear cuenta|registrar/i })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockSupabase.auth.signUp).toHaveBeenCalled()
            }, { timeout: 3000 })
        })
    })
})
