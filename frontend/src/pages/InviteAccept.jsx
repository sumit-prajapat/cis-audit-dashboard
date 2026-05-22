import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function InviteAccept() {
  const { token }     = useParams()
  const navigate      = useNavigate()
  const [invite, setInvite]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchInvite()
  }, [token])

  async function fetchInvite() {
    try {
      const res = await api.get(`/orgs/invite/${token}`)
      setInvite(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired invite link')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/orgs/invite/${token}/accept`, {
        full_name: fullName.trim(),
        password,
      })
      // Save token and user info
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify({
        role:     res.data.role,
        org_name: res.data.org_name,
      }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to accept invite')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Invite not found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <a href="/login" className="text-blue-400 hover:underline">Go to login →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👋</div>
          <h1 className="text-2xl font-bold text-white">You've been invited!</h1>
          <p className="text-slate-400 mt-2">
            Join <span className="text-white font-medium">{invite?.org_name}</span> as a{' '}
            <span className="text-blue-400 capitalize">{invite?.role}</span>
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-4">
            Invite for: <span className="text-white">{invite?.email}</span>
          </p>

          <form onSubmit={handleAccept} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Your name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Create a password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Joining…' : `Join ${invite?.org_name} →`}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Invite expires {new Date(invite?.expires_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
