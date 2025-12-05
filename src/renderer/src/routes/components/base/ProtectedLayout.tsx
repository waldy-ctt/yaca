import { Outlet, useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { ROUTES } from '@/types'

export function ProtectedLayout() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.navigate({ to: ROUTES.LOGIN })
    }
  }, [isAuthenticated, router])

  // While redirecting – show nothing (or spinner)
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8">
        <Outlet />   {/* ← Home, Settings, etc. */}
      </main>
    </div>
  )
}
