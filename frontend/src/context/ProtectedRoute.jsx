import { useAuth } from './AuthContext'

const PG_URL = import.meta.env.VITE_PILARGROUP_URL

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Memuat sesi...</p>
      </div>
    )
  }

  if (!user) {
    // Redirect ke pilargroup login, bawa return URL
    const returnUrl = encodeURIComponent(window.location.href)
    window.location.href = `${PG_URL}/login?redirect=${returnUrl}`
    return null
  }

  // Cek apakah user punya akses ke papertrail
  if (!user.apps?.includes('papertrail')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>Akses Ditolak</p>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Akun kamu tidak terdaftar di aplikasi Papertrail.</p>
        <button onClick={() => window.location.href = PG_URL} style={{ marginTop: '1rem', padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.85rem' }}>
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  return children
}