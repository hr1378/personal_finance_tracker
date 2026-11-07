import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'
import { useAuth } from './context/AuthContext'

vi.mock('./context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}))

vi.mock('./store/useFinanceStore', () => ({
  useFinanceStore: () => ({
    transactions: [],
    summary: null,
    budgets: [],
    debts: [],
    accounts: [],
    cards: [],
    isLoading: false,
    error: null,
    fetchTransactions: vi.fn(),
    fetchSummary: vi.fn(),
    fetchBudgets: vi.fn(),
    fetchDebts: vi.fn(),
    fetchAccounts: vi.fn(),
    fetchCards: vi.fn(),
    addTransaction: vi.fn(),
    deleteTransaction: vi.fn()
  })
}))

describe('App', () => {
  it('renders without crashing', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn()
    } as never)

    render(<App />)
    expect(document.body).toBeInTheDocument()
  })
})
