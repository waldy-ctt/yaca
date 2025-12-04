import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Helper to remove old classes
    root.classList.remove("light", "dark")

    // 1. If specific theme is chosen (Light/Dark), just set it and exit
    if (theme !== "system") {
      root.classList.add(theme)
      return
    }

    // 2. Logic for "System" Mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    // Apply initial system preference
    root.classList.add(mediaQuery.matches ? "dark" : "light")

    // THE FIX: Listen for changes while app is running
    const listener = (e: MediaQueryListEvent) => {
      // Remove both to be safe, then add the new correct one
      root.classList.remove("light", "dark") 
      root.classList.add(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", listener)
    
    // Cleanup listener when component unmounts or theme changes
    return () => mediaQuery.removeEventListener("change", listener)

  }, [theme]) // Re-run if user switches between "System" and "Dark/Light"

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
