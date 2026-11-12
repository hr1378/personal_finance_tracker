import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function StartPage() {
  const { login, register, continueAsGuest } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [preferredCurrency, setPreferredCurrency] = useState('USD')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, preferredCurrency || undefined)
      }
    } catch {
      setError(mode === 'login' ? 'Login failed. Check your credentials.' : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-6">
      <div className="w-full max-w-md glass-card-dark rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white neon-text">Finance</h1>
          <p className="text-sm mt-2 text-white/70">Track income, expenses, budgets, and debts</p>
        </div>

        <div className="flex rounded-xl overflow-hidden mb-6 glass">
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              mode === 'login' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              mode === 'register' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="preferredCurrency" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Preferred currency</label>
              <input
                id="preferredCurrency"
                name="preferredCurrency"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="USD"
              />
            </div>
          )}

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-white/50">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full py-3 glass rounded-xl font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 transition-colors"
        >
          Continue without login
        </button>

        <p className="mt-6 text-center text-xs text-white/50">
          Demo login: test@example.com / password123
        </p>
      </div>
    </div>
  )
}
