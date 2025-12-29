import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton instance
let supabaseInstance: SupabaseClient | null = null

export function createClient() {
  // Si ya existe una instancia, retornarla
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase Client Config:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    key: supabaseAnonKey ? 'SET' : 'MISSING'
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }

  // Crear nueva instancia solo si no existe
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'coachlatam-auth',
    }
  })

  return supabaseInstance
}

// Función para resetear la instancia si es necesario
export function resetSupabaseClient() {
  supabaseInstance = null
}