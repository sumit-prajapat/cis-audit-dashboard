import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api, { clearSession, logout as logoutRequest, readStoredUser } from '../api'
import {
  Activity, BarChart3, CreditCard, FileText, Gauge, LogOut, Monitor,
  Radar, ScanLine, Settings, ShieldCheck
} from 'lucide-react'

const NAV = [
  { group: 'Command', items: [
    { to: '/dashboard', icon: Gauge, label: 'Executive' },
    { to: '/operations', icon: Activity, label: 'Security Ops' },
    { to: '/compliance', icon: ShieldCheck, label: 'Compliance' },
  ]},
  { group: 'Evidence', items: [
    { to: '/devices', icon: Monitor, label: 'Assets' },
    { to: '/scans', icon: ScanLine, label: 'Scans' },
    { to: '/risk', icon: Radar, label: 'Risk' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ]},
  { group: 'Admin', items: [
    { to: '/billing', icon: CreditCard, label: 'Billing' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
]

export const SIDEBAR_COMMANDS = NAV.flatMap(section =>
  section.items.map(item => ({ ...item, group: section.group, keywords: item.label }))
)

export default function Sidebar() {
  const navigate = useNavigate()
  const [billingStatus, setBillingStatus] = useState(null)
  const user = readStoredUser()

  useEffect(() => {
    api.get('/billing/status').then(r => setBillingStatus(r.data)).catch(() => {})
  }, [])

  function handleLogout() {
    logoutRequest().catch(() => {})
      .finally(() => {
        clearSession()
        navigate('/login')
      })
  }

  const planLabel = billingStatus?.plan_label || user.plan || 'Free'

  return (
    <aside className="w-[264px] hidden md:flex flex-col bg-[#080c17]/95 border-r border-white/10 py-4 flex-shrink-0">
      <div className="px-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-emerald-400/30 bg-emerald-400/10 flex items-center justify-center">
            <ShieldCheck size={21} className="text-emerald-300" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-tight">CIS Audit</div>
            <div className="font-mono text-[10px] text-cyan-300 uppercase tracking-[0.18em]">SOC Console</div>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <div className="text-xs text-slate-500">Workspace</div>
          <div className="text-sm text-slate-100 truncate mt-1">{user.org_name || 'Default organization'}</div>
          <div className="mt-2 inline-flex rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyan-300">{planLabel}</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-5 overflow-y-auto">
        {NAV.map(section => (
          <div key={section.group}>
            <div className="px-2 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">{section.group}</div>
            <div className="space-y-1">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`
                  }
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-white">
            {(user.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-300 truncate">{user.email || 'User'}</div>
            <div className="text-[10px] text-slate-600 capitalize">{user.role || 'viewer'}</div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-300" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
