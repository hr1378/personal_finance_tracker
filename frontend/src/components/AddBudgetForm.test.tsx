import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddBudgetForm } from './AddBudgetForm'

describe('AddBudgetForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <AddBudgetForm
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )
    expect(screen.queryByText('Add New Budget')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )
    expect(screen.getByText('Add New Budget')).toBeInTheDocument()
  })

  it('should render all form fields', () => {
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Budget Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Month')).toBeInTheDocument()
    expect(screen.getByLabelText('Year')).toBeInTheDocument()
    expect(screen.getByLabelText('Renewal Date (Optional)')).toBeInTheDocument()
  })

  it('should close form when X button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )

    const closeButton = screen.getByRole('button', { name: '' })
    await user.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )

    await user.type(screen.getByLabelText('Category'), 'Groceries')
    await user.type(screen.getByLabelText('Budget Amount'), '500')
    await user.click(screen.getByRole('button', { name: 'Add Budget' }))

    expect(mockOnSubmit).toHaveBeenCalledWith({
      category: 'Groceries',
      amount: 500,
      month: expect.any(Number),
      year: expect.any(Number),
      renewalDate: ''
    })
  })

  it('should not submit form with invalid amount', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )

    await user.type(screen.getByLabelText('Category'), 'Groceries')
    await user.type(screen.getByLabelText('Budget Amount'), '-100')
    await user.click(screen.getByRole('button', { name: 'Add Budget' }))

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should not submit form without category', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )

    await user.type(screen.getByLabelText('Budget Amount'), '500')
    await user.click(screen.getByRole('button', { name: 'Add Budget' }))

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )

    await user.type(screen.getByLabelText('Category'), 'Groceries')
    await user.type(screen.getByLabelText('Budget Amount'), '500')
    await user.click(screen.getByRole('button', { name: 'Add Budget' }))

    expect(screen.getByLabelText('Category')).toHaveValue('')
  })

  it('should disable submit button when isSubmitting is true', () => {
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Adding...' })
    expect(submitButton).toBeDisabled()
  })

  it('should allow selecting renewal date', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )

    const renewalDateInput = screen.getByLabelText('Renewal Date (Optional)')
    await user.type(renewalDateInput, '2024-12-31')
    await user.type(screen.getByLabelText('Category'), 'Groceries')
    await user.type(screen.getByLabelText('Budget Amount'), '500')
    await user.click(screen.getByRole('button', { name: 'Add Budget' }))

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        renewalDate: '2024-12-31'
      })
    )
  })

  it('should allow selecting month', async () => {
    const user = userEvent.setup()
    render(
      <AddBudgetForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    )

    const monthSelect = screen.getByLabelText('Month')
    await user.selectOptions(monthSelect, '2')

    await user.type(screen.getByLabelText('Category'), 'Groceries')
    await user.type(screen.getByLabelText('Budget Amount'), '500')
    await user.click(screen.getByRole('button', { name: 'Add Budget' }))

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        month: 2
      })
    )
  })
})
