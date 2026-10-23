import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from './ui/Card'

interface AddTransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isSubmitting: boolean
}

export function AddTransactionForm({ isOpen, onClose, onSubmit, isSubmitting }: AddTransactionFormProps) {
  const [formData, setFormData] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      return
    }
    onSubmit({ ...formData, amount })
    setFormData({
      type: 'INCOME',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    })
  }

  if (!isOpen) return null

  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary">Add New Transaction</h3>
        <button
          onClick={onClose}
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold uppercase tracking-wider focus:outline-none focus:brutal-shadow"
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold focus:outline-none focus:brutal-shadow"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold uppercase tracking-wider focus:outline-none focus:brutal-shadow"
            placeholder="e.g., Salary, Groceries"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold focus:outline-none focus:brutal-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold uppercase tracking-wider focus:outline-none focus:brutal-shadow"
            placeholder="Optional"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent-primary text-white py-2.5 px-4 border-brutal border-border-base brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 transition-all font-bold uppercase tracking-wider"
          >
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Card>
  )
}
