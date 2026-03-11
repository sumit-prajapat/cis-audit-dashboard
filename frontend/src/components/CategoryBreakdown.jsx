/**
 * CategoryBreakdown — shows pass rate per CIS category
 * Derived from check_id prefix (e.g. "W1.1" → Account, "L4.2" → Network)
 */

const CATEGORIES = {
  // Windows
  'W1': { label:'Account Policies', icon:'👤' },
  'W2': { label:'User Rights',      icon:'🔑' },
  'W3': { label:'Firewall',         icon:'🔥' },
  'W4': { label:'Remote Access',    icon:'🖥️' },
  'W5': { label:'System Updates',   icon:'🔄' },
  'W6': { label:'Antivirus',        icon:'🛡️' },
  'W7': { label:'Auditing',         icon:'📋' },
  'W8': { label:'Services',         icon:'⚙️' },
  // Linux
  'L1': { label:'Filesystem',       icon:'💾' },
  'L2': { label:'Package Updates',  icon:'📦' },
  'L3': { label:'SSH & Services',   icon:'🔒' },
  'L4': { label:'Network',          icon:'🌐' },
  'L5': { label:'Logging',          icon:'📝' },
  'L6': { label:'Access Control',   icon:'🔐' },
}

function getCategory(checkId) {
  if (!checkId) return 'Other'
  const prefix = checkId.slice(0, 2).toUpperCase()
  return CATEGORIES[prefix] || { label: 'Other', icon: '⚪' }
}

export default function CategoryBreakdown({ results = [] }) {
  // Group by category
  const groups = {}
  results.forEach(r => {
    const cat = getCategory(r.check_id)
    const key = cat.label
    if (!groups[key]) groups[key] = { label:cat.label, icon:cat.icon, pass:0, fail:0, warn:0, total:0 }
    groups[key].total++
    if (r.status === 'PASS') groups[key].pass++
    else if (r.status === 'FAIL') groups[key].fail++
    else groups[key].warn++
  })

  const cats = Object.values(groups).sort((a,b) => {
    const ra = a.pass / a.total
    const rb = b.pass / b.total
    return ra - rb // worst first
  })

  if (cats.length === 0) return null

  return (
    <div>
      <div style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#4a6080',
        letterSpacing:2, textTransform:'uppercase', marginBottom:16 }}>
        Category Breakdown
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {cats.map(c => {
          const pct = Math.round((c.pass / c.total) * 100)
          const barColor = pct >= 80 ? '#00ff88' : pct >= 60 ? '#ffc940' : '#ff4566'
          return (
            <div key={c.label}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ fontSize:13 }}>{c.icon}</span>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#8fa3bf' }}>{c.label}</span>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#00ff88' }}>{c.pass}✓</span>
                  {c.fail > 0 && <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#ff4566' }}>{c.fail}✗</span>}
                  {c.warn > 0 && <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#ffc940' }}>{c.warn}!</span>}
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:11, fontWeight:700, color:barColor, minWidth:34, textAlign:'right' }}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="cat-bar-track">
                <div className="cat-bar-fill"
                  style={{ width:`${pct}%`, background:barColor, boxShadow:`0 0 6px ${barColor}50` }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
