import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Wallet, TrendingUp, CheckCircle, AlertCircle, Plus, Edit2, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../lib/utils'
import { AddBudgetForm } from '../components/AddBudgetForm'
import { toast } from 'sonner'
import type { Budget } from '../types/finance'

interface BudgetsProps {
  budgets: Budget[]
  onAddBudget?: (data: any) => void
  onUpdateBudget?: (id: string, amount: number) => void
  isSubmitting?: boolean
}

export function Budgets({ budgets, onAddBudget, onUpdateBudget, isSubmitting = false }: BudgetsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [alertShown, setAlertShown] = useState(false)

  useEffect(() => {
    if (budgets.length > 0 && !alertShown) {
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
      const remainingBudget = totalBudget - totalSpent

      if (remainingBudget < 0) {
        toast.error(`Budget Alert: You are over budget by ${formatCurrency(Math.abs(remainingBudget))}!`)
      } else if (remainingBudget < totalBudget * 0.2) {
        toast.warning(`Budget Alert: Only ${formatCurrency(remainingBudget)} remaining (${((remainingBudget / totalBudget) * 100).toFixed(0)}% of your total budget)`)
      } else {
        toast.success(`Budget Status: You have ${formatCurrency(remainingBudget)} remaining this month.`)
      }
      setAlertShown(true)
    }
  }, [budgets, alertShown])

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

  const handleAddBudget = (data: any) => {
    if (onAddBudget) {
      onAddBudget(data)
      setShowAddForm(false)
    }
  }

  const handleUpdateBudget = (id: string) => {
    const amount = parseFloat(editAmount)
    if (isNaN(amount) || amount <= 0) {
      return
    }
    if (onUpdateBudget) {
      onUpdateBudget(id, amount)
      setEditingBudgetId(null)
      setEditAmount('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Budget Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full sm:w-auto bg-accent-primary text-white py-2.5 px-4 border-brutal border-border-base brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        {showAddForm ? 'Cancel' : 'Add New Budget'}
      </button>

      {/* Add Budget Form */}
      {showAddForm && onAddBudget && (
        <AddBudgetForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddBudget}
          isSubmitting={isSubmitting}
        />
      )}

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
                      {budget.renewalDate && (
                        <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                          Renews: {format(parseISO(budget.renewalDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 border-brutal-sm border-border-base text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                        status.color === 'danger' ? 'bg-accent-dangerLight text-accent-danger' :
                        status.color === 'warning' ? 'bg-accent-warningLight text-accent-warning' :
                        'bg-accent-successLight text-accent-success'
                      }`}>
                        {status.color === 'danger' && <AlertCircle className="w-3 h-3" />}
                        {status.color === 'primary' && <CheckCircle className="w-3 h-3" />}
                        {status.status}
                      </span>
                      {onUpdateBudget && (
                        <button
                          onClick={() => {
                            setEditingBudgetId(budget.id)
                            setEditAmount(budget.amount.toString())
                          }}
                          className="text-text-tertiary hover:text-text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Manual Budget Edit */}
                  {editingBudgetId === budget.id && onUpdateBudget && (
                    <div className="mb-3 p-3 border-brutal-sm border-border-base bg-bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold text-sm focus:outline-none focus:brutal-shadow"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          onClick={() => handleUpdateBudget(budget.id)}
                          className="px-3 py-2 bg-accent-success text-white border-brutal border-border-base brutal-shadow-sm font-bold uppercase tracking-wider text-sm hover:brutal-shadow"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingBudgetId(null)
                            setEditAmount('')
                          }}
                          className="px-3 py-2 bg-accent-danger text-white border-brutal border-border-base brutal-shadow-sm font-bold uppercase tracking-wider text-sm hover:brutal-shadow"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

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
