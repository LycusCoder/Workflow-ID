import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  BoltIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SecretaryAvatar from './SecretaryAvatar'

interface FAQ {
  id: string
  icon: any
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    id: 'what-is',
    icon: ChatBubbleLeftRightIcon,
    question: 'Apa itu WorkFlow ID?',
    answer: 'WorkFlow ID adalah sistem manajemen workplace modern yang menggunakan teknologi Face Recognition untuk absensi, task management berbasis AI, dan tracking produktivitas real-time.',
  },
  {
    id: 'face-recognition',
    icon: VideoCameraIcon,
    question: 'Bagaimana cara kerja Face Recognition?',
    answer: 'Sistem akan memindai wajah Anda menggunakan kamera. Data wajah diubah menjadi template digital yang unik dan aman. Saat login, sistem membandingkan wajah Anda dengan template yang tersimpan.',
  },
  {
    id: 'security',
    icon: ShieldCheckIcon,
    question: 'Apakah data saya aman?',
    answer: 'Ya! Data wajah Anda dienkripsi dan disimpan dengan standar keamanan tinggi. Kami tidak menyimpan foto asli, hanya template matematis yang tidak bisa diubah kembali menjadi foto.',
  },
  {
    id: 'register',
    icon: UserPlusIcon,
    question: 'Bagaimana cara mendaftar?',
    answer: 'Klik tombol "Daftar", isi nama dan email Anda, lalu ikuti panduan untuk scan wajah. Pastikan cahaya cukup dan wajah Anda terlihat jelas di kamera.',
  },
  {
    id: 'features',
    icon: BoltIcon,
    question: 'Fitur apa saja yang tersedia?',
    answer: 'Face Recognition Login, Absensi Otomatis, Task Management dengan AI, Laporan Produktivitas, dan Dashboard Analytics real-time.',
  },
]

export default function HelpAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null)

  const handleFAQClick = (faqId: string) => {
    setSelectedFAQ(selectedFAQ === faqId ? null : faqId)
  }

  return (
    <>
      {/* Help Button - Floating */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 relative group"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
          </motion.div>
          
          {/* Sparkle indicator */}
          <SparklesIcon className="w-5 h-5 absolute -top-1 -right-1 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-indigo-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </Button>
      </motion.div>

      {/* Help Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Assistant Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header with animated character */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 overflow-hidden">
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Secretary Character Avatar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                  >
                    <SecretaryAvatar />
                  </motion.div>
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <XMarkIcon className="w-6 h-6" />
                </Button>
              </div>

              {/* Content */}
              <div className="h-[calc(100%-12rem)] overflow-y-auto p-6">
                {/* Welcome message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Halo! Saya Asisten Anda 👋
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ada yang bisa saya bantu? Pilih pertanyaan di bawah atau hubungi tim support kami.
                  </p>
                </motion.div>

                {/* FAQ List */}
                <div className="space-y-3">
                  {faqs.map((faq, index) => {
                    const IconComponent = faq.icon
                    const isSelected = selectedFAQ === faq.id

                    return (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            isSelected ? 'ring-2 ring-indigo-500' : ''
                          }`}
                          onClick={() => handleFAQClick(faq.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <CardTitle className="text-base flex-1">
                                {faq.question}
                              </CardTitle>
                              <motion.div
                                animate={{ rotate: isSelected ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRightIcon
                                  className="w-5 h-5 text-slate-400"
                                />
                              </motion.div>
                            </div>
                          </CardHeader>
                          
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <CardContent className="pt-0">
                                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </CardContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Contact Support */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-950 dark:to-cyan-950 rounded-lg"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    Masih butuh bantuan?
                  </p>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                    Hubungi Support
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
