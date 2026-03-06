import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDevices, getScans } from '../api'

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [scans, setScans]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getDevices(), getScans()])
      .then(([d, s]) => { setDevices(d.data); setScans(s.data) })
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
        <h1 style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>Devices</h1>
        <p style={{ color: '#4a6080', fontSize: 13, marginTop: 4 }}>All scanned machines</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {devices.map(d => {
          const deviceScans = scans.filter(s => s.device_id === d.id)
          const lastScore   = d.last_score
          const scoreColor  = !lastScore ? '#4a6080' : lastScore >= 80 ? '#00ff88' : lastScore >= 60 ? '#ffc940' : '#ff4566'

          return (
            <div key={d.id}
              onClick={() => deviceScans[0] && navigate(`/scans/${deviceScans[0].id}`)}
              style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: 24, cursor: deviceScans[0] ? 'pointer' : 'default', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00ff8844'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2d45'}
            >
              {/* Device header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>
                    {d.hostname}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#00d4ff', marginTop: 4 }}>
                    {d.os_type?.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: scoreColor }}>
                  {lastScore ? `${Math.round(lastScore)}%` : 'N/A'}
                </div>
              </div>

              {/* Score bar */}
              <div style={{ background: '#0a0e1a', borderRadius: 4, height: 6, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${lastScore || 0}%`, background: scoreColor, borderRadius: 4, transition: 'width 1s ease' }} />
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'IP',       value: d.ip_address || 'Unknown' },
                  { label: 'OS',       value: d.os_version?.slice(0, 30) || 'Unknown' },
                  { label: 'Scans',    value: deviceScans.length },
                  { label: 'Last scan', value: d.last_scan ? new Date(d.last_scan).toLocaleDateString() : 'Never' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080' }}>{item.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#e2e8f0' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {devices.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: '#4a6080', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
          No devices yet.<br />Run the agent on a machine to register it here.
        </div>
      )}
    </div>
  )
}
