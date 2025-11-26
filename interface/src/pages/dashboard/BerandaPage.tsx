import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { dashboardApi } from '@/lib/api'
import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ChartBarIcon,
  CalendarIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { 
  AreaChart, 
  Area, 
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
} from 'recharts'

export default function BerandaPage() {
  const { user } = useAuth()

  // State Management - Real Data dari Backend
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsData, setStatsData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [productivityData, setProductivityData] = useState<any[]>([])
  const [taskDistribution, setTaskDistribution] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch semua data secara paralel
        const [stats, attendance, taskDist, activities, productivity, events] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getAttendanceWeekly(),
          dashboardApi.getTaskDistribution(),
          dashboardApi.getRecentActivities(),
          dashboardApi.getProductivityTrend(),
          dashboardApi.getUpcomingEvents(),
        ])

        // Transform Stats Data untuk UI
        if (stats.data) {
          const transformed = [
            {
              title: 'Total Karyawan',
              value: stats.data.total_employees.toString(),
              change: '+12%',
              trend: 'up',
              icon: UsersIcon,
              gradient: 'from-indigo-500 via-purple-500 to-pink-500',
              iconBg: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
            },
            {
              title: 'Hadir Hari Ini',
              value: stats.data.present_today.toString(),
              change: '+5%',
              trend: 'up',
              icon: CheckCircleIcon,
              gradient: 'from-emerald-500 via-green-500 to-teal-500',
              iconBg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20',
            },
            {
              title: 'Jam Kerja',
              value: stats.data.average_work_hours.toFixed(1),
              change: '+0.5h',
              trend: 'up',
              icon: ClockIcon,
              gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
              iconBg: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
            },
            {
              title: 'Produktivitas',
              value: `${stats.data.productivity_rate}%`,
              change: '+8%',
              trend: 'up',
              icon: ChartBarIcon,
              gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
              iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20',
            },
          ]
          setStatsData(transformed)
        }

        // Set Attendance Data (sudah format yang pas dari backend)
        if (attendance.data) {
          setAttendanceData(attendance.data)
        }

        // Transform Task Distribution untuk Pie Chart
        if (taskDist.data) {
          const colors: Record<string, string> = {
            completed: '#10b981',
            in_progress: '#3b82f6',
            pending: '#f59e0b',
            overdue: '#ef4444',
          }
          const names: Record<string, string> = {
            completed: 'Selesai',
            in_progress: 'Progress',
            pending: 'Pending',
            overdue: 'Overdue',
          }
          const transformed = Object.entries(taskDist.data).map(([key, value]) => ({
            name: names[key] || key,
            value: value as number,
            color: colors[key] || '#888888',
          }))
          setTaskDistribution(transformed)
        }

        // Set Recent Activities (dengan avatar dan color gradient)
        if (activities.data) {
          const colors = [
            'from-emerald-500 to-teal-500',
            'from-blue-500 to-indigo-500',
            'from-orange-500 to-amber-500',
            'from-purple-500 to-pink-500',
            'from-cyan-500 to-blue-500',
          ]
          const transformed = activities.data.map((activity: any, index: number) => ({
            ...activity,
            color: colors[index % colors.length],
          }))
          setRecentActivities(transformed)
        }

        // Set Productivity Trend (rename field untuk chart)
        if (productivity.data) {
          const transformed = productivity.data.map((item: any) => ({
            name: item.week,
            value: item.score,
          }))
          setProductivityData(transformed)
        }

        // Set Upcoming Events dengan icon mapping
        if (events.data && Array.isArray(events.data)) {
          const iconMap: Record<string, any> = {
            meeting: UsersIcon,
            deadline: FireIcon,
            training: SparklesIcon,
            holiday: CalendarIcon,
          }
          const colorMap: Record<string, string> = {
            meeting: 'text-indigo-600',
            deadline: 'text-red-600',
            training: 'text-purple-600',
            holiday: 'text-green-600',
          }
          const bgMap: Record<string, string> = {
            meeting: 'bg-indigo-50',
            deadline: 'bg-red-50',
            training: 'bg-purple-50',
            holiday: 'bg-green-50',
          }
          
          const transformed = events.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time + ' WIB',
            type: event.event_type,
            icon: iconMap[event.event_type] || UsersIcon,
            color: colorMap[event.event_type] || 'text-gray-600',
            bg: bgMap[event.event_type] || 'bg-gray-50',
          }))
          setUpcomingEvents(transformed)
        }

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Gagal memuat data dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="relative">
      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <p className="text-red-700 font-medium">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Coba Refresh Halaman
          </button>
        </motion.div>
      )}

      {/* Loading State - Skeleton Screens */}
      {loading && (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-pulse">
          <div className="h-48 bg-white/60 backdrop-blur-xl rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-40 bg-white/60 backdrop-blur-xl rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-white/60 backdrop-blur-xl rounded-2xl" />
            <div className="h-96 bg-white/60 backdrop-blur-xl rounded-2xl" />
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!loading && (
        <motion.div
          className="max-w-[1600px] mx-auto space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Welcome Section - Glass Morphism Style */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border border-white/20 shadow-soft p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Selamat Datang, {user?.name}! 👋
              </motion.h1>
              <p className="text-slate-600 text-lg">
                Berikut ringkasan aktivitas workplace hari ini.
              </p>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700">System Online</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full">
                  <BoltIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Fast Performance</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 backdrop-blur-sm hover:shadow-lg transition-all">
                <ArrowPathIcon className="w-4 h-4" />
                Refresh
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                <BellIcon className="w-4 h-4" />
                Notifikasi
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Modern Glassmorphism Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.title}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { duration: 0.2 } 
                }}
              >
                <Card className={`relative overflow-hidden border-0 bg-white/90 backdrop-blur-xl shadow-soft hover:shadow-glow transition-all duration-300`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                  
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${stat.iconBg} backdrop-blur-xl p-3 rounded-2xl border border-white/20`}>
                        <IconComponent className={`w-7 h-7 text-indigo-600`} />
                      </div>
                      <motion.span 
                        className={`text-sm font-bold px-3 py-1 rounded-full ${
                          stat.trend === 'up' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-red-50 text-red-700'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      >
                        {stat.change}
                      </motion.span>
                    </div>
                    <motion.h3 
                      className="text-3xl font-bold text-slate-900 mb-2"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.h3>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    
                    {/* Sparkle decoration */}
                    <SparklesIcon className="absolute bottom-4 right-4 w-8 h-8 text-slate-200 opacity-50" />
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts Section - Glass Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                  Tren Kehadiran Mingguan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="hadir" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="izin" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="alpha" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Task Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-soft h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-purple-600" />
                  Distribusi Tugas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Productivity Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-cyan-600" />
                Tren Produktivitas Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={productivityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Section: Activities & Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-soft">
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50/50 transition-colors border border-slate-100"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
                        {activity.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {activity.user}
                        </p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {activity.action}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0 font-medium">
                        {activity.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-soft h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                  Agenda Mendatang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const IconComponent = event.icon
                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`${event.bg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                            <IconComponent className={`w-5 h-5 ${event.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {event.title}
                            </h4>
                            <p className="text-sm text-slate-600">{event.date}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{event.time}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Success Banner - Glassmorphism */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-glow-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <SparklesIcon className="w-8 h-8 animate-pulse-glow" />
                    <h3 className="text-3xl font-bold">Selamat! 🎉</h3>
                  </div>
                  <p className="text-white/90 text-lg mb-2">
                    Anda berhasil menggunakan WorkFlow ID dengan teknologi Face Recognition!
                  </p>
                  <p className="text-sm text-white/80">
                    Dashboard modern 2025 • Glassmorphism Design • Real-time Analytics
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white/20 backdrop-blur-xl text-white border-white/30 hover:bg-white/30 hover:scale-105 transition-all shadow-lg"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      )}
    </div>
  )
}
