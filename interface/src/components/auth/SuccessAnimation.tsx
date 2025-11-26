import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface SuccessAnimationProps {
  message: string
}

export default function SuccessAnimation({ message }: SuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center"
        >
          <CheckCircle size={40} className="text-white" />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-slate-900 mb-2"
        >
          Berhasil! 🎉
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600"
        >
          {message}
        </motion.p>

        {/* Confetti effect */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4],
              left: '50%',
              top: '30%',
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, Math.random() * 200],
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 1,
              delay: i * 0.05,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
