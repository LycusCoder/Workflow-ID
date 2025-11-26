# 🎨 Dokumentasi Fitur Autentikasi WorkFlow-ID

## 📚 Daftar Isi
1. [Animated Background](#animated-background)
2. [Help Assistant](#help-assistant)
3. [Scanning Animation](#scanning-animation)
4. [Success Animation](#success-animation)
5. [Dev Script](#dev-script)

---

## 🌈 Animated Background

### Lokasi File
`interface/src/components/auth/AnimatedBackground.tsx`

### Deskripsi
Komponen background dinamis dengan animasi yang smooth untuk halaman login dan register. Menggunakan Framer Motion untuk menciptakan pengalaman visual yang menarik.

### Fitur Utama
- **Rotating Gradient**: Gradient yang berputar dengan durasi 20 detik
- **Floating Particles**: 20 partikel yang bergerak secara acak di seluruh layar
- **Glowing Orbs**: 3 bola bercahaya (indigo, cyan, purple) dengan efek pulsing
- **Grid Overlay**: Pattern grid dengan noise texture untuk depth

### Cara Penggunaan
```tsx
import AnimatedBackground from '@/components/auth/AnimatedBackground'

function AuthLayout() {
  return (
    <div className="relative">
      <AnimatedBackground />
      {/* Konten lainnya */}
    </div>
  )
}
```

### Performance Tips
- Partikel menggunakan `will-change: transform` untuk hardware acceleration
- Animasi menggunakan transform (scale, rotate) yang lebih optimal
- Bisa dikurangi jumlah partikel (dari 20 ke 10) jika device low-end

### Customization
```tsx
// Ubah jumlah partikel
{[...Array(10)].map((_, i) => ( // 20 → 10

// Ubah kecepatan rotasi gradient
transition={{ duration: 30, repeat: Infinity }} // 20 → 30 (lebih lambat)

// Ubah ukuran glowing orbs
className="absolute w-96 h-96..." // ubah w-96/h-96
```

---

## 🤝 Help Assistant

### Lokasi File
`interface/src/components/auth/HelpAssistant.tsx`

### Deskripsi
Tombol bantuan floating dengan modal slide-in yang berisi FAQ dan kontak support. Dilengkapi dengan animasi karakter sekretaris yang interaktif.

### Fitur Utama
- **Floating Button**: Tombol di pojok kanan bawah dengan pulse animation
- **Slide-in Modal**: Panel yang muncul dari kanan dengan smooth transition
- **Animated Secretary**: Karakter 👩‍💼 dengan sparkles yang berputar
- **FAQ Accordion**: 5 pertanyaan umum dengan expand/collapse
- **Contact Support**: Tombol CTA untuk menghubungi tim

### FAQ yang Tersedia
1. **Apa itu WorkFlow ID?** - Penjelasan tentang sistem
2. **Bagaimana face recognition bekerja?** - Keamanan biometrik
3. **Apakah data saya aman?** - Enkripsi dan privasi
4. **Cara mendaftar?** - Langkah registrasi
5. **Fitur apa saja?** - Absensi, tugas, laporan

### Cara Penggunaan
```tsx
import HelpAssistant from '@/components/auth/HelpAssistant'

function App() {
  return (
    <>
      <YourContent />
      <HelpAssistant /> {/* Global floating button */}
    </>
  )
}
```

### Customization
```tsx
// Tambah FAQ baru
const faqs = [
  // ... FAQ existing
  {
    icon: <YourIcon />,
    question: 'Pertanyaan baru?',
    answer: 'Jawaban lengkap di sini...'
  }
]

// Ubah posisi button
className="fixed bottom-6 right-6..." // Ubah bottom/right

// Ubah lebar modal
className="w-full sm:w-96..." // 480px → 384px (w-96)
```

### Icons Used (Lucide React)
- `MessageCircle` - Apa itu WorkFlow ID
- `Camera` - Face Recognition
- `Shield` - Keamanan
- `User` - Registrasi
- `Zap` - Fitur

---

## 🔍 Scanning Animation

### Lokasi File
`interface/src/components/auth/ScanningAnimation.tsx`

### Deskripsi
Animasi overlay yang ditampilkan saat face recognition sedang memproses. Menampilkan progress circle, percentage, status text, dan scanning line effect.

### Fitur Utama
- **Progress Circle**: Circle SVG dengan gradient indigo-cyan
- **Percentage Display**: Angka besar di tengah (0-100%)
- **Status Text**: Pesan dinamis sesuai tahap scanning
- **Scanning Line**: Garis horizontal yang bergerak naik-turun

### Props
```typescript
interface ScanningAnimationProps {
  progress: number      // 0-100
  status: string       // Pesan status
}
```

### Status Messages
```tsx
// Di LoginPage.tsx
setScanningStatus('Menghubungkan kamera...')      // 10%
setScanningStatus('Mendeteksi wajah Anda...')     // 30%
setScanningStatus('Mengambil data pengguna...')   // 50%
setScanningStatus('Memproses data wajah...')      // 70%
setScanningStatus('Mencocokkan wajah...')         // 90%
setScanningStatus('Verifikasi berhasil!')         // 100%
```

### Cara Penggunaan
```tsx
import ScanningAnimation from '@/components/auth/ScanningAnimation'

function FaceRecognition() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  return (
    <div className="relative">
      <video ref={videoRef} />
      {progress > 0 && (
        <ScanningAnimation progress={progress} status={status} />
      )}
    </div>
  )
}
```

### Customization
```tsx
// Ubah ukuran progress circle
<svg className="w-40 h-40..."> // 32 → 40 (w-40)

// Ubah warna gradient
<stop offset="0%" stopColor="#f59e0b" /> // indigo → orange
<stop offset="100%" stopColor="#ef4444" /> // cyan → red

// Ubah kecepatan scanning line
transition={{ duration: 1, repeat: Infinity }} // 2 → 1 (lebih cepat)
```

---

## ✅ Success Animation

### Lokasi File
`interface/src/components/auth/SuccessAnimation.tsx`

### Deskripsi
Animasi celebratory yang ditampilkan saat login/register berhasil. Menampilkan check icon, message, dan confetti effect.

### Fitur Utama
- **Check Circle**: Icon centang dalam lingkaran gradient hijau
- **Success Message**: Pesan sambutan yang personal
- **Confetti Effect**: 10 partikel warna-warni yang meledak
- **Backdrop Blur**: Background semi-transparan dengan blur

### Props
```typescript
interface SuccessAnimationProps {
  message: string    // Pesan sukses
}
```

### Cara Penggunaan
```tsx
import SuccessAnimation from '@/components/auth/SuccessAnimation'
import { AnimatePresence } from 'framer-motion'

function LoginPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSuccess = (userName: string) => {
    setSuccessMessage(`Selamat datang kembali, ${userName}!`)
    setShowSuccess(true)

    setTimeout(() => {
      // Redirect atau action lainnya
    }, 2000)
  }

  return (
    <>
      {/* Your content */}
      <AnimatePresence>
        {showSuccess && <SuccessAnimation message={successMessage} />}
      </AnimatePresence>
    </>
  )
}
```

### Customization
```tsx
// Ubah jumlah confetti
{[...Array(20)].map((_, i) => ( // 10 → 20

// Ubah warna confetti
const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// Ubah durasi tampil
setTimeout(() => {
  navigate('/dashboard')
}, 3000) // 2000ms → 3000ms (3 detik)

// Ubah ukuran modal
className="max-w-sm" // sm → md/lg
```

### Animation Timeline
1. **0ms**: Backdrop fade in (opacity 0→1, scale 0→1)
2. **200ms**: Check icon rotate & scale (spring effect)
3. **300ms**: Title slide up (y: 20→0)
4. **400ms**: Message fade in
5. **0-500ms**: Confetti particles explode (staggered 50ms)

---

## 🚀 Dev Script (dev.ps1)

### Lokasi File
`scripts/dev.ps1`

### Deskripsi
PowerShell script untuk menjalankan backend (FastAPI) dan frontend (Vite) secara bersamaan dengan output yang terformat rapi dan berwarna.

### Fitur Utama
- **Progress Indicators**: [1/6] sampai [6/6] dengan deskripsi
- **Color-coded Output**: Yellow (process), Green (success), Red (error), Cyan (URLs)
- **ASCII Box Formatting**: Header dan server status dalam box
- **Dependency Check**: Otomatis install dependencies jika diperlukan
- **Job Monitoring**: Loop untuk cek status server
- **Graceful Shutdown**: Cleanup saat Ctrl+C

### Port Configuration
```powershell
# Backend (FastAPI)
$backendPort = 8001
$backendURL = "http://127.0.0.1:8001"

# Frontend (Vite)
$frontendPort = 5173
$frontendURL = "http://localhost:5173"
```

### Cara Menggunakan
```powershell
# Dari root project
.\scripts\dev.ps1

# Atau dari folder scripts
cd scripts
.\dev.ps1
```

### Progress Stages
```
[1/6] Checking Python installation...
[2/6] Checking Node.js installation...
[3/6] Installing backend dependencies...
[4/6] Installing frontend dependencies...
[5/6] Starting backend server...
[6/6] Starting frontend server...
```

### Output Format
```
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 WorkFlow-ID Development Setup 🚀             ║
║                                                    ║
╚════════════════════════════════════════════════════╝

      ✅ Backend: http://127.0.0.1:8001
      ✅ Frontend: http://localhost:5173

Press Ctrl+C to stop all servers
```

### Troubleshooting

**Problem**: Script tidak jalan
```powershell
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem**: Port sudah dipakai
```powershell
# Cek proses di port
Get-NetTCPConnection -LocalPort 5173

# Kill proses
Stop-Process -Id <PID>
```

**Problem**: Dependencies error
```powershell
# Manual install
cd backend
pip install -r requirements.txt

cd ../interface
npm install
```

### Customization
```powershell
# Ubah port
$frontendPort = 3001  # 5173 → 3001

# Tambah server lain (misal: redis)
Write-Host "[7/7] Starting Redis server..." -ForegroundColor Yellow
Start-Job -Name "redis" -ScriptBlock {
  redis-server
}

# Ubah warna
Write-Host "Message" -ForegroundColor Magenta  # Yellow → Magenta
```

### Script Flow
```
1. Display header
2. Check Python & Node.js installation
3. Install backend dependencies (pip)
4. Install frontend dependencies (npm)
5. Start backend server (uvicorn)
6. Start frontend server (vite)
7. Display URLs in box
8. Monitor jobs until Ctrl+C
9. Cleanup & exit
```

---

## 🔗 Integrasi Antar Komponen

### Auth Flow dengan Animasi

```
User klik "Mulai Face Recognition"
          ↓
LoginPage.handleFaceLogin() dipanggil
          ↓
startScanning() → kamera aktif
          ↓
progress: 10% → ScanningAnimation muncul
status: "Menghubungkan kamera..."
          ↓
progress: 30% → detectFace()
status: "Mendeteksi wajah Anda..."
          ↓
progress: 50% → userApi.getAll()
status: "Mengambil data pengguna..."
          ↓
progress: 70% → parse embeddings
status: "Memproses data wajah..."
          ↓
progress: 90% → matchFace()
status: "Mencocokkan wajah..."
          ↓
progress: 100% → match berhasil
status: "Verifikasi berhasil!"
          ↓
ScanningAnimation fade out
          ↓
SuccessAnimation muncul (2 detik)
message: "Selamat datang kembali, {name}!"
          ↓
navigate('/dashboard')
```

### Component Dependencies

```
AuthLayout
  ├── AnimatedBackground (background kiri)
  ├── HelpAssistant (global floating)
  └── children (LoginPage/RegisterPage)
        ├── ScanningAnimation (saat scanning)
        └── SuccessAnimation (saat sukses)
```

---

## 🎯 Best Practices

### Performance
1. **Lazy Loading**: Import animasi hanya saat diperlukan
   ```tsx
   const SuccessAnimation = lazy(() => import('@/components/auth/SuccessAnimation'))
   ```

2. **Reduce Motion**: Respect prefers-reduced-motion
   ```tsx
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
   const animationDuration = prefersReducedMotion ? 0 : 0.3
   ```

3. **Cleanup**: Selalu cleanup animation timers
   ```tsx
   useEffect(() => {
     const timer = setTimeout(() => setShowSuccess(false), 2000)
     return () => clearTimeout(timer)
   }, [])
   ```

### Accessibility
1. **ARIA Labels**: Tambah label untuk screen readers
   ```tsx
   <button aria-label="Bantuan aplikasi">
     <HelpCircle />
   </button>
   ```

2. **Keyboard Navigation**: Support Tab key
   ```tsx
   <button onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
   ```

3. **Focus Management**: Trap focus di modal
   ```tsx
   useEffect(() => {
     if (isOpen) modalRef.current?.focus()
   }, [isOpen])
   ```

### Security
1. **XSS Prevention**: Sanitize user input di message
   ```tsx
   import DOMPurify from 'dompurify'
   const cleanMessage = DOMPurify.sanitize(userMessage)
   ```

2. **Rate Limiting**: Limit scanning attempts
   ```tsx
   const MAX_ATTEMPTS = 3
   if (attempts >= MAX_ATTEMPTS) {
     toast({ title: 'Terlalu banyak percobaan' })
     return
   }
   ```

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ AnimatedBackground component
- ✅ HelpAssistant dengan FAQ system
- ✅ ScanningAnimation untuk face recognition
- ✅ SuccessAnimation dengan confetti
- ✅ dev.ps1 script improvements (port 5173)

### Upcoming Features
- [ ] Dark mode support untuk semua animasi
- [ ] Liveness detection animation
- [ ] Multi-language support (EN/ID toggle)
- [ ] Custom theme colors untuk animasi
- [ ] A/B testing different animation styles

---

## 🤝 Kontribusi

Jika ingin menambah fitur atau improve animasi:

1. Buat branch baru: `git checkout -b feature/new-animation`
2. Implement changes dengan follow style guide
3. Test di berbagai device (mobile, tablet, desktop)
4. Update dokumentasi ini
5. Create pull request

---

## 📞 Support

Butuh bantuan? Hubungi tim development:
- Email: dev@workflow-id.com
- Discord: WorkFlowID Server
- GitHub Issues: [workflow-id/issues](https://github.com/workflow-id/issues)

---

**Dibuat dengan ❤️ oleh Tim WorkFlow-ID**
