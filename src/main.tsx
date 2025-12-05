// src/renderer/src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { ThemeProvider } from "@/components/theme-provider"
import App from "@/App"
import "@/lib/i18n/i18n"

// Add this fallback so you NEVER see blank screen again
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
