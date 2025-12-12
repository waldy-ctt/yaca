// src/renderer/src/routes/index.tsx  ← FINAL VERSION
import {
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { LoginRoute } from "./components/LoginRoute";
import { ConversationListRoute } from "./components/ConversationListRoute";
import { SignUpRoute } from "./components/SignUpRoute";
import { RootLayout } from "./components/base/RootLayout";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import ConversationScreen from "@/features/conversation/ConversationScreen";

// AUTH GUARD — PROTECTED ROUTES
function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}

// PUBLIC ONLY — redirect if logged in
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;
  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

// PUBLIC ROUTES
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <PublicOnly>
      <LoginRoute />
    </PublicOnly>
  ),
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => (
    <PublicOnly>
      <SignUpRoute />
    </PublicOnly>
  ),
});

// PROTECTED ROUTES
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Protected>
      <ConversationListRoute />
    </Protected>
  ),
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conversation/$conversationId",
  component: () => {
    const { conversationId } = conversationRoute.useParams();
    return (
      <Protected>
        <ConversationScreen />
      </Protected>
    );
  },
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
