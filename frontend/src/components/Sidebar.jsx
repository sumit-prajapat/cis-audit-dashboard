import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Monitor, ScanLine, Shield } from 'lucide-react'

const links = [
  { to:'/',        label:'Dashboard', icon:LayoutDashboard, end:true },
  { to:'/devices', label:'Devices',   icon:Monitor },
  { to:'/scans',   label:'All Scans', icon:ScanLine },
]

export default function Sidebar() {
  const [time, setTime]   = useState(new Date())
  const [apiOk, setApiOk] = useState(null)

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000)
    // Quick health check
    fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/` : '/api/')
      .then(() => setApiOk(true)).catch(() => setApiOk(false))
    return () => clearInterval(tick)
  }, [])

  const statusColor = apiOk === null ? '#ffc940' : apiOk ? '#00ff88' : '#ff4566'
  const statusLabel = apiOk === null ? 'CONNECTING' : apiOk ? 'API LIVE' : 'API DOWN'

  return (
    <aside style={{
      width: 220, minHeight:'100vh',
      background: '#080c17',
      borderRight: '1px solid #1a2640',
      display:'flex', flexDirection:'column',
      position:'sticky', top:0,
    }}>
      {/* Top accent line */}
      <div style={{ height:2, background:'linear-gradient(90deg,#00ff88,#00d4ff,transparent)' }}/>

      {/* Logo */}
      <div style={{ padding:'28px 24px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'#00ff8812',
            border:'1px solid #00ff8830', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={16} color="#00ff88"/>
          </div>
          <div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:12, fontWeight:800, color:'#e2e8f0', letterSpacing:2 }}>
              CIS AUDIT
            </div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:1, marginTop:1 }}>
              COMPLIANCE DASHBOARD
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'0 12px' }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'#4a6080', letterSpacing:2,
          padding:'0 12px', marginBottom:8 }}>NAVIGATION</div>
        {links.map(({ to, label, icon:Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            display:'flex', alignItems:'center', gap:10,
            padding:'10px 12px', borderRadius:8, marginBottom:3,
            color: isActive ? '#00ff88' : '#4a6080',
            background: isActive ? '#00ff8810' : 'transparent',
            border: `1px solid ${isActive ? '#00ff8825' : 'transparent'}`,
            textDecoration:'none',
            fontFamily:'JetBrains Mono', fontSize:12, fontWeight: isActive ? 700 : 500,
            transition:'all .2s',
          })}>
            <Icon size={14}/>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* API Status */}
      <div style={{ margin:'0 12px 12px', padding:'12px', background:'#0d1424',
        border:'1px solid #1a2640', borderRadius:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:statusColor,
            boxShadow:`0 0 8px ${statusColor}80` }} className={apiOk ? 'pulse' : ''}/>
          <span style={{ fontFamily:'JetBrains Mono', fontSize:9, color:statusColor, letterSpacing:1.5 }}>
            {statusLabel}
          </span>
        </div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#4a6080', letterSpacing:1 }}>
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'16px 24px', borderTop:'1px solid #1a2640' }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:1 }}>
          v2.0.0 · SIH 2025
        </div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'#2a3850', marginTop:3 }}>
          mk1311 · github.com/sumit-prajapat
        </div>
      </div>
    </aside>
  )
}
