const TRANSACTION_API_URL = 'http://localhost:8082/api'
const BUDGET_API_URL = 'http://localhost:8083/api'
const DEBT_API_URL = 'http://localhost:8084/api'

export type {
  Transaction,
  TransactionSummary,
  TransactionRequest,
  Budget,
  BudgetRequest,
  Debt,
  DebtRequest
} from '../types/finance'

// Backend API response types (internal)
interface BackendBudget {
  id: string
  userId: string
  category: string
  spendingLimit: number
  month: number
  year: number
  createdAt: string
  updatedAt: string
}

interface BackendDebt {
  id: string
  userId: string
  name: string
  originalBalance: number
  currentBalance: number
  apr: number
  minimumPayment: number
  dueDate: string
  createdAt: string
  updatedAt: string
}

export const api = {
  // ==================== TRANSACTIONS ====================
  // Get all transactions
  async getTransactions(userId?: string, type?: 'INCOME' | 'EXPENSE'): Promise<Transaction[]> {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (type) params.append('type', type)

    const response = await fetch(`${TRANSACTION_API_URL}/transactions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return response.json()
  },

  // Get transaction by ID
  async getTransactionById(id: string): Promise<Transaction> {
    const response = await fetch(`${TRANSACTION_API_URL}/transactions/${id}`)
    if (!response.ok) throw new Error('Failed to fetch transaction')
    return response.json()
  },

  // Create transaction
  async createTransaction(data: TransactionRequest): Promise<Transaction> {
    const response = await fetch(`${TRANSACTION_API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create transaction')
    return response.json()
  },

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${TRANSACTION_API_URL}/transactions/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete transaction')
  },

  // Get summary
  async getSummary(userId?: string): Promise<TransactionSummary> {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)

    const response = await fetch(`${TRANSACTION_API_URL}/transactions/summary?${params}`)
    if (!response.ok) throw new Error('Failed to fetch summary')
    return response.json()
  },

  // ==================== BUDGETS ====================
  // Get budgets by user
  async getBudgets(userId: string, month?: number, year?: number): Promise<Budget[]> {
    let url = `${BUDGET_API_URL}/budgets/user/${userId}`
    if (month !== undefined && year !== undefined) {
      url += `/month/${month}/year/${year}`
    }
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch budgets')
    const backendBudgets: BackendBudget[] = await response.json()
    // Transform backend response to frontend format
    return backendBudgets.map(b => ({
      id: b.id,
      userId: b.userId,
      category: b.category,
      amount: b.spendingLimit,
      spent: 0, // Would need to calculate from transactions
      month: b.month,
      year: b.year
    }))
  },

  // Get budget by ID
  async getBudgetById(id: string): Promise<Budget> {
    const response = await fetch(`${BUDGET_API_URL}/budgets/${id}`)
    if (!response.ok) throw new Error('Failed to fetch budget')
    return response.json()
  },

  // Create budget
  async createBudget(data: BudgetRequest): Promise<Budget> {
    const backendData = {
      userId: data.userId,
      category: data.category,
      spendingLimit: data.amount,
      month: data.month,
      year: data.year
    }
    const response = await fetch(`${BUDGET_API_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendData)
    })
    if (!response.ok) throw new Error('Failed to create budget')
    const backendBudget: BackendBudget = await response.json()
    return {
      id: backendBudget.id,
      userId: backendBudget.userId,
      category: backendBudget.category,
      amount: backendBudget.spendingLimit,
      spent: 0,
      month: backendBudget.month,
      year: backendBudget.year
    }
  },

  // Update budget
  async updateBudget(id: string, data: BudgetRequest): Promise<Budget> {
    const backendData = {
      userId: data.userId,
      category: data.category,
      spendingLimit: data.amount,
      month: data.month,
      year: data.year
    }
    const response = await fetch(`${BUDGET_API_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendData)
    })
    if (!response.ok) throw new Error('Failed to update budget')
    const backendBudget: BackendBudget = await response.json()
    return {
      id: backendBudget.id,
      userId: backendBudget.userId,
      category: backendBudget.category,
      amount: backendBudget.spendingLimit,
      spent: 0,
      month: backendBudget.month,
      year: backendBudget.year
    }
  },

  // Delete budget
  async deleteBudget(id: string): Promise<void> {
    const response = await fetch(`${BUDGET_API_URL}/budgets/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete budget')
  },

  // ==================== DEBTS ====================
  // Get debts by user
  async getDebts(userId: string): Promise<Debt[]> {
    const response = await fetch(`${DEBT_API_URL}/debts/user/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch debts')
    const backendDebts: BackendDebt[] = await response.json()
    // Transform backend response to frontend format
    return backendDebts.map(d => ({
      id: d.id,
      userId: d.userId,
      name: d.name,
      totalAmount: d.originalBalance,
      paidAmount: d.originalBalance - d.currentBalance,
      interestRate: d.apr,
      dueDate: d.dueDate
    }))
  },

  // Get debt by ID
  async getDebtById(id: string): Promise<Debt> {
    const response = await fetch(`${DEBT_API_URL}/debts/${id}`)
    if (!response.ok) throw new Error('Failed to fetch debt')
    return response.json()
  },

  // Create debt
  async createDebt(data: DebtRequest): Promise<Debt> {
    const backendData = {
      userId: data.userId,
      name: data.name,
      originalBalance: data.totalAmount,
      currentBalance: data.totalAmount,
      apr: data.interestRate,
      minimumPayment: 0, // Would need to be calculated or provided
      dueDate: data.dueDate
    }
    const response = await fetch(`${DEBT_API_URL}/debts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendData)
    })
    if (!response.ok) throw new Error('Failed to create debt')
    const backendDebt: BackendDebt = await response.json()
    return {
      id: backendDebt.id,
      userId: backendDebt.userId,
      name: backendDebt.name,
      totalAmount: backendDebt.originalBalance,
      paidAmount: backendDebt.originalBalance - backendDebt.currentBalance,
      interestRate: backendDebt.apr,
      dueDate: backendDebt.dueDate
    }
  },

  // Update debt
  async updateDebt(id: string, data: DebtRequest): Promise<Debt> {
    const backendData = {
      userId: data.userId,
      name: data.name,
      originalBalance: data.totalAmount,
      currentBalance: data.totalAmount, // Would need to track separately
      apr: data.interestRate,
      minimumPayment: 0,
      dueDate: data.dueDate
    }
    const response = await fetch(`${DEBT_API_URL}/debts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendData)
    })
    if (!response.ok) throw new Error('Failed to update debt')
    const backendDebt: BackendDebt = await response.json()
    return {
      id: backendDebt.id,
      userId: backendDebt.userId,
      name: backendDebt.name,
      totalAmount: backendDebt.originalBalance,
      paidAmount: backendDebt.originalBalance - backendDebt.currentBalance,
      interestRate: backendDebt.apr,
      dueDate: backendDebt.dueDate
    }
  },

  // Delete debt
  async deleteDebt(id: string): Promise<void> {
    const response = await fetch(`${DEBT_API_URL}/debts/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete debt')
  }
}
