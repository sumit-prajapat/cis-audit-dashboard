import { useEffect, useState } from 'react'
import { downloadReport, getDevices, getScans } from '../api'
import { Download, FileText, Table } from 'lucide-react'

export default function Reports() {
  const [scans, setScans] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getScans(), getDevices()]).then(([s, d]) => {
      setScans(s.data); setDevices(d.data)
    }).finally(() => setLoading(false))
  }, [])

  function exportCsv() {
    const rows = [['scan_id', 'device', 'score', 'passed', 'failed', 'warnings', 'scanned_at']]
    scans.forEach(s => {
      const device = devices.find(d => d.id === s.device_id)
      rows.push([s.id, device?.hostname || s.device_id, s.score, s.passed, s.failed, s.warnings, s.scanned_at])
    })
    const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cis-audit-scans.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="p-8"><div className="skeleton h-96" /></div>

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs tracking-[0.24em] uppercase text-cyan-300">Reporting</div>
          <h1 className="text-2xl font-semibold text-white mt-2">Export center and compliance reports</h1>
        </div>
        <button onClick={exportCsv} className="btn btn-ghost"><Table size={15} /> Export CSV</button>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          ['Executive report', 'Board-ready posture summary', FileText],
          ['Technical report', 'Control findings and remediation', FileText],
          ['Evidence export', 'Raw scan history in CSV', Table],
        ].map(([title, body, Icon]) => (
          <div key={title} className="card">
            <Icon className="text-cyan-300" />
            <h2 className="text-lg text-white mt-4">{title}</h2>
            <p className="text-sm text-slate-400 mt-2">{body}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">Available PDF reports</div>
        <div className="space-y-3">
          {scans.map(scan => {
            const device = devices.find(d => d.id === scan.device_id)
            return (
              <div key={scan.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <div className="text-sm text-slate-100">{device?.hostname || `Device ${scan.device_id}`}</div>
                  <div className="text-xs text-slate-500">{new Date(scan.scanned_at).toLocaleString()} · {Math.round(scan.score)}%</div>
                </div>
                <button onClick={() => window.open(downloadReport(scan.id))} className="btn btn-green"><Download size={14} /> PDF</button>
              </div>
            )
          })}
          {scans.length === 0 && <div className="text-sm text-slate-500 py-8 text-center">No reports available until scans are ingested.</div>}
        </div>
      </section>
    </div>
  )
}
