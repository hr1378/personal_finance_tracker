import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Trash2, ArrowUpRight, ArrowDownRight, Landmark, CreditCard } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../lib/utils'
import type { Account, Card as CardData } from '../types/finance'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
  accountId?: string
  cardId?: string
}

interface TransactionsProps {
  transactions: Transaction[]
  filter: 'ALL' | 'INCOME' | 'EXPENSE'
  onFilterChange: (filter: 'ALL' | 'INCOME' | 'EXPENSE') => void
  onDelete: (id: string) => void
  accounts?: Account[]
  cards?: CardData[]
}

export function Transactions({ transactions, filter, onFilterChange, onDelete, accounts = [], cards = [] }: TransactionsProps) {
  const [page, setPage] = useState(1)
  const pageSize = 50

  const displayTransactions = filter === 'ALL'
    ? transactions
    : transactions.filter(t => t.type === filter)

  const pageCount = Math.max(1, Math.ceil(displayTransactions.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paginatedTransactions = displayTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Card className="p-6" gradient="none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white">All Transactions</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold uppercase tracking-wider text-white/70">Filter:</label>
          <select
            value={filter}
            onChange={(e) => {
              onFilterChange(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')
              setPage(1)
            }}
            className="px-4 py-2 glass text-sm font-bold uppercase tracking-wider text-white focus:outline-none rounded-xl hover:bg-white/20 transition-all"
          >
            <option value="ALL">All</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expenses</option>
          </select>
        </div>
      </div>

      {displayTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 glass rounded-xl flex items-center justify-center mb-4 glow-purple">
            <ArrowUpRight className="w-8 h-8 text-white/70" />
          </div>
          <p className="text-white text-lg font-bold uppercase tracking-wider">No transactions found</p>
          <p className="text-white/60 text-sm mt-1">Add your first transaction to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-white/70">Date</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-white/70">Type</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-white/70">Category</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-white/70">Description</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-white/70">Amount</th>
                <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-white/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="py-4 px-4 text-sm text-white font-bold">{format(parseISO(transaction.date), 'MMM d, yyyy')}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 glass rounded-lg text-xs font-bold uppercase tracking-wider ${
                      transaction.type === 'INCOME'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'INCOME' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold uppercase tracking-wider text-white">
                    {transaction.category}
                    {(transaction.accountId || transaction.cardId) && (
                      <div className="flex items-center gap-2 mt-1">
                        {transaction.accountId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 glass rounded text-[10px] font-bold uppercase tracking-wider text-blue-300">
                            <Landmark className="w-3 h-3" />
                            {accounts.find(a => a.id === transaction.accountId)?.name || 'Account'}
                          </span>
                        )}
                        {transaction.cardId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 glass rounded text-[10px] font-bold uppercase tracking-wider text-purple-300">
                            <CreditCard className="w-3 h-3" />
                            {cards.find(c => c.id === transaction.cardId)?.name || 'Card'}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-white/60">{transaction.description || '-'}</td>
                  <td className="py-4 px-4 text-sm text-right font-bold">
                    <span className={transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-white/60 hover:text-red-400 focus:outline-none rounded p-1 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                Showing {paginatedTransactions.length} of {displayTransactions.length} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 glass rounded-lg text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
                >
                  Prev
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="px-3 py-1.5 glass rounded-lg text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
