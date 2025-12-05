import { Outlet } from '@tanstack/react-router'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Outlet />
    </div>
  )
}
