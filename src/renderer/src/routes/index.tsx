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
import ConversationScreen from "@/features/conversation/ConversationScreen";
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

// Protected routes 
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ConversationListRoute,
  beforeLoad: authGuard,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conversation/$conversationId",
  component: () => <ConversationScreen />,
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
