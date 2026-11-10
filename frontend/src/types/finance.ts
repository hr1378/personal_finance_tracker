export interface Transaction {
  id: string
  userId: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
  accountId?: string
  cardId?: string
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
  accountId?: string
  cardId?: string
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

export type AccountType = 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET'
export type CardType = 'CREDIT' | 'DEBIT'
export type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'OTHER'

export interface Account {
  id: string
  userId: string
  name: string
  institution?: string
  accountType: AccountType
  currency: string
  currentBalance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AccountRequest {
  userId?: string
  name: string
  institution?: string
  accountType: AccountType
  currency?: string
  currentBalance: number
  isActive?: boolean
}

export interface Card {
  id: string
  userId: string
  accountId?: string
  name: string
  cardType: CardType
  lastFour?: string
  network?: CardNetwork
  creditLimit?: number
  currentBalance: number
  apr?: number
  expiryMonth?: number
  expiryYear?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CardRequest {
  userId?: string
  accountId?: string
  name: string
  cardType: CardType
  lastFour?: string
  network?: CardNetwork
  creditLimit?: number
  currentBalance: number
  apr?: number
  expiryMonth?: number
  expiryYear?: number
  isActive?: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  actions?: string[]
}

export interface ChatRequest {
  message: string
  includeFinanceData: boolean
  history?: ChatMessage[]
}

export interface ChatResponse {
  reply: string
  provider: string
}

export interface AgentChatResponse {
  reply: string
  provider: string
  actions_taken: string[]
}
