import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getScans       = ()      => api.get('/api/scans')
export const getScan        = (id)    => api.get(`/api/scans/${id}`)
export const getDevices     = ()      => api.get('/api/devices')
export const downloadReport = (id)    => `http://localhost:8000/api/reports/${id}/pdf`
export const login          = (data)  => api.post('/auth/login', data)
export const register       = (data)  => api.post('/auth/register', data)

export default api
