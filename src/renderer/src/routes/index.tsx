// render/src/routes/index.tsx  ← REPLACE ENTIRE FILE
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { Root } from './components/base/Root'
import { PublicLayout } from './components/base/PublicLayout'
import { ProtectedLayout } from './components/base/ProtectedLayout'
import { LoginRoute } from './components/LoginRoute'
import { ConversationListRoute } from './components/ConversationListRoute'
import { ROUTES } from '@/types'

const rootRoute = createRootRoute({ component: Root })

// Public login — real path
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.LOGIN,
  component: () => (
    <PublicLayout>
      <LoginRoute />
    </PublicLayout>
  ),
})

// Protected area — home is root
const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ProtectedLayout,
})

const homeRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: '/',
  component: ConversationListRoute,
})

// Tree — order no longer matters!
const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedLayout.addChildren([homeRoute]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
