import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border-light rounded-xl shadow-card',
        hover && 'hover:shadow-card-hover transition-shadow',
        className
      )}
    >
      {children}
    </div>
  )
}
