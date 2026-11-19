import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthState } from '../types'
import { applyAuthResponse, clearAccessToken, getAccessToken, refreshSession } from '../lib/session'

interface AuthContextType extends AuthState {
  isGuest: boolean
  isRestoring: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, preferredCurrency?: string) => Promise<void>
  logout: () => void
  continueAsGuest: () => void
  exitGuest: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState & { isGuest: boolean; isRestoring: boolean }>(() => {
    const isGuest = localStorage.getItem('finance_guest') === 'true'
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest,
      isRestoring: !isGuest
    }
  })

  // On load, exchange the httpOnly refresh-token cookie for an access token.
  useEffect(() => {
    if (authState.isGuest) return
    let cancelled = false
    refreshSession().then((user) => {
      if (cancelled) return
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        setAuthState({
          token: getAccessToken(),
          user,
          isAuthenticated: true,
          isGuest: false,
          isRestoring: false
        })
      } else {
        setAuthState((s) => ({ ...s, isRestoring: false }))
      }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persistUser = (user: { id: string; email: string; preferredCurrency: string }) => {
    localStorage.setItem('user', JSON.stringify(user))
    setAuthState({
      token: getAccessToken(),
      user,
      isAuthenticated: true,
      isGuest: false,
      isRestoring: false
    })
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      throw new Error('Login failed')
    }
    const data = await response.json()
    localStorage.removeItem('finance_guest')
    persistUser(applyAuthResponse(data))
  }

  const register = async (email: string, password: string, preferredCurrency?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, preferredCurrency })
    })
    if (!response.ok) {
      throw new Error('Registration failed')
    }
    const data = await response.json()
    localStorage.removeItem('finance_guest')
    persistUser(applyAuthResponse(data))
  }

  const logout = () => {
    // The httpOnly cookie is sent automatically; the server revokes + clears it.
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }).catch(() => {})
    clearAccessToken()
    localStorage.removeItem('user')
    localStorage.removeItem('finance_guest')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isRestoring: false
    })
  }

  const continueAsGuest = () => {
    clearAccessToken()
    localStorage.removeItem('user')
    localStorage.setItem('finance_guest', 'true')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: true,
      isRestoring: false
    })
  }

  const exitGuest = () => {
    localStorage.removeItem('finance_guest')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isRestoring: false
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
