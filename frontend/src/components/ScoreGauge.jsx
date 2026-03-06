export default function ScoreGauge({ score = 0, size = 160 }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius  // ~339
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#00ff88' :
    score >= 60 ? '#ffc940' : '#ff4566'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* Background ring */}
        <circle cx="60" cy="60" r={radius}
          fill="none" stroke="#1e2d45" strokeWidth="10" />
        {/* Score ring */}
        <circle cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.3s' }}
        />
        {/* Score text */}
        <text x="60" y="56" textAnchor="middle"
          fill={color}
          fontSize="22" fontWeight="700"
          fontFamily="JetBrains Mono">
          {Math.round(score)}%
        </text>
        <text x="60" y="72" textAnchor="middle"
          fill="#4a6080" fontSize="9"
          fontFamily="DM Sans" letterSpacing="1">
          COMPLIANCE
        </text>
      </svg>
    </div>
  )
}
