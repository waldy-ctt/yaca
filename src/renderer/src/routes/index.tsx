// src/renderer/src/routes/index.tsx
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { LoginRoute } from './components/LoginRoute'
import { ConversationListRoute } from './components/ConversationListRoute'
import { RootLayout } from './components/base/RootLayout'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginRoute,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ConversationListRoute,
})

const routeTree = rootRoute.addChildren([loginRoute, homeRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
