import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Overview } from './screens/Overview'
import { Transactions } from './screens/Transactions'
import { Analytics } from './screens/Analytics'
import { Budgets } from './screens/Budgets'
import { Debts } from './screens/Debts'
import { Accounts } from './screens/Accounts'
import { AddTransactionForm } from './components/AddTransactionForm'
import { ChatWidget } from './components/ChatWidget'
import { PageHeader } from './components/layout/PageHeader'
import { toast } from 'sonner'
import { useFinanceStore } from './store/useFinanceStore'
import { useAuth } from './context/AuthContext'
import type { View } from './types'

function App() {
  const {
    transactions,
    summary,
    budgets,
    debts,
    accounts,
    cards,
    isLoading,
    error,
    fetchTransactions,
    fetchSummary,
    fetchBudgets,
    fetchDebts,
    fetchAccounts,
    fetchCards,
    addTransaction,
    deleteTransaction
  } = useFinanceStore()

  const { user, isAuthenticated } = useAuth()

  const [currentView, setCurrentView] = useState<View>('overview')
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'year'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchTransactions()
      fetchSummary()
      fetchBudgets(user.id)
      fetchDebts(user.id)
      fetchAccounts(user.id)
      fetchCards(user.id)
    }
  }, [isAuthenticated, user, fetchTransactions, fetchSummary, fetchBudgets, fetchDebts, fetchAccounts, fetchCards])

  const getFilteredTransactions = () => {
    if (filter === 'ALL') return transactions
    return transactions.filter(t => t.type === filter)
  }

  const filteredTransactions = getFilteredTransactions()

  const handleSubmit = async (data: { type: 'INCOME' | 'EXPENSE'; amount: number; category: string; date: string; description?: string; accountId?: string; cardId?: string }) => {
    if (!data.amount || !data.category || !data.date) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      await addTransaction({
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: data.date,
        description: data.description,
        accountId: data.accountId || undefined,
        cardId: data.cardId || undefined
      })
      toast.success('Transaction added successfully')
      setShowAddForm(false)
    } catch {
      toast.error('Failed to add transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      await deleteTransaction(id)
      toast.success('Transaction deleted successfully')
    } catch {
      toast.error('Failed to delete transaction')
    }
  }

  return (
    <div className="min-h-screen flex gradient-bg relative overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        totalTransactions={transactions.length}
        totalBudgets={budgets.length}
        totalDebts={debts.length}
        totalAccounts={accounts.length + cards.length}
      />

      <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-auto relative z-10">
        {isLoading && (
          <div className="text-center py-8">
            <p className="font-bold uppercase tracking-wider text-slate-400">Loading...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="font-bold uppercase tracking-wider text-rose-400">Error: {error}</p>
          </div>
        )}

        {!isLoading && (
          <>
            <PageHeader
              title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              subtitle="Your financial picture at a glance"
              actions={
                <>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as 'all' | 'month' | 'year')}
                    className="px-4 py-2 glass text-sm font-bold uppercase tracking-wider focus:outline-none text-white rounded-lg hover:bg-white/10 transition-all"
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 glass hover:bg-white/10 transition-all font-bold uppercase tracking-wider text-white rounded-lg"
                  >
                    + Add Transaction
                  </button>
                </>
              }
            />

            <AddTransactionForm
              isOpen={showAddForm}
              onClose={() => setShowAddForm(false)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              accounts={accounts}
              cards={cards}
            />

            {currentView === 'overview' && (
              <Overview
                transactions={filteredTransactions}
                summary={summary ?? { totalIncome: 0, totalExpenses: 0, netCashFlow: 0 }}
                budgets={budgets}
                debts={debts}
              />
            )}

            {currentView === 'transactions' && (
              <Transactions
                transactions={filteredTransactions}
                filter={filter}
                onFilterChange={setFilter}
                onDelete={handleDelete}
                accounts={accounts}
                cards={cards}
              />
            )}

            {currentView === 'analytics' && (
              <Analytics transactions={filteredTransactions} />
            )}

            {currentView === 'budgets' && (
              <Budgets budgets={budgets} />
            )}

            {currentView === 'debts' && (
              <Debts debts={debts} />
            )}

            {currentView === 'accounts' && (
              <Accounts />
            )}
          </>
        )}
      </main>
      <ChatWidget />
    </div>
  )
}

export default App
