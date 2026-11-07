import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from './ui/Card'
import type { Account, Card as CardData, CardRequest, CardType, CardNetwork } from '../types/finance'

interface CardFormData {
  accountId: string
  name: string
  cardType: CardType
  lastFour: string
  network: CardNetwork | ''
  creditLimit: string
  currentBalance: number
  apr: string
  expiryMonth: string
  expiryYear: string
  isActive: boolean
}

interface CardFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CardRequest) => void
  isSubmitting: boolean
  accounts: Account[]
  initialData?: CardData | null
}

const EMPTY_FORM: CardFormData = {
  accountId: '',
  name: '',
  cardType: 'CREDIT',
  lastFour: '',
  network: '',
  creditLimit: '',
  currentBalance: 0,
  apr: '',
  expiryMonth: '',
  expiryYear: '',
  isActive: true
}

function toFormData(card: CardData | null | undefined): CardFormData {
  if (!card) return EMPTY_FORM
  return {
    accountId: card.accountId || '',
    name: card.name,
    cardType: card.cardType,
    lastFour: card.lastFour || '',
    network: card.network || '',
    creditLimit: card.creditLimit?.toString() || '',
    currentBalance: card.currentBalance,
    apr: card.apr?.toString() || '',
    expiryMonth: card.expiryMonth?.toString() || '',
    expiryYear: card.expiryYear?.toString() || '',
    isActive: card.isActive
  }
}

function CardFormFields({ onClose, onSubmit, isSubmitting, accounts, initialData }: Omit<CardFormProps, 'isOpen'>) {
  const [formData, setFormData] = useState<CardFormData>(() => toFormData(initialData))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSubmit({
      accountId: formData.accountId || undefined,
      name: formData.name.trim(),
      cardType: formData.cardType,
      lastFour: formData.lastFour.trim() || undefined,
      network: formData.network || undefined,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
      currentBalance: formData.currentBalance,
      apr: formData.apr ? parseFloat(formData.apr) : undefined,
      expiryMonth: formData.expiryMonth ? parseInt(formData.expiryMonth, 10) : undefined,
      expiryYear: formData.expiryYear ? parseInt(formData.expiryYear, 10) : undefined,
      isActive: formData.isActive
    })
  }

  const isEditing = !!initialData

  return (
    <Card className="p-6 mb-6" gradient="none">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white">
          {isEditing ? 'Edit Card' : 'Add New Card'}
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
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Card Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="e.g., Chase Sapphire"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Card Type</label>
          <select
            value={formData.cardType}
            onChange={(e) => setFormData({ ...formData, cardType: e.target.value as CardType })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
          >
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Linked Account</label>
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
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Last Four Digits</label>
          <input
            type="text"
            maxLength={4}
            value={formData.lastFour}
            onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
            className="w-full px-4 py-2.5 glass text-white font-bold focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="4242"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Network</label>
          <select
            value={formData.network}
            onChange={(e) => setFormData({ ...formData, network: e.target.value as CardNetwork | '' })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
          >
            <option value="">Select network</option>
            <option value="VISA">Visa</option>
            <option value="MASTERCARD">Mastercard</option>
            <option value="AMEX">Amex</option>
            <option value="DISCOVER">Discover</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        {formData.cardType === 'CREDIT' && (
          <>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Credit Limit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 glass text-white font-bold focus:outline-none rounded-xl hover:bg-white/20 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">APR (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.apr}
                onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                className="w-full px-4 py-2.5 glass text-white font-bold focus:outline-none rounded-xl hover:bg-white/20 transition-all"
                placeholder="0.00"
              />
            </div>
          </>
        )}
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
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Expiry Month</label>
          <select
            value={formData.expiryMonth}
            onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold uppercase tracking-wider focus:outline-none rounded-xl hover:bg-white/20 transition-all"
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Expiry Year</label>
          <input
            type="number"
            min={new Date().getFullYear()}
            value={formData.expiryYear}
            onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
            className="w-full px-4 py-2.5 glass text-white font-bold focus:outline-none rounded-xl hover:bg-white/20 transition-all"
            placeholder="YYYY"
          />
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Card' : 'Add Card'}
          </button>
        </div>
      </form>
    </Card>
  )
}

export function CardForm({ isOpen, initialData, ...rest }: CardFormProps) {
  if (!isOpen) return null
  return (
    <CardFormFields
      key={initialData?.id ?? 'new-card'}
      initialData={initialData}
      {...rest}
    />
  )
}
