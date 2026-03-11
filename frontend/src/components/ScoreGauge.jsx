import { useEffect, useState } from 'react'

export default function ScoreGauge({ score = 0, size = 180, animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)
  useEffect(() => {
    if (!animate) { setDisplayed(score); return }
    let frame
    const start = performance.now()
    const duration = 1200
    const run = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplayed(score * ease)
      if (t < 1) frame = requestAnimationFrame(run)
    }
    frame = requestAnimationFrame(run)
    return () => cancelAnimationFrame(frame)
  }, [score, animate])

  const R = 52
  const circumference = 2 * Math.PI * R
  const offset = circumference - (displayed / 100) * circumference
  const color = displayed >= 80 ? '#00ff88' : displayed >= 60 ? '#ffc940' : '#ff4566'
  const glow  = displayed >= 80 ? '#00ff8850' : displayed >= 60 ? '#ffc94050' : '#ff456650'

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="glow-ring" style={{ '--glow': glow }}>
        {/* Outer decorative ring */}
        <circle cx="60" cy="60" r="58" fill="none" stroke="#ffffff06" strokeWidth="1"/>
        {/* Track */}
        <circle cx="60" cy="60" r={R} fill="none" stroke="#1a2640" strokeWidth="10"/>
        {/* Filled arc */}
        <circle cx="60" cy="60" r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ filter:`drop-shadow(0 0 8px ${glow})`, transition:'stroke .3s' }}
        />
        {/* Inner circle */}
        <circle cx="60" cy="60" r="40" fill="#0a0e1a"/>
        {/* Score number */}
        <text x="60" y="55" textAnchor="middle"
          fill={color} fontSize="21" fontWeight="800" fontFamily="JetBrains Mono"
          style={{ filter:`drop-shadow(0 0 6px ${glow})` }}>
          {Math.round(displayed)}%
        </text>
        <text x="60" y="68" textAnchor="middle"
          fill="#4a6080" fontSize="8" fontFamily="JetBrains Mono" letterSpacing="2">
          COMPLIANCE
        </text>
        {/* Tick marks */}
        {[0,25,50,75,100].map(tick => {
          const angle = (tick / 100) * 360 - 90
          const rad = (angle * Math.PI) / 180
          const x1 = 60 + 46 * Math.cos(rad)
          const y1 = 60 + 46 * Math.sin(rad)
          const x2 = 60 + 42 * Math.cos(rad)
          const y2 = 60 + 42 * Math.sin(rad)
          return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e3050" strokeWidth="1.5"/>
        })}
      </svg>
    </div>
  )
}
