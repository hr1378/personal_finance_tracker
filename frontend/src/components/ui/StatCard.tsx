import type { ReactNode } from 'react'
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
  variant?: 'primary' | 'secondary' | 'none'
}

export function StatCard({ label, value, icon, trend, className, variant = 'secondary' }: StatCardProps) {
  return (
    <Card
      hover
      variant={variant}
      className={cn('p-6 relative overflow-hidden', className)}
    >
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-lg flex items-center justify-center glass">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="relative flex items-center gap-2 text-sm font-medium">
          <span className={cn(
            'font-bold',
            trend.positive ? 'text-emerald-400' : 'text-rose-400'
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-500">vs last period</span>
        </div>
      )}
    </Card>
  )
}
