import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScans, getDevices } from '../api'

export default function Scans() {
  const [scans, setScans]     = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getScans(), getDevices()])
      .then(([s, d]) => { setScans(s.data); setDevices(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono', color: '#00ff88' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, padding: 32, overflowY: 'auto' }} className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>All Scans</h1>
        <p style={{ color: '#4a6080', fontSize: 13, marginTop: 4 }}>{scans.length} total scans recorded</p>
      </div>

      <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2d45', background: '#111827' }}>
              {['Scan ID', 'Device', 'Score', 'Passed', 'Failed', 'Warnings', 'Date', ''].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scans.map((s, i) => {
              const device = devices.find(d => d.id === s.device_id)
              const scoreColor = s.score >= 80 ? '#00ff88' : s.score >= 60 ? '#ffc940' : '#ff4566'
              return (
                <tr key={s.id}
                  style={{ borderBottom: '1px solid #1e2d4530', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#00ff8806'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/scans/${s.id}`)}
                >
                  <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#4a6080' }}>#{s.id}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#00d4ff' }}>
                    {device?.hostname || `Device ${s.device_id}`}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: '#0a0e1a', borderRadius: 3, height: 6, width: 60, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.score}%`, background: scoreColor, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: scoreColor }}>
                        {Math.round(s.score)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#00ff88' }}>{s.passed}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#ff4566' }}>{s.failed}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#ffc940' }}>{s.warnings}</td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#4a6080' }}>{new Date(s.scanned_at).toLocaleString()}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#00d4ff' }}>View →</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {scans.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#4a6080', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
            No scans yet. Run the agent first.
          </div>
        )}
      </div>
    </div>
  )
}
