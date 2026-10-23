export interface Transaction {
  id: string
  userId: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
  createdAt: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
}

export interface TransactionRequest {
  userId?: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  amount: number
  spent: number
  month: number
  year: number
}

export interface BudgetRequest {
  userId: string
  category: string
  amount: number
  month: number
  year: number
}

export interface Debt {
  id: string
  userId: string
  name: string
  totalAmount: number
  paidAmount: number
  interestRate: number
  dueDate: string
}

export interface DebtRequest {
  userId: string
  name: string
  totalAmount: number
  interestRate: number
  dueDate: string
}
