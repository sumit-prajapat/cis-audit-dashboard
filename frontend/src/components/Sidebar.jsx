import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',        label: 'Dashboard',  icon: '◈' },
  { to: '/devices', label: 'Devices',    icon: '⬡' },
  { to: '/scans',   label: 'All Scans',  icon: '≡' },
]

export default function Sidebar() {
  return (
    <aside style={{ width: 220, minHeight: '100vh', background: '#111827', borderRight: '1px solid #1e2d45', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#00ff88', letterSpacing: 2, textTransform: 'uppercase' }}>
          CIS Audit
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080', marginTop: 2 }}>
          Compliance Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              color: isActive ? '#00ff88' : '#4a6080',
              background: isActive ? '#00ff8808' : 'transparent',
              borderLeft: isActive ? '2px solid #00ff88' : '2px solid transparent',
              textDecoration: 'none',
              fontFamily: 'DM Sans',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s',
            })}
          >
            <span style={{ fontSize: 18 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '24px', borderTop: '1px solid #1e2d45' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6080' }}>
          v1.0.0 · Phase 2
        </div>
      </div>
    </aside>
  )
}
