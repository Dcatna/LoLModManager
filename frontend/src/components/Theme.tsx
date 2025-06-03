
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  scheme: ColorScheme
  setTheme: (theme: Theme) => void
  setScheme: (themeKey: ColorScheme) => void
  setPreview: (scheme: ColorScheme) => void
  clearPreview: (scheme: ColorScheme) => void
}

const schemeKey = "SCHEME_KEY"
const themeKey = "THEME_KEY"

type ColorScheme = "catapuccin" | "mono" | "doom" | "bubblegum" | "kodama"

export const ColorSchemes: ColorScheme[] = ["catapuccin", "mono", "doom", "bubblegum", "kodama"]

const initialTheme = (): Theme => {
  const item = localStorage.getItem(schemeKey)
  if (item && item === "light" || item === "dark" || item === "system") {
    return item as Theme
  } else {
    return "system"
  }
}

const initialScheme = (): ColorScheme => {
  const item = localStorage.getItem(themeKey)
  if (item && ColorSchemes.map(it => String(it)).includes(item)) {
    return item as ColorScheme
  } else {
    return "catapuccin"
  }
}

const initialState: ThemeProviderState = {
  theme: initialTheme(),
  scheme: initialScheme(),
  setTheme: () => null,
  setScheme: () => null,
  setPreview: () => null,
  clearPreview: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {

  const [preview, setPreview] = useState<ColorScheme | undefined>(undefined)

  const [theme, setTheme] = useState<Theme>(initialTheme())
  const [scheme, setScheme] = useState<ColorScheme>(initialScheme())
  const [initial, setInitial] = useState(true)

  useEffect(() => {

    const time = initial ? 0 : 100
    setInitial(false)

    const cancel = window.setTimeout(() => {
      if (theme === undefined) return
      const root = window.document.documentElement
      localStorage.setItem(schemeKey, scheme)

      for (const key of ColorSchemes) {
        root.classList.remove(key + "-" + "dark", key + "-" + "light")
      }

      const currentScheme = preview !== undefined ? preview : scheme
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"

        root.classList.add(currentScheme + "-" + systemTheme)
      } else {
        root.classList.add(currentScheme + "-" + theme)
      }
    }, time)

    return () => clearTimeout(cancel)
  }, [theme, scheme, preview])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(themeKey, theme)
      setTheme(theme)
    },
    scheme,
    setScheme: (scheme: ColorScheme) => {
      localStorage.setItem(schemeKey, scheme)
      setScheme(scheme)
    },
    clearPreview: (s: ColorScheme) => setPreview(p => s === p ? undefined : p),
    setPreview: setPreview
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
