// src/renderer/src/routes/components/RootLayout.tsx
import { Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export function RootLayout() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && router.state.location.pathname !== '/login') {
      router.navigate({ to: '/login' })
    }
  }, [isAuthenticated, router])

  return (
    <div className="h-screen w-screen bg-background">
      <Outlet />
    </div>
  )
}
