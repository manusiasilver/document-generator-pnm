import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL     = import.meta.env.VITE_API_URL
const PG_URL      = import.meta.env.VITE_PILARGROUP_URL
const MOCK_AUTH   = import.meta.env.VITE_MOCK_AUTH === 'true'
const MOCK_USER   = import.meta.env.VITE_MOCK_USERNAME
const MOCK_PASS   = import.meta.env.VITE_MOCK_PASSWORD

const TOKEN_KEY = 'pt_token'
const USER_KEY  = 'pt_user'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Inject token ke semua request axios
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY)
      if (t) config.headers['Authorization'] = `Bearer ${t}`
      return config
    })
    return () => axios.interceptors.request.eject(interceptor)
  }, [])

  // Boot: cek localStorage, kalau kosong + mock auth → auto login
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser  = localStorage.getItem(USER_KEY)

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setLoading(false)
      return
    }

    if (MOCK_AUTH) {
      mockLogin()
      return
    }

    // Production: redirect ke pilargroup
    setLoading(false)
  }, [])

  async function mockLogin() {
    try {
      const res = await axios.post(`${API_URL}/dev/login`, {
        username: MOCK_USER,
        password: MOCK_PASS,
      })
      saveSession(res.data.token, res.data.user)
    } catch (err) {
      console.error('[MockAuth] Gagal login:', err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  function saveSession(t, u) {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)

    // Redirect ke pilargroup logout
    window.location.href = `${PG_URL}/logout`
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}