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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 brutal-border brutal-shadow-sm"
        style={{ backgroundColor: '#f4f4f0', borderColor: '#000000' }}
      >
        <Menu className="w-5 h-5" style={{ color: '#000000' }} />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full flex flex-col z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
        style={{ backgroundColor: '#f4f4f0', borderRight: '3px solid #000000' }}
      >
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '3px solid #000000' }}>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider" style={{ color: '#000000' }}>Finance</h1>
            <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#666666' }}>Dashboard</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 transition-colors"
            style={{ hover: { backgroundColor: '#e8e8e4' } }}
          >
            <X className="w-5 h-5" style={{ color: '#333333' }} />
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
                className="w-full text-left px-4 py-3 brutal-border-sm transition-all flex items-center gap-3 font-bold uppercase text-sm tracking-wider"
                style={{
                  backgroundColor: isActive ? '#ff3b30' : '#f4f4f0',
                  color: isActive ? '#ffffff' : '#333333',
                  borderColor: isActive ? '#000000' : 'transparent',
                  boxShadow: isActive ? '2px 2px 0 0 #000000' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#000000'
                    e.currentTarget.style.backgroundColor = '#e8e8e4'
                    e.currentTarget.style.color = '#000000'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.backgroundColor = '#f4f4f0'
                    e.currentTarget.style.color = '#333333'
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{view.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6 space-y-4" style={{ borderTop: '3px solid #000000' }}>
          <div className="text-sm">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Transactions</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#000000' }}>{totalTransactions}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Budgets</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#000000' }}>{totalBudgets}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666666' }}>Debts</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#000000' }}>{totalDebts}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
