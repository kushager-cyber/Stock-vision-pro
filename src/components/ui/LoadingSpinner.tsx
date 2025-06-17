'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'text-blue-500',
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <motion.div
        className={`${sizeClasses[size]} ${color}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
            className="opacity-25"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="23.562"
            className="opacity-75"
          />
        </svg>
      </motion.div>
      
      {text && (
        <motion.p
          className={`${textSizeClasses[size]} text-gray-400 font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <SkeletonLoader className="h-6 w-32" />
        <SkeletonLoader className="h-8 w-24" />
      </div>
      
      <div className="flex space-x-2 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-8 w-12" />
        ))}
      </div>
      
      <SkeletonLoader className="h-96 w-full" />
      
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <SkeletonLoader className="h-4 w-16 mx-auto mb-2" />
              <SkeletonLoader className="h-6 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <SkeletonLoader className="h-6 w-24" />
        <SkeletonLoader className="h-4 w-16" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SkeletonLoader className="h-10 w-10 rounded-lg" />
              <div>
                <SkeletonLoader className="h-4 w-16 mb-1" />
                <SkeletonLoader className="h-3 w-24" />
              </div>
            </div>
            <div className="text-right">
              <SkeletonLoader className="h-4 w-16 mb-1" />
              <SkeletonLoader className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NewsSkeleton() {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <SkeletonLoader className="h-6 w-32" />
        <SkeletonLoader className="h-8 w-20" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 glass rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <SkeletonLoader className="h-4 w-16" />
              <SkeletonLoader className="h-3 w-12" />
            </div>
            
            <SkeletonLoader className="h-5 w-full mb-2" />
            <SkeletonLoader className="h-5 w-3/4 mb-3" />
            
            <SkeletonLoader className="h-4 w-full mb-1" />
            <SkeletonLoader className="h-4 w-2/3 mb-3" />
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <SkeletonLoader className="h-6 w-12 rounded" />
                <SkeletonLoader className="h-6 w-16 rounded" />
              </div>
              <SkeletonLoader className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card">
      <SkeletonLoader className="h-6 w-32 mb-6" />
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonLoader key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
