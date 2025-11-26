"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Camera,
  FileText,
  Settings,
  Brain,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface SidebarProps {
  darkMode: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  darkMode, 
  activeTab, 
  setActiveTab,
  isOpen = true,
  onToggle
}) => {
  return (
    <>
      {/* Overlay untuk mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 backdrop-blur-md border-r overflow-y-auto shadow-2xl ${
              darkMode
                ? "bg-slate-900/95 border-slate-700/50"
                : "bg-white/95 border-slate-200/50"
            }`}
          >
            {/* Toggle button - hanya tampil di desktop */}
            <button
              onClick={onToggle}
              className={`hidden lg:flex absolute -right-4 top-20 w-8 h-8 rounded-full items-center justify-center transition-all shadow-lg hover:scale-110 z-50 ${
                darkMode
                  ? "bg-gradient-to-r from-violet-500 to-cyan-400 hover:from-violet-600 hover:to-cyan-500 text-white"
                  : "bg-gradient-to-r from-violet-500 to-cyan-400 hover:from-violet-600 hover:to-cyan-500 text-white"
              }`}
            >
              <ChevronLeft size={18} className="font-bold" />
            </button>

            <div className="p-6 space-y-6">
              {/* Close button untuk mobile - di dalam sidebar */}
              <div className="flex lg:hidden justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {([
                  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                  { id: "absensi", label: "Absensi", icon: Camera },
                  { id: "tugas", label: "Tugas", icon: FileText },
                  { id: "laporan", label: "Laporan", icon: BarChart3 },
                  { id: "pengaturan", label: "Pengaturan", icon: Settings },
                ]).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      // Auto-close di mobile setelah klik
                      if (window.innerWidth < 1024 && onToggle) {
                        onToggle();
                      }
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-violet-500/20 to-cyan-400/20 border border-violet-500/30"
                        : "hover:bg-slate-700/20"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-400/10 border border-violet-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 flex items-center justify-center">
                    <Brain size={16} className="text-white" />
                  </div>
                  <span className="font-medium">AI Assistant</span>
                </div>
                <p className="text-xs opacity-70">
                  Ketik perintah atau gunakan suara untuk delegasi tugas otomatis
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button untuk membuka sidebar (ketika tertutup) - hanya desktop */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={`hidden lg:flex fixed left-4 top-20 w-10 h-10 rounded-full items-center justify-center transition-all shadow-xl hover:scale-110 z-40 ${
            darkMode
              ? "bg-gradient-to-r from-violet-500 to-cyan-400 hover:from-violet-600 hover:to-cyan-500 text-white"
              : "bg-gradient-to-r from-violet-500 to-cyan-400 hover:from-violet-600 hover:to-cyan-500 text-white"
          }`}
        >
          <ChevronRight size={20} className="font-bold" />
        </button>
      )}
    </>
  );
};

export default Sidebar;