import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScan, downloadReport } from '../api'
import ScoreGauge from '../components/ScoreGauge'
import CheckTable from '../components/CheckTable'
import CategoryBreakdown from '../components/CategoryBreakdown'
import { GradeBadge } from '../components/SeverityBadge'
import { ArrowLeft, FileDown, ClipboardList, BarChart2, AlertTriangle } from 'lucide-react'

function Skeleton({ h }) {
  return <div className="skeleton" style={{ height:h, borderRadius:12 }}/>
}

export default function ScanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [scan, setScan]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState('checks') // 'checks' | 'categories'
  const [exportDone, setExportDone] = useState(false)

  useEffect(() => {
    getScan(id).then(r => setScan(r.data)).finally(() => setLoading(false))
  }, [id])

  function exportFailed() {
    if (!scan) return
    const failed = scan.results.filter(r => r.status === 'FAIL')
    const text = failed.map(r =>
      `[${r.check_id}] ${r.title}\nSeverity: ${r.severity}\nFound: ${r.actual_value || 'N/A'}\nFix: ${r.remediation || 'N/A'}`
    ).join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 2000)
  }

  if (loading) return (
    <div style={{ flex:1, padding:32, display:'flex', flexDirection:'column', gap:18 }}>
      <Skeleton h={60}/><Skeleton h={200}/><Skeleton h={400}/>
    </div>
  )
  if (!scan) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'JetBrains Mono', color:'#ff4566', fontSize:14 }}>Scan not found</div>
    </div>
  )

  const critical = scan.results.filter(r => r.status==='FAIL' && r.severity==='critical').length
  const high     = scan.results.filter(r => r.status==='FAIL' && r.severity==='high').length
  const failCount = scan.results.filter(r => r.status==='FAIL').length
  const failedChecks = scan.results.filter(r => r.status==='FAIL')

  return (
    <div style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>

      {/* Header */}
      <div className="fade-up" style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28, flexWrap:'wrap' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding:'7px 14px', fontSize:11 }}>
          <ArrowLeft size={13}/> Back
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'JetBrains Mono', fontSize:18, fontWeight:800, color:'#e2e8f0' }}>
            Scan #{scan.id}
          </h1>
          <p style={{ color:'#4a6080', fontSize:12, marginTop:3 }}>
            {new Date(scan.scanned_at).toLocaleString()} · {scan.results.length} checks
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={exportFailed} className="btn btn-ghost" style={{ fontSize:10, padding:'7px 14px' }}>
            <ClipboardList size={12}/>
            {exportDone ? '✓ Copied!' : `Copy ${failCount} Failed`}
          </button>
          <button onClick={() => window.open(downloadReport(scan.id))} className="btn btn-green">
            <FileDown size={13}/> PDF Report
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="fade-up d1" style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:16, marginBottom:20 }}>

        {/* Gauge */}
        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, padding:24, minWidth:210 }}>
          <ScoreGauge score={scan.score} size={170}/>
          <GradeBadge score={scan.score}/>
          <div style={{ display:'flex', gap:8, width:'100%' }}>
            {[
              { l:'Pass', v:scan.passed,   c:'#00ff88' },
              { l:'Fail', v:scan.failed,   c:'#ff4566' },
              { l:'Warn', v:scan.warnings, c:'#ffc940' },
            ].map(s => (
              <div key={s.l} style={{ flex:1, textAlign:'center', padding:'8px 4px',
                background:`${s.c}08`, border:`1px solid ${s.c}20`, borderRadius:6 }}>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'#4a6080', marginTop:2 }}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk summary */}
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:2 }}>RISK SUMMARY</div>
          <div style={{ display:'flex', gap:12 }}>
            {[
              { label:'CRITICAL', value:critical, color:'#ff4566' },
              { label:'HIGH',     value:high,     color:'#ff8a50' },
              { label:'MEDIUM',   value:scan.results.filter(r=>r.status==='FAIL'&&r.severity==='medium').length, color:'#ffc940' },
              { label:'LOW',      value:scan.results.filter(r=>r.status==='FAIL'&&r.severity==='low').length,    color:'#00d4ff' },
            ].map(s => (
              <div key={s.label} style={{ flex:1, textAlign:'center', padding:'14px 8px',
                background:`${s.color}10`, border:`1px solid ${s.color}30`, borderRadius:8 }}>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {(critical + high) > 0 && (
            <div style={{ padding:'10px 14px', background:'#ff456608', border:'1px solid #ff456620',
              borderRadius:8, display:'flex', gap:8, alignItems:'center' }}>
              <AlertTriangle size={13} color="#ff4566"/>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#ff8080' }}>
                {critical + high} critical/high issues require immediate attention
              </span>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card" style={{ minWidth:260 }}>
          <CategoryBreakdown results={scan.results}/>
        </div>
      </div>

      {/* Tab bar */}
      <div className="fade-up d2" style={{ display:'flex', gap:4, marginBottom:16 }}>
        {[
          { key:'checks',     label:'Check Results', icon:ClipboardList },
          { key:'categories', label:'By Category',   icon:BarChart2 },
        ].map(({ key, label, icon:Icon }) => (
          <button key={key} onClick={() => setTab(key)} className="btn"
            style={{
              fontSize:11, padding:'8px 18px',
              color: tab===key ? '#00ff88' : '#4a6080',
              background: tab===key ? '#00ff8810' : 'transparent',
              border:`1px solid ${tab===key ? '#00ff8830' : '#1a2640'}`,
            }}>
            <Icon size={12}/>{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card fade-up d2">
        {tab === 'checks' && (
          <>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:2, marginBottom:20 }}>
              CHECK RESULTS — {scan.results.length} TOTAL
              <span style={{ marginLeft:12, color:'#4a6080' }}>· Click any failed row to see remediation</span>
            </div>
            <CheckTable results={scan.results}/>
          </>
        )}
        {tab === 'categories' && (
          <div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#4a6080', letterSpacing:2, marginBottom:24 }}>
              COMPLIANCE BY CATEGORY
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {/* Failed checks grouped by category */}
              <div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#ff4566', letterSpacing:2, marginBottom:14 }}>
                  FAILED CHECKS ({failCount})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {failedChecks.length === 0
                    ? <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6080', textAlign:'center', padding:24 }}>
                        🎉 No failed checks!
                      </div>
                    : failedChecks.map((r,i) => (
                      <div key={i} style={{ padding:'10px 14px', background:'#ff456608',
                        border:'1px solid #ff456618', borderRadius:8 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:r.remediation?4:0 }}>
                          <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#00d4ff' }}>{r.check_id}</span>
                          <span style={{ fontFamily:'JetBrains Mono', fontSize:9,
                            color: r.severity==='critical'?'#ff4566':r.severity==='high'?'#ff8a50':'#ffc940',
                            textTransform:'uppercase' }}>{r.severity}</span>
                        </div>
                        <div style={{ fontSize:12, color:'#e2e8f0', fontWeight:500, marginBottom:r.remediation?4:0 }}>
                          {r.title}
                        </div>
                        {r.remediation && (
                          <div style={{ fontSize:11, color:'#4a6080', lineHeight:1.5 }}>
                            💡 {r.remediation}
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
              {/* Category breakdown */}
              <div className="card" style={{ background:'#0d1424', height:'fit-content' }}>
                <CategoryBreakdown results={scan.results}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
