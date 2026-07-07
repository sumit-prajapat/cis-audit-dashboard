import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

export default function CommandPalette({ open, onClose, commands = [] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(cmd =>
      `${cmd.label} ${cmd.group} ${cmd.keywords || ''}`.toLowerCase().includes(q)
    )
  }, [commands, query])

  if (!open) return null

  function run(cmd) {
    if (cmd.to) navigate(cmd.to)
    if (cmd.action) cmd.action()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0b1220]/95 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search size={18} className="text-cyan-300" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search dashboards, assets, scans, reports..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {filtered.map(cmd => (
            <button
              key={`${cmd.group}-${cmd.label}`}
              onClick={() => run(cmd)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-white/[0.06] transition-colors"
            >
              <div className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-cyan-300">
                <cmd.icon size={17} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-100">{cmd.label}</div>
                <div className="text-xs text-slate-500">{cmd.group}</div>
              </div>
              {cmd.shortcut && <div className="font-mono text-[10px] text-slate-500">{cmd.shortcut}</div>}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-500">No command found</div>
          )}
        </div>
      </div>
    </div>
  )
}
