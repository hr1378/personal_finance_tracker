import { format } from 'date-fns'
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
        <Card className="p-6" gradient="blue">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Total Budget</p>
              <p className="text-2xl font-bold text-white neon-text">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">{budgets.length} budget categories</p>
        </Card>

        <Card className="p-6" gradient="pink">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Total Spent</p>
              <p className="text-2xl font-bold text-white neon-text">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">{((totalSpent / totalBudget) * 100).toFixed(0)}% utilized</p>
        </Card>

        <Card className="p-6" gradient="green">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Remaining</p>
              <p className="text-2xl font-bold text-white neon-text">{formatCurrency(remainingBudget)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Available to spend</p>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <Card className="p-6" gradient="none">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Budget Breakdown</h3>
        {budgets.length === 0 ? (
          <p className="text-white/60 text-center py-8 font-bold">No budgets set</p>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.amount) * 100
              const status = getBudgetStatus(budget)
              const isOverBudget = percentage >= 100

              return (
                <div key={budget.id} className="glass rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-white">{budget.category}</h4>
                      <p className="text-sm font-bold uppercase tracking-wider text-white/70">{formatMonth(budget.month, budget.year)}</p>
                    </div>
                    <span className={`px-3 py-1 glass rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      status.color === 'danger' ? 'bg-red-500/20 text-red-400' :
                      status.color === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {status.color === 'danger' && <AlertCircle className="w-3 h-3" />}
                      {status.color === 'primary' && <CheckCircle className="w-3 h-3" />}
                      {status.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold uppercase tracking-wider text-white/70">{formatCurrency(budget.spent)} spent</span>
                      <span className="font-bold uppercase tracking-wider text-white">{formatCurrency(budget.amount)} budget</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 transition-all duration-500 rounded-full ${
                          isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          percentage >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-bold uppercase tracking-wider text-white/70">{percentage.toFixed(0)}% used</span>
                    <span className={isOverBudget ? 'text-red-400 font-bold uppercase tracking-wider' : 'text-green-400 font-bold uppercase tracking-wider'}>
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
