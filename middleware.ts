import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/client-dashboard',
  '/clients',
  '/sessions',
  '/settings',
  '/subscription',
  '/payments',
  '/marketplace',
  '/frameworks',
]

// Rutas exclusivas para administradores
const ADMIN_ROUTES = ['/admin']

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/register-client',
  '/forgot-password',
  '/reset-password',
  '/pricing',
]

// Rutas de API que no requieren middleware de sesión
const API_ROUTES = ['/api/webhooks', '/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorar rutas de archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.includes('.') // archivos estáticos
  ) {
    return NextResponse.next()
  }

  // Crear response mutable
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Crear cliente de Supabase para middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Obtener sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Verificar si la ruta es pública
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Verificar si la ruta está protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Verificar si es ruta de admin
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Si no hay sesión y la ruta está protegida o es admin, redirigir a login
  if (!session && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay sesión y el usuario intenta acceder a rutas de autenticación, redirigir
  if (session && (pathname === '/login' || pathname === '/register' || pathname === '/register-client')) {
    // Obtener perfil del usuario para determinar a dónde redirigir
    const { data: userProfile } = await supabase
      .from('users')
      .select('user_type, role')
      .eq('id', session.user.id)
      .single()

    const isClient = userProfile?.user_type === 'client' || userProfile?.role === 'client'
    const redirectUrl = isClient ? '/client-dashboard' : '/dashboard'

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Verificar acceso a rutas de admin
  if (session && isAdminRoute) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Solo super_admin y admin pueden acceder
    const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin'

    if (!isAdmin) {
      // Redirigir a dashboard con mensaje de error
      const redirectUrl = new URL('/dashboard', request.url)
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Verificar acceso correcto según tipo de usuario
  if (session && isProtectedRoute) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('user_type, role')
      .eq('id', session.user.id)
      .single()

    const isClient = userProfile?.user_type === 'client' || userProfile?.role === 'client'

    // Si es cliente intentando acceder al dashboard de coach
    if (isClient && pathname.startsWith('/dashboard') && !pathname.startsWith('/client-dashboard')) {
      return NextResponse.redirect(new URL('/client-dashboard', request.url))
    }

    // Si es coach intentando acceder al dashboard de cliente
    if (!isClient && pathname.startsWith('/client-dashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Añadir header con user ID para uso en server components
  if (session) {
    response.headers.set('x-user-id', session.user.id)
  }

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')

  // Content Security Policy (Permisiva para desarrollo/PayPal)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paypal.com https://*.paypalobjects.com https://*.supabase.co;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.paypal.com https://*.paypalobjects.com;
    font-src 'self';
    connect-src 'self' https://*.paypal.com https://*.paypalobjects.com https://*.supabase.co;
    frame-src 'self' https://*.paypal.com https://*.paypalobjects.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
