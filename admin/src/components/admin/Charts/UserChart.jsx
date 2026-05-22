import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useTheme } from '../../../contexts/ThemeContext'

/* ══════════════════════════════════════
   UserChart — New subscriptions last 7 days
   Props: subs (array of subscription objects)
══════════════════════════════════════ */
export const UserChart = ({ subs = [] }) => {
  const { isDark } = useTheme()
  const mutedColor = isDark ? '#71717a' : '#9CA3AF'

  const data = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        count: 0,
      })
    }
    subs.forEach(s => {
      const created = s.startDate ? s.startDate.split('T')[0] : null
      const match = days.find(d => d.date === created)
      if (match) match.count += 1
    })
    return days.map(d => ({ day: d.day, subscriptions: d.count }))
  }, [subs])

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#2a2a2a' : '#E5E7EB'}`,
            borderRadius: 8, fontSize: 12, color: isDark ? '#fff' : '#000',
          }}
        />
        <Line
          type="monotone"
          dataKey="subscriptions"
          stroke="#2C6E3F"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#2C6E3F' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ══════════════════════════════════════
   DonutChart — Subscription status breakdown
   Props: subs (array of subscription objects)
══════════════════════════════════════ */
const COLORS       = ['#2C6E3F', '#86EFAC', '#378ADD', '#F59E0B']
const STATUS_ORDER = ['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']

export const DonutChart = ({ subs = [] }) => {
  const data = useMemo(() => {
    const counts = {}
    STATUS_ORDER.forEach(s => { counts[s] = 0 })
    subs.forEach(s => { if (counts[s.status] !== undefined) counts[s.status] += 1 })
    return STATUS_ORDER
      .filter(s => counts[s] > 0)
      .map(s => ({ name: s.charAt(0) + s.slice(1).toLowerCase(), value: counts[s] }))
  }, [subs])

  const total    = subs.length
  const pieData  = data.length > 0 ? data : [{ name: 'None', value: 1 }]
  const pieColors = data.length > 0 ? COLORS : ['#E5E7EB']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <PieChart width={160} height={160}>
          <Pie
            data={pieData}
            cx={75} cy={75}
            innerRadius={52} outerRadius={72}
            dataKey="value"
            startAngle={90} endAngle={-270}
            strokeWidth={0}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
        </PieChart>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center'
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: 'var(--text-primary)' }}>
            {total.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
        </div>
      </div>

      {data.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>No data yet</p>
        : data.map((item, i) => (
          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
          </div>
        ))
      }
    </div>
  )
}