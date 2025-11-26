import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { attendanceApi } from '@/lib/api'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import CheckInNotification from '@/components/auth/CheckInNotification'

interface AttendanceRecord {
  id: number
  date: string
  check_in_time: string
  check_out_time: string | null
  status: string
  work_hours: number | null
}

interface AttendanceStats {
  total_days: number
  on_time_days: number
  late_days: number
  average_work_hours: number
  attendance_rate: number
}

export default function AbsensiPage() {
  const { user } = useAuth()
  
  // Use face detection hook (sama seperti di register/login)
  const {
    modelsLoaded,
    isScanning,
    status: faceStatus,
    faceDetected,
    videoRef,
    startScanning,
    stopScanning,
    detectFace
  } = useFaceDetection()
  
  const [loading, setLoading] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkInData, setCheckInData] = useState<any>(null)

  useEffect(() => {
    fetchAttendanceData()
  }, [user])

  const fetchAttendanceData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const historyRes = await attendanceApi.getHistory(user.id, {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      if (historyRes.data) {
        setAttendanceHistory(historyRes.data.history || [])
        const today = new Date().toISOString().split('T')[0]
        const todayRecord = historyRes.data.history.find((r: any) => r.date === today)
        setTodayAttendance(todayRecord || null)
      }
      const statsRes = await attendanceApi.getStats(user.id)
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'User tidak ditemukan' })
      return
    }
    
    try {
      console.log('[CHECK-IN] Detecting face...')
      const result = await detectFace()
      
      if (!result || !result.descriptor) {
        setMessage({ type: 'error', text: 'Wajah tidak terdeteksi. Coba lagi.' })
        return
      }
      
      console.log('[CHECK-IN] Face detected, sending to backend...')
      setLoading(true)
      setMessage(null)
      
      const payload = {
        user_id: user.id,
        face_embedding: JSON.stringify(Array.from(result.descriptor)),
        location: 'Office'
      }
      
      const response = await attendanceApi.checkIn(payload)
      
      console.log('[CHECK-IN] Response:', response)
      
      if (response.error) {
        console.error('[CHECK-IN] Error from backend:', response.error)
        setMessage({ type: 'error', text: response.error })
      } else {
        console.log('[CHECK-IN] Success! Data:', response.data)
        // Show sci-fi notification popup
        setCheckInData(response.data)
        fetchAttendanceData()
        stopDetection()
        setIsCheckingIn(false)
      }
    } catch (error: any) {
      console.error('[CHECK-IN] Exception:', error)
      console.error('[CHECK-IN] Error message:', error.message)
      console.error('[CHECK-IN] Error stack:', error.stack)
      setMessage({ type: 'error', text: 'Gagal check-in. Silakan coba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user) return
    try {
      setLoading(true)
      setMessage(null)
      const response = await attendanceApi.checkOut({
        user_id: user.id
      })
      if (response.error) {
        setMessage({ type: 'error', text: response.error })
      } else {
        setMessage({ type: 'success', text: response.data.message })
        fetchAttendanceData()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal check-out. Silakan coba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  const startCheckIn = async () => {
    setIsCheckingIn(true)
    setMessage(null)
    await startScanning()
  }

  const cancelCheckIn = () => {
    setIsCheckingIn(false)
    stopScanning()
  const getStatusBadge = (status: string) => {
    const styles = {
      on_time: 'bg-green-100 text-green-700',
      late: 'bg-yellow-100 text-yellow-700',
      absent: 'bg-red-100 text-red-700',
      leave: 'bg-blue-100 text-blue-700'
    }
    const labels = {
      on_time: 'Tepat Waktu',
      late: 'Terlambat',
      absent: 'Alpha',
      leave: 'Izin'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Absensi</h1>
        <p className="text-slate-600">Kelola kehadiran dan check-in/check-out karyawan</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.total_days || 0}</p>
                <p className="text-sm text-slate-600">Hari Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.on_time_days || 0}</p>
                <p className="text-sm text-slate-600">Tepat Waktu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 p-3 rounded-xl">
                <XCircleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.late_days || 0}</p>
                <p className="text-sm text-slate-600">Terlambat</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.average_work_hours.toFixed(1) || '0.0'}h</p>
                <p className="text-sm text-slate-600">Rata-rata Jam</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Check-in / Check-out Hari Ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && !isCheckingIn ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Memuat data...</p>
            </div>
          ) : todayAttendance ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <CalendarIcon className="w-8 h-8 text-slate-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{todayAttendance.date}</p>
                    <p className="text-sm text-slate-600">
                      Check-in: {todayAttendance.check_in_time} 
                      {todayAttendance.check_out_time && ` | Check-out: ${todayAttendance.check_out_time}`}
                    </p>
                  </div>
                </div>
                {getStatusBadge(todayAttendance.status)}
              </div>
              {!todayAttendance.check_out_time && (
                <Button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Check-out Sekarang
                </Button>
              )}
              {todayAttendance.work_hours && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-700">
                    ✅ Total jam kerja hari ini: <span className="font-bold">{todayAttendance.work_hours.toFixed(2)} jam</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!isCheckingIn ? (
                <>
                  <div className="text-center py-8">
                    <ClockIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Belum check-in hari ini</p>
                  </div>
                  <Button
                    onClick={startCheckIn}
                    disabled={loading || !modelsLoaded}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {!modelsLoaded ? 'Memuat model...' : 'Check-in dengan Face Recognition'}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    {/* Camera Preview */}
                    {isScanning && (
                      <div className="mb-4 relative w-full max-w-md mx-auto">
                        <div className="relative w-full rounded-lg overflow-hidden shadow-2xl border-2 border-indigo-300">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            muted
                            className="w-full h-auto"
                          />
                          
                          {/* LIVE Badge */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg z-20">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            LIVE
                          </div>
                          
                          {/* Top Left - User Info */}
                          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-white/30 shadow-lg z-10">
                            <p className="text-[10px] text-gray-300 mb-0.5 font-mono">USER</p>
                            <p className="text-xs font-bold">{user?.name || 'Unknown'}</p>
                          </div>
                          
                          {/* Top Right - Gender Info */}
                          <div className={`absolute top-2 right-2 px-3 py-2 rounded-lg border backdrop-blur-md shadow-lg z-10 ${
                            user?.gender === 'male' 
                              ? 'bg-blue-500/90 border-blue-300/50 text-white' 
                              : user?.gender === 'female'
                              ? 'bg-pink-500/90 border-pink-300/50 text-white'
                              : 'bg-gray-500/90 border-gray-300/50 text-white'
                          }`}>
                            <p className="text-[10px] opacity-90 mb-0.5 font-mono">GENDER</p>
                            <p className="text-xs font-bold flex items-center gap-1.5">
                              <span className="text-base">
                                {user?.gender === 'male' ? '\u2642' : user?.gender === 'female' ? '\u2640' : '\u26b2'}
                              </span>
                              <span>
                                {user?.gender === 'male' ? 'LAKI-LAKI' : user?.gender === 'female' ? 'PEREMPUAN' : 'LAINNYA'}
                              </span>
                            </p>
                          </div>
                          
                          {/* Bottom - Detection Status */}
                          {faceDetected ? (
                            <div className="absolute bottom-2 left-2 right-2 bg-green-500/95 backdrop-blur-md text-white px-3 py-2.5 rounded-lg border border-green-300/70 shadow-lg z-10">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold">WAJAH TERDETEKSI</span>
                              </div>
                            </div>
                          ) : (
                            <div className="absolute bottom-2 left-2 right-2 bg-yellow-500/95 backdrop-blur-md text-white px-3 py-2.5 rounded-lg border border-yellow-300/70 shadow-lg z-10">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold">MENCARI WAJAH...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      {faceStatus && (
                        <p className="text-sm text-indigo-600 mb-2">{faceStatus}</p>
                      )}
                      
                      {faceDetected && (
                        <Button
                          onClick={handleCheckIn}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 mb-2"
                        >
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          Check-in Sekarang
                        </Button>
                      )}
                      
                      <Button
                        onClick={cancelCheckIn}
                        variant="outline"
                        className="w-full"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Riwayat Absensi (30 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceHistory.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Belum ada riwayat absensi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <CalendarIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{record.date}</p>
                      <p className="text-sm text-slate-600">
                        Check-in: {record.check_in_time}
                        {record.check_out_time && ` | Check-out: ${record.check_out_time}`}
                        {record.work_hours && ` | ${record.work_hours.toFixed(1)} jam`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sci-Fi Check-In Notification Popup */}
      {checkInData && (
        <CheckInNotification 
          data={checkInData}
          onClose={() => setCheckInData(null)}
        />
      )}
    </motion.div>
  )
}
