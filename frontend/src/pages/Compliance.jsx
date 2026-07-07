import { useEffect, useMemo, useState } from 'react'
import { getDevices, getScans } from '../api'
import TrendChart from '../components/TrendChart'
import ScoreGauge from '../components/ScoreGauge'

const FRAMEWORKS = ['CIS', 'NIST CSF', 'ISO 27001', 'SOC 2', 'PCI DSS', 'HIPAA']

export default function Compliance() {
  const [scans, setScans] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getScans(), getDevices()]).then(([s, d]) => {
      setScans(s.data); setDevices(d.data)
    }).finally(() => setLoading(false))
  }, [])

  const latest = scans[0]
  const summary = useMemo(() => {
    const total = scans.reduce((a, s) => a + s.total_checks, 0)
    const passed = scans.reduce((a, s) => a + s.passed, 0)
    const failed = scans.reduce((a, s) => a + s.failed, 0)
    return { total, passed, failed, passRate: total ? Math.round((passed / total) * 100) : 0 }
  }, [scans])

  if (loading) return <div className="p-8 space-y-4"><div className="skeleton h-24" /><div className="skeleton h-96" /></div>

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header>
        <div className="font-mono text-xs tracking-[0.24em] uppercase text-cyan-300">Compliance</div>
        <h1 className="text-2xl font-semibold text-white mt-2">Framework posture and control health</h1>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        <section className="card flex flex-col items-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">CIS score</div>
          <ScoreGauge score={latest?.score || 0} size={210} />
          <div className="grid grid-cols-3 gap-2 w-full mt-4">
            {[['Passed', summary.passed, '#00ff88'], ['Failed', summary.failed, '#ff4566'], ['Assets', devices.length, '#00d4ff']].map(([l, v, c]) => (
              <div key={l} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="font-mono text-lg font-bold" style={{ color: c }}>{v}</div>
                <div className="text-[10px] text-slate-500 uppercase">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">Historical trend</div>
          <TrendChart scans={scans} height={260} />
        </section>
      </div>

      <section className="card">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">Framework mapping readiness</div>
        <div className="grid md:grid-cols-3 gap-3">
          {FRAMEWORKS.map((name, i) => {
            const score = Math.max(0, Math.min(100, summary.passRate - i * 4))
            const color = score >= 80 ? '#00ff88' : score >= 60 ? '#ffc940' : '#ff4566'
            return (
              <div key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex justify-between text-sm"><span className="text-slate-100">{name}</span><span className="font-mono" style={{ color }}>{score}%</span></div>
                <div className="h-1.5 bg-slate-800 rounded mt-3 overflow-hidden"><div className="h-full rounded" style={{ width: `${score}%`, background: color }} /></div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
