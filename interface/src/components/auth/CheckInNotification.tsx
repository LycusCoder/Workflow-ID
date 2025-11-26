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
  const [isVisible, setIsVisible] = useState(false);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 50);
    
    // Stop scanning animation after 2s
    const scanTimeout = setTimeout(() => setScanning(false), 2000);
    
    // Auto close after 6s
    const closeTimeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 6000);

    return () => {
      clearTimeout(scanTimeout);
      clearTimeout(closeTimeout);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'LAKI-LAKI';
      case 'female': return 'PEREMPUAN';
      default: return 'LAINNYA';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'from-blue-500 to-cyan-500';
      case 'female': return 'from-pink-500 to-purple-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ontime': return 'text-green-400';
      case 'late': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Notification Card */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Scanning Animation Overlay */}
        {scanning && (
          <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line" />
            <div className="absolute inset-0 grid grid-cols-12 gap-px opacity-20">
              {[...Array(48)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-full bg-cyan-500/50 animate-pulse"
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 overflow-hidden">
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 animate-border-glow" />
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 transition-all group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {data.message}
              </h3>
              <p className="text-cyan-400 text-sm font-mono">
                VERIFIKASI BERHASIL • SIMILARITY {data.similarity}%
              </p>
            </div>

            {/* User Info Grid */}
            <div className="space-y-3 mb-6">
              {/* Name */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 font-mono mb-1">NAMA</p>
                  <p className="text-white font-semibold">{data.user_name}</p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getGenderColor(data.user_gender)}/20 border border-${data.user_gender === 'male' ? 'blue' : data.user_gender === 'female' ? 'pink' : 'gray'}-500/30`}>
                  <div className="w-5 h-5 flex items-center justify-center text-lg">
                    {data.user_gender === 'male' ? '♂' : data.user_gender === 'female' ? '♀' : '⚲'}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 font-mono mb-1">JENIS KELAMIN</p>
                  <p className={`font-semibold bg-gradient-to-r ${getGenderColor(data.user_gender)} bg-clip-text text-transparent`}>
                    {getGenderLabel(data.user_gender)}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 font-mono mb-1">WAKTU CHECK-IN</p>
                  <p className={`font-bold ${getStatusColor(data.status)}`}>
                    {data.check_in_time}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 font-mono mb-1">TANGGAL</p>
                  <p className="text-white font-semibold">{data.date}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                data.status === 'ontime' 
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                  : data.status === 'late'
                  ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                  : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span className="text-sm font-mono font-bold uppercase">
                  {data.status === 'ontime' ? 'TEPAT WAKTU' : data.status === 'late' ? 'TERLAMBAT' : 'ABSEN'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Glow */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </div>

        {/* Corner Accents */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
      </div>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
        
        @keyframes border-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
        
        .animate-border-glow {
          animation: border-glow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CheckInNotification;
