import React, { useState } from 'react'
import { UserChart, DonutChart } from './Charts/UserChart'
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react'

const STATS = [
  { label: 'Total Clients',        value: '5',     icon: Users,     change: '+12%', color: '#2C6E3F' },
  { label: 'Nutritionists',         value: '3',     icon: UserPlus,  change: '+2',   color: '#4CAF50' },
  { label: 'Active Subscriptions',  value: '3',     icon: Activity,  change: '+18%', color: '#FF9800' },
  { label: 'AI Estimates',          value: '12.4k', icon: TrendingUp,change: '+24%', color: '#9C27B0' },
]

const INQUIRIES = [
  { name: 'Khalid Nasser', subject: 'Subscription Renewal Issue',  date: '2025-04-10', unread: true  },
  { name: 'Mona Sami',     subject: 'Cannot login to my account',  date: '2025-04-09', unread: false },
  { name: 'Tariq Bilal',   subject: 'Nutritionist not responding', date: '2025-04-08', unread: false },
]

const REVENUE = [
  { label: 'Premium Annual',   count: '2 active' },
  { label: 'Premium Monthly',  count: '0 active' },
  { label: 'Summer Seasonal',  count: '0 active' },
  { label: 'Ramadan Plan',     count: '1 active' },
]

const Dashboard = () => {
  const [range, setRange] = useState('Last 7 Days')

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={s.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 20 }}>↑ {s.change}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: 'var(--text-primary)', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, color: 'var(--text-primary)' }}>New Users — Last 7 Days</h3>
            <select value={range} onChange={e => setRange(e.target.value)} style={{ fontSize: 12, border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', color: 'var(--text-secondary)', background: 'var(--bg-card)', cursor: 'pointer' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <UserChart />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>Plan Distribution</h3>
          <DonutChart total={1270} />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Inquiries */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Inquiries</h3>
          {INQUIRIES.map((inq, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < INQUIRIES.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2C6E3F20', color: '#2C6E3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {inq.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{inq.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inq.subject}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {inq.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{inq.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>Revenue Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active Revenue</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#2C6E3F', fontFamily: 'Syne,sans-serif' }}>SAR 1,077</span>
          </div>
          {REVENUE.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < REVENUE.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{r.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
