import React, { useState, useEffect } from 'react'
import { Search, Bell, RefreshCw, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const Header = ({ pageName, date, notifications = [], onClearAll }) => {
  const { isDark, toggleTheme } = useTheme()
  const [showNotif, setShowNotif] = useState(false)
  
  // تحويل الإشعارات إلى State داخلي للتمكن من حذفها وتحديث الواجهة فوراً
  const [localNotifs, setLocalNotifs] = useState(notifications)

  // لمزامنة الإشعارات المحلية في حال تم إرسال إشعارات جديدة من المكون الأب
  useEffect(() => {
    setLocalNotifs(notifications)
  }, [notifications])

  // حساب عدد الإشعارات غير المقروءة بناءً على الـ State المحلي
  const unread = localNotifs.filter(n => n.unread).length

  // دالة حذف جميع الإشعارات
  const handleClearAll = () => {
    setLocalNotifs([])
    if (onClearAll) {
      onClearAll() // استدعاء الدالة من المكون الأب إن وجدت لتحديث البيانات هناك أيضاً
    }
  }

  return (
    <header style={{
      height: 64, background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      {/* Left */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{pageName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{date}</div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', width: 200 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Global search..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-primary)', width: '100%' }} />
        </div>

        {/* Refresh */}
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 8 }} onClick={() => window.location.reload()}>
          <RefreshCw size={15} />
        </button>

        {/* Dark/Light toggle */}
        <button onClick={toggleTheme} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
          background: isDark ? '#2C6E3F18' : 'var(--bg-main)',
          color: isDark ? '#4CAF50' : 'var(--text-secondary)',
          fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          {isDark ? 'Light' : 'Dark'}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotif(!showNotif)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 8, position: 'relative' }}>
            <Bell size={16} />
            {unread > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }} />}
          </button>

          {showNotif && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowNotif(false)} />
              <div style={{ position: 'absolute', top: 42, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-md)', width: 300, zIndex: 200 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Notifications ({unread})</span>
                  {/* ربط زر الحذف بالدالة الجديدة */}
                  <button onClick={handleClearAll} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Clear all</button>
                </div>
                
                {localNotifs.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
                ) : (
                  localNotifs.map((n, i) => (
                    <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 10, background: n.unread ? '#2C6E3F08' : 'transparent', borderBottom: i < localNotifs.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.unread ? '#EF4444' : 'var(--border)', marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{n.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Admin avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, borderLeft: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', color: 'var(--text-primary)' }}>Admin Manager</div>
            <div style={{ fontSize: 10, color: '#2C6E3F', fontWeight: 700, textAlign: 'right' }}>SUPER ADMIN</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2C6E3F,#4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>A</div>
        </div>
      </div>
    </header>
  )
}

export default Header