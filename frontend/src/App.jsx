import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar     from './components/Sidebar'
import Dashboard   from './pages/Dashboard'
import Devices     from './pages/Devices'
import Scans       from './pages/Scans'
import ScanDetail  from './pages/ScanDetail'
import Billing     from './pages/Billing'
import Settings    from './pages/Settings'
import Onboarding  from './pages/Onboarding'
import InviteAccept from './pages/InviteAccept'
import Login       from './pages/Login'
import Register    from './pages/Register'

function ProtectedLayout({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/invite/:token" element={<InviteAccept />} />

        {/* Onboarding — protected but no sidebar */}
        <Route path="/onboarding" element={
          localStorage.getItem('token')
            ? <Onboarding />
            : <Navigate to="/register" replace />
        } />

        {/* Protected app routes */}
        <Route path="/dashboard"  element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/devices"    element={<ProtectedLayout><Devices /></ProtectedLayout>} />
        <Route path="/scans"      element={<ProtectedLayout><Scans /></ProtectedLayout>} />
        <Route path="/scans/:id"  element={<ProtectedLayout><ScanDetail /></ProtectedLayout>} />
        <Route path="/billing"    element={<ProtectedLayout><Billing /></ProtectedLayout>} />
        <Route path="/settings"   element={<ProtectedLayout><Settings /></ProtectedLayout>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
