import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDevices, getScans } from '../api'
import { GradeBadge } from '../components/SeverityBadge'
import { Monitor, Calendar, Globe, Hash, Cpu } from 'lucide-react'

function SparkBar({ scans }) {
  // Mini score history bar — last 5 scans
  const recent = scans.slice(0, 5).reverse()
  if (recent.length === 0) return null
  return (
    <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:22 }}>
      {recent.map((s,i) => {
        const h = Math.max(4, Math.round((s.score / 100) * 22))
        const c = s.score>=80?'#00ff88':s.score>=60?'#ffc940':'#ff4566'
        return <div key={i} style={{ width:6, height:h, background:c, borderRadius:2, opacity:.8 }}/>
      })}
    </div>
  )
}

function DeviceCard({ d, deviceScans, onClick }) {
  const lastScore = d.last_score
  const scoreColor = !lastScore ? '#4a6080'
    : lastScore >= 80 ? '#00ff88'
    : lastScore >= 60 ? '#ffc940'
    : '#ff4566'

  return (
    <div onClick={onClick} className="card card-glow fade-up d1"
      style={{ cursor: deviceScans[0] ? 'pointer' : 'default',
        display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ width:36, height:36, borderRadius:8, background:'#00d4ff12',
            border:'1px solid #00d4ff25', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Monitor size={16} color="#00d4ff"/>
          </div>
          <div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:14, fontWeight:700, color:'#e2e8f0' }}>
              {d.hostname}
            </div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#00d4ff', letterSpacing:2, marginTop:2 }}>
              {d.os_type?.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
          {lastScore && <GradeBadge score={lastScore}/>}
          <SparkBar scans={deviceScans}/>
        </div>
      </div>

      {/* Score bar */}
      {lastScore && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:1 }}>COMPLIANCE SCORE</span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:12, fontWeight:700, color:scoreColor }}>
              {Math.round(lastScore)}%
            </span>
          </div>
          <div style={{ background:'#1a2640', borderRadius:4, height:6, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${lastScore}%`, background:scoreColor,
              borderRadius:4, transition:'width 1s ease',
              boxShadow:`0 0 8px ${scoreColor}50` }}/>
          </div>
        </div>
      )}

      {/* Details */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[
          { icon:Globe,    label:'IP',       value: d.ip_address || 'Unknown' },
          { icon:Hash,     label:'Scans',    value: deviceScans.length },
          { icon:Cpu,      label:'OS',       value: d.os_version?.slice(0,22) || 'Unknown' },
          { icon:Calendar, label:'Last Scan',value: d.last_scan ? new Date(d.last_scan).toLocaleDateString() : 'Never' },
        ].map(({ icon:Icon, label, value }) => (
          <div key={label} style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
            <Icon size={11} color="#4a6080" style={{ marginTop:1, flexShrink:0 }}/>
            <div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'#4a6080', letterSpacing:1 }}>{label}</div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#8fa3bf', marginTop:1,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:100 }}>
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {deviceScans[0] && (
        <div style={{ marginTop:'auto', fontFamily:'JetBrains Mono', fontSize:10, color:'#00d4ff',
          borderTop:'1px solid #1a2640', paddingTop:12 }}>
          View latest scan →
        </div>
      )}
    </div>
  )
}

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [scans,   setScans]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getDevices(), getScans()])
      .then(([d, s]) => { setDevices(d.data); setScans(s.data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'JetBrains Mono', fontSize:20, fontWeight:800, color:'#e2e8f0' }}>Devices</h1>
        <p style={{ color:'#4a6080', fontSize:13, marginTop:4 }}>
          {devices.length} registered machine{devices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height:240, borderRadius:12 }}/>
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 40px' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🖥️</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color:'#4a6080', lineHeight:2 }}>
            No devices registered yet.<br/>
            Run <span style={{ color:'#00ff88' }}>py scanner.py</span> on a machine<br/>
            to register it here automatically.
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {devices.map(d => {
            const deviceScans = scans.filter(s => s.device_id === d.id)
            return (
              <DeviceCard key={d.id} d={d} deviceScans={deviceScans}
                onClick={() => deviceScans[0] && navigate(`/scans/${deviceScans[0].id}`)}/>
            )
          })}
        </div>
      )}
    </div>
  )
}
