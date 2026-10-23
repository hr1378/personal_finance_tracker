import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from './ui/Card'

interface AddBudgetFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isSubmitting: boolean
}

export function AddBudgetForm({ isOpen, onClose, onSubmit, isSubmitting }: AddBudgetFormProps) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    renewalDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      return
    }
    if (!formData.category) {
      return
    }
    onSubmit({ ...formData, amount })
    setFormData({
      category: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      renewalDate: ''
    })
  }

  if (!isOpen) return null

  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary">Add New Budget</h3>
        <button
          onClick={onClose}
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold uppercase tracking-wider focus:outline-none focus:brutal-shadow"
            placeholder="e.g., Groceries, Entertainment"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Budget Amount</label>
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
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Month</label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold uppercase tracking-wider focus:outline-none focus:brutal-shadow"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Year</label>
          <input
            type="number"
            min="2020"
            max="2030"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold focus:outline-none focus:brutal-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-2">Renewal Date (Optional)</label>
          <input
            type="date"
            value={formData.renewalDate}
            onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
            className="w-full px-4 py-2.5 border-brutal border-border-base brutal-shadow-sm bg-bg-surface text-text-primary font-bold focus:outline-none focus:brutal-shadow"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent-primary text-white py-2.5 px-4 border-brutal border-border-base brutal-shadow-sm hover:brutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 transition-all font-bold uppercase tracking-wider"
          >
            {isSubmitting ? 'Adding...' : 'Add Budget'}
          </button>
        </div>
      </form>
    </Card>
  )
}
