export type View = 'overview' | 'transactions' | 'analytics' | 'budgets' | 'debts'

export interface User {
  id: string
  email: string
  preferredCurrency: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
