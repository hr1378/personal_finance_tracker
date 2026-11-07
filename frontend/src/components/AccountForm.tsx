import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from './ui/Card'
import type { Account, AccountRequest, AccountType } from '../types/finance'

interface AccountFormData {
  name: string
  institution: string
  accountType: AccountType
  currency: string
  currentBalance: number
  isActive: boolean
}

interface AccountFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AccountRequest) => void
  isSubmitting: boolean
  initialData?: Account | null
}

const EMPTY_FORM: AccountFormData = {
  name: '',
  institution: '',
  accountType: 'CHECKING',
  currency: 'USD',
  currentBalance: 0,
  isActive: true
}

function toFormData(account: Account | null | undefined): AccountFormData {
  if (!account) return EMPTY_FORM
  return {
    name: account.name,
    institution: account.institution || '',
    accountType: account.accountType,
    currency: account.currency || 'USD',
    currentBalance: account.currentBalance,
    isActive: account.isActive
  }
}

function AccountFormFields({ onClose, onSubmit, isSubmitting, initialData }: Omit<AccountFormProps, 'isOpen'>) {
  const [formData, setFormData] = useState<AccountFormData>(() => toFormData(initialData))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSubmit({
      name: formData.name.trim(),
      institution: formData.institution.trim() || undefined,
      accountType: formData.accountType,
      currency: formData.currency.trim() || 'USD',
      currentBalance: formData.currentBalance,
      isActive: formData.isActive
    })
  }

  const isEditing = !!initialData

  return (
    <Card className="p-6 mb-6" gradient="none">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white">
          {isEditing ? 'Edit Account' : 'Add New Account'}
        </h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Account Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="e.g., Everyday Checking"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Institution</label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="e.g., Chase, Fidelity"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Account Type</label>
          <select
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value as AccountType })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
          >
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
            <option value="MONEY_MARKET">Money Market</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Currency</label>
          <input
            type="text"
            maxLength={3}
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="USD"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Current Balance</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.currentBalance}
              onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-4 py-2.5 glass text-white font-bold focus:outline-none rounded-xl hover:bg-white/20 transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 accent-purple-500"
            />
            <span className="text-sm font-bold uppercase tracking-wider text-white/70">Active</span>
          </label>
        </div>
        <div className="flex items-end md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 px-6 rounded-xl glow-purple hover:scale-105 disabled:opacity-50 transition-all font-bold uppercase tracking-wider"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Account' : 'Add Account'}
          </button>
        </div>
      </form>
    </Card>
  )
}

export function AccountForm({ isOpen, initialData, ...rest }: AccountFormProps) {
  if (!isOpen) return null
  return (
    <AccountFormFields
      key={initialData?.id ?? 'new-account'}
      initialData={initialData}
      {...rest}
    />
  )
}
