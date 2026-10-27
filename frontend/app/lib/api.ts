import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  register: (data: any) => apiClient.post('/auth/register', data),
}

// Worker endpoints
export const workersAPI = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get(`/workers?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/workers/${id}`),
  create: (data: any) => apiClient.post('/workers', data),
  update: (id: string, data: any) => apiClient.put(`/workers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/workers/${id}`),
}

// Membership endpoints
export const membershipAPI = {
  getAll: () => apiClient.get('/membership'),
  getById: (id: string) => apiClient.get(`/membership/${id}`),
  generateQR: (workerId: string) => apiClient.post(`/membership/${workerId}/qr`),
}

// Pricing endpoints
export const pricingAPI = {
  getAllPrices: () => apiClient.get('/prices'),
  getPricesByMaterial: (material: string) =>
    apiClient.get(`/prices/${material}`),
  addPrice: (data: any) => apiClient.post('/prices', data),
}

// Transaction endpoints
export const transactionsAPI = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get(`/transactions?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/transactions/${id}`),
  create: (data: any) => apiClient.post('/transactions', data),
  update: (id: string, data: any) => apiClient.put(`/transactions/${id}`, data),
}

// Grievance endpoints
export const grievancesAPI = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get(`/grievances?page=${page}&limit=${limit}`),
  getById: (id: string) => apiClient.get(`/grievances/${id}`),
  create: (data: any) => apiClient.post('/grievances', data),
  update: (id: string, data: any) => apiClient.put(`/grievances/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/grievances/${id}/status`, { status }),
}

// Report endpoints
export const reportsAPI = {
  getDashboardStats: () => apiClient.get('/reports/dashboard-stats'),
  getRecentActivities: () => apiClient.get('/reports/recent-activities'),
  getCollectiveBargaining: () => apiClient.get('/reports/collective-bargaining'),
}

export default apiClient
