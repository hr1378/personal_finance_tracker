import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'
import type { View } from '../types'

describe('Sidebar', () => {
  const defaultProps = {
    currentView: 'overview' as View,
    onViewChange: vi.fn(),
    totalTransactions: 10,
    totalBudgets: 3,
    totalDebts: 2,
    totalAccounts: 5
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation items including Accounts', () => {
    render(<Sidebar {...defaultProps} />)

    const navButtons = screen.getAllByRole('button')
    const navLabels = ['Overview', 'Transactions', 'Analytics', 'Budgets', 'Debts', 'Accounts']
    navLabels.forEach((label) => {
      expect(navButtons.some((b) => b.textContent?.includes(label))).toBe(true)
    })
  })

  it('calls onViewChange when Accounts is clicked', async () => {
    const onViewChange = vi.fn()
    render(<Sidebar {...defaultProps} onViewChange={onViewChange} />)

    await userEvent.click(screen.getByRole('button', { name: /Accounts/ }))

    expect(onViewChange).toHaveBeenCalledWith('accounts')
  })

  it('displays account count in footer', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
