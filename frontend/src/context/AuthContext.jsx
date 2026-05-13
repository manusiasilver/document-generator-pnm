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

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

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
    // 1. Cek token dari URL parameter (redirect dari pilargroup)
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')

    if (urlToken) {
      const payload = parseJwt(urlToken)
      if (payload && payload.apps?.includes('papertrail')) {
        const userData = {
          id:            payload.sub,
          internal_id:   payload.internal_id,
          username:      payload.username,
          name:          payload.name,
          email:         payload.email,
          phone:         payload.phone,
          department_id: payload.department_id,
          department:    payload.department,
          job_position:  payload.job_position,
          apps:          payload.apps,
          cv:            payload.cv,
        }
        saveSession(urlToken, userData)
      }
      // Bersihkan token dari URL
      window.history.replaceState({}, '', window.location.pathname)
      setLoading(false)
      return
    }

    // 2. Cek localStorage
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser  = localStorage.getItem(USER_KEY)

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setLoading(false)
      return
    }

    // 3. Mock auth (local only)
    if (MOCK_AUTH) {
      mockLogin()
      return
    }

    // 4. Tidak ada sesi → ProtectedRoute akan redirect
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