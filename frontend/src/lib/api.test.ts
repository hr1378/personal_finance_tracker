import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from './api'
import type { Account, Card } from '../types/finance'

const mockAccount: Account = {
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

const mockCard: Card = {
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

describe('api accounts and cards', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('getAccounts fetches accounts for a user', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([mockAccount]), { status: 200 })
    )

    const result = await api.getAccounts('user-1')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/user/user-1'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
    )
    expect(result).toEqual([mockAccount])
  })

  it('createAccount posts account data', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockAccount), { status: 201 })
    )

    const result = await api.createAccount({
      name: 'Everyday Checking',
      institution: 'Chase',
      accountType: 'CHECKING',
      currency: 'USD',
      currentBalance: 2500
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/accounts'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(result.id).toBe('acc-1')
  })

  it('updateAccount sends PUT request', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ...mockAccount, name: 'Renamed' }), { status: 200 })
    )

    const result = await api.updateAccount('acc-1', {
      name: 'Renamed',
      accountType: 'CHECKING',
      currentBalance: 3000
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/acc-1'),
      expect.objectContaining({ method: 'PUT' })
    )
    expect(result.name).toBe('Renamed')
  })

  it('deleteAccount sends DELETE request', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 })
    )

    await api.deleteAccount('acc-1')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/accounts/acc-1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('getCards fetches cards for a user', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([mockCard]), { status: 200 })
    )

    const result = await api.getCards('user-1')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/cards/user/user-1'),
      expect.anything()
    )
    expect(result).toEqual([mockCard])
  })

  it('getCardsByAccount fetches cards linked to an account', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([mockCard]), { status: 200 })
    )

    const result = await api.getCardsByAccount('acc-1')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/cards/account/acc-1'),
      expect.anything()
    )
    expect(result[0].accountId).toBe('acc-1')
  })

  it('createCard posts card data', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockCard), { status: 201 })
    )

    const result = await api.createCard({
      accountId: 'acc-1',
      name: 'Chase Sapphire',
      cardType: 'CREDIT',
      lastFour: '4242',
      network: 'VISA',
      creditLimit: 10000,
      currentBalance: 1200,
      apr: 19.99,
      expiryMonth: 12,
      expiryYear: 2027
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/cards'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(result.cardType).toBe('CREDIT')
  })

  it('deleteCard sends DELETE request', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 })
    )

    await api.deleteCard('card-1')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/cards/card-1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('getTransactions passes accountId and cardId filters', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    )

    await api.getTransactions('user-1', undefined, 'acc-1', 'card-1')

    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('accountId=acc-1')
    expect(calledUrl).toContain('cardId=card-1')
  })

  it('throws when account fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('error', { status: 500 })
    )

    await expect(api.getAccounts('user-1')).rejects.toThrow('Failed to fetch accounts')
  })
})
