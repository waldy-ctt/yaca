// src/renderer/src/routes/components/base/RootLayout.tsx
import { Outlet } from "@tanstack/react-router";

export function RootLayout() {
  return (
    <div className="h-screen w-screen bg-background">
      <Outlet />
    </div>
  );
}
