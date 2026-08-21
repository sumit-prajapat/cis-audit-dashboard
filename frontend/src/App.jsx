import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar, { SIDEBAR_COMMANDS } from './components/Sidebar'
import CommandPalette from './components/CommandPalette'
import Dashboard   from './pages/Dashboard'
import Devices     from './pages/Devices'
import Scans       from './pages/Scans'
import ScanDetail  from './pages/ScanDetail'
import QuickScan   from './pages/QuickScan'
import Billing     from './pages/Billing'
import Settings    from './pages/Settings'
import SecurityOps from './pages/SecurityOps'
import Compliance  from './pages/Compliance'
import Risk        from './pages/Risk'
import ReportsPage from './pages/Reports'
import Onboarding  from './pages/Onboarding'
import InviteAccept from './pages/InviteAccept'
import Login       from './pages/Login'
import Register    from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { clearSession, getMe, hasAuthToken, persistAuth, readStoredUser, refreshSession } from './api'
// New advanced dashboards
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import SecurityOpsDashboard from './pages/SecurityOpsDashboard'
import ComplianceDashboard from './pages/ComplianceDashboard'
import AssetDashboard from './pages/AssetDashboard'
import RiskDashboard from './pages/RiskDashboard'
import ReportingDashboard from './pages/ReportingDashboard'
import { Search, ShieldCheck } from 'lucide-react'
import { ThemeProvider } from './contexts/ThemeContext'

function ProtectedLayout({ children }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const user = readStoredUser()

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-screen bg-[#070b14] overflow-hidden text-slate-100">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-white/10 bg-[#080c17]/80 backdrop-blur flex items-center justify-between px-4 lg:px-6">
          <div className="md:hidden flex items-center gap-2">
            <ShieldCheck className="text-emerald-300" size={20} />
            <span className="font-mono text-sm font-bold">CIS Audit</span>
          </div>
          <button onClick={() => setPaletteOpen(true)} className="hidden md:flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-slate-500 hover:text-slate-200 min-w-[320px] text-left">
            <Search size={15} />
            Search or run command
            <span className="ml-auto font-mono text-[10px] text-slate-600">Ctrl K</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-slate-300">{user.org_name || 'Workspace'}</div>
              <div className="text-[10px] text-slate-600 capitalize">{user.role || 'viewer'}</div>
            </div>
            <button onClick={() => setPaletteOpen(true)} className="md:hidden btn btn-ghost px-3"><Search size={15} /></button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
        {children}
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={SIDEBAR_COMMANDS} />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    async function verifySession() {
      try {
        if (hasAuthToken()) {
          try {
            const res = await getMe()
            persistAuth(res.data)
          } catch {
            await refreshSession()
          }
        } else {
          await refreshSession()
        }

        if (active) setStatus('authenticated')
      } catch {
        clearSession()
        if (active) setStatus('anonymous')
      }
    }

    verifySession()
    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-300 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-300 animate-spin" />
      </div>
    )
  }

  return status === 'authenticated' ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/invite/:token" element={<InviteAccept />} />

        {/* Onboarding — protected but no sidebar */}
        <Route path="/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />

        {/* Protected app routes */}
        <Route path="/dashboard"  element={<ProtectedRoute><ProtectedLayout><ExecutiveDashboard /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/operations" element={<ProtectedRoute><ProtectedLayout><SecurityOpsDashboard /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/compliance" element={<ProtectedRoute><ProtectedLayout><ComplianceDashboard /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/devices"    element={<ProtectedRoute><ProtectedLayout><AssetDashboard /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/scans"      element={<ProtectedRoute><ProtectedLayout><Scans /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/scans/:id"  element={<ProtectedRoute><ProtectedLayout><ScanDetail /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/quick-scan" element={<ProtectedRoute><ProtectedLayout><QuickScan /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/risk"       element={<ProtectedRoute><ProtectedLayout><RiskDashboard /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/reports"    element={<ProtectedRoute><ProtectedLayout><ReportingDashboard /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/billing"    element={<ProtectedRoute><ProtectedLayout><Billing /></ProtectedLayout></ProtectedRoute>} />
        <Route path="/settings"   element={<ProtectedRoute><ProtectedLayout><Settings /></ProtectedLayout></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
    </ThemeProvider>
  )
}
