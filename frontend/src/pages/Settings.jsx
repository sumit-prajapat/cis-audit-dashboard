import { useState, useEffect } from 'react'
import api from '../api'

export default function Settings() {
  const [org, setOrg]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [orgName, setOrgName]   = useState('')
  const [saving, setSaving]     = useState(false)

  // Invite state
  const [inviteEmail, setInviteEmail]   = useState('')
  const [inviteRole, setInviteRole]     = useState('viewer')
  const [inviting, setInviting]         = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError]   = useState('')

  // Current user role
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isOwner     = currentUser.role === 'owner'
  const isAdmin     = ['owner', 'admin'].includes(currentUser.role)

  useEffect(() => {
    fetchOrg()
  }, [])

  async function fetchOrg() {
    try {
      const res = await api.get('/orgs/me')
      setOrg(res.data)
      setOrgName(res.data.name)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveOrg(e) {
    e.preventDefault()
    if (!orgName.trim()) return
    setSaving(true)
    try {
      await api.put('/orgs/me', { name: orgName.trim() })
      setOrg(prev => ({ ...prev, name: orgName.trim() }))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update org name')
    } finally {
      setSaving(false)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')
    try {
      const res = await api.post('/orgs/invite', { email: inviteEmail, role: inviteRole })
      setInviteSuccess(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      fetchOrg()
    } catch (err) {
      setInviteError(err.response?.data?.detail || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  async function handleRevokeInvite(inviteId) {
    if (!confirm('Revoke this invite?')) return
    try {
      await api.delete(`/orgs/invite/${inviteId}`)
      fetchOrg()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to revoke invite')
    }
  }

  async function handleRemoveMember(userId, email) {
    if (!confirm(`Remove ${email} from the organization?`)) return
    try {
      await api.delete(`/orgs/members/${userId}`)
      fetchOrg()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove member')
    }
  }

  async function handleChangeRole(userId, newRole) {
    try {
      await api.put(`/orgs/members/${userId}/role`, { role: newRole })
      fetchOrg()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to change role')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const roleColor = r => r === 'owner' ? 'text-purple-400' : r === 'admin' ? 'text-blue-400' : 'text-slate-400'

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your organization and team.</p>
      </div>

      {/* ── Organization name ───────────────────────── */}
      <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Organization</h2>
        <form onSubmit={handleSaveOrg} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Organization name</label>
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              disabled={!isAdmin}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {isAdmin && (
            <button
              type="submit"
              disabled={saving || !orgName.trim() || orgName.trim() === org?.name}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </form>

        <div className="mt-4 pt-4 border-t border-slate-700 flex gap-6 text-sm text-slate-400">
          <span>Plan: <span className="text-white font-medium capitalize">{org?.plan_label}</span></span>
          <span>Devices: <span className="text-white font-medium">{org?.device_count} / {org?.device_limit === -1 ? '∞' : org?.device_limit}</span></span>
          <span>Members: <span className="text-white font-medium">{org?.members?.length}</span></span>
        </div>
      </section>

      {/* ── Team members ────────────────────────────── */}
      <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Team members</h2>

        <div className="space-y-3">
          {org?.members?.map(member => (
            <div key={member.user_id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium text-white">
                  {(member.full_name || member.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{member.full_name || member.email}</p>
                  {member.full_name && <p className="text-slate-400 text-xs">{member.email}</p>}
                </div>
                {member.is_current && (
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">you</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Role selector (only owner can change) */}
                {isOwner && !member.is_current && member.role !== 'owner' ? (
                  <select
                    value={member.role}
                    onChange={e => handleChangeRole(member.user_id, e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-sm text-white rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                ) : (
                  <span className={`text-sm capitalize ${roleColor(member.role)}`}>{member.role}</span>
                )}

                {/* Remove button */}
                {isAdmin && !member.is_current && member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id, member.email)}
                    className="text-slate-500 hover:text-red-400 text-sm transition-colors"
                    title="Remove member"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Invite new member ───────────────────────── */}
      {isAdmin && (
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Invite team member</h2>
          {org?.plan === 'free' ? (
            <div className="text-sm text-slate-400 mt-2">
              Upgrade to a paid plan to invite team members.{' '}
              <a href="/billing" className="text-blue-400 hover:underline">View plans →</a>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="mt-3 space-y-3">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  {inviting ? 'Sending…' : 'Send invite'}
                </button>
              </div>

              {inviteSuccess && <p className="text-sm text-green-400">{inviteSuccess}</p>}
              {inviteError   && <p className="text-sm text-red-400">{inviteError}</p>}
            </form>
          )}
        </section>
      )}

      {/* ── Pending invites ─────────────────────────── */}
      {org?.pending_invites?.length > 0 && isAdmin && (
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">
            Pending invites ({org.pending_invites.length})
          </h2>
          <div className="space-y-3">
            {org.pending_invites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-white text-sm">{inv.email}</p>
                  <p className="text-slate-400 text-xs">
                    Expires {new Date(inv.expires_at).toLocaleDateString()} · {inv.role}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Copy invite link */}
                  <button
                    onClick={() => { navigator.clipboard.writeText(inv.invite_url); alert('Invite link copied!') }}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Copy link
                  </button>
                  <button
                    onClick={() => handleRevokeInvite(inv.id)}
                    className="text-slate-500 hover:text-red-400 text-sm transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Role guide */}
      <div className="text-xs text-slate-500 space-y-1">
        <p><span className="text-purple-400">Owner</span> — full access, billing, can delete org</p>
        <p><span className="text-blue-400">Admin</span> — manage devices, scans, team. No billing access.</p>
        <p><span className="text-slate-400">Viewer</span> — read-only access to scans and reports.</p>
      </div>
    </div>
  )
}
