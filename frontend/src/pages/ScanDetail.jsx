import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScan, downloadReport } from '../api'
import ScoreGauge from '../components/ScoreGauge'
import CheckTable from '../components/CheckTable'

export default function ScanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [scan, setScan]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getScan(id).then(r => setScan(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono', color: '#00ff88' }}>Loading scan...</div>
    </div>
  )

  if (!scan) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono', color: '#ff4566' }}>Scan not found</div>
    </div>
  )

  const critical = scan.results.filter(r => r.status === 'FAIL' && r.severity === 'critical').length
  const high     = scan.results.filter(r => r.status === 'FAIL' && r.severity === 'high').length

  return (
    <div style={{ flex: 1, padding: 32, overflowY: 'auto' }} className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate(-1)} style={{
          background: '#1a2235', border: '1px solid #1e2d45',
          color: '#4a6080', padding: '8px 16px', borderRadius: 8,
          cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 11,
        }}>← Back</button>
        <div>
          <h1 style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>
            Scan #{scan.id}
          </h1>
          <p style={{ color: '#4a6080', fontSize: 12, marginTop: 2 }}>
            {new Date(scan.scanned_at).toLocaleString()}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => window.open(downloadReport(scan.id))}
            style={{ padding: '10px 20px', background: '#00ff8814', color: '#00ff88', border: '1px solid #00ff8830', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700 }}>
            ↓ PDF Report
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <ScoreGauge score={scan.score} size={140} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Total',    value: scan.total_checks, color: '#e2e8f0' },
              { label: 'Passed',   value: scan.passed,       color: '#00ff88' },
              { label: 'Failed',   value: scan.failed,       color: '#ff4566' },
              { label: 'Warnings', value: scan.warnings,     color: '#ffc940' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', width: 60 }}>{stat.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk summary */}
        <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: 24, flex: 1 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', letterSpacing: 2, marginBottom: 16 }}>RISK SUMMARY</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ background: '#ff456614', border: '1px solid #ff456630', borderRadius: 10, padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700, color: '#ff4566' }}>{critical}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', marginTop: 4 }}>CRITICAL</div>
            </div>
            <div style={{ background: '#ff456610', border: '1px solid #ff456620', borderRadius: 10, padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700, color: '#ff6b80' }}>{high}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', marginTop: 4 }}>HIGH</div>
            </div>
          </div>
          {(critical > 0 || high > 0) && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#ff456610', border: '1px solid #ff456620', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11, color: '#ff6b80' }}>
              ⚠ {critical + high} high-priority issues require immediate attention
            </div>
          )}
        </div>
      </div>

      {/* Check results table */}
      <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 12, padding: 28 }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
          Check Results — {scan.results.length} total
        </div>
        <CheckTable results={scan.results} />
      </div>
    </div>
  )
}
