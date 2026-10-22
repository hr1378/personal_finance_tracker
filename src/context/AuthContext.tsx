import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, preferredCurrency?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token')
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      setAuthState({
        token,
        user: JSON.parse(userStr),
        isAuthenticated: true
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Call auth service
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
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
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, preferredCurrency })
    })
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
