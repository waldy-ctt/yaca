import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import "@main/assets/main.css";
import { useSettingsStore } from "./stores/settingStore";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { ws } from "./lib/api";

export default function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      ws.connect();
    } else {
      ws.disconnect();
    }

    return () => ws.disconnect();
  }, [token]);
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
