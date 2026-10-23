import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Overview } from './screens/Overview'
import { Transactions } from './screens/Transactions'
import { Analytics } from './screens/Analytics'
import { Budgets } from './screens/Budgets'
import { Debts } from './screens/Debts'
import { AddTransactionForm } from './components/AddTransactionForm'
import { PageHeader } from './components/layout/PageHeader'
import { toast } from 'sonner'
import { useFinanceStore } from './store/useFinanceStore'
import type { View } from './types'
import type { Budget, Debt } from './types/finance'

function App() {
  const {
    transactions,
    summary,
    budgets,
    debts,
    isLoading,
    error,
    fetchTransactions,
    fetchSummary,
    fetchBudgets,
    fetchDebts,
    addTransaction,
    deleteTransaction
  } = useFinanceStore()

  const [currentView, setCurrentView] = useState<View>('overview')
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'year'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    fetchTransactions()
    fetchSummary()
    // Using a hardcoded userId for now - will be replaced with auth later
    const userId = '550e8400-e29b-41d4-a716-446655440000'
    fetchBudgets(userId)
    fetchDebts(userId)
  }, [fetchTransactions, fetchSummary, fetchBudgets, fetchDebts])

  const getFilteredTransactions = () => {
    if (filter === 'ALL') return transactions
    return transactions.filter(t => t.type === filter)
  }

  const filteredTransactions = getFilteredTransactions()

  const handleSubmit = async (data: any) => {
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
        description: data.description
      })
      toast.success('Transaction added successfully')
      setShowAddForm(false)
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete transaction')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#ffffff' }}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        totalTransactions={transactions.length}
        totalBudgets={budgets.length}
        totalDebts={debts.length}
      />

      <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-auto">
        {isLoading && (
          <div className="text-center py-8">
            <p className="font-bold uppercase tracking-wider">Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="font-bold uppercase tracking-wider" style={{ color: '#ff3b30' }}>Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <PageHeader
              title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              subtitle="Your financial picture at a glance"
              actions={
                <>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as 'all' | 'month' | 'year')}
                    className="px-4 py-2 brutal-border brutal-shadow-sm text-sm font-bold uppercase tracking-wider focus:outline-none"
                    style={{ backgroundColor: '#f4f4f0', color: '#000000', borderColor: '#000000' }}
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 brutal-border brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-bold uppercase tracking-wider"
                    style={{ backgroundColor: '#ff3b30', color: '#ffffff', borderColor: '#000000' }}
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
            />

            {currentView === 'overview' && (
              <Overview transactions={filteredTransactions} summary={summary} budgets={budgets} debts={debts} />
            )}

            {currentView === 'transactions' && (
              <Transactions
                transactions={filteredTransactions}
                filter={filter}
                onFilterChange={setFilter}
                onDelete={handleDelete}
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
          </>
        )}
      </main>
    </div>
  )
}

export default App
