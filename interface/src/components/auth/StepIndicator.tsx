import { motion } from 'framer-motion'
import { Check, type LucideIcon } from 'lucide-react'

interface Step {
  title: string
  icon: LucideIcon
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-center mb-8">
      {steps.map((step, index) => {
        const IconComponent = step.icon
        const isCompleted = index + 1 < currentStep
        const isCurrent = index + 1 === currentStep

        return (
          <div key={index} className="flex items-center">
            <motion.div
              animate={{
                backgroundColor: isCompleted
                  ? '#22c55e' // green-500
                  : isCurrent
                  ? '#6366f1' // indigo-500
                  : '#cbd5e1', // slate-300
                scale: isCurrent ? 1.05 : 1,
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            >
              {isCompleted ? (
                <Check size={16} className="text-white" />
              ) : (
                <IconComponent
                  size={16}
                  className={isCurrent ? 'text-white' : 'text-slate-600'}
                />
              )}
            </motion.div>
            {index < steps.length - 1 && (
              <motion.div
                animate={{
                  backgroundColor: isCompleted ? '#22c55e' : '#cbd5e1',
                }}
                className="w-12 h-1 mx-2 rounded"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
