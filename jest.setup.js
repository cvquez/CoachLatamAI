import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase client
// Mock Supabase client
jest.mock('@/lib/supabase/client', () => {
    const mockSupabase = {
        auth: {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
            getUser: jest.fn(),
            resetPasswordForEmail: jest.fn(),
            updateUser: jest.fn(),
            onAuthStateChange: jest.fn(() => ({
                data: { subscription: { unsubscribe: jest.fn() } },
            })),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        })),
        rpc: jest.fn(),
    }
    return {
        createClient: () => mockSupabase,
    }
})

// Mock use-toast hook
jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn(),
    }),
}))

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning:') ||
                args[0].includes('React does not recognize'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})

// Polyfill for ResizeObserver (needed for Radix UI)
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
