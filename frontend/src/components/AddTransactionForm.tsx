import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from './ui/Card'
import type { Account, Card as CardData } from '../types/finance'

interface TransactionFormData {
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  date: string
  description?: string
  accountId?: string
  cardId?: string
}

interface AddTransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TransactionFormData) => void
  isSubmitting: boolean
  accounts?: Account[]
  cards?: CardData[]
}

export function AddTransactionForm({ isOpen, onClose, onSubmit, isSubmitting, accounts = [], cards = [] }: AddTransactionFormProps) {
  const [formData, setFormData] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    accountId: '',
    cardId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      return
    }
    onSubmit({
      ...formData,
      amount,
      accountId: formData.accountId || undefined,
      cardId: formData.cardId || undefined
    })
    setFormData({
      type: 'INCOME',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      accountId: '',
      cardId: ''
    })
  }

  if (!isOpen) return null

  const hasPaymentMethods = accounts.length > 0 || cards.length > 0

  return (
    <Card className="p-6 mb-6" gradient="none">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white">Add New Transaction</h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-4 py-2.5 glass text-white font-bold focus:outline-none rounded-xl hover:bg-white/20 transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="e.g., Salary, Groceries"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold focus:outline-none rounded-xl hover:bg-white/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="Optional"
          />
        </div>
        {hasPaymentMethods && (
          <>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Account</label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
              >
                <option value="">None</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Card</label>
              <select
                value={formData.cardId}
                onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
              >
                <option value="">None</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>{card.name}{card.lastFour ? ` ····${card.lastFour}` : ''}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 px-4 rounded-xl glow-purple hover:scale-105 disabled:opacity-50 transition-all font-bold uppercase tracking-wider"
          >
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Card>
  )
}
