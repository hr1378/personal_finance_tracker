import { create } from 'zustand'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
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

interface Summary {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
}

interface FinanceState {
  transactions: Transaction[]
  budgets: Budget[]
  debts: Debt[]
  filter: 'ALL' | 'INCOME' | 'EXPENSE'
  timeFilter: 'all' | 'month' | 'year'
  currentView: 'overview' | 'transactions' | 'analytics' | 'budgets' | 'debts'

  // Actions
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void
  setBudgets: (budgets: Budget[]) => void
  setDebts: (debts: Debt[]) => void
  setFilter: (filter: 'ALL' | 'INCOME' | 'EXPENSE') => void
  setTimeFilter: (filter: 'all' | 'month' | 'year') => void
  setCurrentView: (view: 'overview' | 'transactions' | 'analytics' | 'budgets' | 'debts') => void
  getSummary: () => Summary
  getFilteredTransactions: () => Transaction[]
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  budgets: [],
  debts: [],
  filter: 'ALL',
  timeFilter: 'all',
  currentView: 'overview',

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),

  deleteTransaction: (id) =>
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

  setBudgets: (budgets) => set({ budgets }),

  setDebts: (debts) => set({ debts }),

  setFilter: (filter) => set({ filter }),

  setTimeFilter: (timeFilter) => set({ timeFilter }),

  setCurrentView: (currentView) => set({ currentView }),

  getSummary: () => {
    const { transactions, timeFilter } = get()
    const filtered = get().getFilteredTransactions()

    const totalIncome = filtered
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = filtered
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
    }
  },

  getFilteredTransactions: () => {
    const { transactions, filter, timeFilter } = get()
    const now = new Date()

    let filtered = transactions

    // Filter by type
    if (filter !== 'ALL') {
      filtered = filtered.filter((t) => t.type === filter)
    }

    // Filter by time
    if (timeFilter === 'month') {
      filtered = filtered.filter(
        (t) =>
          new Date(t.date).getMonth() === now.getMonth() &&
          new Date(t.date).getFullYear() === now.getFullYear()
      )
    } else if (timeFilter === 'year') {
      filtered = filtered.filter(
        (t) => new Date(t.date).getFullYear() === now.getFullYear()
      )
    }

    return filtered
  },
}))
