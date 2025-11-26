import { motion } from 'framer-motion'

export default function SecretaryAvatar() {
  return (
    <div className="relative w-24 h-24">
      {/* Professional Avatar Image */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-xl border-4 border-white"
      >
        <img
          src="/avatar/secretary.svg"
          alt="Virtual Assistant"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Rotating sparkles */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `rotate(${i * 120}deg) translateY(-60px)`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
