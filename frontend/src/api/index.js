import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''
console.log("API URL =", import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token from localStorage to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const register       = d => api.post('/auth/register', d)
export const login          = d => api.post('/auth/login', new URLSearchParams(d))
export const getMe          = ()  => api.get('/auth/me')

// ── Scans & Devices ───────────────────────────────────────
export const getScans       = ()   => api.get('/api/scans')
export const getScan        = id   => api.get(`/api/scans/${id}`)
export const getDevices     = ()   => api.get('/api/devices')
export const downloadReport = id   => `${BASE_URL}/api/reports/${id}/pdf`

// ── Organization ──────────────────────────────────────────
export const getOrg         = ()              => api.get('/orgs/me')
export const updateOrg      = body            => api.put('/orgs/me', body)
export const inviteMember   = body            => api.post('/orgs/invite', body)
export const getInvite      = token           => api.get(`/orgs/invite/${token}`)
export const acceptInvite   = (token, body)   => api.post(`/orgs/invite/${token}/accept`, body)
export const revokeInvite   = inviteId        => api.delete(`/orgs/invite/${inviteId}`)
export const removeMember   = userId          => api.delete(`/orgs/members/${userId}`)
export const changeMemberRole = (userId, role) => api.put(`/orgs/members/${userId}/role`, { role })

// ── Billing ───────────────────────────────────────────────
export const getBillingStatus   = ()    => api.get('/billing/status')
export const createCheckout     = plan  => api.post(`/billing/checkout?plan=${plan}`)
export const createPortal       = ()    => api.post('/billing/portal')

export default api
