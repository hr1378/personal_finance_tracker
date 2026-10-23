import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'
import type { Budget, BudgetRequest } from '../types/finance'

// Mock global fetch
global.fetch = vi.fn()

describe('API - Budget Functions', () => {
  const mockBudget: Budget = {
    id: '1',
    userId: 'user1',
    category: 'Groceries',
    amount: 500,
    spent: 0,
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

  const mockBackendBudget = {
    id: '1',
    userId: 'user1',
    category: 'Groceries',
    spendingLimit: 500,
    month: 1,
    year: 2024,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBudgets', () => {
    it('should fetch budgets by user ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockBackendBudget],
      } as Response)

      const result = await api.getBudgets('user1')

      expect(result).toEqual([mockBudget])
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8083/api/budgets/user/user1'
      )
    })

    it('should fetch budgets with month and year parameters', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockBackendBudget],
      } as Response)

      const result = await api.getBudgets('user1', 1, 2024)

      expect(result).toEqual([mockBudget])
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8083/api/budgets/user/user1/month/1/year/2024'
      )
    })

    it('should transform backend budget to frontend format', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockBackendBudget],
      } as Response)

      const result = await api.getBudgets('user1')

      expect(result[0].amount).toBe(mockBackendBudget.spendingLimit)
      expect(result[0].spent).toBe(0)
    })

    it('should handle fetch budgets error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(api.getBudgets('user1')).rejects.toThrow(
        'Failed to fetch budgets'
      )
    })

    it('should set renewalDate to undefined when not provided by backend', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockBackendBudget],
      } as Response)

      const result = await api.getBudgets('user1')

      expect(result[0].renewalDate).toBeUndefined()
    })
  })

  describe('getBudgetById', () => {
    it('should fetch budget by ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBudget,
      } as Response)

      const result = await api.getBudgetById('1')

      expect(result).toEqual(mockBudget)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8083/api/budgets/1'
      )
    })

    it('should handle fetch budget by ID error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(api.getBudgetById('1')).rejects.toThrow(
        'Failed to fetch budget'
      )
    })
  })

  describe('createBudget', () => {
    it('should create budget successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendBudget,
      } as Response)

      const result = await api.createBudget(mockBudgetRequest)

      expect(result).toEqual(mockBudget)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8083/api/budgets',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('spendingLimit'),
        })
      )
    })

    it('should transform frontend request to backend format', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendBudget,
      } as Response)

      await api.createBudget(mockBudgetRequest)

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(fetchCall[1]?.body as string)

      expect(body.spendingLimit).toBe(mockBudgetRequest.amount)
      expect(body.amount).toBeUndefined()
    })

    it('should include renewalDate in response when provided', async () => {
      const requestWithRenewal: BudgetRequest = {
        ...mockBudgetRequest,
        renewalDate: '2024-02-01',
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendBudget,
      } as Response)

      const result = await api.createBudget(requestWithRenewal)

      expect(result.renewalDate).toBe('2024-02-01')
    })

    it('should handle create budget error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(api.createBudget(mockBudgetRequest)).rejects.toThrow(
        'Failed to create budget'
      )
    })
  })

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendBudget,
      } as Response)

      const result = await api.updateBudget('1', mockBudgetRequest)

      expect(result).toEqual(mockBudget)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8083/api/budgets/1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should transform frontend request to backend format on update', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendBudget,
      } as Response)

      await api.updateBudget('1', mockBudgetRequest)

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(fetchCall[1]?.body as string)

      expect(body.spendingLimit).toBe(mockBudgetRequest.amount)
    })

    it('should include renewalDate in response when provided', async () => {
      const requestWithRenewal: BudgetRequest = {
        ...mockBudgetRequest,
        renewalDate: '2024-02-01',
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendBudget,
      } as Response)

      const result = await api.updateBudget('1', requestWithRenewal)

      expect(result.renewalDate).toBe('2024-02-01')
    })

    it('should handle update budget error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(api.updateBudget('1', mockBudgetRequest)).rejects.toThrow(
        'Failed to update budget'
      )
    })
  })

  describe('deleteBudget', () => {
    it('should delete budget successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response)

      await api.deleteBudget('1')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8083/api/budgets/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('should handle delete budget error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(api.deleteBudget('1')).rejects.toThrow(
        'Failed to delete budget'
      )
    })
  })
})
