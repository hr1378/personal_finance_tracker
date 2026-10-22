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

// Mock initial data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'INCOME',
    amount: 8500,
    category: 'Salary',
    date: '2026-10-15',
    description: 'Monthly salary'
  },
  {
    id: '2',
    type: 'INCOME',
    amount: 1200,
    category: 'Freelance',
    date: '2026-10-18',
    description: 'Web design project'
  },
  {
    id: '3',
    type: 'INCOME',
    amount: 500,
    category: 'Investment',
    date: '2026-10-20',
    description: 'Stock dividend'
  },
  {
    id: '4',
    type: 'INCOME',
    amount: 350,
    category: 'Freelance',
    date: '2026-10-05',
    description: 'Logo design'
  },
  {
    id: '5',
    type: 'INCOME',
    amount: 200,
    category: 'Investment',
    date: '2026-10-19',
    description: 'Bond interest'
  },
  {
    id: '6',
    type: 'EXPENSE',
    amount: 2500,
    category: 'Rent',
    date: '2026-10-01',
    description: 'Monthly rent payment'
  },
  {
    id: '7',
    type: 'EXPENSE',
    amount: 450,
    category: 'Groceries',
    date: '2026-10-16',
    description: 'Weekly grocery shopping'
  },
  {
    id: '8',
    type: 'EXPENSE',
    amount: 180,
    category: 'Utilities',
    date: '2026-10-10',
    description: 'Electric and water bill'
  },
  {
    id: '9',
    type: 'EXPENSE',
    amount: 320,
    category: 'Transportation',
    date: '2026-10-17',
    description: 'Gas and car maintenance'
  },
  {
    id: '10',
    type: 'EXPENSE',
    amount: 150,
    category: 'Entertainment',
    date: '2026-10-14',
    description: 'Netflix and Spotify'
  },
  {
    id: '11',
    type: 'EXPENSE',
    amount: 95,
    category: 'Dining',
    date: '2026-10-12',
    description: 'Restaurant dinner'
  },
  {
    id: '12',
    type: 'EXPENSE',
    amount: 280,
    category: 'Healthcare',
    date: '2026-10-08',
    description: 'Doctor visit and medication'
  },
  {
    id: '13',
    type: 'EXPENSE',
    amount: 175,
    category: 'Shopping',
    date: '2026-10-11',
    description: 'Clothing and accessories'
  },
  {
    id: '14',
    type: 'EXPENSE',
    amount: 120,
    category: 'Insurance',
    date: '2026-10-03',
    description: 'Monthly insurance premium'
  },
  {
    id: '15',
    type: 'EXPENSE',
    amount: 85,
    category: 'Internet',
    date: '2026-10-02',
    description: 'Internet and phone bill'
  },
  {
    id: '16',
    type: 'EXPENSE',
    amount: 210,
    category: 'Fitness',
    date: '2026-10-09',
    description: 'Gym membership'
  },
  {
    id: '17',
    type: 'EXPENSE',
    amount: 65,
    category: 'Education',
    date: '2026-10-07',
    description: 'Online course subscription'
  },
  {
    id: '18',
    type: 'EXPENSE',
    amount: 145,
    category: 'Personal Care',
    date: '2026-10-13',
    description: 'Haircut and grooming'
  },
  {
    id: '19',
    type: 'INCOME',
    amount: 400,
    category: 'Bonus',
    date: '2026-10-22',
    description: 'Performance bonus'
  },
  {
    id: '20',
    type: 'EXPENSE',
    amount: 220,
    category: 'Home',
    date: '2026-10-21',
    description: 'Home supplies'
  }
]

// Mock budget data
const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Groceries',
    amount: 500,
    spent: 450,
    month: 10,
    year: 2026
  },
  {
    id: '2',
    category: 'Entertainment',
    amount: 200,
    spent: 150,
    month: 10,
    year: 2026
  },
  {
    id: '3',
    category: 'Transportation',
    amount: 400,
    spent: 320,
    month: 10,
    year: 2026
  },
  {
    id: '4',
    category: 'Dining',
    amount: 300,
    spent: 280,
    month: 10,
    year: 2026
  }
]

// Mock debt data
const mockDebts: Debt[] = [
  {
    id: '1',
    name: 'Credit Card',
    totalAmount: 5000,
    paidAmount: 2000,
    interestRate: 18.5,
    dueDate: '2027-01-15'
  },
  {
    id: '2',
    name: 'Student Loan',
    totalAmount: 25000,
    paidAmount: 10000,
    interestRate: 4.5,
    dueDate: '2030-06-01'
  },
  {
    id: '3',
    name: 'Car Loan',
    totalAmount: 15000,
    paidAmount: 7500,
    interestRate: 6.2,
    dueDate: '2028-03-20'
  }
]

function App() {
  const {
    transactions,
    budgets,
    debts,
    currentView,
    filter,
    timeFilter,
    setTransactions,
    setBudgets,
    setDebts,
    setCurrentView,
    setFilter,
    setTimeFilter,
    addTransaction,
    deleteTransaction,
    getSummary,
    getFilteredTransactions
  } = useFinanceStore()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Initialize store with mock data
  useEffect(() => {
    setTransactions(mockTransactions)
    setBudgets(mockBudgets)
    setDebts(mockDebts)
  }, [setTransactions, setBudgets, setDebts])

  const filteredTransactions = getFilteredTransactions()
  const summary = getSummary()

  const handleSubmit = (data: any) => {
    setError('')

    if (!data.amount || !data.category || !data.date) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: data.date,
        description: data.description || undefined
      }

      addTransaction(newTransaction)
      toast.success('Transaction added successfully')
      setShowAddForm(false)
      setIsSubmitting(false)
    }, 500)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    deleteTransaction(id)
    toast.success('Transaction deleted successfully')
  }

  return (
    <div className="min-h-screen bg-bg-base flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        totalTransactions={transactions.length}
        totalBudgets={budgets.length}
        totalDebts={debts.length}
      />

      <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-auto">
        <PageHeader
          title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          subtitle="Your financial picture at a glance"
          actions={
            <>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as 'all' | 'month' | 'year')}
                className="px-4 py-2 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-accent-primary bg-bg-surface text-sm text-text-primary"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-accent-primary text-white px-4 py-2 rounded-button hover:bg-accent-primaryHover transition-colors font-medium"
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
      </main>
    </div>
  )
}

export default App
