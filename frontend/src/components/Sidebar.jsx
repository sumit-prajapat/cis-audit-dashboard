import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api'

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/devices',   icon: '💻', label: 'Devices' },
  { to: '/scans',     icon: '🔍', label: 'Scans' },
]

const BOTTOM_NAV = [
  { to: '/billing',   icon: '💳', label: 'Billing' },
  { to: '/settings',  icon: '⚙️',  label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [billingStatus, setBillingStatus] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    // Load billing status for plan badge
    api.get('/billing/status').then(r => setBillingStatus(r.data)).catch(() => {})
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const planLabel = billingStatus?.plan_label || 'Free'
  const isOverLimit = billingStatus &&
    billingStatus.device_limit !== -1 &&
    billingStatus.device_count >= billingStatus.device_limit

  return (
    <aside className="w-56 flex flex-col bg-slate-900 border-r border-slate-800 py-4 flex-shrink-0">
      {/* Logo */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <span className="text-white font-bold text-base tracking-tight">CIS Audit</span>
        </div>
        {/* Plan badge */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            billingStatus?.plan === 'free'
              ? 'bg-slate-700 text-slate-400'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {planLabel}
          </span>
          {isOverLimit && (
            <span className="text-xs text-red-400 font-medium">Device limit</span>
          )}
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav: Billing + Settings */}
      <div className="px-2 space-y-0.5 border-t border-slate-800 pt-3 mt-3">
        {BOTTOM_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
            {/* Red dot on Billing if device limit reached */}
            {item.to === '/billing' && isOverLimit && (
              <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </NavLink>
        ))}

        {/* User / logout */}
        <div className="px-3 py-2 mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white flex-shrink-0">
              {(user.email || 'U')[0].toUpperCase()}
            </div>
            <span className="text-xs text-slate-400 truncate">{user.email || user.role || 'User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 text-xs ml-1 flex-shrink-0 transition-colors"
            title="Log out"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}
