'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthGuard: Checking authentication...')
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('AuthGuard: Session check result:', {
        hasSession: !!session,
        userId: session?.user?.id,
        error
      })

      if (!session) {
        console.log('AuthGuard: No session found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('AuthGuard: Session valid, showing protected content')
      setIsLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthGuard: Auth state changed:', { event, hasSession: !!session })
      if (!session) {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return <>{children}</>
}
