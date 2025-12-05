// src/renderer/src/App.tsx
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/routes'
import '@main/assets/main.css'

export default function App() {
  return <RouterProvider router={router} />
}
