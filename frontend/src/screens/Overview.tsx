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
  netCashFlow?: number
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

const COLORS = ['#34c759', '#ff3b30', '#007aff', '#ff9500', '#af52de']

const COLORS_STYLES = {
  income: '#34c759',
  expense: '#ff3b30',
  success: '#34c759',
  danger: '#ff3b30',
  warning: '#ff9500',
  successLight: '#e8f9ee',
  dangerLight: '#ffe5e5',
  warningLight: '#fff4e6',
  infoLight: '#e6f2ff',
}

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

  // Calculate net cash flow
  const netCashFlow = (summary?.totalIncome || 0) - (summary?.totalExpenses || 0)

  // Pie chart data
  const pieData = [
    { name: 'Income', value: summary?.totalIncome || 0, color: '#34c759' },
    { name: 'Expenses', value: summary?.totalExpenses || 0, color: '#ff3b30' },
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
          value={formatCurrency(summary?.totalIncome || 0)}
          icon={<TrendingUp className="w-5 h-5 text-accent-success" />}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(summary?.totalExpenses || 0)}
          icon={<TrendingDown className="w-5 h-5 text-accent-danger" />}
        />
        <StatCard
          label="Net Cash Flow"
          value={formatCurrency(netCashFlow)}
          icon={netCashFlow >= 0 ? <ArrowUpRight className="w-5 h-5 text-accent-success" /> : <ArrowDownRight className="w-5 h-5 text-accent-danger" />}
        />
        <StatCard
          label="Total Debt"
          value={formatCurrency(remainingDebt)}
          icon={<CreditCard className="w-5 h-5 text-accent-warning" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary mb-6">Income vs Expenses</h3>
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
          <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary mb-6">Monthly Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" strokeWidth={1} />
                <XAxis dataKey="month" tick={{ fill: '#000000', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: '#000000', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#34c759" name="Income" radius={[0, 0, 0, 0]} />
                <Bar dataKey="expenses" fill="#ff3b30" name="Expenses" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Budget and Debt Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary mb-4">Budget Utilization</h3>
          {budgets.length === 0 ? (
            <p className="text-text-secondary text-center py-8 font-bold">No budgets set</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Total Budget</span>
                <span className="font-bold text-text-primary">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Amount Spent</span>
                <span className="font-bold text-text-primary">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Remaining</span>
                <span className={`font-bold ${budgetUtilization > 100 ? 'text-accent-danger' : 'text-accent-success'}`}>
                  {formatCurrency(totalBudget - totalSpent)}
                </span>
              </div>
              <div className="w-full bg-bg-muted border-brutal-sm border-border-base h-4">
                <div
                  className={`h-4 transition-all duration-500 ${
                    budgetUtilization > 100 ? 'bg-accent-danger' :
                    budgetUtilization > 80 ? 'bg-accent-warning' :
                    'bg-accent-success'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-text-tertiary mt-2">{budgetUtilization.toFixed(0)}% utilized</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary mb-4">Debt Progress</h3>
          {debts.length === 0 ? (
            <p className="text-text-secondary text-center py-8 font-bold">No debts recorded</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Total Debt</span>
                <span className="font-bold text-text-primary">{formatCurrency(totalDebt)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Amount Paid</span>
                <span className="font-bold text-accent-success">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Remaining</span>
                <span className="font-bold text-accent-warning">{formatCurrency(remainingDebt)}</span>
              </div>
              <div className="w-full bg-bg-muted border-brutal-sm border-border-base h-4">
                <div
                  className="bg-accent-success h-4 transition-all duration-500"
                  style={{ width: `${debtProgress}%` }}
                />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-text-tertiary mt-2">{debtProgress.toFixed(0)}% paid off</p>
            </div>
          )}
        </Card>
      </div>

      {/* Spending Categories */}
      <Card className="p-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary mb-4">Top Spending Categories</h3>
        {categoryData.length === 0 ? (
          <p className="text-text-secondary text-center py-8 font-bold">No expense data available</p>
        ) : (
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((item, index) => {
              const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0)
              const percentage = (item.amount / totalExpenses) * 100
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold uppercase tracking-wider text-text-primary">{item.category}</span>
                      <span className="text-sm font-bold text-text-primary">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-bg-muted border-brutal-sm border-border-base h-3">
                      <div
                        className="bg-accent-danger h-3 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary ml-4 w-12 text-right">{percentage.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary">Recent Transactions</h3>
          <button className="text-sm font-bold uppercase tracking-wider text-accent-primary hover:text-accent-primaryHover">
            View All
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-text-secondary text-center py-8 font-bold">No transactions available</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border-brutal-sm border-border-base hover:bg-bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 border-brutal-sm border-border-base flex items-center justify-center ${
                    transaction.type === 'INCOME' ? 'bg-accent-successLight' : 'bg-accent-dangerLight'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="w-5 h-5 text-accent-success" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-accent-danger" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-text-primary">{transaction.category}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">{format(parseISO(transaction.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  transaction.type === 'INCOME' ? 'text-accent-success' : 'text-accent-danger'
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
