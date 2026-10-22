import type { View } from '../types'
import { LayoutGrid, Receipt, BarChart3, Wallet, CreditCard, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  totalTransactions: number
  totalBudgets?: number
  totalDebts?: number
}

export function Sidebar({ currentView, onViewChange, totalTransactions, totalBudgets = 0, totalDebts = 0 }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const views = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'debts', label: 'Debts', icon: CreditCard }
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-border-light rounded-lg shadow-card"
      >
        <Menu className="w-5 h-5 text-text-primary" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-surface border-r border-border-light flex flex-col z-50 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } w-64`}>
        <div className="p-6 border-b border-border-light flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Personal Finance</h1>
            <p className="text-text-secondary text-sm mt-1">Dashboard</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {views.map((view) => {
            const Icon = view.icon
            return (
              <button
                key={view.id}
                onClick={() => {
                  onViewChange(view.id as View)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                  currentView === view.id
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{view.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-border-light space-y-4">
          <div className="text-sm">
            <p className="text-text-secondary">Total Transactions</p>
            <p className="text-2xl font-semibold text-text-primary mt-1">{totalTransactions}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-secondary">Budgets</p>
              <p className="text-xl font-semibold text-text-primary mt-1">{totalBudgets}</p>
            </div>
            <div>
              <p className="text-text-secondary">Debts</p>
              <p className="text-xl font-semibold text-text-primary mt-1">{totalDebts}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
