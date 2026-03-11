import { useState } from 'react'
import { SeverityBadge, StatusBadge } from './SeverityBadge'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'

const STATUS_FILTERS = ['ALL', 'FAIL', 'WARN', 'PASS']
const SEV_FILTERS    = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

function CheckRow({ r, i }) {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)

  function copyRemediation() {
    navigator.clipboard.writeText(r.remediation || r.title)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const rowBg = r.status === 'FAIL' ? '#ff456606' : r.status === 'WARN' ? '#ffc94006' : 'transparent'

  return (
    <>
      <tr onClick={() => r.remediation && setOpen(o => !o)}
        style={{ borderBottom:'1px solid #1a264018', background:rowBg,
          cursor: r.remediation ? 'pointer' : 'default', transition:'background .15s' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#00ff8806' }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? '#00ff8808' : rowBg }}>
        <td style={{ padding:'11px 16px', fontFamily:'JetBrains Mono', fontSize:11, color:'#00d4ff', whiteSpace:'nowrap' }}>
          {r.check_id}
        </td>
        <td style={{ padding:'11px 16px', maxWidth:300 }}>
          <div style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{r.title}</div>
          {r.actual_value && (
            <div style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#4a6080', marginTop:2 }}>
              Found: {r.actual_value}
            </div>
          )}
        </td>
        <td style={{ padding:'11px 16px' }}><SeverityBadge severity={r.severity}/></td>
        <td style={{ padding:'11px 16px' }}><StatusBadge status={r.status}/></td>
        <td style={{ padding:'11px 16px', textAlign:'center' }}>
          {r.remediation
            ? (open ? <ChevronDown size={13} color="#4a6080"/> : <ChevronRight size={13} color="#4a6080"/>)
            : null}
        </td>
      </tr>
      {r.remediation && (
        <tr style={{ background: open ? '#00ff8804' : 'transparent', transition:'background .2s' }}>
          <td colSpan={5} style={{ padding: open ? '0 16px 14px 48px' : 0, overflow:'hidden',
            maxHeight: open ? 200 : 0, transition:'all .3s' }}>
            {open && (
              <div style={{ display:'flex', gap:12, alignItems:'flex-start',
                padding:'12px 16px', background:'#0d1424', borderRadius:8,
                border:'1px solid #1a2640', marginBottom:4 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'#00ff88', letterSpacing:2, marginBottom:6 }}>
                    REMEDIATION STEP
                  </div>
                  <div style={{ fontSize:12, color:'#8fa3bf', lineHeight:1.6 }}>{r.remediation}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); copyRemediation() }}
                  className="btn btn-ghost" style={{ padding:'6px 10px', flexShrink:0 }}>
                  {copied ? <Check size={12} color="#00ff88"/> : <Copy size={12}/>}
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default function CheckTable({ results = [] }) {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sevFilter,    setSevFilter]    = useState('ALL')
  const [search,       setSearch]       = useState('')

  const filtered = results.filter(r => {
    const ms = statusFilter === 'ALL' || r.status === statusFilter
    const mv = sevFilter    === 'ALL' || r.severity?.toUpperCase() === sevFilter
    const mt = r.title.toLowerCase().includes(search.toLowerCase()) ||
               r.check_id.toLowerCase().includes(search.toLowerCase())
    return ms && mv && mt
  })

  const failCount = results.filter(r => r.status === 'FAIL').length
  const warnCount = results.filter(r => r.status === 'WARN').length

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        {/* Status filter */}
        <div style={{ display:'flex', gap:4 }}>
          {STATUS_FILTERS.map(f => {
            const count = f === 'ALL' ? results.length : results.filter(r => r.status === f).length
            const active = statusFilter === f
            const col = f === 'FAIL' ? '#ff4566' : f === 'WARN' ? '#ffc940' : f === 'PASS' ? '#00ff88' : '#00d4ff'
            return (
              <button key={f} onClick={() => setStatusFilter(f)}
                className="btn" style={{
                  padding:'5px 12px', fontSize:10, letterSpacing:1,
                  color: active ? col : '#4a6080',
                  background: active ? `${col}15` : 'transparent',
                  border: `1px solid ${active ? `${col}40` : '#1a2640'}`,
                }}>
                {f} {f !== 'ALL' && <span style={{ opacity:.7 }}>({count})</span>}
              </button>
            )
          })}
        </div>

        {/* Severity filter */}
        <div style={{ display:'flex', gap:4 }}>
          {SEV_FILTERS.slice(1).map(f => {
            const active = sevFilter === f
            const col = { CRITICAL:'#ff4566', HIGH:'#ff8a50', MEDIUM:'#ffc940', LOW:'#00d4ff' }[f]
            return (
              <button key={f} onClick={() => setSevFilter(sevFilter === f ? 'ALL' : f)}
                className="btn" style={{
                  padding:'5px 10px', fontSize:9, letterSpacing:1,
                  color: active ? col : '#4a6080',
                  background: active ? `${col}15` : 'transparent',
                  border: `1px solid ${active ? `${col}30` : '#1a2640'}`,
                }}>
                {f}
              </button>
            )
          })}
        </div>

        <input className="input" placeholder="Search checks…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex:1, minWidth:180, padding:'6px 12px' }}/>

        <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#4a6080', whiteSpace:'nowrap' }}>
          {filtered.length} / {results.length} checks
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1a2640' }}>
              {['Check ID','Title','Severity','Status',''].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontFamily:'JetBrains Mono',
                  fontSize:10, color:'#4a6080', textTransform:'uppercase', letterSpacing:1.2 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => <CheckRow key={r.id || i} r={r} i={i}/>)}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px', color:'#4a6080',
            fontFamily:'JetBrains Mono', fontSize:12 }}>
            No checks match the current filter
          </div>
        )}
      </div>
    </div>
  )
}
