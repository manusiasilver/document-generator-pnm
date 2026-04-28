import { useState } from 'react'
import Dashboard from './Dashboard'
import Header from './templateComponents/templateComponents/Header.jsx'
import Sidebar from './templateComponents/templateComponents/Sidebar.jsx'

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePage, setActivePage] = useState('form')

  const pageTitle = activePage === 'form' ? 'Generate Dokumen' : 'Riwayat Dokumen'

  return (
    <div className={`dashboard-shell${collapsed ? ' dashboard-shell--sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        activePage={activePage}
        onNavigate={setActivePage}
        onToggleCollapse={() => setCollapsed(c => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="dashboard-stage">
        <Header
          title="Document Generator"
          showMenuButton={true}
          onMenuToggle={() => setMobileOpen(o => !o)}
          breadcrumb={[{ label: pageTitle, href: '#', active: true }]}
        />
        <main className="dashboard-main">
          <Dashboard activePage={activePage} onNavigate={setActivePage} />
        </main>
      </div>
    </div>
  )
}

export default App
