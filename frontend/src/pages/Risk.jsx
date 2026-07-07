import { useEffect, useMemo, useState } from 'react'
import { getScans } from '../api'

export default function Risk() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getScans().then(r => setScans(r.data)).finally(() => setLoading(false))
  }, [])

  const risk = useMemo(() => {
    const latest = scans[0]
    const failed = latest?.failed || 0
    const warnings = latest?.warnings || 0
    const exposure = Math.min(100, failed * 8 + warnings * 2)
    return { latest, failed, warnings, exposure }
  }, [scans])

  if (loading) return <div className="p-8"><div className="skeleton h-96" /></div>

  const cells = ['Low', 'Medium', 'High', 'Critical'].flatMap(impact =>
    ['Rare', 'Possible', 'Likely', 'Active'].map(likelihood => ({ impact, likelihood }))
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header>
        <div className="font-mono text-xs tracking-[0.24em] uppercase text-cyan-300">Risk</div>
        <h1 className="text-2xl font-semibold text-white mt-2">Severity analytics and exposure matrix</h1>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          ['Exposure score', risk.exposure, '#ff4566'],
          ['Failed controls', risk.failed, '#ffc940'],
          ['Warnings', risk.warnings, '#00d4ff'],
        ].map(([label, value, color]) => (
          <div key={label} className="card">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
            <div className="font-mono text-4xl font-bold mt-4" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <section className="card">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">Risk heatmap</div>
        <div className="grid grid-cols-4 gap-2">
          {cells.map((cell, i) => {
            const active = risk.exposure > i * 6
            const color = i > 10 ? '#ff4566' : i > 6 ? '#ffc940' : '#00d4ff'
            return (
              <div key={`${cell.impact}-${cell.likelihood}`} className="min-h-24 rounded-lg border p-3" style={{
                borderColor: active ? `${color}66` : '#ffffff12',
                background: active ? `${color}18` : '#ffffff05',
              }}>
                <div className="text-xs text-slate-500">{cell.likelihood}</div>
                <div className="text-sm text-slate-100 mt-1">{cell.impact}</div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
