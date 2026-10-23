import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 pt-4 lg:pt-0">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-text-primary">{title}</h1>
          {subtitle && (
            <p className="text-text-tertiary mt-1 font-bold uppercase tracking-wider text-sm">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
