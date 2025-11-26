"use client";

import React, { useState, useEffect } from 'react';
import { Camera, Bell, User, Settings, BarChart3, FileText, Brain, Plus, CheckCircle, AlertTriangle, Lock, Download, Menu, X, Clock, Users, TrendingUp, Zap, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const Beranda: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync dengan theme system
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    
    // Observer untuk detect perubahan theme
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Data untuk visualisasi
  const attendanceData = [
    { day: 'Sen', hadir: 45, izin: 3, alpha: 2 },
    { day: 'Sel', hadir: 48, izin: 1, alpha: 1 },
    { day: 'Rab', hadir: 47, izin: 2, alpha: 1 },
    { day: 'Kam', hadir: 46, izin: 3, alpha: 1 },
    { day: 'Jum', hadir: 44, izin: 4, alpha: 2 },
  ];

  const performanceData = [
    { bulan: 'Jan', produktivitas: 85, efisiensi: 78 },
    { bulan: 'Feb', produktivitas: 88, efisiensi: 82 },
    { bulan: 'Mar', produktivitas: 92, efisiensi: 87 },
    { bulan: 'Apr', produktivitas: 89, efisiensi: 85 },
    { bulan: 'Mei', produktivitas: 95, efisiensi: 90 },
    { bulan: 'Jun', produktivitas: 93, efisiensi: 88 },
  ];

  const departmentStats = [
    { name: 'Engineering', value: 35, color: '#6C4BFF' },
    { name: 'Design', value: 20, color: '#00F0FF' },
    { name: 'Marketing', value: 25, color: '#FFD93D' },
    { name: 'HR', value: 20, color: '#FF6B6B' },
  ];

  const recentActivities = [
    { id: 1, user: 'Ahmad Rizki', action: 'Check-in', time: '08:45', status: 'success' },
    { id: 2, user: 'Sarah Putri', action: 'Submit Report', time: '09:12', status: 'success' },
    { id: 3, user: 'Budi Santoso', action: 'Meeting Started', time: '10:00', status: 'ongoing' },
    { id: 4, user: 'Linda Kusuma', action: 'Task Completed', time: '11:30', status: 'success' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="relative p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-200">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <TrendingUp size={16} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{title}</h3>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-violet-500/10 to-cyan-400/10 dark:from-violet-500/20 dark:to-cyan-400/20 border border-violet-200 dark:border-violet-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
              {getGreeting()}, Admin! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Selamat datang di NexusOffice Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Karyawan"
          value="248"
          subtitle="Active employees"
          icon={Users}
          color="from-violet-500 to-purple-600"
          trend="+12%"
        />
        <StatCard
          title="Kehadiran Hari Ini"
          value="94%"
          subtitle="46/50 hadir"
          icon={CheckCircle}
          color="from-green-500 to-emerald-600"
          trend="+3%"
        />
        <StatCard
          title="Tugas Aktif"
          value="127"
          subtitle="23 high priority"
          icon={FileText}
          color="from-blue-500 to-cyan-600"
          trend="+8%"
        />
        <StatCard
          title="Produktivitas"
          value="92%"
          subtitle="This month average"
          icon={TrendingUp}
          color="from-orange-500 to-red-600"
          trend="+5%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kehadiran Mingguan</h2>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors">
              <BarChart3 size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#cbd5e1'} opacity={0.3} />
              <XAxis dataKey="day" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#1e293b'
                }} 
              />
              <Bar dataKey="hadir" fill="#6C4BFF" radius={[8, 8, 0, 0]} />
              <Bar dataKey="izin" fill="#FFD93D" radius={[8, 8, 0, 0]} />
              <Bar dataKey="alpha" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Chart */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Performa Tim</h2>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors">
              <TrendingUp size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorProduktivitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C4BFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6C4BFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEfisiensi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#cbd5e1'} opacity={0.3} />
              <XAxis dataKey="bulan" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#1e293b'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="produktivitas" 
                stroke="#6C4BFF" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorProduktivitas)" 
              />
              <Area 
                type="monotone" 
                dataKey="efisiensi" 
                stroke="#00F0FF" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEfisiensi)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Distribusi Departemen</h2>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#1e293b'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {departmentStats.map((dept, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                <span className="text-sm text-slate-600 dark:text-slate-300">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aktivitas Terkini</h2>
            <button className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
              Lihat Semua →
            </button>
          </div>
          
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-100 font-medium">{activity.user}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{activity.action}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{activity.time}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-400' :
                    activity.status === 'ongoing' ? 'bg-yellow-400' :
                    'bg-slate-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Camera, label: 'Face Recognition', color: 'from-violet-500 to-purple-600' },
          { icon: Calendar, label: 'Jadwal Meeting', color: 'from-blue-500 to-cyan-600' },
          { icon: Award, label: 'Leaderboard', color: 'from-orange-500 to-red-600' },
          { icon: Brain, label: 'AI Assistant', color: 'from-green-500 to-emerald-600' },
        ].map((action, idx) => (
          <button
            key={idx}
            className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br ${action.color} shadow-lg hover:shadow-xl transition-all`}
          >
            <action.icon size={32} className="text-white mx-auto mb-3" />
            <p className="text-white font-medium text-sm">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Beranda;