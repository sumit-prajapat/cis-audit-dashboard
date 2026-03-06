import { useState } from 'react'
import { SeverityBadge, StatusBadge } from './SeverityBadge'

export default function CheckTable({ results = [] }) {
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filters = ['ALL', 'FAIL', 'WARN', 'PASS']

  const filtered = results.filter(r => {
    const matchStatus = filter === 'ALL' || r.status === filter
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                        r.check_id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px',
              background: filter === f ? '#00ff8820' : 'transparent',
              color: filter === f ? '#00ff88' : '#4a6080',
              border: `1px solid ${filter === f ? '#00ff8840' : '#1e2d45'}`,
              borderRadius: 6, cursor: 'pointer',
              fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700,
              transition: 'all 0.2s',
            }}>{f}</button>
          ))}
        </div>
        <input
          placeholder="Search checks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: '#0a0e1a', border: '1px solid #1e2d45',
            borderRadius: 6, padding: '6px 12px',
            color: '#e2e8f0', fontFamily: 'DM Sans', fontSize: 13,
            outline: 'none', flex: 1, minWidth: 200,
          }}
        />
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#4a6080' }}>
          {filtered.length} checks
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2d45' }}>
              {['Check ID', 'Title', 'Severity', 'Status', 'Found'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontFamily: 'JetBrains Mono', fontSize: 10,
                  color: '#4a6080', fontWeight: 700, letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id || i} style={{
                borderBottom: '1px solid #1e2d4533',
                background: i % 2 === 0 ? 'transparent' : '#ffffff04',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#00ff8806'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#ffffff04'}
              >
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#00d4ff' }}>
                  {r.check_id}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', maxWidth: 280 }}>
                  <div>{r.title}</div>
                  {r.remediation && r.status === 'FAIL' && (
                    <div style={{ fontSize: 11, color: '#4a6080', marginTop: 3 }}>
                      💡 {r.remediation.slice(0, 80)}...
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <SeverityBadge severity={r.severity} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#4a6080', maxWidth: 200 }}>
                  {r.actual_value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#4a6080', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
            No checks match filter
          </div>
        )}
      </div>
    </div>
  )
}
