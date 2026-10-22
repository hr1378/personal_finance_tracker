import { ReactNode } from 'react'
import { Card } from './Card'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string
  icon?: ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card hover className={cn('p-6', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="text-2xl font-semibold text-text-primary mt-1">{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-text-secondary">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            'font-medium',
            trend.positive ? 'text-primary' : 'text-danger'
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-text-muted">vs last period</span>
        </div>
      )}
    </Card>
  )
}
