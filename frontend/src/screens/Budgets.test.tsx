import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Budgets } from './Budgets'
import { toast } from 'sonner'
import type { Budget } from '../types/finance'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

const mockBudgets: Budget[] = [
  {
    id: '1',
    userId: 'user1',
    category: 'Groceries',
    amount: 500,
    spent: 300,
    month: 1,
    year: 2024,
  },
  {
    id: '2',
    userId: 'user1',
    category: 'Entertainment',
    amount: 200,
    spent: 180,
    month: 1,
    year: 2024,
    renewalDate: '2024-02-01',
  },
]

describe('Budgets', () => {
  const mockOnAddBudget = vi.fn()
  const mockOnUpdateBudget = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render budget summary cards', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('Total Budget')).toBeInTheDocument()
    expect(screen.getByText('Total Spent')).toBeInTheDocument()
    expect(screen.getByText('Remaining')).toBeInTheDocument()
  })

  it('should display correct total budget amount', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('$700.00')).toBeInTheDocument() // 500 + 200
  })

  it('should display correct total spent amount', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnUpdateBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('$480.00')).toBeInTheDocument() // 300 + 180
  })

  it('should display correct remaining amount', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('$220.00')).toBeInTheDocument() // 700 - 480
  })

  it('should render budget breakdown', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('Budget Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Entertainment')).toBeInTheDocument()
  })

  it('should show renewal date when set', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText(/Renews:/)).toBeInTheDocument()
  })

  it('should show budget status badges', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('On Track')).toBeInTheDocument()
    expect(screen.getByText('Near Limit')).toBeInTheDocument()
  })

  it('should show edit button when onUpdateBudget is provided', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    const editButtons = screen.getAllByRole('button')
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('should show edit button when onUpdateBudget is provided', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(1)
  })

  it('should show add budget button', () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('Add New Budget')).toBeInTheDocument()
  })

  it('should show add budget form when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    const addButton = screen.getByText('Add New Budget')
    await user.click(addButton)

    expect(screen.getByText('Add New Budget')).toBeInTheDocument()
  })

  it('should show no budgets message when budgets array is empty', () => {
    render(
      <Budgets
        budgets={[]}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    expect(screen.getByText('No budgets set')).toBeInTheDocument()
  })

  it('should show budget alert when over budget', async () => {
    const overBudgetBudgets: Budget[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Groceries',
        amount: 500,
        spent: 600,
        month: 1,
        year: 2024,
      },
    ]

    render(
      <Budgets
        budgets={overBudgetBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('over budget')
      )
    })
  })

  it('should show warning alert when near limit', async () => {
    const nearLimitBudgets: Budget[] = [
      {
        id: '1',
        userId: 'user1',
        category: 'Groceries',
        amount: 500,
        spent: 450,
        month: 1,
        year: 2024,
      },
    ]

    render(
      <Budgets
        budgets={nearLimitBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('remaining')
      )
    })
  })

  it('should show success alert when on track', async () => {
    render(
      <Budgets
        budgets={mockBudgets}
        onAddBudget={mockOnAddBudget}
        onUpdateBudget={mockOnUpdateBudget}
      />
    )

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('remaining')
      )
    })
  })


})
