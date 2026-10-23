import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFinanceStore } from './useFinanceStore'
import { api } from '../lib/api'
import type { Budget, BudgetRequest } from '../types/finance'

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    getBudgets: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
  },
}))

describe('useFinanceStore - Budget Actions', () => {
  const mockBudget: Budget = {
    id: '1',
    userId: 'user1',
    category: 'Groceries',
    amount: 500,
    spent: 300,
    month: 1,
    year: 2024,
  }

  const mockBudgetRequest: BudgetRequest = {
    userId: 'user1',
    category: 'Groceries',
    amount: 500,
    month: 1,
    year: 2024,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useFinanceStore.setState({
      budgets: [],
      isLoading: false,
      error: null,
    })
  })

  it('should fetch budgets successfully', async () => {
    const mockBudgets = [mockBudget]
    vi.mocked(api.getBudgets).mockResolvedValue(mockBudgets)

    const { fetchBudgets } = useFinanceStore.getState()
    await fetchBudgets('user1')

    const state = useFinanceStore.getState()
    expect(state.budgets).toEqual(mockBudgets)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe(null)
    expect(api.getBudgets).toHaveBeenCalledWith('user1', undefined, undefined)
  })

  it('should handle fetch budgets error', async () => {
    vi.mocked(api.getBudgets).mockRejectedValue(new Error('API Error'))

    const { fetchBudgets } = useFinanceStore.getState()
    await fetchBudgets('user1')

    const state = useFinanceStore.getState()
    expect(state.budgets).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to fetch budgets')
  })

  it('should fetch budgets with month and year parameters', async () => {
    const mockBudgets = [mockBudget]
    vi.mocked(api.getBudgets).mockResolvedValue(mockBudgets)

    const { fetchBudgets } = useFinanceStore.getState()
    await fetchBudgets('user1', 1, 2024)

    expect(api.getBudgets).toHaveBeenCalledWith('user1', 1, 2024)
  })

  it('should add budget successfully', async () => {
    vi.mocked(api.createBudget).mockResolvedValue(mockBudget)

    const { addBudget } = useFinanceStore.getState()
    await addBudget(mockBudgetRequest)

    const state = useFinanceStore.getState()
    expect(state.budgets).toContainEqual(mockBudget)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe(null)
    expect(api.createBudget).toHaveBeenCalledWith(mockBudgetRequest)
  })

  it('should handle add budget error', async () => {
    vi.mocked(api.createBudget).mockRejectedValue(new Error('API Error'))

    const { addBudget } = useFinanceStore.getState()
    await addBudget(mockBudgetRequest)

    const state = useFinanceStore.getState()
    expect(state.budgets).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to add budget')
  })

  it('should update budget successfully', async () => {
    const updatedBudget = { ...mockBudget, amount: 600 }
    vi.mocked(api.updateBudget).mockResolvedValue(updatedBudget)

    useFinanceStore.setState({ budgets: [mockBudget] })

    const { updateBudget } = useFinanceStore.getState()
    await updateBudget('1', mockBudgetRequest)

    const state = useFinanceStore.getState()
    expect(state.budgets[0].amount).toBe(600)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe(null)
    expect(api.updateBudget).toHaveBeenCalledWith('1', mockBudgetRequest)
  })

  it('should handle update budget error', async () => {
    vi.mocked(api.updateBudget).mockRejectedValue(new Error('API Error'))

    useFinanceStore.setState({ budgets: [mockBudget] })

    const { updateBudget } = useFinanceStore.getState()
    await updateBudget('1', mockBudgetRequest)

    const state = useFinanceStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to update budget')
  })

  it('should delete budget successfully', async () => {
    vi.mocked(api.deleteBudget).mockResolvedValue()

    useFinanceStore.setState({ budgets: [mockBudget] })

    const { deleteBudget } = useFinanceStore.getState()
    await deleteBudget('1')

    const state = useFinanceStore.getState()
    expect(state.budgets).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe(null)
    expect(api.deleteBudget).toHaveBeenCalledWith('1')
  })

  it('should handle delete budget error', async () => {
    vi.mocked(api.deleteBudget).mockRejectedValue(new Error('API Error'))

    useFinanceStore.setState({ budgets: [mockBudget] })

    const { deleteBudget } = useFinanceStore.getState()
    await deleteBudget('1')

    const state = useFinanceStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to delete budget')
  })

  it('should set budget manually successfully', async () => {
    const updatedBudget = { ...mockBudget, amount: 600 }
    vi.mocked(api.updateBudget).mockResolvedValue(updatedBudget)

    useFinanceStore.setState({ budgets: [mockBudget] })

    const { setBudgetManually } = useFinanceStore.getState()
    await setBudgetManually('1', 600)

    const state = useFinanceStore.getState()
    expect(state.budgets[0].amount).toBe(600)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe(null)
  })

  it('should handle set budget manually error', async () => {
    vi.mocked(api.updateBudget).mockRejectedValue(new Error('API Error'))

    useFinanceStore.setState({ budgets: [mockBudget] })

    const { setBudgetManually } = useFinanceStore.getState()
    await setBudgetManually('1', 600)

    const state = useFinanceStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to update budget')
  })

  it('should handle set budget manually with non-existent budget', async () => {
    useFinanceStore.setState({ budgets: [] })

    const { setBudgetManually } = useFinanceStore.getState()
    await setBudgetManually('1', 600)

    const state = useFinanceStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to update budget')
  })

  it('should preserve renewal date when updating budget', async () => {
    const budgetWithRenewal: Budget = {
      ...mockBudget,
      renewalDate: '2024-02-01',
    }
    const updatedBudget = { ...budgetWithRenewal, amount: 600 }
    vi.mocked(api.updateBudget).mockResolvedValue(updatedBudget)

    useFinanceStore.setState({ budgets: [budgetWithRenewal] })

    const { setBudgetManually } = useFinanceStore.getState()
    await setBudgetManually('1', 600)

    const state = useFinanceStore.getState()
    expect(state.budgets[0].renewalDate).toBe('2024-02-01')
  })

  it('should set loading state correctly during operations', async () => {
    vi.mocked(api.getBudgets).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([mockBudget]), 100)
        })
    )

    const { fetchBudgets } = useFinanceStore.getState()
    const promise = fetchBudgets('user1')

    const state = useFinanceStore.getState()
    expect(state.isLoading).toBe(true)

    await promise

    const finalState = useFinanceStore.getState()
    expect(finalState.isLoading).toBe(false)
  })
})
