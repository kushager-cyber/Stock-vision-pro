'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    success: string
    danger: string
    warning: string
    info: string
    border: string
    glass: string
    gradient: string
  }
  gradients: {
    main: string
    card: string
    button: string
    accent: string
  }
}

export const themes: Record<string, Theme> = {
  darkBlue: {
    id: 'darkBlue',
    name: 'Dark Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: 'rgba(255, 255, 255, 0.1)',
      glass: 'rgba(255, 255, 255, 0.05)',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    },
    gradients: {
      main: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      card: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
      button: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      accent: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
    }
  },
  purpleGradient: {
    id: 'purpleGradient',
    name: 'Purple Gradient',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#1a0b2e',
      surface: '#2d1b4e',
      text: '#f3e8ff',
      textSecondary: '#c4b5fd',
      success: '#10b981',
      danger: '#f43f5e',
      warning: '#f59e0b',
      info: '#8b5cf6',
      border: 'rgba(139, 92, 246, 0.2)',
      glass: 'rgba(139, 92, 246, 0.1)',
      gradient: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #4c1d95 100%)'
    },
    gradients: {
      main: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #4c1d95 100%)',
      card: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
      button: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      accent: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
    }
  },
  greenFinance: {
    id: 'greenFinance',
    name: 'Green Finance',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34d399',
      background: '#0a2e1a',
      surface: '#1a4d2e',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      success: '#10b981',
      danger: '#dc2626',
      warning: '#f59e0b',
      info: '#059669',
      border: 'rgba(5, 150, 105, 0.2)',
      glass: 'rgba(5, 150, 105, 0.1)',
      gradient: 'linear-gradient(135deg, #0a2e1a 0%, #1a4d2e 50%, #166534 100%)'
    },
    gradients: {
      main: 'linear-gradient(135deg, #0a2e1a 0%, #1a4d2e 50%, #166534 100%)',
      card: 'linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
      button: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      accent: 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
    }
  },
  goldLuxury: {
    id: 'goldLuxury',
    name: 'Gold Luxury',
    colors: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#fbbf24',
      background: '#1c1917',
      surface: '#292524',
      text: '#fef3c7',
      textSecondary: '#fde68a',
      success: '#22c55e',
      danger: '#dc2626',
      warning: '#f59e0b',
      info: '#d97706',
      border: 'rgba(217, 119, 6, 0.2)',
      glass: 'rgba(217, 119, 6, 0.1)',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #451a03 100%)'
    },
    gradients: {
      main: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #451a03 100%)',
      card: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)',
      button: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      accent: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
    }
  }
}

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (themeId: string) => void
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentThemeId, setCurrentThemeId] = useState('darkBlue')

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('stockvision_theme')
      if (savedTheme && themes[savedTheme]) {
        setCurrentThemeId(savedTheme)
      }
    }
  }, [])

  // Apply theme to document root
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = themes[currentThemeId]
      const root = document.documentElement
      
      // Set CSS custom properties
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
      
      Object.entries(theme.gradients).forEach(([key, value]) => {
        root.style.setProperty(`--gradient-${key}`, value)
      })

      // Update body background
      document.body.style.background = theme.colors.gradient
    }
  }, [currentThemeId])

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentThemeId(themeId)
      if (typeof window !== 'undefined') {
        localStorage.setItem('stockvision_theme', themeId)
      }
    }
  }

  const value: ThemeContextType = {
    currentTheme: themes[currentThemeId],
    setTheme,
    availableThemes: Object.values(themes)
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
