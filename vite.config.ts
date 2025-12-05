import { defineConfig } from "vite";
import path, { resolve } from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import tanstackRouter from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
      renderer:
        process.env.NODE_ENV === "test"
          ? undefined
          : {},
    }),
    tanstackRouter({
      target: 'react',       // We're React, baby
      autoCodeSplitting: true,  // Lazy-load routes = faster app
    }),
  ],
  resolve: {
    alias: {
      "@renderer": resolve(__dirname, "src/renderer/src"),
      "@": resolve(__dirname, "src/renderer/src"),
      "@main": resolve(__dirname, "src")
    },
  },
});
