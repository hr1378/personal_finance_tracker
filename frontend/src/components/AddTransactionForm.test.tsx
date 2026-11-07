import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTransactionForm } from './AddTransactionForm'
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
  }
]

const mockCards: Card[] = [
  {
    id: 'card-1',
    userId: 'user-1',
    name: 'Chase Sapphire',
    cardType: 'CREDIT',
    lastFour: '4242',
    network: 'VISA',
    creditLimit: 10000,
    currentBalance: 1200,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('AddTransactionForm', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false
  }

  it('renders nothing when closed', () => {
    const { container } = render(<AddTransactionForm {...defaultProps} isOpen={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders account and card selectors when accounts and cards exist', () => {
    render(<AddTransactionForm {...defaultProps} accounts={mockAccounts} cards={mockCards} />)

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    expect(screen.getByText('Everyday Checking')).toBeInTheDocument()
    expect(screen.getByText(/Chase Sapphire/)).toBeInTheDocument()
  })

  it('hides account and card selectors when none exist', () => {
    render(<AddTransactionForm {...defaultProps} />)

    expect(screen.queryByText('Account')).not.toBeInTheDocument()
    expect(screen.queryByText('Card')).not.toBeInTheDocument()
  })

  it('submits form with selected account and card ids', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<AddTransactionForm {...defaultProps} onSubmit={onSubmit} accounts={mockAccounts} cards={mockCards} />)

    await user.type(screen.getByPlaceholderText(/Salary, Groceries/), 'Groceries')
    await user.type(document.querySelector('input[type="number"]') as HTMLElement, '42.50')

    const selects = screen.getAllByRole('combobox')
    // selects: Type, Account, Card
    await user.selectOptions(selects[1], 'acc-1')
    await user.selectOptions(selects[2], 'card-1')

    await user.click(screen.getByRole('button', { name: /Add Transaction/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Groceries',
        amount: 42.5,
        accountId: 'acc-1',
        cardId: 'card-1'
      })
    )
  })
})
