import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

const menuItems = [
  {
    name: 'Beranda',
    path: '/dashboard/beranda',
    icon: HomeIcon,
    description: 'Dashboard & ringkasan',
  },
  {
    name: 'Absensi',
    path: '/dashboard/absensi',
    icon: ClockIcon,
    description: 'Kelola kehadiran',
  },
  {
    name: 'Tugas',
    path: '/dashboard/tugas',
    icon: ClipboardDocumentListIcon,
    description: 'Task management',
  },
  {
    name: 'Laporan',
    path: '/dashboard/laporan',
    icon: DocumentChartBarIcon,
    description: 'Analytics & reports',
  },
  {
    name: 'Pengaturan',
    path: '/dashboard/pengaturan',
    icon: Cog6ToothIcon,
    description: 'Settings & profile',
  },
]

// Mock notifications
const notifications = [
  {
    id: 1,
    title: 'Check-in berhasil',
    message: 'Muhammad Affif telah check-in pada 08:45 WIB',
    time: '5 menit lalu',
    unread: true,
  },
  {
    id: 2,
    title: 'Tugas baru',
    message: 'Anda mendapat tugas baru: Review Dokumen Q4',
    time: '1 jam lalu',
    unread: true,
  },
  {
    id: 3,
    title: 'Reminder',
    message: 'Team Meeting akan dimulai dalam 30 menit',
    time: '2 jam lalu',
    unread: false,
  },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const sidebarVariants = {
    open: { width: '280px', transition: { duration: 0.3, ease: 'easeInOut' } },
    closed: { width: '80px', transition: { duration: 0.3, ease: 'easeInOut' } },
  }

  const menuItemVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        className="hidden lg:flex flex-col bg-white border-r border-slate-200 shadow-lg fixed left-0 top-0 h-screen z-30"
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        initial="open"
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  WorkFlow ID
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">Smart Workplace</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const active = isActive(item.path)
            
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.div
                      className="flex-1 text-left"
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                    >
                      <p className={`font-medium text-sm ${active ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs ${active ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-slate-200">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Mobile Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    WorkFlow ID
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">Smart Workplace</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Mobile Menu */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const IconComponent = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
                      <div className="flex-1 text-left">
                        <p className={`font-medium text-sm ${active ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${active ? 'text-white/80' : 'text-slate-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </nav>

              {/* Mobile Logout */}
              <div className="p-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={logout}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-slate-700" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan, laporan, tugas..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen)
                    setProfileOpen(false)
                  }}
                  className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <BellIcon className="w-5 h-5 text-slate-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notificationOpen && (
                    <>
                      {/* Backdrop for mobile */}
                      <div
                        className="fixed inset-0 z-30 md:hidden"
                        onClick={() => setNotificationOpen(false)}
                      />
                      
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900">Notifikasi</h3>
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                              {notifications.filter(n => n.unread).length} baru
                            </span>
                          </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                                notif.unread ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {notif.unread && (
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900">{notif.title}</p>
                                  <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                                  <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-3 border-t border-slate-200">
                          <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            Lihat Semua Notifikasi
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile Menu - Desktop */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen)
                    setNotificationOpen(false)
                  }}
                  className="flex items-center gap-3 ml-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-600">{user?.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-slate-600 transition-transform ${
                      profileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setProfileOpen(false)}
                      />
                      
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 overflow-hidden"
                      >
                        {/* Profile Header */}
                        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{user?.name}</p>
                              <p className="text-sm text-white/80 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              navigate('/dashboard/pengaturan')
                              setProfileOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <UserCircleIcon className="w-5 h-5 text-slate-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">Profile Saya</p>
                              <p className="text-xs text-slate-600">Kelola akun dan preferensi</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/dashboard/pengaturan')
                              setProfileOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Cog6ToothIcon className="w-5 h-5 text-slate-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">Pengaturan</p>
                              <p className="text-xs text-slate-600">Customize aplikasi</p>
                            </div>
                          </button>
                        </div>

                        {/* Logout */}
                        <div className="p-2 border-t border-slate-200">
                          <button
                            onClick={() => {
                              logout()
                              setProfileOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout - Desktop (fallback) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden xl:flex gap-2 text-red-600 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
