import { motion } from 'framer-motion'
import { ChevronRight, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RegisterData } from '@/types'

interface PersonalInfoStepProps {
  formData: RegisterData
  emailError: string
  passwordStrength: { strength: 'weak' | 'medium' | 'strong'; score: number; feedback: string[] } | null
  showPassword: boolean
  isLoading: boolean
  onInputChange: (field: keyof RegisterData, value: string) => void
  onTogglePassword: () => void
  onNext: () => void
}

export default function PersonalInfoStep({
  formData,
  emailError,
  passwordStrength,
  showPassword,
  isLoading,
  onInputChange,
  onTogglePassword,
  onNext,
}: PersonalInfoStepProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          required
          placeholder="Masukkan nama lengkap"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          required
          placeholder="user@domain.com"
          className={emailError ? 'border-red-500' : ''}
        />
        {emailError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1 text-red-500 text-sm"
          >
            <AlertCircle size={14} />
            <span>{emailError}</span>
          </motion.div>
        )}
        {formData.email && !emailError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1 text-green-500 text-sm"
          >
            <CheckCircle2 size={14} />
            <span>Format email valid</span>
          </motion.div>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
            placeholder="Buat password yang kuat"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={onTogglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </Button>
        </div>

        {/* Password Strength Indicator */}
        {passwordStrength && formData.password && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${passwordStrength.score}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${
                    passwordStrength.strength === 'weak'
                      ? 'bg-red-500'
                      : passwordStrength.strength === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
              </div>
              {passwordStrength.strength === 'weak' && (
                <XCircle size={16} className="text-red-500" />
              )}
              {passwordStrength.strength === 'medium' && (
                <AlertCircle size={16} className="text-yellow-500" />
              )}
              {passwordStrength.strength === 'strong' && (
                <CheckCircle2 size={16} className="text-green-500" />
              )}
            </div>
            <p
              className={`text-sm font-medium ${
                passwordStrength.strength === 'weak'
                  ? 'text-red-500'
                  : passwordStrength.strength === 'medium'
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}
            >
              Kekuatan password:{' '}
              {passwordStrength.strength === 'weak'
                ? 'Lemah'
                : passwordStrength.strength === 'medium'
                ? 'Sedang'
                : 'Kuat'}
            </p>
            {passwordStrength.feedback.length > 0 && (
              <p className="text-xs text-slate-500">
                Saran: {passwordStrength.feedback.join(', ')}
              </p>
            )}
          </motion.div>
        )}
      </div>

      <Button onClick={onNext} className="w-full" disabled={isLoading}>
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <>
            Langkah Selanjutnya
            <ChevronRight size={16} className="ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  )
}
