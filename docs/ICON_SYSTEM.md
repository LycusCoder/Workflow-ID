# 🎨 Icon System - WorkFlow-ID

## 📚 Daftar Icon Library

Project WorkFlow-ID menggunakan **Heroicons** sebagai icon library utama untuk tampilan yang lebih modern dan konsisten.

### Library yang Digunakan
- **Heroicons v2** (@heroicons/react) - Icon modern dari Tailwind Labs
- **Lucide React** - Masih digunakan di beberapa komponen legacy (akan dimigrasikan)

---

## 🎯 Heroicons yang Digunakan

### Auth Components

#### HelpAssistant.tsx
```tsx
import {
  QuestionMarkCircleIcon,      // Floating help button
  ChatBubbleLeftRightIcon,      // FAQ: Apa itu WorkFlow ID & Support button
  VideoCameraIcon,              // FAQ: Face Recognition
  ShieldCheckIcon,              // FAQ: Security
  UserPlusIcon,                 // FAQ: Registration
  BoltIcon,                     // FAQ: Features
  SparklesIcon,                 // Hover effect sparkle
  ChevronRightIcon,             // FAQ expand/collapse
  XMarkIcon                     // Close modal button
} from '@heroicons/react/24/outline' // atau /24/solid
```

**Outline vs Solid:**
- `24/outline`: Icon dengan garis (default untuk UI)
- `24/solid`: Icon padat (untuk emphasis/button)

#### LoginPage.tsx
```tsx
import {
  VideoCameraIcon,    // Camera placeholder
  EnvelopeIcon,       // Email tab icon
  FingerPrintIcon,    // Face ID tab icon
  EyeIcon,            // Show password
  EyeSlashIcon        // Hide password
} from '@heroicons/react/24/outline'
```

#### AuthLayout.tsx
```tsx
import {
  VideoCameraIcon,      // Face Recognition feature
  ClockIcon,            // Real-time tracking
  RocketLaunchIcon      // AI-Powered features
} from '@heroicons/react/24/outline'
```

---

## 🖼️ SecretaryAvatar Component

### Lokasi
`interface/src/components/auth/SecretaryAvatar.tsx`

### Deskripsi
Custom SVG avatar profesional menggantikan emoji 👩‍💼 di HelpAssistant.

### Fitur
- **Animated SVG**: Full vector graphics (scalable tanpa blur)
- **Professional Design**: Karakter sekretaris dengan blazer & tie
- **Gradient Colors**: Indigo-purple gradient background
- **Accessories**: Glasses untuk tampilan professional
- **Sparkles Animation**: 3 bintang berputar (360°) dengan fade in/out
- **Smooth Pulse**: Scale animation (1 → 1.05 → 1)

### Struktur SVG
```svg
- Background circle (gradient indigo→purple)
- Hair (dark gradient)
- Face (skin tone gradient)
- Eyes + eyebrows + nose
- Smile (curved path)
- Blazer (indigo) + collar + tie (purple)
- Glasses (optional, subtle opacity)
```

### Customization
```tsx
// Ubah warna skin tone
<linearGradient id="skinGradient">
  <stop offset="0%" stopColor="#fcd5ce" /> // Lebih terang
  <stop offset="100%" stopColor="#f4a59a" /> // Lebih gelap
</linearGradient>

// Ubah warna blazer
<path d="..." fill="#4f46e5" /> // Indigo → ganti hex color

// Hilangkan glasses
// Comment out section "Glasses (optional professional touch)"
```

### Usage
```tsx
import SecretaryAvatar from '@/components/auth/SecretaryAvatar'

<SecretaryAvatar />
```

---

## 📦 Installation

### Heroicons
```bash
npm install @heroicons/react
```

### Import Syntax
```tsx
// Outline icons (garis)
import { HomeIcon } from '@heroicons/react/24/outline'

// Solid icons (padat)
import { HomeIcon } from '@heroicons/react/24/solid'

// Mini icons (20px, untuk small UI)
import { HomeIcon } from '@heroicons/react/20/solid'
```

---

## 🎨 Icon Sizes

### Heroicons Sizing
```tsx
// Small (16px)
<IconComponent className="w-4 h-4" />

// Default (20px)
<IconComponent className="w-5 h-5" />

// Medium (24px)
<IconComponent className="w-6 h-6" />

// Large (32px)
<IconComponent className="w-8 h-8" />

// Extra Large (64px)
<IconComponent className="w-16 h-16" />
```

### Colors
```tsx
// Text colors
<IconComponent className="text-indigo-600" />

// With hover
<IconComponent className="text-slate-400 hover:text-slate-600" />

// Gradient (tidak langsung support, pakai wrapper)
<div className="bg-gradient-to-br from-indigo-500 to-cyan-500">
  <IconComponent className="text-white" />
</div>
```

---

## 🔄 Migration dari Lucide

### Before (Lucide)
```tsx
import { Camera, Mail, Shield } from 'lucide-react'

<Camera size={24} className="text-blue-500" />
<Mail size={20} />
<Shield size={16} />
```

### After (Heroicons)
```tsx
import { 
  VideoCameraIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'

<VideoCameraIcon className="w-6 h-6 text-blue-500" />
<EnvelopeIcon className="w-5 h-5" />
<ShieldCheckIcon className="w-4 h-4" />
```

### Icon Name Mapping
| Lucide | Heroicons | Notes |
|--------|-----------|-------|
| Camera | VideoCameraIcon | Lebih spesifik |
| Mail | EnvelopeIcon | Standard naming |
| Shield | ShieldCheckIcon | Ada checkmark |
| User | UserIcon atau UserCircleIcon | Pilih style |
| Zap | BoltIcon | Lebih modern |
| MessageCircle | ChatBubbleLeftRightIcon | Conversation icon |
| HelpCircle | QuestionMarkCircleIcon | Question mark |
| Eye | EyeIcon | Show visibility |
| EyeOff | EyeSlashIcon | Hide visibility |
| X | XMarkIcon | Close/dismiss |
| ChevronRight | ChevronRightIcon | Navigation |

---

## 🎯 Best Practices

### 1. Consistency
Gunakan **outline** untuk semua icon di UI, kecuali untuk:
- Primary buttons (solid)
- Selected states (solid)
- Icons di dalam colored background (solid lebih kontras)

### 2. Sizing
Stick dengan Tailwind sizes:
- `w-4 h-4`: Small text inline icons
- `w-5 h-5`: Default button/input icons
- `w-6 h-6`: Large buttons, headers
- `w-8 h-8`: Feature cards, emphasis

### 3. Accessibility
```tsx
// Tambahkan aria-label untuk icon-only buttons
<button aria-label="Tutup modal">
  <XMarkIcon className="w-6 h-6" />
</button>

// Atau wrap dengan span untuk screen readers
<button>
  <XMarkIcon className="w-6 h-6" />
  <span className="sr-only">Tutup modal</span>
</button>
```

### 4. Performance
```tsx
// ❌ Don't: Import semua icon
import * as HeroIcons from '@heroicons/react/24/outline'

// ✅ Do: Named imports (tree-shaking)
import { VideoCameraIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
```

---

## 🔍 Icon Explorer

### Official Resources
- **Heroicons Website**: https://heroicons.com/
- **Search Tool**: https://heroicons.com/ (live search)
- **GitHub**: https://github.com/tailwindlabs/heroicons

### Quick Search Tips
1. Buka https://heroicons.com/
2. Search by keyword (misal: "camera", "user", "email")
3. Click icon → Copy import statement
4. Pilih outline/solid variant
5. Paste ke component

---

## 📊 Icon Usage Statistics

### Project WorkFlow-ID
```
Total Heroicons: 24+ unique icons
Total Components Updated: 8 files
- HelpAssistant.tsx: 9 icons
- LoginPage.tsx: 5 icons
- AuthLayout.tsx: 3 icons
- DashboardLayout.tsx: 10 icons
- BerandaPage.tsx: 12 icons
- SecretaryAvatar.tsx: Custom SVG

Legacy Lucide Icons: ~5 icons (mostly migrated)
```

### Dashboard Icons (BerandaPage.tsx)
```tsx
import {
  UsersIcon,              // Total Karyawan stat
  ClockIcon,              // Jam Kerja stat
  CheckCircleIcon,        // Hadir Hari Ini stat
  ChartBarIcon,           // Produktivitas stat & Distribusi Tugas
  CalendarIcon,           // Kehadiran chart & Agenda
  BellIcon,               // Notifikasi button
  ArrowTrendingUpIcon,    // Produktivitas trend chart
  ArrowPathIcon,          // Refresh button
  SparklesIcon,           // Sparkle decorations & events
  FireIcon,               // Deadline event icon
  BoltIcon,               // Fast Performance badge
} from '@heroicons/react/24/outline'
```

### DashboardLayout Icons
```tsx
import {
  HomeIcon,                   // Beranda menu
  ClockIcon,                  // Absensi menu
  ClipboardDocumentListIcon,  // Tugas menu
  DocumentChartBarIcon,       // Laporan menu
  Cog6ToothIcon,             // Pengaturan menu & profile dropdown
  ArrowRightOnRectangleIcon, // Logout button
  Bars3Icon,                 // Mobile menu toggle
  XMarkIcon,                 // Close mobile menu
  BellIcon,                  // Notification dropdown
  MagnifyingGlassIcon,       // Search bar
  UserCircleIcon,            // Profile menu item
  ChevronDownIcon,           // Profile dropdown indicator
} from '@heroicons/react/24/outline'
```

---

## 🚀 Future Enhancements

### Planned
- [ ] Migrate semua Lucide icons ke Heroicons
- [ ] Create icon component wrapper untuk consistent sizing
- [ ] Add animation presets untuk common transitions
- [ ] Custom icon set untuk WorkFlow-ID branding

### Custom Icon Component Example
```tsx
// components/ui/icon.tsx
interface IconProps {
  icon: ComponentType<{ className?: string }>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Icon({ icon: IconComponent, size = 'md', className }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }
  
  return <IconComponent className={cn(sizeClasses[size], className)} />
}

// Usage
<Icon icon={VideoCameraIcon} size="lg" className="text-indigo-600" />
```

---

## 📞 Support

Questions about icons?
- Check Heroicons docs: https://heroicons.com/
- Ask in team chat: #ui-design
- GitHub issues: workflow-id/issues

---

**Last Updated**: 2024 - WorkFlow-ID v1.0
