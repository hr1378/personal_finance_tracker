import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, PiggyBank, Target } from 'lucide-react'
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
          icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
          variant="secondary"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(summary?.totalExpenses || 0)}
          icon={<TrendingDown className="w-6 h-6 text-rose-400" />}
          variant="secondary"
        />
        <StatCard
          label="Net Cash Flow"
          value={formatCurrency(netCashFlow)}
          icon={netCashFlow >= 0 ? <ArrowUpRight className="w-6 h-6 text-blue-400" /> : <ArrowDownRight className="w-6 h-6 text-rose-400" />}
          variant="secondary"
        />
        <StatCard
          label="Total Debt"
          value={formatCurrency(remainingDebt)}
          icon={<CreditCard className="w-6 h-6 text-amber-400" />}
          variant="secondary"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" variant="secondary">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Income vs Expenses</h3>
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
                <Tooltip
                  formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6" variant="secondary">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Monthly Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip
                  formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="income" fill="#3b82f6" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Cash Flow Trend Line Chart */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Cash Flow Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
              <Tooltip
                formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Area Chart for Spending */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Spending Over Time</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
              <Tooltip
                formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                fill="url(#expenseGradient)"
                strokeWidth={2}
                name="Expenses"
              />
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Scatter Plot - Spending vs Amount */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Transaction Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={transactions.slice(0, 100).map((t, i) => ({
              x: i,
              y: t.amount,
              z: t.type === 'INCOME' ? 10 : 5,
              type: t.type
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="x" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }} />
              <YAxis dataKey="y" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Scatter dataKey="y" fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Radar Chart - Category Analysis */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Category Analysis</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={categoryData.slice(0, 6).map(c => ({
              category: c.category,
              amount: c.amount
            }))}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }} />
              <Radar
                name="Spending"
                dataKey="amount"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Budget and Debt Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" variant="secondary">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Budget Utilization</h3>
          </div>
          {budgets.length === 0 ? (
            <p className="text-slate-500 text-center py-8 font-bold">No budgets set</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
                <span className="font-bold text-white">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Amount Spent</span>
                <span className="font-bold text-white">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Remaining</span>
                <span className={`font-bold ${budgetUtilization > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatCurrency(totalBudget - totalSpent)}
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 transition-all duration-500 rounded-full ${
                    budgetUtilization > 100 ? 'bg-rose-500' :
                    budgetUtilization > 80 ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mt-2">{budgetUtilization.toFixed(0)}% utilized</p>
            </div>
          )}
        </Card>

        <Card className="p-6" variant="secondary">
          <div className="flex items-center gap-3 mb-4">
            <PiggyBank className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Debt Progress</h3>
          </div>
          {debts.length === 0 ? (
            <p className="text-slate-500 text-center py-8 font-bold">No debts recorded</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Debt</span>
                <span className="font-bold text-white">{formatCurrency(totalDebt)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Amount Paid</span>
                <span className="font-bold text-emerald-400">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Remaining</span>
                <span className="font-bold text-amber-400">{formatCurrency(remainingDebt)}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-4 transition-all duration-500 rounded-full"
                  style={{ width: `${debtProgress}%` }}
                />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mt-2">{debtProgress.toFixed(0)}% paid off</p>
            </div>
          )}
        </Card>
      </div>

      {/* Spending Categories */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-4">Top Spending Categories</h3>
        {categoryData.length === 0 ? (
          <p className="text-slate-500 text-center py-8 font-bold">No expense data available</p>
        ) : (
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((item, index) => {
              const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0)
              const percentage = (item.amount / totalExpenses) * 100
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold uppercase tracking-wider text-white">{item.category}</span>
                      <span className="text-sm font-bold text-white">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-rose-500 h-3 transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-4 w-12 text-right">{percentage.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6" variant="none">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">Recent Transactions</h3>
          <button className="text-sm font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors">
            View All
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8 font-bold">No transactions available</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center glass ${
                    transaction.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-white">{transaction.category}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{format(parseISO(transaction.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  transaction.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
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
