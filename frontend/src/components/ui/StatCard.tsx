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
          <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#666666' }}>{label}</p>
          <p className="text-3xl font-bold mt-2" style={{ color: '#000000' }}>{value}</p>
        </div>
        {icon && (
          <div className="w-12 h-12 brutal-border-sm flex items-center justify-center" style={{ backgroundColor: '#f0f0ec', borderColor: '#000000' }}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="font-bold" style={{ color: trend.positive ? '#34c759' : '#ff3b30' }}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span style={{ color: '#666666' }}>vs last period</span>
        </div>
      )}
    </Card>
  )
}
