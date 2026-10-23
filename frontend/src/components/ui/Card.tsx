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
        'brutal-border brutal-shadow-sm transition-all',
        hover && 'hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5',
        className
      )}
      style={{ backgroundColor: '#f4f4f0', borderColor: '#000000' }}
    >
      {children}
    </div>
  )
}
