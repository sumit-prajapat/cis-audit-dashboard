const config = {
  critical: { bg: '#ff456622', color: '#ff4566', label: 'CRITICAL' },
  high:     { bg: '#ff456614', color: '#ff6b80', label: 'HIGH'     },
  medium:   { bg: '#ffc94022', color: '#ffc940', label: 'MEDIUM'   },
  low:      { bg: '#00ff8814', color: '#00ff88', label: 'LOW'      },
  info:     { bg: '#00d4ff14', color: '#00d4ff', label: 'INFO'     },
}

const statusConfig = {
  PASS: { bg: '#00ff8814', color: '#00ff88' },
  FAIL: { bg: '#ff456622', color: '#ff4566' },
  WARN: { bg: '#ffc94022', color: '#ffc940' },
  SKIP: { bg: '#4a608022', color: '#4a6080' },
}

export function SeverityBadge({ severity }) {
  const c = config[severity?.toLowerCase()] || config.info
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontFamily: 'JetBrains Mono', fontSize: 10,
      fontWeight: 700, letterSpacing: 1,
      padding: '3px 8px', borderRadius: 4,
    }}>
      {c.label}
    </span>
  )
}

export function StatusBadge({ status }) {
  const c = statusConfig[status] || statusConfig.SKIP
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontFamily: 'JetBrains Mono', fontSize: 11,
      fontWeight: 700, padding: '3px 10px', borderRadius: 4,
    }}>
      {status}
    </span>
  )
}
