// src/renderer/src/App.tsx
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import "@main/assets/main.css";
import { useSettingsStore } from "./stores/settingStore";
import { useEffect } from "react";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AppInit />
    </>
  );
}

function AppInit() {
  const { theme, setTheme, language, setLanguage } = useSettingsStore();

  useEffect(() => {
    setTheme(theme);
    setLanguage(language);
  }, []);

  return null;
}
