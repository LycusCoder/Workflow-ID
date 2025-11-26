// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// API Endpoints
export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  attendance: `${API_BASE_URL}/attendance`,
  tasks: `${API_BASE_URL}/tasks`,
  reports: `${API_BASE_URL}/reports`,
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    faceLogin: `${API_BASE_URL}/auth/face-login`,
    logout: `${API_BASE_URL}/auth/logout`,
  },
  dashboard: {
    stats: `${API_BASE_URL}/dashboard/stats`,
    attendanceWeekly: `${API_BASE_URL}/dashboard/attendance-weekly`,
    taskDistribution: `${API_BASE_URL}/dashboard/task-distribution`,
    recentActivities: `${API_BASE_URL}/dashboard/recent-activities`,
    productivityTrend: `${API_BASE_URL}/dashboard/productivity-trend`,
  },
} as const

// Face Detection Configuration
export const FACE_DETECTION_CONFIG = {
  MIN_CONFIDENCE: 0.5,
  MIN_QUALITY_SCORE: 0.6,
  MATCH_THRESHOLD: 0.55, // Stricter than 0.6
  DETECTION_INTERVAL: 300, // ms
  COUNTDOWN_DURATION: 800, // ms per count
  CIRCLE_RADIUS_PERCENT: 0.25,
  CIRCLE_TOLERANCE: 0.9,
  MODEL_PATH: '/models/',
} as const

// Password Validation
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*(),.?":{}|<>',
} as const

// Password Strength Scoring
export const PASSWORD_STRENGTH = {
  WEAK_MAX: 40,
  MEDIUM_MAX: 70,
  STRONG_MIN: 71,
} as const

// Email Validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'workflow_token',
  USER_KEY: 'workflow_user',
  REFRESH_TOKEN_KEY: 'workflow_refresh_token',
  TOKEN_EXPIRY_HOURS: 24,
  REMEMBER_ME_DAYS: 30,
} as const

// Rate Limiting (client-side tracking)
export const RATE_LIMIT = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in ms
  ATTEMPT_WINDOW: 5 * 60 * 1000, // 5 minutes in ms
} as const

// Toast Messages
export const TOAST_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login berhasil! Selamat datang kembali 🎉',
    LOGIN_FAILED: 'Login gagal. Periksa kredensial Anda.',
    REGISTER_SUCCESS: 'Registrasi berhasil! Silakan login.',
    REGISTER_FAILED: 'Registrasi gagal. Coba lagi.',
    LOGOUT_SUCCESS: 'Berhasil logout. Sampai jumpa!',
    SESSION_EXPIRED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    RATE_LIMITED: 'Terlalu banyak percobaan. Coba lagi nanti.',
  },
  FACE: {
    NO_FACE: 'Wajah tidak terdeteksi. Pastikan cahaya cukup.',
    MULTIPLE_FACES: 'Lebih dari satu wajah terdeteksi. Hanya satu orang.',
    LOW_QUALITY: 'Kualitas wajah kurang jelas. Dekatkan atau cari cahaya lebih baik.',
    POSITION_FACE: 'Posisikan wajah di dalam lingkaran panduan.',
    STAY_STILL: 'Tetap diam, sedang mengambil foto...',
    CAPTURE_SUCCESS: 'Wajah berhasil ditangkap!',
    MATCH_SUCCESS: 'Wajah dikenali! Selamat datang.',
    MATCH_FAILED: 'Wajah tidak dikenali. Daftar dulu atau coba lagi.',
    MODEL_LOADING: 'Memuat model deteksi wajah...',
    MODEL_LOADED: 'Siap untuk scan wajah!',
    MODEL_ERROR: 'Gagal memuat model. Refresh halaman.',
    CAMERA_ERROR: 'Gagal mengakses kamera. Periksa izin.',
  },
  VALIDATION: {
    REQUIRED_FIELDS: 'Semua field wajib diisi.',
    INVALID_EMAIL: 'Format email tidak valid (contoh: user@domain.com)',
    WEAK_PASSWORD: 'Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.',
    PASSWORD_MISMATCH: 'Password tidak cocok.',
  },
  NETWORK: {
    ERROR: 'Gagal terhubung ke server. Periksa koneksi internet.',
    TIMEOUT: 'Request timeout. Coba lagi.',
  },
} as const
