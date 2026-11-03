import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, preferredCurrency?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        return {
          token,
          user: JSON.parse(userStr),
          isAuthenticated: true
        }
      } catch {
        return {
          user: null,
          token: null,
          isAuthenticated: false
        }
      }
    }
    return {
      user: null,
      token: null,
      isAuthenticated: false
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
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency }))
    setAuthState({
      token: data.token,
      user: { id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency },
      isAuthenticated: true
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
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency }))
    setAuthState({
      token: data.token,
      user: { id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency },
      isAuthenticated: true
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false
    })
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
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
