import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScans, getDevices, downloadReport } from '../api'
import ScoreGauge from '../components/ScoreGauge'
import TrendChart from '../components/TrendChart'
import { StatusBadge } from '../components/SeverityBadge'

function StatCard({ label, value, color = '#e2e8f0', sub }) {
  return (
    <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: '20px 24px', flex: 1 }}>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700, color }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#4a6080', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [scans, setScans]     = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getScans(), getDevices()])
      .then(([s, d]) => {
        setScans(s.data)
        setDevices(d.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const latest = scans[0]
  const avgScore = scans.length
    ? Math.round(scans.reduce((a, s) => a + s.score, 0) / scans.length)
    : 0

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono', color: '#00ff88', fontSize: 13 }}>
        Loading...
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, padding: 32, overflowY: 'auto' }} className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>
          Security Dashboard
        </h1>
        <p style={{ color: '#4a6080', fontSize: 13, marginTop: 4 }}>
          CIS Benchmark Compliance Overview
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Latest Score" value={latest ? `${Math.round(latest.score)}%` : 'N/A'}
          color={latest?.score >= 80 ? '#00ff88' : latest?.score >= 60 ? '#ffc940' : '#ff4566'} />
        <StatCard label="Total Scans"   value={scans.length}    color="#00d4ff" />
        <StatCard label="Devices"       value={devices.length}  color="#e2e8f0" />
        <StatCard label="Avg Score"     value={`${avgScore}%`}  color="#ffc940" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>

        {/* Score Gauge */}
        <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', letterSpacing: 2, textTransform: 'uppercase' }}>
            Latest Scan
          </div>
          <ScoreGauge score={latest?.score || 0} size={180} />
          {latest && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#4a6080' }}>
                {latest.passed} passed · {latest.failed} failed · {latest.warnings} warnings
              </div>
              <button
                onClick={() => window.open(downloadReport(latest.id))}
                style={{ marginTop: 12, padding: '8px 20px', background: '#00ff8814', color: '#00ff88', border: '1px solid #00ff8830', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700 }}>
                ↓ Download PDF Report
              </button>
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: 28 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
            Compliance Trend
          </div>
          <TrendChart scans={scans} />
        </div>
      </div>

      {/* Recent Scans Table */}
      <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: 28 }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
          Recent Scans
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2d45' }}>
              {['ID', 'Device', 'Score', 'Passed', 'Failed', 'Date', 'Action'].map(h => (
                <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scans.slice(0, 8).map((s, i) => (
              <tr key={s.id}
                style={{ borderBottom: '1px solid #1e2d4530', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#00ff8806'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigate(`/scans/${s.id}`)}
              >
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#4a6080' }}>#{s.id}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#00d4ff' }}>
                  {devices.find(d => d.id === s.device_id)?.hostname || `Device ${s.device_id}`}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700,
                  color: s.score >= 80 ? '#00ff88' : s.score >= 60 ? '#ffc940' : '#ff4566' }}>
                  {Math.round(s.score)}%
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#00ff88' }}>{s.passed}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#ff4566' }}>{s.failed}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#4a6080' }}>
                  {new Date(s.scanned_at).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#00d4ff', cursor: 'pointer' }}>
                    View →
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {scans.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#4a6080', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
            No scans yet. Run the agent to see results here.
          </div>
        )}
      </div>
    </div>
  )
}
