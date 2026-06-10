import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token  = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('user') }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user: u } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    const { token, user: u } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}