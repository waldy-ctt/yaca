// src/renderer/src/routes/index.tsx
import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { LoginRoute } from "./components/LoginRoute";
import { ConversationListRoute } from "./components/ConversationListRoute";
import { SignUpRoute } from "./components/SignUpRoute";
import { RootLayout } from "./components/base/RootLayout";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/types";

const authGuard = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({
      to: ROUTES.LOGIN,
      search: { redirect: location.href },
    });
  }
};

const rootRoute = createRootRoute({
  component: RootLayout,
});

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.LOGIN,
  component: LoginRoute,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.SIGNUP,
  component: SignUpRoute,
});

// ✅ FIXED: Home route that handles both list and conversation
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ConversationListRoute,
  beforeLoad: authGuard,
});

// ✅ FIXED: Conversation route as child of home (same component)
const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conversation/$conversationId",
  component: ConversationListRoute, // ✅ Same component handles both!
  beforeLoad: authGuard,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  homeRoute,
  conversationRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
