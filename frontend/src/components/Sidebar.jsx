import { ChevronLeft, ChevronRight, XClose } from '@untitledui/icons'
import { ArrowLeft, Clock, FileText, LayoutTemplate } from 'lucide-react'

import '../styles/templateComponents.css'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const navItems = [
  { id: 'form', label: 'Generate Dokumen', Icon: FileText },
  { id: 'history', label: 'Riwayat Dokumen', Icon: Clock },
  { id: 'templates', label: 'Kelola Template', Icon: LayoutTemplate },
]

function Sidebar({
  collapsed = false,
  mobileOpen = false,
  userName = 'Al fatih',
  userRole = 'Frontend Developer',
  portalHref = '/',
  activePage = 'form',
  onNavigate,
  onToggleCollapse,
  onCloseMobile,
}) {
  const initials = getInitials(userName)

  const sidebarClassName = [
    'sidebar',
    collapsed ? 'collapsed' : '',
    mobileOpen ? 'mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside id="sidebar" className={sidebarClassName}>
      <button
        type="button"
        className="sidebar-toggle"
        aria-label="Toggle Sidebar"
        onClick={onToggleCollapse}
      >
        {collapsed ? (
          <ChevronRight className="toggle-icon" size={16} />
        ) : (
          <ChevronLeft className="toggle-icon" size={16} />
        )}
      </button>

      <button
        type="button"
        className="sidebar-mobile-dismiss"
        aria-label="Close Sidebar"
        onClick={onCloseMobile}
      >
        <XClose size={18} />
      </button>

      <div className="sidebar-logo">
        <div className="profile-content">
          <div className="profile-avatar">
            <span className="profile-avatar__badge">{initials}</span>
            <div className="online-status" />
          </div>
          <div className="profile-info">
            <h3 className="profile-name">{userName}</h3>
            <p className="profile-role">{userRole}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item nav-item--button${activePage === id ? ' active' : ''}`}
            data-tooltip={collapsed ? label : undefined}
            onClick={() => onNavigate?.(id)}
          >
            <Icon className="nav-icon" size={22} />
            <span className="nav-text">{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <a
          href={portalHref}
          className="nav-item"
          data-tooltip={collapsed ? 'Kembali ke Pilar Group' : undefined}
        >
          <ArrowLeft className="nav-icon" size={22} />
          <span className="nav-text">Kembali ke Pilar Group</span>
        </a>
      </div>
    </aside>
  )
}

export default Sidebar
