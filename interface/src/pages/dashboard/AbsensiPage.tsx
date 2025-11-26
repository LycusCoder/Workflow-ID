import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
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
  attendance_rate: number // Properti ini belum dipakai di UI, tapi bagus ada.
}

// Fungsi pembantu untuk format waktu
const formatTime = (timeString: string) => {
  if (!timeString) return 'N/A'
  try {
    // Asumsi format timeString adalah HH:mm:ss atau HH:mm:ss.SSSSSS
    // Kita ambil jam dan menit saja
    const [hours, minutes] = timeString.split(':')
    return `${hours}:${minutes}`
  } catch {
    return timeString // Fallback jika parsing gagal
  }
}

export default function AbsensiPage() {
  const { user } = useAuth()
  
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
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null) // Ubah any ke interface
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkInData, setCheckInData] = useState<any>(null)

  // Auto-detect face setiap 500ms saat scanning aktif
  useEffect(() => {
    if (!isScanning) return

    console.log('🔄 [AUTO-DETECT] Memulai loop auto-detection...')
    
    const interval = setInterval(async () => {
      try {
        await detectFace()
      } catch (error) {
        console.error('❌ [AUTO-DETECT] Error:', error)
      }
    }, 500) // Cek setiap 500ms

    return () => {
      console.log('🛑 [AUTO-DETECT] Menghentikan loop auto-detection')
      clearInterval(interval)
    }
  }, [isScanning, detectFace])

  // Gunakan useCallback untuk memoize fungsi
  const fetchAttendanceData = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const historyRes = await attendanceApi.getHistory(user.id, { start_date: startDate })
      
      if (historyRes.data) {
        // Cast hasil history ke AttendanceRecord[]
        const history: AttendanceRecord[] = historyRes.data.history || []
        setAttendanceHistory(history)
        
        const today = new Date().toISOString().split('T')[0]
        const todayRecord = history.find(r => r.date === today)
        setTodayAttendance(todayRecord || null)
      }
      
      const statsRes = await attendanceApi.getStats(user.id)
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error)
      setMessage({ type: 'error', text: 'Gagal memuat data absensi.' })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchAttendanceData()
  }, [user, fetchAttendanceData])

  const handleCheckIn = async () => {
    console.log('═══════════════════════════════════════════════════════════')
    console.log('🚀 [CHECK-IN START] Proses check-in dimulai...')
    console.log('⏰ Waktu:', new Date().toLocaleString('id-ID'))
    console.log('═══════════════════════════════════════════════════════════')
    
    if (!user) {
      console.error('❌ [CHECK-IN ABORT] User tidak ditemukan!')
      setMessage({ type: 'error', text: 'User tidak ditemukan' })
      return
    }
    
    console.log('👤 [CHECK-IN USER] User ID:', user.id)
    console.log('👤 [CHECK-IN USER] User Name:', user.name)
    console.log('👤 [CHECK-IN USER] User Email:', user.email)
    
    try {
      console.log('\n🎥 [CHECK-IN STEP 1] Memulai deteksi wajah...')
      console.log('📹 Video Ref:', videoRef.current ? 'Ready ✅' : 'Not Ready ❌')
      console.log('🤖 Models Loaded:', modelsLoaded ? 'Yes ✅' : 'No ❌')
      console.log('👁️ Face Detected State:', faceDetected ? 'Yes ✅' : 'No ❌')
      
      const result = await detectFace()
      
      console.log('\n📊 [CHECK-IN STEP 2] Hasil deteksi wajah:')
      console.log('Result:', result)
      console.log('Has Descriptor:', result?.descriptor ? 'Yes ✅' : 'No ❌')
      
      if (!result || !result.descriptor) {
        console.error('❌ [CHECK-IN ERROR] Deteksi wajah gagal!')
        console.error('   - Result is null:', !result)
        console.error('   - Descriptor is null:', !result?.descriptor)
        setMessage({ type: 'error', text: 'Wajah tidak terdeteksi. Pastikan wajah terlihat jelas di kamera.' })
        return
      }
      
      const faceEmbeddingArray = Array.from(result.descriptor)
      
      console.log('\n🧬 [CHECK-IN STEP 3] Face Embedding berhasil dikonversi:')
      console.log('   - Total dimensi:', faceEmbeddingArray.length)
      console.log('   - 10 nilai pertama:', faceEmbeddingArray.slice(0, 10).map(n => n.toFixed(4)).join(', '))
      console.log('   - Min value:', Math.min(...faceEmbeddingArray).toFixed(4))
      console.log('   - Max value:', Math.max(...faceEmbeddingArray).toFixed(4))
      
      console.log('\n📤 [CHECK-IN STEP 4] Mengirim data ke backend...')
      setLoading(true)
      setMessage(null)
      
      const payload = {
        user_id: user.id,
        face_embedding: JSON.stringify(faceEmbeddingArray),
        location: 'Office'
      }
      
      console.log('📦 Payload:')
      console.log('   - user_id:', payload.user_id)
      console.log('   - location:', payload.location)
      console.log('   - face_embedding length:', payload.face_embedding.length, 'characters')
      
      const response = await attendanceApi.checkIn(payload)
      
      console.log('\n📥 [CHECK-IN STEP 5] Response dari backend:')
      console.log('Response:', response)
      
      if (response.error) {
        console.error('❌ [CHECK-IN ERROR] Backend mengembalikan error!')
        console.error('   Error message:', response.error)
        setMessage({ type: 'error', text: response.error })
      } else {
        console.log('✅ [CHECK-IN SUCCESS] Check-in berhasil!')
        console.log('📊 Data response:', response.data)
        console.log('   - Message:', response.data?.message)
        console.log('   - User Name:', response.data?.user_name)
        console.log('   - Check-in Time:', response.data?.check_in_time)
        console.log('   - Status:', response.data?.status)
        console.log('   - Similarity:', response.data?.similarity + '%')
        
        setCheckInData(response.data)
        fetchAttendanceData()
        stopScanning()
        setIsCheckingIn(false)
        setMessage({ type: 'success', text: response.data.message || 'Check-in Berhasil!' })
      }
    } catch (error: any) {
      console.error('\n💥 [CHECK-IN EXCEPTION] Exception tertangkap!')
      console.error('   Error name:', error?.name)
      console.error('   Error message:', error?.message)
      console.error('   Error stack:', error?.stack)
      console.error('   Full error:', error)
      
      setMessage({ 
        type: 'error', 
        text: `Gagal check-in: ${error?.message || 'Masalah koneksi atau kamera'}` 
      })
    } finally {
      setLoading(false)
      console.log('\n🏁 [CHECK-IN END] Proses check-in selesai.')
      console.log('═══════════════════════════════════════════════════════════\n')
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
        setMessage({ type: 'success', text: response.data.message || 'Check-out berhasil!' })
        fetchAttendanceData()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal check-out. Silakan coba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  const startCheckIn = async () => {
    console.log('\n🎬 [START CHECK-IN] Tombol check-in diklik!')
    console.log('🤖 Models Loaded:', modelsLoaded ? 'Yes ✅' : 'No ❌')
    
    if (!modelsLoaded) {
      console.error('❌ [START CHECK-IN ERROR] Model belum dimuat!')
      setMessage({ type: 'error', text: 'Model Face Recognition belum termuat. Tunggu sebentar...' })
      return
    }
    
    console.log('📹 [START CHECK-IN] Memulai scanning...')
    setIsCheckingIn(true)
    setMessage(null)
    
    try {
      await startScanning()
      console.log('✅ [START CHECK-IN] Kamera berhasil diaktifkan!')
    } catch (error: any) {
      console.error('❌ [START CHECK-IN ERROR] Gagal memulai kamera:', error)
      setMessage({ type: 'error', text: 'Gagal mengakses kamera. Pastikan izin kamera diaktifkan.' })
      setIsCheckingIn(false)
    }
  }

  // Fungsi yang terpotong di input kamu, kita perbaiki di sini
  const cancelCheckIn = () => {
    console.log('🛑 [CANCEL CHECK-IN] User membatalkan check-in')
    setIsCheckingIn(false)
    stopScanning()
    console.log('📹 [CANCEL CHECK-IN] Kamera dihentikan')
  }
  
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
    const safeStatus = status.toLowerCase() as keyof typeof styles
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[safeStatus] || styles.absent}`}>
        {labels[safeStatus] || 'N/A'}
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
                <p className="text-2xl font-bold text-slate-900">{stats?.average_work_hours ? stats.average_work_hours.toFixed(1) + 'h' : '0.0h'}</p>
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
              <div className="animate-spin rounded-full h-12 w-12 border-indigo-600 border-b-2 mx-auto"></div>
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
                      Check-in: {formatTime(todayAttendance.check_in_time)} 
                      {todayAttendance.check_out_time && ` | Check-out: ${formatTime(todayAttendance.check_out_time)}`}
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
              {todayAttendance.work_hours !== null && ( // Cek agar 0 jam juga tampil
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
                        Check-in: {formatTime(record.check_in_time)}
                        {record.check_out_time && ` | Check-out: ${formatTime(record.check_out_time)}`}
                        {record.work_hours !== null && ` | ${record.work_hours.toFixed(1)} jam`}
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