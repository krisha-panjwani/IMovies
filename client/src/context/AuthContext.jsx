import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api'
import { tokenStore } from '../api/http'

const AuthContext = createContext(null)

// Keeps track of who is logged in and shares it with every component.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // True while we check a saved token on page load.
  const [initializing, setInitializing] = useState(() => Boolean(tokenStore.get()))

  useEffect(() => {
    if (!tokenStore.get()) return
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setInitializing(false))
  }, [])

  // The axios interceptor fires this event when the token expires.
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('imovies:logout', onLogout)
    return () => window.removeEventListener('imovies:logout', onLogout)
  }, [])

  const startSession = useCallback(({ token, user }) => {
    tokenStore.set(token)
    setUser(user)
    return user
  }, [])

  const login = useCallback(async (email, password) => startSession(await authApi.login({ email, password })), [startSession])
  const register = useCallback(async (data) => startSession(await authApi.register(data)), [startSession])
  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === 'admin', initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
