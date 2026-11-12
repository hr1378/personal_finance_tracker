import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthState } from '../types'

interface AuthContextType extends AuthState {
  isGuest: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, preferredCurrency?: string) => Promise<void>
  logout: () => void
  continueAsGuest: () => void
  exitGuest: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState & { isGuest: boolean }>(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    const isGuest = localStorage.getItem('finance_guest') === 'true'
    if (token && userStr) {
      try {
        return {
          token,
          user: JSON.parse(userStr),
          isAuthenticated: true,
          isGuest: false
        }
      } catch {
        return {
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest
        }
      }
    }
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest
    }
  })

  const login = async (email: string, password: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      throw new Error('Login failed')
    }
    const data = await response.json()
    localStorage.removeItem('finance_guest')
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency }))
    setAuthState({
      token: data.token,
      user: { id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency },
      isAuthenticated: true,
      isGuest: false
    })
  }

  const register = async (email: string, password: string, preferredCurrency?: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, preferredCurrency })
    })
    if (!response.ok) {
      throw new Error('Registration failed')
    }
    const data = await response.json()
    localStorage.removeItem('finance_guest')
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency }))
    setAuthState({
      token: data.token,
      user: { id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency },
      isAuthenticated: true,
      isGuest: false
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('finance_guest')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false
    })
  }

  const continueAsGuest = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.setItem('finance_guest', 'true')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: true
    })
  }

  const exitGuest = () => {
    localStorage.removeItem('finance_guest')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false
    })
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, continueAsGuest, exitGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
