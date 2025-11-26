import { motion } from 'framer-motion'

interface ScanningAnimationProps {
  progress: number
  status: string
}

export default function ScanningAnimation({ progress, status }: ScanningAnimationProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-full">
      {/* Progress circle */}
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            pathLength: progress / 100,
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage */}
      <motion.div
        className="absolute text-white text-2xl font-bold"
        key={progress}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {progress}%
      </motion.div>

      {/* Status text */}
      <motion.p
        className="absolute bottom-8 text-white text-sm text-center px-4"
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {status}
      </motion.p>

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{
          top: ['20%', '80%', '20%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}
