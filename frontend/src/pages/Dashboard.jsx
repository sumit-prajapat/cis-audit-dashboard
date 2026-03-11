import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScans, getDevices, downloadReport } from '../api'
import ScoreGauge from '../components/ScoreGauge'
import TrendChart from '../components/TrendChart'
import { ScoreBadge, GradeBadge } from '../components/SeverityBadge'
import { FileDown, Monitor, ScanLine, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

function Skeleton({ h = 120 }) {
  return <div className="skeleton" style={{ height:h, borderRadius:12 }}/>
}

function StatCard({ label, value, sub, icon:Icon, color='#e2e8f0', delta, delay='' }) {
  const deltaEl = delta != null
    ? delta > 0  ? <span style={{ color:'#00ff88', fontSize:10, fontFamily:'JetBrains Mono' }}>▲ +{delta}%</span>
    : delta < 0  ? <span style={{ color:'#ff4566', fontSize:10, fontFamily:'JetBrains Mono' }}>▼ {delta}%</span>
    : <span style={{ color:'#4a6080', fontSize:10, fontFamily:'JetBrains Mono' }}>— 0%</span>
    : null

  return (
    <div className={`card card-glow fade-up ${delay}`}
      style={{ flex:1, minWidth:140, display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:2, textTransform:'uppercase' }}>
          {label}
        </div>
        <div style={{ width:32, height:32, borderRadius:8, background:`${color}15`,
          border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={14} color={color}/>
        </div>
      </div>
      <div style={{ fontFamily:'JetBrains Mono', fontSize:28, fontWeight:800, color, lineHeight:1 }}>
        {value}
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        {sub && <span style={{ fontSize:12, color:'#4a6080' }}>{sub}</span>}
        {deltaEl}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [scans,   setScans]   = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getScans(), getDevices()])
      .then(([s, d]) => { setScans(s.data); setDevices(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ flex:1, padding:32, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', gap:16 }}>
        {[...Array(4)].map((_,i) => <Skeleton key={i} h={110}/>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:20 }}>
        <Skeleton h={280}/><Skeleton h={280}/>
      </div>
      <Skeleton h={240}/>
    </div>
  )

  const latest   = scans[0]
  const prev     = scans[1]
  const delta    = latest && prev ? Math.round(latest.score - prev.score) : null
  const avgScore = scans.length ? Math.round(scans.reduce((a,s) => a + s.score, 0) / scans.length) : 0

  const latestColor = !latest ? '#4a6080'
    : latest.score >= 80 ? '#00ff88'
    : latest.score >= 60 ? '#ffc940'
    : '#ff4566'

  return (
    <div style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'JetBrains Mono', fontSize:20, fontWeight:800, color:'#e2e8f0', letterSpacing:1 }}>
          Security Dashboard
        </h1>
        <p style={{ color:'#4a6080', fontSize:13, marginTop:4 }}>
          CIS Benchmark Compliance Overview
          {latest && <span style={{ marginLeft:12, color:'#2a3850' }}>·</span>}
          {latest && <span style={{ marginLeft:12, fontSize:11, color:'#4a6080', fontFamily:'JetBrains Mono' }}>
            Last scan: {new Date(latest.scanned_at).toLocaleString()}
          </span>}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'flex', gap:14, marginBottom:24, flexWrap:'wrap' }}>
        <StatCard
          label="Latest Score"
          value={latest ? `${Math.round(latest.score)}%` : 'N/A'}
          color={latestColor}
          icon={Activity}
          delta={delta}
          sub={latest ? `${latest.passed} passed, ${latest.failed} failed` : 'No scans yet'}
          delay="d1"
        />
        <StatCard label="Total Scans" value={scans.length} color="#00d4ff" icon={ScanLine}
          sub={scans.length > 0 ? `Last 30 days` : 'Run agent to start'} delay="d1"/>
        <StatCard label="Devices"     value={devices.length} color="#a78bfa" icon={Monitor}
          sub={`${devices.length} machine${devices.length !== 1 ? 's' : ''} registered`} delay="d2"/>
        <StatCard label="Avg Score"   value={`${avgScore}%`} color="#ffc940" icon={TrendingUp}
          sub="Across all scans" delay="d2"/>
      </div>

      {/* Gauge + Trend */}
      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:18, marginBottom:18 }}>
        {/* Gauge card */}
        <div className="card card-glow fade-up d2" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:28, minWidth:220 }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:2 }}>
            LATEST SCAN
          </div>
          <ScoreGauge score={latest?.score || 0} size={186}/>
          {latest && (
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
              {/* Pass/fail/warn breakdown */}
              <div style={{ display:'flex', gap:6 }}>
                {[
                  { label:'PASS', value:latest.passed,   color:'#00ff88' },
                  { label:'FAIL', value:latest.failed,   color:'#ff4566' },
                  { label:'WARN', value:latest.warnings, color:'#ffc940' },
                ].map(s => (
                  <div key={s.label} style={{ flex:1, textAlign:'center', padding:'8px 4px',
                    background:`${s.color}0a`, border:`1px solid ${s.color}25`, borderRadius:6 }}>
                    <div style={{ fontFamily:'JetBrains Mono', fontSize:16, fontWeight:800, color:s.color }}>{s.value}</div>
                    <div style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'#4a6080', marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Delta badge */}
              {delta != null && (
                <div style={{ textAlign:'center', padding:'6px',
                  background: delta > 0 ? '#00ff8808' : delta < 0 ? '#ff456608' : '#4a608010',
                  border:`1px solid ${delta > 0 ? '#00ff8825' : delta < 0 ? '#ff456625' : '#4a608030'}`,
                  borderRadius:6 }}>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:11, fontWeight:700,
                    color: delta > 0 ? '#00ff88' : delta < 0 ? '#ff4566' : '#4a6080' }}>
                    {delta > 0 ? `▲ +${delta}%` : delta < 0 ? `▼ ${delta}%` : '— No change'} vs previous
                  </span>
                </div>
              )}

              <button onClick={() => window.open(downloadReport(latest.id))}
                className="btn btn-green" style={{ justifyContent:'center', width:'100%' }}>
                <FileDown size={13}/> PDF Report
              </button>
            </div>
          )}
          {!latest && (
            <div style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#4a6080', textAlign:'center', lineHeight:1.8 }}>
              No scan data yet.<br/>
              <span style={{ color:'#00ff88' }}>Run scanner.py</span><br/>
              to see results.
            </div>
          )}
        </div>

        {/* Trend chart */}
        <div className="card fade-up d3">
          <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:2, marginBottom:20 }}>
            COMPLIANCE TREND
          </div>
          <TrendChart scans={scans} height={200}/>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="card fade-up d3">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:2 }}>
            RECENT SCANS
          </div>
          <button onClick={() => navigate('/scans')} className="btn btn-ghost"
            style={{ padding:'5px 12px', fontSize:10 }}>
            View all →
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {['ID', 'Device', 'Score', 'Grade', 'Passed', 'Failed', 'Date'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scans.slice(0, 6).map((s) => (
              <tr key={s.id} onClick={() => navigate(`/scans/${s.id}`)}>
                <td><span style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#4a6080' }}>#{s.id}</span></td>
                <td><span style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#00d4ff' }}>
                  {devices.find(d => d.id === s.device_id)?.hostname || `Device ${s.device_id}`}
                </span></td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:52, height:5, background:'#1a2640', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${s.score}%`, borderRadius:3,
                        background: s.score>=80?'#00ff88':s.score>=60?'#ffc940':'#ff4566' }}/>
                    </div>
                    <ScoreBadge score={s.score}/>
                  </div>
                </td>
                <td><GradeBadge score={s.score}/></td>
                <td><span style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#00ff88' }}>{s.passed}</span></td>
                <td><span style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#ff4566' }}>{s.failed}</span></td>
                <td><span style={{ fontSize:12, color:'#4a6080' }}>{new Date(s.scanned_at).toLocaleDateString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {scans.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 40px' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🛡️</div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6080', lineHeight:2 }}>
              No scans yet.<br/>
              Run <span style={{ color:'#00ff88' }}>py scanner.py</span> on your machine to populate this dashboard.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
