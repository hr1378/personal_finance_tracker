import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format, parseISO } from 'date-fns'
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

  const chartData = sortedMonths.map(month => ({
    month: formatMonth(month),
    income: monthlyData[month].income,
    expenses: monthlyData[month].expenses,
    net: monthlyData[month].income - monthlyData[month].expenses
  }))

  return (
    <div className="space-y-6">
      {/* Monthly Trends Chart */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Monthly Trends</h3>
        {sortedMonths.length === 0 ? (
          <p className="text-slate-500 text-center py-8 font-bold">No data available</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip
                  formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="income" fill="#3b82f6" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Net Cash Flow Line Chart */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Net Cash Flow</h3>
        {sortedMonths.length === 0 ? (
          <p className="text-slate-500 text-center py-8 font-bold">No data available</p>
        ) : (
          <div className="h-80">
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
                  dataKey="net"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Net Cash Flow"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6" variant="secondary">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-bold">No data available</p>
            ) : (
              categoryData.map((item, index) => {
                const totalExpenses = Object.values(expenseCategories).reduce((sum, val) => sum + val, 0)
                const percentage = (item.amount / totalExpenses) * 100
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider text-white">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{formatCurrency(item.amount)}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-rose-500 h-3 transition-all duration-500 rounded-full"
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
        <Card className="p-6" variant="secondary">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Spending Patterns</h3>
          <div className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-bold">No expense data available</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Highest Expense</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-white">{categoryData[0]?.category || 'N/A'}</p>
                  <p className="text-lg font-bold text-rose-400 mt-1">{formatCurrency(categoryData[0]?.amount || 0)}</p>
                </div>
                <div className="glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-white">{categoryData.length}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">expense types</p>
                </div>
                <div className="glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Avg per Category</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(Object.values(expenseCategories).reduce((a, b) => a + b, 0) / Object.keys(expenseCategories).length || 0)}</p>
                </div>
                <div className="glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Expenses</p>
                  <p className="text-lg font-bold text-rose-400">{formatCurrency(Object.values(expenseCategories).reduce((a, b) => a + b, 0))}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pie Chart for Expense Distribution */}
      <Card className="p-6" variant="secondary">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Expense Distribution</h3>
        {categoryData.length === 0 ? (
          <p className="text-slate-500 text-center py-8 font-bold">No expense data available</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  nameKey="category"
                  label
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.slice(0, 6).map((entry, index) => (
                    <Cell key={entry.category} fill={['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Income Sources */}
      <Card className="p-6" variant="none">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-6">Income Sources</h3>
        <div className="space-y-3">
          {Object.entries(incomeCategories).length === 0 ? (
            <p className="text-slate-500 text-center py-8 font-bold">No income data available</p>
          ) : (
            Object.entries(incomeCategories)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount], index) => {
                const totalIncome = Object.values(incomeCategories).reduce((sum, val) => sum + val, 0)
                const percentage = (amount / totalIncome) * 100
                return (
                  <div key={index} className="glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-white">{category}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{percentage.toFixed(0)}% of total income</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(amount)}</p>
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
