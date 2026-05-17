import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('fitwise_theme') === 'dark'
  })

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('fitwise_theme', next ? 'dark' : 'light')
      return next
    })
  }

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.style.setProperty('--bg-main',        '#0f0f0f')
      root.style.setProperty('--bg-card',        '#1a1a1a')
      root.style.setProperty('--bg-sidebar',     '#141414')
      root.style.setProperty('--bg-hover',       '#222222')
      root.style.setProperty('--text-primary',   '#ffffff')
      root.style.setProperty('--text-secondary', '#a1a1aa')
      root.style.setProperty('--text-muted',     '#71717a')
      root.style.setProperty('--border',         '#2a2a2a')
      root.style.setProperty('--border-light',   '#1f1f1f')
      root.style.setProperty('--input-bg',       '#111111')
      root.style.setProperty('--table-head-bg',  '#111111')
      root.style.setProperty('--shadow-sm',      '0 1px 3px rgba(0,0,0,0.5)')
      root.style.setProperty('--shadow-md',      '0 4px 12px rgba(0,0,0,0.6)')
    } else {
      root.style.setProperty('--bg-main',        '#F5F6FA')
      root.style.setProperty('--bg-card',        '#FFFFFF')
      root.style.setProperty('--bg-sidebar',     '#FFFFFF')
      root.style.setProperty('--bg-hover',       '#F9FAFB')
      root.style.setProperty('--text-primary',   '#1A1A2E')
      root.style.setProperty('--text-secondary', '#6B7280')
      root.style.setProperty('--text-muted',     '#9CA3AF')
      root.style.setProperty('--border',         '#E5E7EB')
      root.style.setProperty('--border-light',   '#F3F4F6')
      root.style.setProperty('--input-bg',       '#F5F6FA')
      root.style.setProperty('--table-head-bg',  '#FAFAFA')
      root.style.setProperty('--shadow-sm',      '0 1px 3px rgba(0,0,0,0.06)')
      root.style.setProperty('--shadow-md',      '0 4px 12px rgba(0,0,0,0.08)')
    }
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
