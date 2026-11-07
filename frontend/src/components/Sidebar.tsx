import type { View } from '../types'
import { LayoutGrid, Receipt, BarChart3, Wallet, CreditCard, Landmark, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  totalTransactions: number
  totalBudgets?: number
  totalDebts?: number
  totalAccounts?: number
}

export function Sidebar({ currentView, onViewChange, totalTransactions, totalBudgets = 0, totalDebts = 0, totalAccounts = 0 }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const views = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'debts', label: 'Debts', icon: CreditCard },
    { id: 'accounts', label: 'Accounts', icon: Landmark }
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl glow-purple"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full flex flex-col z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 glass-card-dark`}
      >
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-white neon-text">Finance</h1>
            <p className="text-xs mt-1 uppercase tracking-widest text-white/70">Dashboard</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 transition-colors hover:bg-white/20 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {views.map((view) => {
            const Icon = view.icon
            const isActive = currentView === view.id
            return (
              <button
                key={view.id}
                onClick={() => {
                  onViewChange(view.id as View)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-bold uppercase text-sm tracking-wider ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white glow-purple'
                    : 'glass hover:bg-white/20 text-white/70'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{view.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6 space-y-4 border-t border-white/10">
          <div className="text-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Transactions</p>
            <p className="text-2xl font-bold mt-1 text-white neon-text">{totalTransactions}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="glass rounded-xl p-3 hover:bg-white/20 transition-all">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Budgets</p>
              <p className="text-xl font-bold mt-1 text-white">{totalBudgets}</p>
            </div>
            <div className="glass rounded-xl p-3 hover:bg-white/20 transition-all">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Debts</p>
              <p className="text-xl font-bold mt-1 text-white">{totalDebts}</p>
            </div>
            <div className="glass rounded-xl p-3 hover:bg-white/20 transition-all">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Accounts</p>
              <p className="text-xl font-bold mt-1 text-white">{totalAccounts}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
