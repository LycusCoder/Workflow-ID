import { API_ENDPOINTS } from '@/constants/config'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

/**
 * Wrapper untuk fetch API dengan error handling
 */
export async function apiCall<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  console.log('\n🌐 [API CALL] Request dimulai')
  console.log('   Endpoint:', endpoint)
  console.log('   Method:', options?.method || 'GET')
  
  try {
    const startTime = Date.now()
    
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const duration = Date.now() - startTime
    console.log(`   Duration: ${duration}ms`)
    console.log('   Status:', response.status, response.statusText)

    const data = await response.json()
    console.log('   Response Data:', data)

    if (!response.ok) {
      console.error('❌ [API CALL] Request failed!')
      console.error('   Error:', data.detail || data.message || 'Request failed')
      return {
        error: data.detail || data.message || 'Request failed',
        data: undefined,
      }
    }

    console.log('✅ [API CALL] Request berhasil!')
    return {
      data,
      error: undefined,
    }
  } catch (error) {
    console.error('💥 [API CALL] Network error!')
    console.error('   Error:', error)
    return {
      error: error instanceof Error ? error.message : 'Network error',
      data: undefined,
    }
  }
}

/**
 * GET request
 */
export async function apiGet<T = any>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'GET',
  })
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'DELETE',
  })
}

// Export specific API functions
export const userApi = {
  getAll: () => apiGet(API_ENDPOINTS.users),
  getById: (id: number) => apiGet(`${API_ENDPOINTS.users}/${id}`),
  create: (data: any) => apiPost(API_ENDPOINTS.users, data),
  update: (id: number, data: any) => apiPut(`${API_ENDPOINTS.users}/${id}`, data),
  delete: (id: number) => apiDelete(`${API_ENDPOINTS.users}/${id}`),
}

export const attendanceApi = {
  getAll: () => apiGet(API_ENDPOINTS.attendance),
  create: (data: any) => apiPost(API_ENDPOINTS.attendance, data),
  checkIn: (data: any) => apiPost(`${API_ENDPOINTS.attendance}/check-in`, data),
  checkOut: (data: any) => apiPost(`${API_ENDPOINTS.attendance}/check-out`, data),
  getHistory: (userId: number, params?: any) => {
    const query = new URLSearchParams(params).toString()
    return apiGet(`${API_ENDPOINTS.attendance}/history/${userId}${query ? `?${query}` : ''}`)
  },
  getStats: (userId: number) => apiGet(`${API_ENDPOINTS.attendance}/stats/${userId}`),
  getToday: () => apiGet(`${API_ENDPOINTS.attendance}/today`),
}

export const taskApi = {
  getAll: () => apiGet(API_ENDPOINTS.tasks),
  create: (data: any) => apiPost(API_ENDPOINTS.tasks, data),
  update: (id: string, data: any) => apiPut(`${API_ENDPOINTS.tasks}/${id}`, data),
  // V2 endpoints with full features
  getUserTasks: (userId: number, params?: any) => {
    const query = new URLSearchParams(params).toString()
    return apiGet(`${API_ENDPOINTS.tasks}/user/${userId}${query ? `?${query}` : ''}`)
  },
  createV2: (data: any) => apiPost(`${API_ENDPOINTS.tasks}/v2`, data),
  updateV2: (id: number, data: any) => apiPut(`${API_ENDPOINTS.tasks}/v2/${id}`, data),
  deleteV2: (id: number) => apiDelete(`${API_ENDPOINTS.tasks}/v2/${id}`),
  getStats: (userId: number) => apiGet(`${API_ENDPOINTS.tasks}/stats/${userId}`),
}

// Dashboard API - Real-time analytics
export const dashboardApi = {
  getStats: () => apiGet(API_ENDPOINTS.dashboard.stats),
  getAttendanceWeekly: () => apiGet(API_ENDPOINTS.dashboard.attendanceWeekly),
  getTaskDistribution: () => apiGet(API_ENDPOINTS.dashboard.taskDistribution),
  getRecentActivities: () => apiGet(API_ENDPOINTS.dashboard.recentActivities),
  getProductivityTrend: () => apiGet(API_ENDPOINTS.dashboard.productivityTrend),
  getUpcomingEvents: () => apiGet(API_ENDPOINTS.dashboard.upcomingEvents),
}

// Event API
export const eventApi = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString()
    return apiGet(`${API_ENDPOINTS.events}${query ? `?${query}` : ''}`)
  },
  create: (data: any) => apiPost(API_ENDPOINTS.events, data),
  getUpcoming: (limit: number = 5) => apiGet(`${API_ENDPOINTS.events}/upcoming?limit=${limit}`),
}

// Report API - Analytics and exports
export const reportApi = {
  getAttendanceSummary: (params?: any) => {
    const query = new URLSearchParams(params).toString()
    return apiGet(`${API_ENDPOINTS.reports}/attendance-summary${query ? `?${query}` : ''}`)
  },
  getTaskSummary: (params?: any) => {
    const query = new URLSearchParams(params).toString()
    return apiGet(`${API_ENDPOINTS.reports}/task-summary${query ? `?${query}` : ''}`)
  },
  getProductivityReport: (userId?: number) => {
    return apiGet(`${API_ENDPOINTS.reports}/productivity-report${userId ? `?user_id=${userId}` : ''}`)
  },
}
