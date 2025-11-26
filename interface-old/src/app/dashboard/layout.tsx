"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { Camera, Bell, User, Settings, BarChart3, FileText, Brain, Plus, CheckCircle, AlertTriangle, Lock, Download, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';

// Define types for notification and other components
interface Notification {
  type: 'success' | 'warning';
  message: string;
}

interface Task {
  id: number;
  title: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'inprogress' | 'done';
  aiEstimate: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}

interface AppProps {
  children: ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-open sidebar di desktop, auto-close di mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [cameraActive, setCameraActive] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Review Q4 Budget', assignee: 'Sarah', deadline: '2025-11-25', priority: 'high', status: 'todo', aiEstimate: '2h' },
    { id: 2, title: 'Client Presentation', assignee: 'Mike', deadline: '2025-11-24', priority: 'high', status: 'inprogress', aiEstimate: '4h' },
    { id: 3, title: 'Team Performance Review', assignee: 'You', deadline: '2025-11-26', priority: 'medium', status: 'todo', aiEstimate: '1h' },
    { id: 4, title: 'Office Supplies Order', assignee: 'Alex', deadline: '2025-11-28', priority: 'low', status: 'done', aiEstimate: '30m' }
  ]);

  // Mock data for charts
  const attendanceData = [
    { day: 'Mon', attendance: 85 },
    { day: 'Tue', attendance: 88 },
    { day: 'Wed', attendance: 92 },
    { day: 'Thu', attendance: 87 },
    { day: 'Fri', attendance: 90 },
    { day: 'Sat', attendance: 78 },
    { day: 'Sun', attendance: 0 }
  ];

  const taskDistribution = [
    { department: 'Marketing', tasks: 12 },
    { department: 'Engineering', tasks: 18 },
    { department: 'HR', tasks: 8 },
    { department: 'Finance', tasks: 6 }
  ];

  const COLORS = ['#FF6B6B', '#FFD93D', '#6C4BFF', '#00F0FF'];

  // Simulate face detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (cameraActive) {
        setFaceDetected(Math.random() > 0.3);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [cameraActive]);

  // Show notifications
  useEffect(() => {
    if (faceDetected) {
      setNotification({ type: 'success', message: 'Wajah Terdaftar - Absen Berhasil!' });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [faceDetected]);

  const handleTaskDrag = (taskId: number, newStatus: 'todo' | 'inprogress' | 'done') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl backdrop-blur-md border ${
        darkMode 
          ? 'bg-slate-800/70 border-slate-600/30' 
          : 'bg-white/70 border-slate-200/50'
      } shadow-lg cursor-move`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm">{task.title}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {task.priority}
        </div>
      </div>
      <p className="text-xs opacity-70 mb-2">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
            {task.assignee.charAt(0)}
          </div>
          <span className="text-xs">{task.assignee}</span>
        </div>
        <div className="text-xs opacity-70">{task.aiEstimate}</div>
      </div>
    </motion.div>
  );

  const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl backdrop-blur-md border ${
        darkMode 
          ? 'bg-slate-800/70 border-slate-600/30' 
          : 'bg-white/70 border-slate-200/50'
      } shadow-lg relative overflow-hidden`}
    >
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
        <p className="text-sm opacity-70">{subtitle}</p>
      </div>
      <div 
        className="absolute inset-0 opacity-20 rounded-2xl"
        style={{ 
          background: `linear-gradient(45deg, ${color}, ${color === '#6C4BFF' ? '#00F0FF' : '#6C4BFF'})`,
          filter: 'blur(20px)'
        }}
      />
    </motion.div>
  );

  const router = useRouter();
  const pathname = usePathname();

  // Deteksi path aktif untuk menentukan tab
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path === 'dashboard' || !path) {
      setActiveTab('dashboard');
    } else {
      setActiveTab(path);
    }
  }, [pathname]);

  // Fungsi navigasi saat sidebar diklik
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${tab}`);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900'
    }`}>
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              notification.type === 'success' ? 'bg-green-500/90' : 'bg-yellow-500/90'
            } text-white`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b ${
        darkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 flex items-center justify-center">
                  <span className="font-bold text-white text-sm">NO</span>
                </div>
                <span className="font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  NexusOffice
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
              </button>
              
              <button className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors relative">
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
                <User size={20} />
                <span className="hidden sm:inline">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] mt-16">
        <Sidebar 
          darkMode={darkMode} 
          activeTab={activeTab} 
          setActiveTab={handleTabChange}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <App>{children}</App>;
}
