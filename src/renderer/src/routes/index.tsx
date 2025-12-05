import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { PublicLayout } from './components/base/PublicLayout'
import { ProtectedLayout } from './components/base/ProtectedLayout'
import { Root } from './components/base/Root'
import { ConversationListRoute } from './components/ConversationListRoute'
import { LoginRoute } from './components/LoginRoute'
import { ROUTES } from '@/types'

const rootRoute = createRootRoute({ component: Root })

// Public area
const publicLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.ROOT,
  component: PublicLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => publicLayout,
  path: ROUTES.LOGIN,            
  component: LoginRoute,
})

// Protected area
const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.ROOT,
  component: ProtectedLayout,
})

const homeRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: ROUTES.HOME,
  component: ConversationListRoute,
})

// const settingsRoute = createRoute({
//   getParentRoute: () => protectedLayout,
//   path: '/settings',
//   component: Settings,
// })

// Final tree
const routeTree = rootRoute.addChildren([
  publicLayout.addChildren([loginRoute]),
  // protectedLayout.addChildren([homeRoute, settingsRoute]),
  protectedLayout.addChildren([homeRoute])
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
