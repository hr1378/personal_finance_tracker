import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type CardGradient = 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'none'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  variant?: 'primary' | 'secondary' | 'none'
  gradient?: CardGradient
}

const gradientClasses: Record<CardGradient, string> = {
  blue: 'bg-gradient-to-br from-blue-500/15 to-blue-700/5',
  green: 'bg-gradient-to-br from-green-500/15 to-green-700/5',
  pink: 'bg-gradient-to-br from-pink-500/15 to-pink-700/5',
  purple: 'bg-gradient-to-br from-purple-500/15 to-purple-700/5',
  orange: 'bg-gradient-to-br from-orange-500/15 to-orange-700/5',
  none: ''
}

export function Card({ children, className, hover = false, variant = 'none', gradient }: CardProps) {
  const variantClasses = {
    primary: 'gradient-bg-primary',
    secondary: 'gradient-bg-secondary',
    none: ''
  }

  return (
    <div
      className={cn(
        'glass-card-dark rounded-xl transition-all duration-200',
        hover && 'glass-hover',
        variantClasses[variant],
        gradient && gradientClasses[gradient],
        className
      )}
    >
      {children}
    </div>
  )
}
