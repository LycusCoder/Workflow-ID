# 🎭 Avatar Configuration Guide

## Overview
SecretaryAvatar sekarang menggunakan **DiceBear Avatars API** - library avatar gratis & open source dengan berbagai style profesional.

## Current Setup

### Avatar Source
- **API**: DiceBear v7.x (https://dicebear.com)
- **Style**: Avataaars (Sketch library inspired)
- **License**: Free for commercial use (CC0)
- **Hosting**: CDN (no download required)

### Default Avatar
```typescript
// File: src/constants/avatars.ts
export const defaultAvatar = 
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Assistant1&backgroundColor=b6e3f4&clothing=blazerShirt&clothingColor=3c4f5c..."
```

## Avatar Customization

### Change Avatar Style
Edit `src/constants/avatars.ts`:

```typescript
// Professional Female Assistant - Glasses
export const defaultAvatar = avatarStyles.professional1

// Atau pilih style lain:
export const defaultAvatar = avatarStyles.professional2  // Short hair
export const defaultAvatar = avatarStyles.friendly       // Curly hair
export const defaultAvatar = avatarStyles.modern         // With glasses
export const defaultAvatar = avatarStyles.elegant        // Straight hair
```

### Available Styles

#### 1. Professional 1 (Default)
- Long straight hair
- Blazer + shirt
- Glasses (prescription)
- Blue background
- Best for: Corporate/professional look

#### 2. Professional 2
- Short flat hair
- Collar sweater
- No glasses
- Pink background
- Best for: Friendly professional

#### 3. Friendly
- Long curly hair
- Blazer sweater
- No glasses
- Purple background
- Best for: Approachable assistant

#### 4. Modern
- Long bob hair
- Crew neck shirt
- Round glasses
- Orange background
- Best for: Tech/startup vibe

#### 5. Elegant
- Long straight hair
- Collar sweater
- No glasses
- Lavender background
- Best for: Elegant/formal

## DiceBear Parameters

### Customization Options

```typescript
// Base URL
"https://api.dicebear.com/7.x/avataaars/svg"

// Parameters:
?seed=Assistant1              // Unique identifier
&backgroundColor=b6e3f4       // Hex color (tanpa #)
&clothing=blazerShirt         // Clothing type
&clothingColor=3c4f5c         // Clothing color
&eyebrows=defaultNatural      // Eyebrow style
&eyes=happy                   // Eye expression
&facialHair=blank             // No facial hair
&mouth=smile                  // Mouth expression
&top=longHairStraight         // Hair style
&topColor=4a312c              // Hair color
&accessories=prescription02   // Glasses, etc
```

### Clothing Options
- `blazerShirt` - Professional blazer
- `blazerSweater` - Casual blazer
- `collarSweater` - Sweater with collar
- `shirtCrewNeck` - Basic t-shirt
- `hoodie` - Casual hoodie

### Hair Options (top)
- `longHairStraight` - Long straight
- `longHairCurly` - Long curly
- `longHairBob` - Bob cut
- `shortHairShortFlat` - Short flat
- `shortHairShortCurly` - Short curly
- `longHairStraight2` - Alternative long

### Eye Options
- `default` - Normal eyes
- `happy` - Happy/smiling eyes
- `wink` - Winking
- `surprised` - Wide open

### Mouth Options
- `smile` - Simple smile
- `twinkle` - Big smile
- `default` - Neutral

### Accessories
- `blank` - No accessories
- `prescription01` - Round glasses
- `prescription02` - Rectangle glasses
- `sunglasses` - Sunglasses

## Alternative Avatar Styles

### Big Smile (More cartoon)
```typescript
export const defaultAvatar = avatarStyles.bigSmile
// Cute, friendly cartoon style
```

### Lorelei (Artistic)
```typescript
export const defaultAvatar = avatarStyles.lorelei
// More artistic/illustrative style
```

### Notionists (Minimalist)
```typescript
export const defaultAvatar = avatarStyles.notionists
// Clean, modern, minimalist
```

## Creating Custom Avatar

### Step 1: Use DiceBear Playground
Visit: https://www.dicebear.com/playground

### Step 2: Customize
1. Select "Avataaars" style
2. Adjust all parameters
3. Preview in real-time

### Step 3: Copy URL
Click "Copy URL" and paste to `avatars.ts`:

```typescript
export const myCustomAvatar = "PASTE_URL_HERE"
export const defaultAvatar = myCustomAvatar
```

## Error Handling

### Fallback System
Jika avatar gagal load, SecretaryAvatar akan menampilkan fallback SVG:

```typescript
// File: src/constants/avatars.ts
export const fallbackSVG = `
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="gradient" />
    <!-- Smiley face icon -->
  </svg>
`
```

### Customize Fallback
Edit `fallbackSVG` di `src/constants/avatars.ts` untuk ubah tampilan error.

## Performance Tips

### 1. CDN Caching
DiceBear API menggunakan CDN, avatar akan di-cache otomatis.

### 2. Preload (Optional)
Tambah preload di `index.html`:
```html
<link rel="preload" href="https://api.dicebear.com/7.x/avataaars/svg?seed=Assistant1..." as="image">
```

### 3. Local Hosting (Optional)
Download SVG dan host locally:
```bash
# Download avatar
curl "https://api.dicebear.com/7.x/avataaars/svg?seed=Assistant1..." > public/avatar.svg

# Update code
import avatarSVG from '/avatar.svg'
<img src={avatarSVG} />
```

## Color Palette Recommendations

### Professional Theme
```typescript
backgroundColor=e3f2fd     // Light blue
clothingColor=1565c0       // Dark blue
topColor=3e2723           // Dark brown hair
```

### Friendly Theme
```typescript
backgroundColor=fff3e0     // Light orange
clothingColor=fb8c00       // Orange
topColor=6d4c41           // Brown hair
```

### Modern Theme
```typescript
backgroundColor=f3e5f5     // Light purple
clothingColor=7b1fa2       // Purple
topColor=424242           // Dark gray hair
```

### Corporate Theme
```typescript
backgroundColor=eceff1     // Light gray
clothingColor=455a64       // Blue gray
topColor=212121           // Black hair
```

## License & Attribution

### DiceBear License
- **License**: CC0 1.0 Universal (Public Domain)
- **Commercial Use**: ✅ Allowed
- **Attribution**: Not required (but appreciated)
- **Modification**: ✅ Allowed

### Usage Rights
You can:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Private use
- ❌ No warranty

## Troubleshooting

### Avatar Not Loading
1. Check internet connection
2. Check DiceBear API status: https://status.dicebear.com
3. Verify URL is correct (no typos)
4. Fallback SVG should show automatically

### Avatar Looks Wrong
1. Check parameters (clothing, hair, etc)
2. Verify hex colors (no # symbol)
3. Try different seed value

### Want Different Style
1. Visit DiceBear playground
2. Select different style (not avataaars)
3. Update entire URL in `avatars.ts`

## Alternative Free Avatar APIs

If DiceBear is down:

### 1. UI Avatars
```typescript
"https://ui-avatars.com/api/?name=Assistant&background=6366f1&color=fff&size=128"
```

### 2. Boring Avatars
```typescript
"https://source.boringavatars.com/beam/120/Assistant?colors=264653,2a9d8f,e9c46a,f4a261,e76f51"
```

### 3. Gravatar (if have email)
```typescript
"https://www.gravatar.com/avatar/EMAIL_HASH?d=identicon&s=128"
```

## Resources

- **DiceBear Docs**: https://www.dicebear.com/docs
- **Playground**: https://www.dicebear.com/playground
- **GitHub**: https://github.com/dicebear/dicebear
- **Styles Gallery**: https://www.dicebear.com/styles

---

**Last Updated**: 2024 - WorkFlow-ID v1.0
**Maintained by**: UI/UX Team
