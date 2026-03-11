export function SeverityBadge({ severity }) {
  const cls = {
    critical: 'badge-critical',
    high:     'badge-high',
    medium:   'badge-medium',
    low:      'badge-low',
  }[severity?.toLowerCase()] || 'badge-low'
  return <span className={`badge ${cls}`}>{severity?.toUpperCase()}</span>
}

export function StatusBadge({ status }) {
  const cls = {
    PASS: 'badge-pass',
    FAIL: 'badge-fail',
    WARN: 'badge-warn',
  }[status] || 'badge-warn'
  return <span className={`badge ${cls}`}>{status}</span>
}

export function ScoreBadge({ score }) {
  const cls = score >= 80 ? 'score-good' : score >= 60 ? 'score-ok' : 'score-bad'
  return <span className={`${cls}`} style={{ fontFamily:'JetBrains Mono', fontWeight:700 }}>{Math.round(score)}%</span>
}

export function GradeBadge({ score }) {
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  const colors = { A:'#00ff88', B:'#39e5b2', C:'#ffc940', D:'#ff8a50', F:'#ff4566' }
  const c = colors[grade]
  return (
    <div style={{ width:38, height:38, borderRadius:8, background:`${c}15`, border:`1px solid ${c}40`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontFamily:'JetBrains Mono', fontSize:18, fontWeight:800, color:c }}>{grade}</span>
    </div>
  )
}
