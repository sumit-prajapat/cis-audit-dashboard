import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api, { extractApiErrorMessage } from '../api'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/password-reset/confirm', { token, password })
      setMessage(res.data.message || 'Password reset completed')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setError(extractApiErrorMessage(err) || 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d1424] p-7">
        <h1 className="text-2xl font-semibold">Create a new password</h1>
        <p className="text-sm text-slate-400 mt-2">Use a strong password to complete the reset.
        </p>

        <label className="block mt-6">
          <span className="text-xs font-medium text-slate-400">New password</span>
          <input
            type="password"
            className="input mt-1 w-full py-3"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={12}
            autoComplete="new-password"
          />
        </label>

        <label className="block mt-4">
          <span className="text-xs font-medium text-slate-400">Confirm password</span>
          <input
            type="password"
            className="input mt-1 w-full py-3"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={12}
            autoComplete="new-password"
          />
        </label>

        {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
        {message && <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</div>}

        <button type="submit" disabled={loading} className="btn btn-green mt-6 w-full justify-center py-3">
          {loading ? 'Saving…' : 'Reset password'}
        </button>

        <p className="text-sm text-slate-500 mt-6">
          <Link className="text-cyan-300 hover:text-cyan-200" to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}
