import { format, parseISO, differenceInDays } from 'date-fns'
import { CreditCard, CheckCircle, Clock, AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../lib/utils'

interface Debt {
  id: string
  name: string
  totalAmount: number
  paidAmount: number
  interestRate: number
  dueDate: string
}

interface DebtsProps {
  debts: Debt[]
}

export function Debts({ debts }: DebtsProps) {
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMMM d, yyyy')
  }

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(parseISO(dueDate), new Date())
  }

  const getUrgencyLevel = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return { level: 'Overdue', color: 'danger', icon: AlertTriangle }
    if (daysUntilDue <= 30) return { level: 'Urgent', color: 'warning', icon: Clock }
    if (daysUntilDue <= 90) return { level: 'Soon', color: 'primary', icon: Calendar }
    return { level: 'On Track', color: 'primary', icon: CheckCircle }
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0)
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0)
  const remainingDebt = totalDebt - totalPaid
  const overallProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Debt</p>
              <p className="text-2xl font-semibold text-text-primary">{formatCurrency(totalDebt)}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">Original amount</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Amount Paid</p>
              <p className="text-2xl font-semibold text-text-primary">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">{overallProgress.toFixed(0)}% paid off</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Remaining</p>
              <p className="text-2xl font-semibold text-text-primary">{formatCurrency(remainingDebt)}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">Still to pay</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active Debts</p>
              <p className="text-2xl font-semibold text-text-primary">{debts.length}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">Total accounts</p>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Overall Progress</h3>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-text-primary">{overallProgress.toFixed(0)}%</p>
            <p className="text-sm text-text-secondary mt-2">Total Debt Paid Off</p>
          </div>
          <div className="w-full bg-background rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-text-secondary mt-2">
            <span>{formatCurrency(totalPaid)} paid</span>
            <span>{formatCurrency(totalDebt)} total</span>
          </div>
        </div>
      </Card>

      {/* Debt Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Debt Details</h3>
        {debts.length === 0 ? (
          <p className="text-text-secondary text-center py-8">No debts recorded</p>
        ) : (
          <div className="space-y-4">
            {debts.map((debt) => {
              const progress = (debt.paidAmount / debt.totalAmount) * 100
              const daysUntilDue = getDaysUntilDue(debt.dueDate)
              const urgency = getUrgencyLevel(daysUntilDue)
              const remaining = debt.totalAmount - debt.paidAmount
              const UrgencyIcon = urgency.icon

              return (
                <div key={debt.id} className="border border-border-light rounded-lg p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-text-primary text-lg">{debt.name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {formatDate(debt.dueDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {debt.interestRate}% APR
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      urgency.color === 'danger' ? 'bg-red-50 text-danger' :
                      urgency.color === 'warning' ? 'bg-amber-50 text-warning' :
                      urgency.color === 'primary' ? 'bg-blue-50 text-primary' :
                      'bg-emerald-50 text-primary'
                    }`}>
                      <UrgencyIcon className="w-3 h-3" />
                      {urgency.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-text-secondary mb-1">Original Amount</p>
                      <p className="font-semibold text-text-primary">{formatCurrency(debt.totalAmount)}</p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-text-secondary mb-1">Paid</p>
                      <p className="font-semibold text-primary">{formatCurrency(debt.paidAmount)}</p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-text-secondary mb-1">Remaining</p>
                      <p className="font-semibold text-warning">{formatCurrency(remaining)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">{progress.toFixed(0)}% paid off</span>
                      <span className="text-text-primary font-medium">{formatCurrency(remaining)} left</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
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
