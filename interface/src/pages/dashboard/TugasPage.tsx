import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { taskApi } from '@/lib/api'
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  category: string
  completed: boolean
  deadline: string | null
  created_at: string
}

interface TaskStats {
  total_tasks: number
  completed: number
  in_progress: number
  overdue: number
  completion_rate: number
}

const statusColumns = [
  { id: 'pending', title: 'Pending', color: 'from-slate-500 to-slate-600', icon: ClockIcon },
  { id: 'in_progress', title: 'In Progress', color: 'from-blue-500 to-indigo-600', icon: ClockIcon },
  { id: 'completed', title: 'Completed', color: 'from-green-500 to-emerald-600', icon: CheckCircleIcon },
  { id: 'overdue', title: 'Overdue', color: 'from-red-500 to-orange-600', icon: ExclamationTriangleIcon },
]

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export default function TugasPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    deadline: ''
  })
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')

  useEffect(() => {
    fetchTasks()
  }, [user, filterPriority, filterCategory])

  const fetchTasks = async () => {
    if (!user) return
    try {
      setLoading(true)
      const params: any = {}
      if (filterPriority) params.priority = filterPriority
      if (filterCategory) params.category = filterCategory
      
      const response = await taskApi.getUserTasks(user.id, params)
      if (response.data) {
        setTasks(response.data.tasks || [])
      }

      const statsRes = await taskApi.getStats(user.id)
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!user || !newTask.title) return
    try {
      setLoading(true)
      const response = await taskApi.createV2({
        ...newTask,
        user_id: user.id,
        deadline: newTask.deadline || null
      })
      if (response.data) {
        setShowAddModal(false)
        setNewTask({ title: '', description: '', priority: 'medium', category: 'general', deadline: '' })
        fetchTasks()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await taskApi.updateV2(taskId, {
        status: newStatus,
        completed: newStatus === 'completed'
      })
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Yakin ingin menghapus task ini?')) return
    try {
      await taskApi.deleteV2(taskId)
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1800px] mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tugas</h1>
          <p className="text-slate-600">Kelola dan track progress tugas karyawan</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Tambah Tugas
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{stats?.total_tasks || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Total Tugas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats?.completed || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.in_progress || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats?.overdue || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats?.completion_rate.toFixed(0) || 0}%</p>
              <p className="text-sm text-slate-600 mt-1">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <FunnelIcon className="w-5 h-5 text-slate-600" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Kategori</option>
              <option value="general">General</option>
              <option value="development">Development</option>
              <option value="meeting">Meeting</option>
              <option value="review">Review</option>
            </select>
            {(filterPriority || filterCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterPriority('')
                  setFilterCategory('')
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
            const Icon = column.icon

            return (
              <Card key={column.id} className="border-0 shadow-lg">
                <CardHeader className={`bg-gradient-to-r ${column.color} text-white rounded-t-xl`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <CardTitle className="text-white text-sm font-semibold">
                      {column.title} ({columnTasks.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3 min-h-[400px]">
                  {columnTasks.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-8">Tidak ada tugas</p>
                  ) : (
                    columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                            {task.priority}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {task.category}
                          </span>
                        </div>
                        {task.deadline && (
                          <p className="text-xs text-slate-500 mb-3">
                            📅 {new Date(task.deadline).toLocaleDateString('id-ID')}
                          </p>
                        )}
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Tambah Tugas Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Tugas</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Masukkan judul tugas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Masukkan deskripsi tugas"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="development">Development</option>
                  <option value="meeting">Meeting</option>
                  <option value="review">Review</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline (Opsional)</label>
                <Input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateTask}
                  disabled={loading || !newTask.title}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Simpan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
