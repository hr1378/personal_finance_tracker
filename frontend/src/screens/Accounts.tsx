import { useState } from 'react'
import { Landmark, CreditCard, Wallet, Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { AccountForm } from '../components/AccountForm'
import { CardForm } from '../components/CardForm'
import { formatCurrency } from '../lib/utils'
import { useFinanceStore } from '../store/useFinanceStore'
import { toast } from 'sonner'
import type { Account, Card as CardData, AccountRequest, CardRequest } from '../types/finance'

export function Accounts() {
  const {
    accounts,
    cards,
    addAccount,
    updateAccount,
    deleteAccount,
    addCard,
    updateCard,
    deleteCard
  } = useFinanceStore()

  const [showAccountForm, setShowAccountForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [showCardForm, setShowCardForm] = useState(false)
  const [editingCard, setEditingCard] = useState<CardData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeAccounts = accounts.filter(a => a.isActive)
  const activeCards = cards.filter(c => c.isActive)
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.currentBalance, 0)
  const totalCreditUsed = activeCards
    .filter(c => c.cardType === 'CREDIT')
    .reduce((sum, c) => sum + c.currentBalance, 0)
  const totalCreditLimit = activeCards
    .filter(c => c.cardType === 'CREDIT' && c.creditLimit)
    .reduce((sum, c) => sum + (c.creditLimit || 0), 0)

  const accountName = (id?: string) => accounts.find(a => a.id === id)?.name

  const handleAccountSubmit = async (data: AccountRequest) => {
    setIsSubmitting(true)
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, data)
        toast.success('Account updated successfully')
      } else {
        await addAccount(data)
        toast.success('Account added successfully')
      }
      setShowAccountForm(false)
      setEditingAccount(null)
    } catch {
      toast.error(editingAccount ? 'Failed to update account' : 'Failed to add account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCardSubmit = async (data: CardRequest) => {
    setIsSubmitting(true)
    try {
      if (editingCard) {
        await updateCard(editingCard.id, data)
        toast.success('Card updated successfully')
      } else {
        await addCard(data)
        toast.success('Card added successfully')
      }
      setShowCardForm(false)
      setEditingCard(null)
    } catch {
      toast.error(editingCard ? 'Failed to update card' : 'Failed to add card')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (account: Account) => {
    if (!confirm(`Are you sure you want to delete "${account.name}"?`)) return
    try {
      await deleteAccount(account.id)
      toast.success('Account deleted successfully')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const handleDeleteCard = async (card: CardData) => {
    if (!confirm(`Are you sure you want to delete "${card.name}"?`)) return
    try {
      await deleteCard(card.id)
      toast.success('Card deleted successfully')
    } catch {
      toast.error('Failed to delete card')
    }
  }

  const openAddAccount = () => {
    setEditingAccount(null)
    setShowAccountForm(true)
  }

  const openEditAccount = (account: Account) => {
    setEditingAccount(account)
    setShowAccountForm(true)
  }

  const openAddCard = () => {
    setEditingCard(null)
    setShowCardForm(true)
  }

  const openEditCard = (card: CardData) => {
    setEditingCard(card)
    setShowCardForm(true)
  }

  const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6" gradient="blue">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <Landmark className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Total Balance</p>
              <p className="text-2xl font-bold text-white neon-text">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Across {activeAccounts.length} accounts</p>
        </Card>

        <Card className="p-6" gradient="green">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Bank Accounts</p>
              <p className="text-2xl font-bold text-white neon-text">{accounts.length}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">{activeAccounts.length} active</p>
        </Card>

        <Card className="p-6" gradient="purple">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Cards</p>
              <p className="text-2xl font-bold text-white neon-text">{cards.length}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">{activeCards.length} active</p>
        </Card>

        <Card className="p-6" gradient="orange">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">Credit Used</p>
              <p className="text-2xl font-bold text-white neon-text">{formatCurrency(totalCreditUsed)}</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">
            {totalCreditLimit > 0 ? `${creditUtilization.toFixed(0)}% of ${formatCurrency(totalCreditLimit)} limit` : 'No credit limits set'}
          </p>
        </Card>
      </div>

      {/* Forms */}
      <AccountForm
        isOpen={showAccountForm}
        onClose={() => { setShowAccountForm(false); setEditingAccount(null) }}
        onSubmit={handleAccountSubmit}
        isSubmitting={isSubmitting}
        initialData={editingAccount}
      />
      <CardForm
        isOpen={showCardForm}
        onClose={() => { setShowCardForm(false); setEditingCard(null) }}
        onSubmit={handleCardSubmit}
        isSubmitting={isSubmitting}
        accounts={accounts}
        initialData={editingCard}
      />

      {/* Bank Accounts */}
      <Card className="p-6" gradient="none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">Bank Accounts</h3>
          <button
            onClick={openAddAccount}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl glow-purple hover:scale-105 transition-all font-bold uppercase tracking-wider text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
        {accounts.length === 0 ? (
          <p className="text-white/60 text-center py-8 font-bold">No accounts yet — add your first bank account</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="glass rounded-xl p-5 hover:bg-white/20 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-white text-lg">{account.name}</h4>
                    <p className="text-sm font-bold uppercase tracking-wider text-white/70 mt-1">
                      {account.institution || 'No institution'} · {account.accountType.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 glass rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      account.isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
                    }`}>
                      {account.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-white neon-text">{formatCurrency(account.currentBalance)}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70">{account.currency}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditAccount(account)}
                    className="flex-1 px-3 py-2 glass rounded-lg text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account)}
                    className="flex-1 px-3 py-2 glass rounded-lg text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cards */}
      <Card className="p-6" gradient="none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">Cards</h3>
          <button
            onClick={openAddCard}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl glow-purple hover:scale-105 transition-all font-bold uppercase tracking-wider text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
        {cards.length === 0 ? (
          <p className="text-white/60 text-center py-8 font-bold">No cards yet — add your first credit or debit card</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => {
              const linkedAccount = accountName(card.accountId)
              const expiry = card.expiryMonth && card.expiryYear
                ? `${String(card.expiryMonth).padStart(2, '0')}/${card.expiryYear}`
                : null
              return (
                <div key={card.id} className="glass rounded-xl p-5 hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-white text-lg">{card.name}</h4>
                      <p className="text-sm font-bold uppercase tracking-wider text-white/70 mt-1">
                        {card.cardType} {card.network ? `· ${card.network}` : ''} {card.lastFour ? `···· ${card.lastFour}` : ''}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 glass rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      card.isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
                    }`}>
                      {card.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {card.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="glass rounded-lg p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Balance</p>
                      <p className="font-bold text-white">{formatCurrency(card.currentBalance)}</p>
                    </div>
                    {card.cardType === 'CREDIT' ? (
                      <div className="glass rounded-lg p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Credit Limit</p>
                        <p className="font-bold text-white">{card.creditLimit ? formatCurrency(card.creditLimit) : '-'}</p>
                      </div>
                    ) : (
                      <div className="glass rounded-lg p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Linked Account</p>
                        <p className="font-bold text-white truncate">{linkedAccount || '-'}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/70 mb-4">
                    {card.apr != null && <span>APR: {card.apr}%</span>}
                    {expiry && <span>Expires: {expiry}</span>}
                    {card.accountId && card.cardType === 'CREDIT' && linkedAccount && <span>Via: {linkedAccount}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditCard(card)}
                      className="flex-1 px-3 py-2 glass rounded-lg text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card)}
                      className="flex-1 px-3 py-2 glass rounded-lg text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
