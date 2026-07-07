import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { extractApiErrorMessage } from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await api.post('/auth/password-reset/request', { email })
      const resetUrl = res.data.reset_url
      setMessage(resetUrl ? `Reset link generated: ${resetUrl}` : res.data.message || 'If the email exists, a reset link has been sent.')
    } catch (err) {
      setError(extractApiErrorMessage(err) || 'Unable to start password reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d1424] p-7">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-slate-400 mt-2">Enter your email and we’ll generate a secure reset link.</p>

        <label className="block mt-6">
          <span className="text-xs font-medium text-slate-400">Email</span>
          <input
            type="email"
            className="input mt-1 w-full py-3"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
        {message && <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</div>}

        <button type="submit" disabled={loading} className="btn btn-green mt-6 w-full justify-center py-3">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>

        <p className="text-sm text-slate-500 mt-6">
          Back to <Link className="text-cyan-300 hover:text-cyan-200" to="/login">sign in</Link>
        </p>
      </form>
    </div>
  )
}
