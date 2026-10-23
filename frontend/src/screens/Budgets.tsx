import { format, parseISO } from 'date-fns'
import { Wallet, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../lib/utils'

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  month: number
  year: number
}

interface BudgetsProps {
  budgets: Budget[]
}

export function Budgets({ budgets }: BudgetsProps) {
  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month - 1)
    return format(date, 'MMMM yyyy')
  }

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100
    if (percentage >= 100) return { status: 'Over Budget', color: 'danger' }
    if (percentage >= 80) return { status: 'Near Limit', color: 'warning' }
    return { status: 'On Track', color: 'primary' }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const remainingBudget = totalBudget - totalSpent

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 border-brutal border-border-base bg-bg-accent flex items-center justify-center">
              <Wallet className="w-5 h-5 text-text-tertiary" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Total Budget</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">{budgets.length} budget categories</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 border-brutal border-border-base bg-bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-danger" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Total Spent</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">{((totalSpent / totalBudget) * 100).toFixed(0)}% utilized</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 border-brutal border-border-base bg-bg-accent flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent-success" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Remaining</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(remainingBudget)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Available to spend</p>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary mb-6">Budget Breakdown</h3>
        {budgets.length === 0 ? (
          <p className="text-text-secondary text-center py-8 font-bold">No budgets set</p>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.amount) * 100
              const status = getBudgetStatus(budget)
              const isOverBudget = percentage >= 100

              return (
                <div key={budget.id} className="border-brutal border-border-base p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-text-primary">{budget.category}</h4>
                      <p className="text-sm font-bold uppercase tracking-wider text-text-tertiary">{formatMonth(budget.month, budget.year)}</p>
                    </div>
                    <span className={`px-3 py-1 border-brutal-sm border-border-base text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      status.color === 'danger' ? 'bg-accent-dangerLight text-accent-danger' :
                      status.color === 'warning' ? 'bg-accent-warningLight text-accent-warning' :
                      'bg-accent-successLight text-accent-success'
                    }`}>
                      {status.color === 'danger' && <AlertCircle className="w-3 h-3" />}
                      {status.color === 'primary' && <CheckCircle className="w-3 h-3" />}
                      {status.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold uppercase tracking-wider text-text-tertiary">{formatCurrency(budget.spent)} spent</span>
                      <span className="font-bold uppercase tracking-wider text-text-primary">{formatCurrency(budget.amount)} budget</span>
                    </div>
                    <div className="w-full bg-bg-muted border-brutal-sm border-border-base h-3">
                      <div
                        className={`h-3 transition-all duration-500 ${
                          isOverBudget ? 'bg-accent-danger' :
                          percentage >= 80 ? 'bg-accent-warning' :
                          'bg-accent-success'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-bold uppercase tracking-wider text-text-tertiary">{percentage.toFixed(0)}% used</span>
                    <span className={isOverBudget ? 'text-accent-danger font-bold uppercase tracking-wider' : 'text-accent-success font-bold uppercase tracking-wider'}>
                      {isOverBudget ? `Over by ${formatCurrency(budget.spent - budget.amount)}` : `${formatCurrency(budget.amount - budget.spent)} remaining`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
