import { create } from 'zustand'
import { api } from '../lib/api'
import type { Transaction, TransactionSummary, Budget, Debt, BudgetRequest, DebtRequest } from '../types/finance'

interface FinanceStore {
  transactions: Transaction[]
  summary: TransactionSummary | null
  budgets: Budget[]
  debts: Debt[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchTransactions: (userId?: string, type?: 'INCOME' | 'EXPENSE') => Promise<void>
  loadDemoData: (userId?: string) => void
  fetchSummary: (userId?: string) => Promise<void>
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  fetchBudgets: (userId: string, month?: number, year?: number) => Promise<void>
  addBudget: (data: BudgetRequest) => Promise<void>
  updateBudget: (id: string, data: BudgetRequest) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  fetchDebts: (userId: string) => Promise<void>
  addDebt: (data: DebtRequest) => Promise<void>
  updateDebt: (id: string, data: DebtRequest) => Promise<void>
  deleteDebt: (id: string) => Promise<void>
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: [],
  summary: null,
  budgets: [],
  debts: [],
  isLoading: false,
  error: null,

  loadDemoData: (userId = 'demo-user') => {
    const now = new Date()
    const date = (daysAgo: number) => {
      const value = new Date(now)
      value.setDate(value.getDate() - daysAgo)
      return value.toISOString().slice(0, 10)
    }
    const createdAt = now.toISOString()
    const transactions: Transaction[] = [
      { id: 'demo-1', userId, type: 'INCOME', amount: 6200, category: 'Salary', date: date(27), description: 'Monthly salary', createdAt },
      { id: 'demo-2', userId, type: 'EXPENSE', amount: 1850, category: 'Housing', date: date(24), description: 'Rent and utilities', createdAt },
      { id: 'demo-3', userId, type: 'EXPENSE', amount: 540, category: 'Food', date: date(17), description: 'Groceries and dining', createdAt },
      { id: 'demo-4', userId, type: 'EXPENSE', amount: 160, category: 'Transportation', date: date(11), description: 'Transit and fuel', createdAt },
      { id: 'demo-5', userId, type: 'EXPENSE', amount: 95, category: 'Entertainment', date: date(5), description: 'Streaming and movies', createdAt },
    ]
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((total, transaction) => total + transaction.amount, 0)
    const totalExpenses = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((total, transaction) => total + transaction.amount, 0)
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    set({
      transactions,
      summary: { totalIncome, totalExpenses, netCashFlow: totalIncome - totalExpenses },
      budgets: [
        { id: 'demo-budget-1', userId, category: 'Housing', amount: 2200, spent: 1850, month, year },
        { id: 'demo-budget-2', userId, category: 'Food', amount: 700, spent: 540, month, year },
        { id: 'demo-budget-3', userId, category: 'Transportation', amount: 300, spent: 160, month, year },
      ],
      debts: [
        { id: 'demo-debt-1', userId, name: 'Student loan', totalAmount: 12000, paidAmount: 3500, interestRate: 4.8, dueDate: date(-20) },
        { id: 'demo-debt-2', userId, name: 'Credit card', totalAmount: 2400, paidAmount: 900, interestRate: 18.9, dueDate: date(-12) },
      ],
      error: null,
      isLoading: false,
    })
  },

  fetchTransactions: async (userId?: string, type?: 'INCOME' | 'EXPENSE') => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getTransactions(userId, type)
      set({ transactions: data, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch transactions', isLoading: false })
    }
  },

  fetchSummary: async (userId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getSummary(userId)
      set({ summary: data, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch summary', isLoading: false })
    }
  },

  addTransaction: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const newTransaction = await api.createTransaction(data)
      set((state) => ({
        transactions: [...state.transactions, newTransaction],
        isLoading: false
      }))
      // Refresh summary after adding transaction
      await useFinanceStore.getState().fetchSummary()
    } catch {
      set({ error: 'Failed to add transaction', isLoading: false })
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteTransaction(id)
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isLoading: false
      }))
      // Refresh summary after deleting transaction
      await useFinanceStore.getState().fetchSummary()
    } catch {
      set({ error: 'Failed to delete transaction', isLoading: false })
    }
  },

  fetchBudgets: async (userId: string, month?: number, year?: number) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getBudgets(userId, month, year)
      set({ budgets: data, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch budgets', isLoading: false })
    }
  },

  addBudget: async (data: BudgetRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newBudget = await api.createBudget(data)
      set((state) => ({
        budgets: [...state.budgets, newBudget],
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to add budget', isLoading: false })
    }
  },

  updateBudget: async (id: string, data: BudgetRequest) => {
    set({ isLoading: true, error: null })
    try {
      const updatedBudget = await api.updateBudget(id, data)
      set((state) => ({
        budgets: state.budgets.map(b => b.id === id ? updatedBudget : b),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to update budget', isLoading: false })
    }
  },

  deleteBudget: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteBudget(id)
      set((state) => ({
        budgets: state.budgets.filter(b => b.id !== id),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to delete budget', isLoading: false })
    }
  },

  fetchDebts: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getDebts(userId)
      set({ debts: data, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch debts', isLoading: false })
    }
  },

  addDebt: async (data: DebtRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newDebt = await api.createDebt(data)
      set((state) => ({
        debts: [...state.debts, newDebt],
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to add debt', isLoading: false })
    }
  },

  updateDebt: async (id: string, data: DebtRequest) => {
    set({ isLoading: true, error: null })
    try {
      const updatedDebt = await api.updateDebt(id, data)
      set((state) => ({
        debts: state.debts.map(d => d.id === id ? updatedDebt : d),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to update debt', isLoading: false })
    }
  },

  deleteDebt: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteDebt(id)
      set((state) => ({
        debts: state.debts.filter(d => d.id !== id),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to delete debt', isLoading: false })
    }
  }
}))
