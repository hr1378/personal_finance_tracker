import { format, parseISO } from 'date-fns'
import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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

interface TransactionsProps {
  transactions: Transaction[]
  filter: 'ALL' | 'INCOME' | 'EXPENSE'
  onFilterChange: (filter: 'ALL' | 'INCOME' | 'EXPENSE') => void
  onDelete: (id: string) => void
}

export function Transactions({ transactions, filter, onFilterChange, onDelete }: TransactionsProps) {
  const displayTransactions = filter === 'ALL'
    ? transactions
    : transactions.filter(t => t.type === filter)

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary">All Transactions</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold uppercase tracking-wider text-text-tertiary">Filter:</label>
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')}
            className="px-4 py-2 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-sm font-bold uppercase tracking-wider text-text-primary focus:outline-none focus:brutal-shadow"
          >
            <option value="ALL">All</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expenses</option>
          </select>
        </div>
      </div>

      {displayTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 border-brutal border-border-base bg-bg-accent flex items-center justify-center mb-4">
            <ArrowUpRight className="w-8 h-8 text-text-tertiary" />
          </div>
          <p className="text-text-primary text-lg font-bold uppercase tracking-wider">No transactions found</p>
          <p className="text-text-secondary text-sm mt-1">Add your first transaction to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-brutal border-border-base">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-text-primary">Date</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-text-primary">Type</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-text-primary">Category</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-text-primary">Description</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-text-primary">Amount</th>
                <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b-brutal-sm border-border-base hover:bg-bg-muted transition-colors">
                  <td className="py-4 px-4 text-sm text-text-primary font-bold">{format(parseISO(transaction.date), 'MMM d, yyyy')}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 border-brutal-sm border-border-base text-xs font-bold uppercase tracking-wider ${
                      transaction.type === 'INCOME'
                        ? 'bg-accent-successLight text-accent-success'
                        : 'bg-accent-dangerLight text-accent-danger'
                    }`}>
                      {transaction.type === 'INCOME' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold uppercase tracking-wider text-text-primary">{transaction.category}</td>
                  <td className="py-4 px-4 text-sm text-text-secondary">{transaction.description || '-'}</td>
                  <td className="py-4 px-4 text-sm text-right font-bold">
                    <span className={transaction.type === 'INCOME' ? 'text-accent-success' : 'text-accent-danger'}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-text-tertiary hover:text-accent-danger focus:outline-none rounded p-1 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
