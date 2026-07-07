import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, extractApiErrorMessage, persistAuth } from '../api'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login({ username: email, password, remember_me: rememberMe })
      persistAuth(res.data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(extractApiErrorMessage(err) || 'Unable to sign in with those credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex">
      <section className="hidden lg:flex flex-1 flex-col justify-between p-10 border-r border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(0,212,255,.16),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(0,255,136,.12),transparent_28%),#080c17]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-emerald-400/30 bg-emerald-400/10 flex items-center justify-center">
            <ShieldCheck size={22} className="text-emerald-300" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-[0.18em] text-emerald-300">CIS AUDIT</div>
            <div className="text-xs text-slate-400">Enterprise compliance operations</div>
          </div>
        </div>

        <div className="max-w-xl">
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300 mb-5">Security command center</div>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Audit posture, assets, risk, and remediation in one hardened console.
          </h1>
          <div className="grid grid-cols-3 gap-3 mt-10">
            {[
              ['Live', 'scan ingestion'],
              ['CIS', 'control evidence'],
              ['PDF', 'executive reports'],
            ].map(([a, b]) => (
              <div key={a} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-2xl font-bold text-emerald-300">{a}</div>
                <div className="text-xs text-slate-400 mt-1">{b}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">Protected by JWT auth, tenant-ready data boundaries, and scan evidence workflows.</p>
      </section>

      <main className="w-full lg:w-[480px] flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <ShieldCheck className="text-emerald-300" />
            <span className="font-mono font-bold tracking-[0.18em]">CIS AUDIT</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-slate-400 mt-2">Continue to your compliance workspace.</p>

          <div className="space-y-4 mt-8">
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Email</span>
              <input className="input mt-1 w-full py-3" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Password</span>
              <input className="input mt-1 w-full py-3" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
              Remember me
            </label>
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

          <button disabled={loading} className="btn btn-green mt-6 w-full justify-center py-3" type="submit">
            {loading ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
            Sign in
          </button>

          <p className="text-sm text-slate-500 mt-6">
            New workspace? <Link className="text-cyan-300 hover:text-cyan-200" to="/register">Create an account</Link>
            <span className="mx-2 text-slate-600">·</span>
            <Link className="text-cyan-300 hover:text-cyan-200" to="/forgot-password">Forgot password?</Link>
          </p>
        </form>
      </main>
    </div>
  )
}
