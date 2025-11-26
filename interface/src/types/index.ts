export interface User {
  id: number
  name: string
  email: string
  gender?: 'male' | 'female' | 'other'
  position?: string
  department?: string
  face_embedding?: string
  created_at?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  face_embedding?: string
}

export interface FaceDetectionResult {
  descriptor: Float32Array
  score: number
  box: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface AttendanceRecord {
  id: number
  user_id: number
  check_in?: string
  check_out?: string
  date: string
  status: 'present' | 'late' | 'absent' | 'leave'
}

export interface Task {
  id: number
  title: string
  description?: string
  assignee: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'inprogress' | 'done'
  ai_estimate?: string
}
