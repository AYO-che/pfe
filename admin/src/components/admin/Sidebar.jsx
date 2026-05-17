import React from 'react'
// 1. استيراد الصورة (تأكد من كتابة المسار الصحيح لمكان الصورة في جهازك)
import logoImg from '../../assets/logo.jpg' 

import {
  LayoutDashboard, Users, UserCheck, MessageSquare,
  FileText, CreditCard, Settings, LogOut
} from 'lucide-react'

const NAV = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'clients',      label: 'Clients',       icon: Users           },
  { id: 'nutritionists', label: 'Nutritionists',  icon: UserCheck       },
  { id: 'inquiries',     label: 'Inquiries',      icon: MessageSquare, badge: true },
  { id: 'content',       label: 'Content',        icon: FileText        },
  { id: 'subscriptions', label: 'Subscriptions',  icon: CreditCard      },
  { id: 'settings',      label: 'Settings',       icon: Settings        },
]

const Sidebar = ({ activePage, onNavigate, onLogout, inquiryBadge }) => (
  <aside style={{
    width: 220, minHeight: '100vh',
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
    transition: 'background 0.25s, border-color 0.25s',
  }}>
    
    {/* قسم اللوغو المعدل */}
    <div style={{ 
      height: '90px', // تثبيت ارتفاع مناسب للقسم
      borderBottom: '1px solid var(--border)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      overflow: 'hidden' // ضروري عشان الزووم ما يطلع برا الحدود
    }}>
      <img 
        src={logoImg} 
        alt="Chrysalis Logo" 
        style={{ 
          width: '100%',
          height: '100%',
          objectFit: 'contain', // يحافظ على أبعاد الصورة الأصلية عشان ما تتمطط
          transform: 'scale(1.7)', // 💡 السر هنا: نعمل زووم بنسبة 1.5 لتكبير اللوغو وإخفاء حدوده البيضاء
          transformOrigin: 'center' // يكون التكبير من المركز
        }} 
      />
    </div>

    {/* Nav items */}
    <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
      {NAV.map(item => {
        const Icon = item.icon
        const active = activePage === item.id
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, border: 'none', marginBottom: 2,
            background: active ? '#2C6E3F' : 'transparent',
            color: active ? '#fff' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: active ? 600 : 500,
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && inquiryBadge > 0 && (
              <span style={{ background: active ? 'rgba(255,255,255,0.3)' : '#EF4444', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                {inquiryBadge}
              </span>
            )}
          </button>
        )
      })}
    </nav>

    {/* Logout */}
    <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
      <button onClick={onLogout} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 8, border: 'none',
        background: 'transparent', color: '#EF4444',
        fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  </aside>
)

export default Sidebar