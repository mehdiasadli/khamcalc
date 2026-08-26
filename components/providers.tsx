"use client"

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
