import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 16px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 16, color: '#00ff88', fontWeight: 700 }}>
          {payload[0].value}%
        </div>
      </div>
    )
  }
  return null
}

export default function TrendChart({ scans = [] }) {
  const data = scans.slice().reverse().map(s => ({
    date: new Date(s.scanned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.round(s.score),
  }))

  if (data.length === 0) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a6080', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
        No scan history yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#4a6080' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#4a6080' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={80} stroke="#00ff8820" strokeDasharray="4 4" />
        <Line
          type="monotone" dataKey="score"
          stroke="#00ff88" strokeWidth={2}
          dot={{ fill: '#00ff88', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#00ff88', stroke: '#0a0e1a', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
