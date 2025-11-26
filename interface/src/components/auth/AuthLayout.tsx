import { Card } from '@/components/ui/card'
import type { ReactNode } from 'react'
import AnimatedBackground from './AnimatedBackground'
import HelpAssistant from './HelpAssistant'
import { motion } from 'framer-motion'
import { VideoCameraIcon, ClockIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex relative">
      {/* Left side - Artistic area with animated background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 flex items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white p-8"
          >
            <motion.h1
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-6xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                WorkFlow ID
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl italic opacity-90 mb-12"
            >
              "Masa depan workplace management yang cerdas"
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-4 text-left max-w-md mx-auto"
            >
              {[
                { 
                  icon: <VideoCameraIcon className="w-8 h-8" />, 
                  text: 'Face Recognition Technology', 
                  delay: 0.8 
                },
                { 
                  icon: <ClockIcon className="w-8 h-8" />, 
                  text: 'Real-time Attendance Tracking', 
                  delay: 0.9 
                },
                { 
                  icon: <RocketLaunchIcon className="w-8 h-8" />, 
                  text: 'AI-Powered Task Management', 
                  delay: 1.0 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: item.delay }}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-all"
                >
                  <div className="text-indigo-200">{item.icon}</div>
                  <p className="text-lg">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-slate-50 relative">
        {/* Mobile background pattern */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-indigo-50 to-cyan-50" />
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              WorkFlow ID
            </h1>
            <p className="text-sm text-slate-600">Smart workplace management</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-slate-200 shadow-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                <p className="text-slate-600 mt-2">{subtitle}</p>
              </div>
              {children}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Help Assistant */}
      <HelpAssistant />
    </div>
  )
}
