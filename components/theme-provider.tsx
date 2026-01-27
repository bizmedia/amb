"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Загружаем сохранённую тему из localStorage
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      setTheme(stored)
    } else {
      // Если темы нет в localStorage, применяем системную тему сразу
      const root = window.document.documentElement
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialResolved = systemDark ? "dark" : "light"
      setResolvedTheme(initialResolved)
      root.classList.remove("light", "dark")
      root.classList.add(initialResolved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Определяем реальную тему
    let resolved: "light" | "dark"
    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    } else {
      resolved = theme
    }

    setResolvedTheme(resolved)

    // Применяем класс к html
    root.classList.remove("light", "dark")
    root.classList.add(resolved)

    // Сохраняем в localStorage
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  // Слушаем изменения системной темы
  useEffect(() => {
    if (!mounted || theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? "dark" : "light"
      setResolvedTheme(newResolved)
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newResolved)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
