'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { currentTheme, setTheme, availableThemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const getThemePreview = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId)
    if (!theme) return null

    return (
      <div className="flex space-x-1">
        <div 
          className="w-3 h-3 rounded-full border border-white/20" 
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-white/20" 
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-white/20" 
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors relative"
        title="Change Theme"
      >
        <Palette className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Theme Selector */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-72 glass-dropdown rounded-lg z-[60] overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Choose Theme</h3>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-2">
                  {availableThemes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => {
                        setTheme(theme.id)
                        setIsOpen(false)
                      }}
                      className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                        currentTheme.id === theme.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getThemePreview(theme.id)}
                          <span className="text-white font-medium">{theme.name}</span>
                        </div>
                        {currentTheme.id === theme.id && (
                          <Check className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      
                      {/* Theme Preview Card */}
                      <div 
                        className="mt-3 p-2 rounded border border-white/10 text-xs"
                        style={{ 
                          background: theme.gradients.card,
                          borderColor: theme.colors.border 
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ color: theme.colors.text }}>Sample Card</span>
                          <div 
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: theme.colors.primary + '20',
                              color: theme.colors.primary 
                            }}
                          >
                            +2.5%
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 text-center">
                    Theme preference is saved automatically
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
