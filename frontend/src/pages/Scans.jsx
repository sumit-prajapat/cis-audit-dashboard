import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScans, getDevices } from '../api'
import { ScoreBadge, GradeBadge } from '../components/SeverityBadge'
import { Search } from 'lucide-react'

function Skeleton() {
  return (
    <tr>
      {[...Array(7)].map((_,i) => (
        <td key={i} style={{ padding:'14px 20px' }}>
          <div className="skeleton" style={{ height:16, borderRadius:4 }}/>
        </td>
      ))}
    </tr>
  )
}

export default function Scans() {
  const [scans,   setScans]   = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getScans(), getDevices()])
      .then(([s, d]) => { setScans(s.data); setDevices(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = scans.filter(s => {
    const hostname = devices.find(d => d.id === s.device_id)?.hostname || ''
    return !search || hostname.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search)
  })

  // Compute score delta vs previous scan for same device
  function getDelta(scan) {
    const same = scans.filter(s => s.device_id === scan.device_id && s.id !== scan.id)
    if (same.length === 0) return null
    const prev = same.find(s => s.id < scan.id)
    if (!prev) return null
    return Math.round(scan.score - prev.score)
  }

  return (
    <div style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>
      <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'JetBrains Mono', fontSize:20, fontWeight:800, color:'#e2e8f0' }}>All Scans</h1>
          <p style={{ color:'#4a6080', fontSize:13, marginTop:4 }}>{scans.length} total scans recorded</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4a6080' }}/>
            <input className="input" placeholder="Search by device or ID…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft:30, width:220 }}/>
          </div>
        </div>
      </div>

      <div className="card fade-up d1" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead>
            <tr style={{ background:'#0d1424' }}>
              {['Scan ID','Device','Score','Grade','Δ vs Prev','Passed','Failed','Date'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_,i) => <Skeleton key={i}/>)
              : filtered.map(s => {
                  const device = devices.find(d => d.id === s.device_id)
                  const delta  = getDelta(s)
                  return (
                    <tr key={s.id} onClick={() => navigate(`/scans/${s.id}`)}>
                      <td><span style={{ fontFamily:'JetBrains Mono', color:'#4a6080', fontSize:11 }}>#{s.id}</span></td>
                      <td><span style={{ fontFamily:'JetBrains Mono', color:'#00d4ff', fontSize:12 }}>
                        {device?.hostname || `Device ${s.device_id}`}
                      </span></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:48, height:5, background:'#1a2640', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${s.score}%`, borderRadius:3,
                              background:s.score>=80?'#00ff88':s.score>=60?'#ffc940':'#ff4566' }}/>
                          </div>
                          <ScoreBadge score={s.score}/>
                        </div>
                      </td>
                      <td><GradeBadge score={s.score}/></td>
                      <td>
                        {delta === null
                          ? <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#4a6080' }}>—</span>
                          : <span style={{ fontFamily:'JetBrains Mono', fontSize:11, fontWeight:700,
                              color: delta > 0 ? '#00ff88' : delta < 0 ? '#ff4566' : '#4a6080' }}>
                              {delta > 0 ? `▲ +${delta}%` : delta < 0 ? `▼ ${delta}%` : '—'}
                            </span>
                        }
                      </td>
                      <td><span style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#00ff88' }}>{s.passed}</span></td>
                      <td><span style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#ff4566' }}>{s.failed}</span></td>
                      <td><span style={{ fontSize:12, color:'#4a6080' }}>{new Date(s.scanned_at).toLocaleDateString()}</span></td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px', color:'#4a6080', fontFamily:'JetBrains Mono', fontSize:12 }}>
            {search ? 'No scans match your search.' : 'No scans yet. Run the agent first.'}
          </div>
        )}
      </div>
    </div>
  )
}
