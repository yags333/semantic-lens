/**
 * Realistic Mock Seed Media Gallery for SemanticLens
 * Pre-populated with diverse semantic domains and 512-dim CLIP embeddings
 */

import { MediaItem } from '../types/media';
import { mockClipEngine } from '../ai/mockClipEngine';

export interface SeedImageDefinition {
  id: string;
  fileName: string;
  fileExtension: 'jpg' | 'png' | 'heic' | 'webp';
  fileSize: number;
  width: number;
  height: number;
  captureDateOffsetDays: number;
  tags: string[];
  description: string;
  svgPlaceholder: string;
  exif: {
    cameraMake: string;
    cameraModel: string;
    fNumber: number;
    exposureTime: string;
    iso: number;
    focalLength: string;
  };
}

const NOW = Date.now();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const SEED_DEFINITIONS: SeedImageDefinition[] = [
  {
    id: 'seed_warrior_sword_01',
    fileName: 'ancient_warrior_blade.jpg',
    fileExtension: 'jpg',
    fileSize: 3450210,
    width: 3840,
    height: 2160,
    captureDateOffsetDays: 2,
    tags: ['warrior', 'sword', 'blade', 'armor', 'shield', 'fighter', 'battle', 'knight'],
    description: 'A heroic warrior clad in forged steel armor holding an engraved broadsword on a misty cliff.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg_warrior" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a1c29"/>
          <stop offset="50%" stop-color="#2a3342"/>
          <stop offset="100%" stop-color="#0f111a"/>
        </linearGradient>
        <linearGradient id="blade_grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#cbd5e1"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#bg_warrior)"/>
      <circle cx="300" cy="130" r="45" fill="#e2e8f0" opacity="0.9"/>
      <path d="M250,220 L350,220 L370,360 L230,360 Z" fill="#475569"/>
      <!-- Sword -->
      <polygon points="300,50 307,240 293,240" fill="url(#blade_grad)"/>
      <rect x="270" y="240" width="60" height="12" rx="4" fill="#d97706"/>
      <rect x="295" y="252" width="10" height="40" fill="#78350f"/>
      <circle cx="300" cy="298" r="10" fill="#d97706"/>
      <text x="300" y="385" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle" font-weight="bold">Ancient Warrior with Sword</text>
    </svg>`,
    exif: {
      cameraMake: 'Sony',
      cameraModel: 'ILCE-7RM5',
      fNumber: 2.8,
      exposureTime: '1/500s',
      iso: 200,
      focalLength: '50mm'
    }
  },
  {
    id: 'seed_dog_grass_02',
    fileName: 'golden_retriever_grass.png',
    fileExtension: 'png',
    fileSize: 4120500,
    width: 4032,
    height: 3024,
    captureDateOffsetDays: 5,
    tags: ['dog', 'puppy', 'canine', 'golden', 'retriever', 'grass', 'lawn', 'field', 'running', 'park'],
    description: 'Happy golden retriever dog energetically running across a lush green lawn in the park.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="sky_grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#bae6fd"/>
        </linearGradient>
      </defs>
      <rect width="600" height="230" fill="url(#sky_grad)"/>
      <rect y="230" width="600" height="170" fill="#22c55e"/>
      <circle cx="500" cy="80" r="35" fill="#fef08a"/>
      <!-- Dog body -->
      <ellipse cx="280" cy="220" rx="85" ry="45" fill="#f59e0b"/>
      <circle cx="360" cy="180" r="38" fill="#fbbf24"/>
      <!-- Ears & nose -->
      <path d="M360,165 Q390,195 380,215 Z" fill="#d97706"/>
      <ellipse cx="388" cy="188" rx="8" ry="6" fill="#1e293b"/>
      <!-- Legs -->
      <rect x="220" y="245" width="16" height="45" rx="8" fill="#d97706"/>
      <rect x="250" y="245" width="16" height="45" rx="8" fill="#d97706"/>
      <rect x="310" y="245" width="16" height="45" rx="8" fill="#d97706"/>
      <rect x="340" y="245" width="16" height="45" rx="8" fill="#d97706"/>
      <!-- Tail -->
      <path d="M195,210 Q160,170 180,150" stroke="#f59e0b" stroke-width="14" stroke-linecap="round" fill="none"/>
      <text x="300" y="380" font-family="sans-serif" font-size="16" fill="#14532d" text-anchor="middle" font-weight="bold">Dog Running on Grass</text>
    </svg>`,
    exif: {
      cameraMake: 'Apple',
      cameraModel: 'iPhone 15 Pro',
      fNumber: 1.78,
      exposureTime: '1/1250s',
      iso: 80,
      focalLength: '24mm'
    }
  },
  {
    id: 'seed_mountain_sunset_03',
    fileName: 'alpine_sunset_mountains.heic',
    fileExtension: 'heic',
    fileSize: 2190800,
    width: 5464,
    height: 3640,
    captureDateOffsetDays: 12,
    tags: ['mountain', 'mountains', 'peak', 'alps', 'sunset', 'golden hour', 'sky', 'clouds', 'range'],
    description: 'Dramatic snow-capped mountain range under a brilliant orange, pink and violet sunset sky.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="sunset_sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4c1d95"/>
          <stop offset="40%" stop-color="#c026d3"/>
          <stop offset="70%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#fbbf24"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#sunset_sky)"/>
      <circle cx="300" cy="270" r="60" fill="#fef08a" opacity="0.9"/>
      <!-- Mountain silhouettes -->
      <polygon points="40,360 180,180 320,360" fill="#1e1b4b" opacity="0.9"/>
      <polygon points="180,180 220,230 180,240 140,230" fill="#f8fafc" opacity="0.8"/>
      <polygon points="200,400 370,140 540,400" fill="#0f172a"/>
      <polygon points="370,140 420,210 370,220 320,210" fill="#f8fafc" opacity="0.9"/>
      <polygon points="0,400 120,250 240,400" fill="#312e81"/>
      <text x="300" y="380" font-family="sans-serif" font-size="16" fill="#fef08a" text-anchor="middle" font-weight="bold">Mountain Sunset Alpine Range</text>
    </svg>`,
    exif: {
      cameraMake: 'Fujifilm',
      cameraModel: 'X-T5',
      fNumber: 8.0,
      exposureTime: '1/60s',
      iso: 160,
      focalLength: '35mm'
    }
  },
  {
    id: 'seed_birthday_cake_04',
    fileName: 'chocolate_birthday_cake.jpg',
    fileExtension: 'jpg',
    fileSize: 2890450,
    width: 3000,
    height: 3000,
    captureDateOffsetDays: 1,
    tags: ['cake', 'birthday', 'celebration', 'candles', 'dessert', 'frosting', 'chocolate', 'party'],
    description: 'Decadent multi-layered chocolate birthday cake with burning candles and decorative berries.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#1c1917"/>
      <!-- Plate -->
      <ellipse cx="300" cy="330" rx="190" ry="40" fill="#f5f5f4"/>
      <!-- Cake Base -->
      <rect x="180" y="210" width="240" height="100" rx="10" fill="#451a03"/>
      <!-- Frosting Layer -->
      <rect x="175" y="195" width="250" height="25" rx="8" fill="#78350f"/>
      <ellipse cx="300" cy="195" rx="125" ry="30" fill="#92400e"/>
      <!-- Candles -->
      <g>
        <rect x="230" y="125" width="8" height="50" rx="2" fill="#38bdf8"/>
        <path d="M234,110 Q242,120 234,125 Q226,120 234,110 Z" fill="#f59e0b"/>
        
        <rect x="296" y="115" width="8" height="60" rx="2" fill="#ec4899"/>
        <path d="M300,100 Q308,110 300,115 Q292,110 300,100 Z" fill="#f59e0b"/>
        
        <rect x="362" y="125" width="8" height="50" rx="2" fill="#a855f7"/>
        <path d="M366,110 Q374,120 366,125 Q358,120 366,110 Z" fill="#f59e0b"/>
      </g>
      <text x="300" y="380" font-family="sans-serif" font-size="16" fill="#fde047" text-anchor="middle" font-weight="bold">Birthday Cake with Candles</text>
    </svg>`,
    exif: {
      cameraMake: 'Canon',
      cameraModel: 'EOS R6 Mark II',
      fNumber: 2.0,
      exposureTime: '1/160s',
      iso: 400,
      focalLength: '85mm'
    }
  },
  {
    id: 'seed_sports_car_05',
    fileName: 'red_sports_supercar.webp',
    fileExtension: 'webp',
    fileSize: 1820400,
    width: 3840,
    height: 2160,
    captureDateOffsetDays: 18,
    tags: ['car', 'sports', 'vehicle', 'automobile', 'racing', 'red', 'highway', 'speed', 'supercar'],
    description: 'High performance vibrant red exotic sports car cruising at speed on an open coastal highway.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="240" fill="#0f172a"/>
      <rect y="240" width="600" height="160" fill="#334155"/>
      <!-- Car Body -->
      <path d="M120,260 L180,210 L330,195 L440,225 L500,260 L480,285 L130,285 Z" fill="#dc2626"/>
      <path d="M220,210 L320,200 L410,225 L230,225 Z" fill="#0284c7" opacity="0.8"/>
      <!-- Wheels -->
      <circle cx="190" cy="285" r="32" fill="#0f172a"/>
      <circle cx="190" cy="285" r="18" fill="#94a3b8"/>
      <circle cx="430" cy="285" r="32" fill="#0f172a"/>
      <circle cx="430" cy="285" r="18" fill="#94a3b8"/>
      <text x="300" y="360" font-family="sans-serif" font-size="16" fill="#fca5a5" text-anchor="middle" font-weight="bold">Red Sports Car on Highway</text>
    </svg>`,
    exif: {
      cameraMake: 'Nikon',
      cameraModel: 'Z8',
      fNumber: 4.0,
      exposureTime: '1/2000s',
      iso: 100,
      focalLength: '70mm'
    }
  },
  {
    id: 'seed_coffee_book_06',
    fileName: 'rustic_coffee_book.jpg',
    fileExtension: 'jpg',
    fileSize: 3105000,
    width: 3200,
    height: 2400,
    captureDateOffsetDays: 3,
    tags: ['coffee', 'cup', 'mug', 'book', 'reading', 'wooden', 'table', 'rustic', 'tea', 'warm'],
    description: 'Hot porcelain mug of coffee with delicate latte art resting beside an open hardcover book on oak wood.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#78350f"/>
      <!-- Table grain highlights -->
      <line x1="0" y1="100" x2="600" y2="105" stroke="#92400e" stroke-width="3"/>
      <line x1="0" y1="250" x2="600" y2="255" stroke="#92400e" stroke-width="3"/>
      <!-- Open book -->
      <polygon points="120,280 270,300 270,180 120,160" fill="#fef3c7"/>
      <polygon points="270,300 420,280 420,160 270,180" fill="#fde68a"/>
      <!-- Coffee mug -->
      <ellipse cx="480" cy="220" rx="45" ry="30" fill="#f8fafc"/>
      <ellipse cx="480" cy="216" rx="38" ry="24" fill="#451a03"/>
      <ellipse cx="480" cy="216" rx="20" ry="12" fill="#d97706" opacity="0.6"/>
      <path d="M525,210 Q550,220 525,235" stroke="#f8fafc" stroke-width="8" fill="none"/>
      <text x="300" y="380" font-family="sans-serif" font-size="16" fill="#fef3c7" text-anchor="middle" font-weight="bold">Coffee Mug with Open Book</text>
    </svg>`,
    exif: {
      cameraMake: 'Leica',
      cameraModel: 'Q3',
      fNumber: 1.7,
      exposureTime: '1/125s',
      iso: 320,
      focalLength: '28mm'
    }
  },
  {
    id: 'seed_snowy_peaks_07',
    fileName: 'snowy_mountain_peaks.png',
    fileExtension: 'png',
    fileSize: 4500120,
    width: 4000,
    height: 3000,
    captureDateOffsetDays: 30,
    tags: ['snow', 'snowy', 'alps', 'mountain', 'peaks', 'winter', 'frost', 'pine', 'nature'],
    description: 'Crisp blue winter sky over majestic snow-covered jagged alpine peaks and pine forest.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="240" fill="#0284c7"/>
      <polygon points="50,300 220,110 390,300" fill="#e0f2fe"/>
      <polygon points="220,110 260,160 220,180 180,160" fill="#ffffff"/>
      <polygon points="260,320 420,130 580,320" fill="#f0f9ff"/>
      <rect y="290" width="600" height="110" fill="#0f172a"/>
      <!-- Pine trees -->
      <polygon points="120,290 140,240 160,290" fill="#14532d"/>
      <polygon points="180,300 200,230 220,300" fill="#166534"/>
      <polygon points="320,300 340,225 360,300" fill="#14532d"/>
      <text x="300" y="380" font-family="sans-serif" font-size="16" fill="#e0f2fe" text-anchor="middle" font-weight="bold">Snowy Alpine Peaks & Pines</text>
    </svg>`,
    exif: {
      cameraMake: 'Sony',
      cameraModel: 'ILCE-7M4',
      fNumber: 5.6,
      exposureTime: '1/800s',
      iso: 100,
      focalLength: '70mm'
    }
  },
  {
    id: 'seed_neon_city_08',
    fileName: 'cyberpunk_neon_city.webp',
    fileExtension: 'webp',
    fileSize: 2200500,
    width: 3840,
    height: 2160,
    captureDateOffsetDays: 8,
    tags: ['city', 'cityscape', 'cyberpunk', 'neon', 'lights', 'night', 'futuristic', 'tokyo'],
    description: 'Vibrant neon-drenched futuristic cyberpunk metropolis at midnight with glowing holographic signs.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#09090b"/>
      <!-- Neon Skyscrapers -->
      <rect x="60" y="120" width="90" height="280" fill="#18181b" stroke="#06b6d4" stroke-width="2"/>
      <rect x="180" y="80" width="110" height="320" fill="#27272a" stroke="#ec4899" stroke-width="2"/>
      <rect x="320" y="140" width="85" height="260" fill="#18181b" stroke="#a855f7" stroke-width="2"/>
      <rect x="430" y="100" width="120" height="300" fill="#27272a" stroke="#f43f5e" stroke-width="2"/>
      <!-- Neon lines -->
      <line x1="0" y1="360" x2="600" y2="360" stroke="#06b6d4" stroke-width="4"/>
      <line x1="0" y1="380" x2="600" y2="380" stroke="#ec4899" stroke-width="3"/>
      <text x="300" y="50" font-family="sans-serif" font-size="18" fill="#38bdf8" text-anchor="middle" font-weight="bold">CYBERPUNK NEON CITY</text>
    </svg>`,
    exif: {
      cameraMake: 'Fujifilm',
      cameraModel: 'X100V',
      fNumber: 2.0,
      exposureTime: '1/60s',
      iso: 1600,
      focalLength: '23mm'
    }
  },
  {
    id: 'seed_sleeping_cat_09',
    fileName: 'cat_sunlight_nap.heic',
    fileExtension: 'heic',
    fileSize: 2600400,
    width: 4032,
    height: 3024,
    captureDateOffsetDays: 4,
    tags: ['cat', 'kitten', 'sleeping', 'couch', 'sunlight', 'pet', 'animal', 'feline', 'nap'],
    description: 'Gentle domestic cat sleeping curled up on a soft living room sofa in a warm patch of afternoon sunlight.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#3f3f46"/>
      <!-- Couch -->
      <rect x="80" y="200" width="440" height="150" rx="20" fill="#71717a"/>
      <!-- Sunlight ray -->
      <polygon points="100,0 260,0 380,400 200,400" fill="#fef08a" opacity="0.3"/>
      <!-- Sleeping cat -->
      <ellipse cx="280" cy="260" rx="65" ry="40" fill="#fb923c"/>
      <circle cx="340" cy="245" r="28" fill="#f97316"/>
      <!-- Ears -->
      <polygon points="330,225 345,200 355,225" fill="#ea580c"/>
      <polygon points="350,225 365,205 370,228" fill="#ea580c"/>
      <!-- Curled tail -->
      <path d="M220,265 Q190,290 230,300" stroke="#f97316" stroke-width="12" stroke-linecap="round" fill="none"/>
      <text x="300" y="380" font-family="sans-serif" font-size="16" fill="#fed7aa" text-anchor="middle" font-weight="bold">Sleeping Cat in Sunlight</text>
    </svg>`,
    exif: {
      cameraMake: 'Apple',
      cameraModel: 'iPhone 15 Pro Max',
      fNumber: 2.8,
      exposureTime: '1/250s',
      iso: 64,
      focalLength: '120mm'
    }
  },
  {
    id: 'seed_cozy_cabin_10',
    fileName: 'cozy_winter_cabin.jpg',
    fileExtension: 'jpg',
    fileSize: 3750000,
    width: 4000,
    height: 2667,
    captureDateOffsetDays: 45,
    tags: ['cabin', 'cozy', 'winter', 'forest', 'fireplace', 'woods', 'timber', 'snowfall'],
    description: 'Rustic wooden log cabin nestled deep inside an evergreen pine forest blanketed in fresh winter snow.',
    svgPlaceholder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="260" fill="#1e293b"/>
      <rect y="260" width="600" height="140" fill="#f1f5f9"/>
      <!-- Cabin -->
      <polygon points="210,180 300,100 390,180" fill="#451a03"/>
      <rect x="220" y="180" width="160" height="100" fill="#78350f"/>
      <rect x="240" y="200" width="35" height="40" fill="#fef08a"/>
      <rect x="305" y="210" width="40" height="70" fill="#3e2723"/>
      <!-- Chimney with smoke -->
      <rect x="340" y="90" width="20" height="40" fill="#78716c"/>
      <path d="M350,85 Q360,60 345,45 Q360,25 350,10" stroke="#cbd5e1" stroke-width="6" fill="none" opacity="0.6"/>
      <text x="300" y="380" font-family="sans-serif" font-size="16" fill="#334155" text-anchor="middle" font-weight="bold">Cozy Winter Cabin in Snow</text>
    </svg>`,
    exif: {
      cameraMake: 'Nikon',
      cameraModel: 'Z7 II',
      fNumber: 4.5,
      exposureTime: '1/320s',
      iso: 200,
      focalLength: '45mm'
    }
  }
];

/**
 * Transforms seed definitions into populated MediaItem entities with authentic 512-dim embeddings.
 */
export function generateSeedMediaItems(): MediaItem[] {
  return SEED_DEFINITIONS.map(def => {
    // Generate authentic 512-dimensional embedding
    const embedding = mockClipEngine.generateImageEmbedding(def.tags, def.fileName);
    const captureDate = NOW - def.captureDateOffsetDays * ONE_DAY_MS;

    // Convert SVG to data URI for instant rendering
    const svgEncoded = encodeURIComponent(def.svgPlaceholder.trim());
    const thumbnailUri = `data:image/svg+xml;utf8,${svgEncoded}`;

    return {
      id: def.id,
      filePath: `/local/storage/DCIM/Camera/${def.fileName}`,
      fileName: def.fileName,
      fileExtension: def.fileExtension,
      fileSize: def.fileSize,
      width: def.width,
      height: def.height,
      captureDate,
      indexedAt: NOW,
      embedding,
      tags: def.tags,
      thumbnailUri,
      exif: def.exif
    };
  });
}
