import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, extractApiErrorMessage, persistAuth } from '../api'
import { ArrowRight, Building2, Loader2, ShieldCheck } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', org_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await register(form)
      persistAuth(res.data)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(extractApiErrorMessage(err) || 'Unable to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_440px] gap-8">
        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-8 flex flex-col justify-between min-h-[620px]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-emerald-400/30 bg-emerald-400/10 flex items-center justify-center">
              <ShieldCheck size={22} className="text-emerald-300" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold tracking-[0.18em] text-emerald-300">CIS AUDIT</div>
              <div className="text-xs text-slate-400">Compliance SaaS workspace</div>
            </div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300 mb-4">Provision workspace</div>
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight max-w-xl">
              Start collecting audit evidence from Windows and Linux assets.
            </h1>
            <div className="grid sm:grid-cols-3 gap-3 mt-10">
              {['Tenant workspace', 'Asset inventory', 'Compliance reports'].map(item => (
                <div key={item} className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-slate-300">{item}</div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">Your first user becomes the organization owner.</p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-[#0d1424] p-7">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs tracking-[0.18em] uppercase">
            <Building2 size={15} /> New organization
          </div>
          <h2 className="text-2xl font-semibold mt-4">Create account</h2>
          <p className="text-sm text-slate-400 mt-2">Set up your security compliance workspace.</p>

          <div className="space-y-4 mt-7">
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Full name</span>
              <input className="input mt-1 w-full py-3" value={form.full_name} onChange={e => update('full_name', e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Work email</span>
              <input className="input mt-1 w-full py-3" type="email" value={form.email} onChange={e => update('email', e.target.value)} required autoComplete="email" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Organization name</span>
              <input className="input mt-1 w-full py-3" value={form.org_name} onChange={e => update('org_name', e.target.value)} placeholder="Acme Security" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Password</span>
              <input className="input mt-1 w-full py-3" type="password" minLength={12} value={form.password} onChange={e => update('password', e.target.value)} required autoComplete="new-password" />
            </label>
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

          <button disabled={loading} className="btn btn-green mt-6 w-full justify-center py-3" type="submit">
            {loading ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
            Create workspace
          </button>

          <p className="text-sm text-slate-500 mt-6">
            Already have an account? <Link className="text-cyan-300 hover:text-cyan-200" to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
