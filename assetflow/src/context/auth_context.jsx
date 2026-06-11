import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

function getInitialUser() {
  try {
    const token  = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) return JSON.parse(stored)
  } catch {
    localStorage.removeItem('user')
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)

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
    <AuthContext.Provider value={{ user, loading: false, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}