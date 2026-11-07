import { create } from 'zustand'
import { api } from '../lib/api'
import type { Transaction, TransactionSummary, Budget, Debt, BudgetRequest, DebtRequest, Account, AccountRequest, Card, CardRequest } from '../types/finance'

interface FinanceStore {
  transactions: Transaction[]
  summary: TransactionSummary | null
  budgets: Budget[]
  debts: Debt[]
  accounts: Account[]
  cards: Card[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchTransactions: (userId?: string, type?: 'INCOME' | 'EXPENSE') => Promise<void>
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
  fetchAccounts: (userId: string) => Promise<void>
  addAccount: (data: AccountRequest) => Promise<void>
  updateAccount: (id: string, data: AccountRequest) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  fetchCards: (userId: string) => Promise<void>
  addCard: (data: CardRequest) => Promise<void>
  updateCard: (id: string, data: CardRequest) => Promise<void>
  deleteCard: (id: string) => Promise<void>
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: [],
  summary: null,
  budgets: [],
  debts: [],
  accounts: [],
  cards: [],
  isLoading: false,
  error: null,

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
  },

  fetchAccounts: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getAccounts(userId)
      set({ accounts: data, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch accounts', isLoading: false })
    }
  },

  addAccount: async (data: AccountRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newAccount = await api.createAccount(data)
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to add account', isLoading: false })
    }
  },

  updateAccount: async (id: string, data: AccountRequest) => {
    set({ isLoading: true, error: null })
    try {
      const updatedAccount = await api.updateAccount(id, data)
      set((state) => ({
        accounts: state.accounts.map(a => a.id === id ? updatedAccount : a),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to update account', isLoading: false })
    }
  },

  deleteAccount: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteAccount(id)
      set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id),
        // Clear account links on cards pointing to the deleted account
        cards: state.cards.map(c => c.accountId === id ? { ...c, accountId: undefined } : c),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to delete account', isLoading: false })
    }
  },

  fetchCards: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getCards(userId)
      set({ cards: data, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch cards', isLoading: false })
    }
  },

  addCard: async (data: CardRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newCard = await api.createCard(data)
      set((state) => ({
        cards: [...state.cards, newCard],
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to add card', isLoading: false })
    }
  },

  updateCard: async (id: string, data: CardRequest) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCard = await api.updateCard(id, data)
      set((state) => ({
        cards: state.cards.map(c => c.id === id ? updatedCard : c),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to update card', isLoading: false })
    }
  },

  deleteCard: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteCard(id)
      set((state) => ({
        cards: state.cards.filter(c => c.id !== id),
        isLoading: false
      }))
    } catch {
      set({ error: 'Failed to delete card', isLoading: false })
    }
  }
}))
