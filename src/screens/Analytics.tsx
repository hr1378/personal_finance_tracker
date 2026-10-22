import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, Activity } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../lib/utils'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
}

interface AnalyticsProps {
  transactions: Transaction[]
}

export function Analytics({ transactions }: AnalyticsProps) {
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return format(date, 'MMM yy')
  }

  // Calculate category breakdown
  const expenseCategories = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const incomeCategories = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categoryData = Object.entries(expenseCategories)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  const maxCategoryAmount = Math.max(...categoryData.map(c => c.amount), 1)

  // Calculate monthly trends
  const monthlyData = transactions.reduce((acc, t) => {
    const date = parseISO(t.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
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

  const sortedMonths = Object.keys(monthlyData).sort().slice(-6)
  const maxMonthlyAmount = Math.max(
    ...sortedMonths.map(m => Math.max(monthlyData[m].income, monthlyData[m].expenses)),
    1
  )

  const chartData = sortedMonths.map(month => ({
    month: formatMonth(month),
    income: monthlyData[month].income,
    expenses: monthlyData[month].expenses,
    net: monthlyData[month].income - monthlyData[month].expenses
  }))

  return (
    <div className="space-y-6">
      {/* Monthly Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Monthly Trends</h3>
        {sortedMonths.length === 0 ? (
          <p className="text-text-secondary text-center py-8">No data available</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No data available</p>
            ) : (
              categoryData.map((item, index) => {
                const totalExpenses = Object.values(expenseCategories).reduce((sum, val) => sum + val, 0)
                const percentage = (item.amount / totalExpenses) * 100
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text-primary">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.amount)}</span>
                        <span className="text-xs text-text-muted">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-danger h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.amount / maxCategoryAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Spending Patterns */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Spending Patterns</h3>
          <div className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No expense data available</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Highest Expense</p>
                  <p className="text-sm font-semibold text-text-primary">{categoryData[0]?.category || 'N/A'}</p>
                  <p className="text-lg font-bold text-danger mt-1">{formatCurrency(categoryData[0]?.amount || 0)}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-text-primary">{categoryData.length}</p>
                  <p className="text-xs text-text-muted mt-1">expense types</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Avg per Category</p>
                  <p className="text-lg font-bold text-text-primary">{formatCurrency(Object.values(expenseCategories).reduce((a, b) => a + b, 0) / Object.keys(expenseCategories).length || 0)}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Total Expenses</p>
                  <p className="text-lg font-bold text-danger">{formatCurrency(Object.values(expenseCategories).reduce((a, b) => a + b, 0))}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Income Sources */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Income Sources</h3>
        <div className="space-y-3">
          {Object.entries(incomeCategories).length === 0 ? (
            <p className="text-text-secondary text-center py-8">No income data available</p>
          ) : (
            Object.entries(incomeCategories)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount], index) => {
                const totalIncome = Object.values(incomeCategories).reduce((sum, val) => sum + val, 0)
                const percentage = (amount / totalIncome) * 100
                return (
                  <div key={index} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-emerald-800">{category}</p>
                        <p className="text-xs text-emerald-600 mt-1">{percentage.toFixed(0)}% of total income</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(amount)}</p>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </Card>
    </div>
  )
}
