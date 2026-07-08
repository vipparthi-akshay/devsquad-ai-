"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api, type UserResponse } from "./api"

interface AuthContextValue {
  user: UserResponse | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (full_name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = "devsquad_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
      api.auth.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    const userData = await api.auth.me()
    setUser(userData)
  }, [])

  const register = useCallback(async (full_name: string, email: string, password: string) => {
    const res = await api.auth.register({ full_name, email, password })
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    const userData = await api.auth.me()
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await api.auth.google(idToken)
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setToken(res.access_token)
    const userData = await api.auth.me()
    setUser(userData)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
