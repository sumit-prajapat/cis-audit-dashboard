import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar    from './components/Sidebar'
import Dashboard  from './pages/Dashboard'
import Devices    from './pages/Devices'
import Scans      from './pages/Scans'
import ScanDetail from './pages/ScanDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
        <Sidebar />
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/devices"   element={<Devices />} />
          <Route path="/scans"     element={<Scans />} />
          <Route path="/scans/:id" element={<ScanDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
