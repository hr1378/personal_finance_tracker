import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, Wallet, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { formatCurrency } from '../lib/utils'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
}

interface Summary {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
}

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  month: number
  year: number
}

interface Debt {
  id: string
  name: string
  totalAmount: number
  paidAmount: number
  interestRate: number
  dueDate: string
}

interface OverviewProps {
  transactions: Transaction[]
  summary: Summary
  budgets?: Budget[]
  debts?: Debt[]
}

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6']

export function Overview({ transactions, summary, budgets = [], debts = [] }: OverviewProps) {
  // Calculate category breakdown
  const expenseCategories = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categoryData = Object.entries(expenseCategories)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Calculate debt summary
  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0)
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0)
  const remainingDebt = totalDebt - totalPaid
  const debtProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0

  // Calculate budget utilization
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Pie chart data
  const pieData = [
    { name: 'Income', value: summary.totalIncome, color: '#10b981' },
    { name: 'Expenses', value: summary.totalExpenses, color: '#f43f5e' },
  ]

  // Bar chart data - monthly breakdown
  const monthlyData = transactions.reduce((acc, t) => {
    const date = parseISO(t.date)
    const monthKey = format(date, 'MMM yyyy')
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0 }
    }
    if (t.type === 'INCOME') {
      acc[monthKey].income += t.amount
    } else {
      acc[monthKey].expenses += t.amount
    }
    return acc
  }, {} as Record<string, { income: number; expenses: number }>)

  const chartData = Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .slice(-6)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(summary.totalIncome)}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<TrendingDown className="w-5 h-5 text-danger" />}
        />
        <StatCard
          label="Net Cash Flow"
          value={formatCurrency(summary.netCashFlow)}
          icon={summary.netCashFlow >= 0 ? <ArrowUpRight className="w-5 h-5 text-primary" /> : <ArrowDownRight className="w-5 h-5 text-danger" />}
        />
        <StatCard
          label="Total Debt"
          value={formatCurrency(remainingDebt)}
          icon={<CreditCard className="w-5 h-5 text-warning" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Monthly Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Budget and Debt Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Budget Utilization</h3>
          {budgets.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No budgets set</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary">Total Budget</span>
                <span className="font-semibold text-text-primary">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary">Amount Spent</span>
                <span className="font-semibold text-text-primary">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-text-secondary">Remaining</span>
                <span className={`font-semibold ${budgetUtilization > 100 ? 'text-danger' : 'text-primary'}`}>
                  {formatCurrency(totalBudget - totalSpent)}
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    budgetUtilization > 100 ? 'bg-danger' :
                    budgetUtilization > 80 ? 'bg-warning' :
                    'bg-primary'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
              <p className="text-sm text-text-muted mt-2">{budgetUtilization.toFixed(0)}% utilized</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Debt Progress</h3>
          {debts.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No debts recorded</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary">Total Debt</span>
                <span className="font-semibold text-text-primary">{formatCurrency(totalDebt)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary">Amount Paid</span>
                <span className="font-semibold text-primary">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-text-secondary">Remaining</span>
                <span className="font-semibold text-warning">{formatCurrency(remainingDebt)}</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${debtProgress}%` }}
                />
              </div>
              <p className="text-sm text-text-muted mt-2">{debtProgress.toFixed(0)}% paid off</p>
            </div>
          )}
        </Card>
      </div>

      {/* Spending Categories */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Top Spending Categories</h3>
        {categoryData.length === 0 ? (
          <p className="text-text-secondary text-center py-8">No expense data available</p>
        ) : (
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((item, index) => {
              const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0)
              const percentage = (item.amount / totalExpenses) * 100
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-text-primary">{item.category}</span>
                      <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5">
                      <div
                        className="bg-danger h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-text-muted ml-4 w-12 text-right">{percentage.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Recent Transactions</h3>
          <button className="text-sm text-primary hover:text-primaryDark font-medium">
            View All
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-text-secondary text-center py-8">No transactions available</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'INCOME' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="w-5 h-5 text-primary" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{transaction.category}</p>
                    <p className="text-xs text-text-muted">{format(parseISO(transaction.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  transaction.type === 'INCOME' ? 'text-primary' : 'text-danger'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
