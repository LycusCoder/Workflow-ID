import React, { useEffect, useState } from 'react';
import { X, Clock, User, Calendar, Sparkles } from 'lucide-react';

interface CheckInData {
  user_name: string;
  user_gender: 'male' | 'female' | 'other';
  check_in_time: string;
  date: string;
  status: string;
  similarity: number;
  message: string;
}

interface CheckInNotificationProps {
  data: CheckInData;
  onClose: () => void;
}

const CheckInNotification: React.FC<CheckInNotificationProps> = ({ data, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 50)
    
    // Auto close after 5s
    const closeTimeout = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => {
      clearTimeout(closeTimeout)
    }
  }, [onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Laki-laki'
      case 'female': return 'Perempuan'
      default: return 'Lainnya'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ontime': return 'text-green-600'
      case 'late': return 'text-yellow-600'
      default: return 'text-red-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Notification Card - Modern Minimalist */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Check-in Berhasil!
              </h3>
              <p className="text-gray-500 text-sm">
                Similarity {data.similarity}% • {data.message}
              </p>
            </div>

            {/* User Info - Clean Cards */}
            <div className="space-y-3 mb-6">
              {/* Name */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Nama</p>
                  <p className="text-gray-900 font-semibold">{data.user_name}</p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  data.user_gender === 'male' 
                    ? 'bg-blue-100' 
                    : data.user_gender === 'female'
                    ? 'bg-pink-100'
                    : 'bg-gray-200'
                }`}>
                  <div className={`text-xl ${
                    data.user_gender === 'male' 
                      ? 'text-blue-600' 
                      : data.user_gender === 'female'
                      ? 'text-pink-600'
                      : 'text-gray-600'
                  }`}>
                    {data.user_gender === 'male' ? '♂' : data.user_gender === 'female' ? '♀' : '⚲'}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Jenis Kelamin</p>
                  <p className="text-gray-900 font-semibold">
                    {getGenderLabel(data.user_gender)}
                  </p>
                </div>
              </div>

              {/* Time & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Waktu</p>
                    <p className={`font-bold text-sm ${getStatusColor(data.status)}`}>
                      {data.check_in_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Tanggal</p>
                    <p className="text-gray-900 font-semibold text-sm truncate">{data.date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm ${
                data.status === 'ontime' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : data.status === 'late'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <span>
                  {data.status === 'ontime' ? 'Tepat Waktu' : data.status === 'late' ? 'Terlambat' : 'Absen'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInNotification;
