import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accounts } from './Accounts'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Account, Card } from '../types/finance'

const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    userId: 'user-1',
    name: 'Everyday Checking',
    institution: 'Chase',
    accountType: 'CHECKING',
    currency: 'USD',
    currentBalance: 2500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'acc-2',
    userId: 'user-1',
    name: 'High-Yield Savings',
    institution: 'Marcus',
    accountType: 'SAVINGS',
    currency: 'USD',
    currentBalance: 10000,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const mockCards: Card[] = [
  {
    id: 'card-1',
    userId: 'user-1',
    accountId: 'acc-1',
    name: 'Chase Sapphire',
    cardType: 'CREDIT',
    lastFour: '4242',
    network: 'VISA',
    creditLimit: 10000,
    currentBalance: 1200,
    apr: 19.99,
    expiryMonth: 12,
    expiryYear: 2027,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('Accounts screen', () => {
  beforeEach(() => {
    useFinanceStore.setState({
      accounts: mockAccounts,
      cards: mockCards,
      isLoading: false,
      error: null
    })
  })

  it('renders summary cards with totals', () => {
    render(<Accounts />)

    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getAllByText('Bank Accounts').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cards').length).toBeGreaterThan(0)
    expect(screen.getByText('Credit Used')).toBeInTheDocument()
    // $12,500 total balance across 2 accounts
    expect(screen.getByText('$12,500.00')).toBeInTheDocument()
  })

  it('lists accounts and cards', () => {
    render(<Accounts />)

    expect(screen.getByText('Everyday Checking')).toBeInTheDocument()
    expect(screen.getByText('High-Yield Savings')).toBeInTheDocument()
    expect(screen.getByText('Chase Sapphire')).toBeInTheDocument()
    expect(screen.getByText(/4242/)).toBeInTheDocument()
  })

  it('shows empty state when no accounts or cards', () => {
    useFinanceStore.setState({ accounts: [], cards: [] })
    render(<Accounts />)

    expect(screen.getByText(/No accounts yet/)).toBeInTheDocument()
    expect(screen.getByText(/No cards yet/)).toBeInTheDocument()
  })

  it('opens account form when Add Account is clicked', async () => {
    const user = userEvent.setup()
    render(<Accounts />)

    await user.click(screen.getByRole('button', { name: /Add Account/i }))

    expect(screen.getByText('Add New Account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Everyday Checking/)).toBeInTheDocument()
  })

  it('opens card form when Add Card is clicked', async () => {
    const user = userEvent.setup()
    render(<Accounts />)

    await user.click(screen.getByRole('button', { name: /Add Card/i }))

    expect(screen.getByText('Add New Card')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Chase Sapphire/)).toBeInTheDocument()
  })
})
