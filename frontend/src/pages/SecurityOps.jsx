import { useEffect, useMemo, useState } from 'react'
import { getDevices, getScans } from '../api'
import { Activity, AlertTriangle, Clock, Radar } from 'lucide-react'

function Panel({ title, children }) {
  return <section className="card"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">{title}</div>{children}</section>
}

export default function SecurityOps() {
  const [scans, setScans] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getScans(), getDevices()]).then(([s, d]) => {
      setScans(s.data); setDevices(d.data)
    }).finally(() => setLoading(false))
  }, [])

  const live = useMemo(() => {
    const latestByDevice = devices.map(d => scans.find(s => s.device_id === d.id)).filter(Boolean)
    const failed = latestByDevice.reduce((sum, s) => sum + s.failed, 0)
    const warnings = latestByDevice.reduce((sum, s) => sum + s.warnings, 0)
    const avg = latestByDevice.length ? Math.round(latestByDevice.reduce((a, s) => a + s.score, 0) / latestByDevice.length) : 0
    return { latestByDevice, failed, warnings, avg }
  }, [devices, scans])

  if (loading) return <div className="p-8 space-y-4"><div className="skeleton h-24" /><div className="skeleton h-96" /></div>

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header>
        <div className="font-mono text-xs tracking-[0.24em] uppercase text-cyan-300">Security operations</div>
        <h1 className="text-2xl font-semibold text-white mt-2">Live findings and exposure drift</h1>
      </header>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          ['Posture', `${live.avg}%`, Activity, live.avg >= 80 ? '#00ff88' : live.avg >= 60 ? '#ffc940' : '#ff4566'],
          ['Open findings', live.failed, AlertTriangle, '#ff4566'],
          ['Warnings', live.warnings, Radar, '#ffc940'],
          ['Active scans', scans.length, Clock, '#00d4ff'],
        ].map(([label, value, Icon, color]) => (
          <div key={label} className="card">
            <div className="flex justify-between"><span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</span><Icon size={16} color={color} /></div>
            <div className="font-mono text-3xl font-bold mt-4" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <Panel title="Recent activity">
        <div className="space-y-3">
          {scans.slice(0, 10).map(scan => {
            const device = devices.find(d => d.id === scan.device_id)
            return (
              <div key={scan.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <div className="text-sm text-slate-100">{device?.hostname || `Device ${scan.device_id}`}</div>
                  <div className="text-xs text-slate-500">{new Date(scan.scanned_at).toLocaleString()}</div>
                </div>
                <div className="font-mono text-sm text-slate-300">{Math.round(scan.score)}% score</div>
              </div>
            )
          })}
          {scans.length === 0 && <div className="text-sm text-slate-500 py-8 text-center">No scan activity yet.</div>}
        </div>
      </Panel>
    </div>
  )
}
