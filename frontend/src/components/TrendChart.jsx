import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
         ResponsiveContainer, ReferenceLine, CartesianGrid, defs, linearGradient, stop } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  const color = v >= 80 ? '#00ff88' : v >= 60 ? '#ffc940' : '#ff4566'
  return (
    <div style={{ background:'#111827', border:'1px solid #1a2640', borderRadius:8,
      padding:'10px 16px', fontFamily:'JetBrains Mono' }}>
      <div style={{ fontSize:10, color:'#4a6080', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:800, color }}>{v}%</div>
    </div>
  )
}

export default function TrendChart({ scans = [], height = 180 }) {
  const data = scans.slice().reverse().map(s => ({
    date:  new Date(s.scanned_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
    score: Math.round(s.score),
  }))

  if (data.length === 0) return (
    <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center',
      color:'#4a6080', fontFamily:'JetBrains Mono', fontSize:12 }}>
      No scan history yet
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top:10, right:10, left:-20, bottom:0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a264022" vertical={false}/>
        <XAxis dataKey="date"
          tick={{ fontFamily:'JetBrains Mono', fontSize:10, fill:'#4a6080' }}
          axisLine={false} tickLine={false}/>
        <YAxis domain={[0,100]}
          tick={{ fontFamily:'JetBrains Mono', fontSize:10, fill:'#4a6080' }}
          axisLine={false} tickLine={false}/>
        <Tooltip content={<CustomTooltip/>}/>
        <ReferenceLine y={80} stroke="#00ff8825" strokeDasharray="4 4" label={{ value:'TARGET', fill:'#00ff8850', fontSize:9, fontFamily:'JetBrains Mono' }}/>
        <Area
          type="monotone" dataKey="score"
          stroke="#00ff88" strokeWidth={2}
          fill="url(#scoreGrad)"
          dot={{ fill:'#00ff88', r:4, strokeWidth:0 }}
          activeDot={{ r:6, fill:'#00ff88', stroke:'#080c17', strokeWidth:2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
