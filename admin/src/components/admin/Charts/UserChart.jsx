import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useTheme } from '../../../contexts/ThemeContext'

const DATA = [
  { day: 'Mon', users: 320 }, { day: 'Tue', users: 480 },
  { day: 'Wed', users: 560 }, { day: 'Thu', users: 490 },
  { day: 'Fri', users: 780 }, { day: 'Sat', users: 920 },
  { day: 'Sun', users: 1100 },
]

export const UserChart = () => {
  const { isDark } = useTheme()
  const mutedColor = isDark ? '#71717a' : '#9CA3AF'
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={DATA} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#2a2a2a' : '#E5E7EB'}`,
            borderRadius: 8, fontSize: 12, color: isDark ? '#fff' : '#000',
          }}
        />
        <Line type="monotone" dataKey="users" stroke="#2C6E3F" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2C6E3F' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

const DONUT_DATA = [{ name: 'Premium', value: 450 }, { name: 'Free', value: 820 }]
const COLORS = ['#2C6E3F', '#86EFAC']

export const DonutChart = ({ total = 1270 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      <PieChart width={160} height={160}>
        <Pie data={DONUT_DATA} cx={75} cy={75} innerRadius={52} outerRadius={72}
          dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
          {DONUT_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
      </PieChart>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: 'var(--text-primary)' }}>{total.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
      </div>
    </div>
    {DONUT_DATA.map((item, i) => (
      <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.name}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
      </div>
    ))}
  </div>
)
