import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { reportApi } from '@/lib/api'
import { 
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'

interface AttendanceSummary {
  user_id: number
  user_name: string
  total_days: number
  on_time: number
  late: number
  total_hours: number
  avg_hours: number
  on_time_rate: number
}

interface TaskSummary {
  user_id: number
  user_name: string
  total_tasks: number
  completed: number
  in_progress: number
  overdue: number
  completion_rate: number
}

interface ProductivityReport {
  user_id: number
  user_name: string
  attendance_days: number
  on_time_days: number
  avg_work_hours: number
  total_tasks: number
  completed_tasks: number
  task_completion_rate: number
  productivity_score: number
  grade: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function LaporanPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'attendance' | 'task' | 'productivity'>('attendance')
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })

  const [attendanceData, setAttendanceData] = useState<AttendanceSummary[]>([])
  const [taskData, setTaskData] = useState<TaskSummary[]>([])
  const [productivityData, setProductivityData] = useState<ProductivityReport[]>([])

  useEffect(() => {
    fetchReports()
  }, [dateRange, activeTab])

  const fetchReports = async () => {
    if (!user) return
    try {
      setLoading(true)
      
      if (activeTab === 'attendance') {
        const response = await reportApi.getAttendanceSummary({
          ...dateRange,
          user_id: user.id
        })
        if (response.data) {
          setAttendanceData(response.data.summaries || [])
        }
      } else if (activeTab === 'task') {
        const response = await reportApi.getTaskSummary({
          ...dateRange,
          user_id: user.id
        })
        if (response.data) {
          setTaskData(response.data.summaries || [])
        }
      } else if (activeTab === 'productivity') {
        const response = await reportApi.getProductivityReport(user.id)
        if (response.data) {
          setProductivityData(response.data.reports || [])
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(',')).join('\n')
    const csv = `${headers}\n${rows}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'text-green-600 bg-green-100',
      B: 'text-blue-600 bg-blue-100',
      C: 'text-yellow-600 bg-yellow-100',
      D: 'text-red-600 bg-red-100'
    }
    return colors[grade] || 'text-slate-600 bg-slate-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Laporan</h1>
          <p className="text-slate-600">Analytics dan reporting untuk insights mendalam</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-5 h-5 text-slate-600" />
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-600">sampai</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveTab('attendance')}
          variant={activeTab === 'attendance' ? 'default' : 'outline'}
          className={activeTab === 'attendance' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : ''}
        >
          <UserGroupIcon className="w-5 h-5 mr-2" />
          Laporan Absensi
        </Button>
        <Button
          onClick={() => setActiveTab('task')}
          variant={activeTab === 'task' ? 'default' : 'outline'}
          className={activeTab === 'task' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : ''}
        >
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
          Laporan Tugas
        </Button>
        <Button
          onClick={() => setActiveTab('productivity')}
          variant={activeTab === 'productivity' ? 'default' : 'outline'}
          className={activeTab === 'productivity' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : ''}
        >
          <DocumentChartBarIcon className="w-5 h-5 mr-2" />
          Produktivitas
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat laporan...</p>
        </div>
      ) : (
        <>
          {/* Attendance Report */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  onClick={() => exportToCSV(attendanceData, 'attendance-report')}
                  variant="outline"
                  disabled={attendanceData.length === 0}
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Export CSV
                </Button>
              </div>

              {attendanceData.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <DocumentChartBarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Tidak ada data absensi di periode ini</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Chart */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Perbandingan Kehadiran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="user_name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="on_time" fill="#10b981" name="Tepat Waktu" />
                          <Bar dataKey="late" fill="#f59e0b" name="Terlambat" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Table */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Detail Laporan Absensi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Nama</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Total Hari</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tepat Waktu</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Terlambat</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Rata-rata Jam</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">On-Time Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceData.map((record) => (
                              <tr key={record.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm text-slate-900">{record.user_name}</td>
                                <td className="px-4 py-3 text-sm text-slate-900">{record.total_days}</td>
                                <td className="px-4 py-3 text-sm text-green-600 font-semibold">{record.on_time}</td>
                                <td className="px-4 py-3 text-sm text-yellow-600 font-semibold">{record.late}</td>
                                <td className="px-4 py-3 text-sm text-slate-900">{record.avg_hours.toFixed(1)}h</td>
                                <td className="px-4 py-3 text-sm text-slate-900">{record.on_time_rate.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Task Report */}
          {activeTab === 'task' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  onClick={() => exportToCSV(taskData, 'task-report')}
                  variant="outline"
                  disabled={taskData.length === 0}
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Export CSV
                </Button>
              </div>

              {taskData.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <ClipboardDocumentCheckIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Tidak ada data tugas di periode ini</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Chart */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Status Tugas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={taskData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="user_name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#10b981" name="Selesai" />
                          <Bar dataKey="in_progress" fill="#3b82f6" name="Progress" />
                          <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Table */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Detail Laporan Tugas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Nama</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Total Tugas</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Selesai</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Progress</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Overdue</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Completion Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {taskData.map((record) => (
                              <tr key={record.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm text-slate-900">{record.user_name}</td>
                                <td className="px-4 py-3 text-sm text-slate-900">{record.total_tasks}</td>
                                <td className="px-4 py-3 text-sm text-green-600 font-semibold">{record.completed}</td>
                                <td className="px-4 py-3 text-sm text-blue-600 font-semibold">{record.in_progress}</td>
                                <td className="px-4 py-3 text-sm text-red-600 font-semibold">{record.overdue}</td>
                                <td className="px-4 py-3 text-sm text-slate-900">{record.completion_rate.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Productivity Report */}
          {activeTab === 'productivity' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  onClick={() => exportToCSV(productivityData, 'productivity-report')}
                  variant="outline"
                  disabled={productivityData.length === 0}
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Export CSV
                </Button>
              </div>

              {productivityData.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <DocumentChartBarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Tidak ada data produktivitas</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Chart */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Skor Produktivitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={productivityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="user_name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="productivity_score" stroke="#8b5cf6" strokeWidth={2} name="Produktivitas Score" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productivityData.map((record) => (
                      <Card key={record.user_id} className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-slate-900">{record.user_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(record.grade)}`}>
                              Grade {record.grade}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Kehadiran:</span>
                              <span className="font-semibold text-slate-900">{record.attendance_days} hari</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Rata-rata Jam:</span>
                              <span className="font-semibold text-slate-900">{record.avg_work_hours.toFixed(1)}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Total Tugas:</span>
                              <span className="font-semibold text-slate-900">{record.total_tasks}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Tugas Selesai:</span>
                              <span className="font-semibold text-green-600">{record.completed_tasks}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Completion Rate:</span>
                              <span className="font-semibold text-slate-900">{record.task_completion_rate.toFixed(1)}%</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Produktivitas Score:</span>
                                <span className="text-2xl font-bold text-purple-600">{record.productivity_score.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
