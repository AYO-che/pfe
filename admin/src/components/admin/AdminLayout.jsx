import React from 'react'
import Sidebar from './Sidebar'
import Header  from './Header'

const AdminLayout = ({ children, activePage, onNavigate, onLogout, pageName, notifications, inquiryBadge }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', transition: 'background 0.25s' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        inquiryBadge={inquiryBadge}
      />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header pageName={pageName} date={today} notifications={notifications} />
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
