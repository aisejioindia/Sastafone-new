/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive 91mobiles-grounded mobile phones database
 * Covers all 24 brands from the user reference:
 * Samsung, Motorola, Vivo, Oppo, Tecno, Realme, Xiaomi, OnePlus, iQOO, POCO,
 * Apple, Nothing, Google, Infinix, Lava, CMF, Honor, Micromax, Alcatel,
 * Huawei, BlackBerry, Asus, Nubia, LG (Nokia removed per user request).
 */

import { PhoneModel } from '../types';

export const COMPREHENSIVE_PHONE_MODELS: PhoneModel[] = [
  // ==========================================
  // 1. SAMSUNG (91mobiles Top Tracked Brand)
  // ==========================================
  {
    id: 'samsung-galaxy-s24-ultra',
    brandId: 'samsung',
    name: 'Samsung Galaxy S24 Ultra 5G',
    baseValuation: 72000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 97,
    processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
    display: '6.8" QHD+ Dynamic AMOLED 2X, 120Hz, 2600 nits',
    camera: '200MP Quad OIS + 50MP 5x Periscope + 12MP Ultra-wide',
    battery: '5000 mAh, 45W Fast Charging',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 6500 },
      { ram: '12 GB', storage: '1 TB', priceModifier: 14000 }
    ],
    colors: [
      { name: 'Titanium Gray', hex: '#64748b' },
      { name: 'Titanium Black', hex: '#1e293b' },
      { name: 'Titanium Violet', hex: '#7c3aed' },
      { name: 'Titanium Yellow', hex: '#eab308' }
    ]
  },
  {
    id: 'samsung-galaxy-s24-plus',
    brandId: 'samsung',
    name: 'Samsung Galaxy S24+ 5G',
    baseValuation: 56000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 95,
    processor: 'Exynos 2400 / Snapdragon 8 Gen 3',
    display: '6.7" QHD+ Dynamic AMOLED 2X, 120Hz',
    camera: '50MP OIS Triple Camera + 12MP Ultra-wide',
    battery: '4900 mAh, 45W Fast Charging',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 5000 }
    ],
    colors: [
      { name: 'Onyx Black', hex: '#09090b' },
      { name: 'Marble Gray', hex: '#94a3b8' },
      { name: 'Cobalt Violet', hex: '#6b21a8' }
    ]
  },
  {
    id: 'samsung-galaxy-s24',
    brandId: 'samsung',
    name: 'Samsung Galaxy S24 5G (Compact AI Flagship)',
    baseValuation: 46000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 93,
    processor: 'Exynos 2400 10-Core / Galaxy AI',
    display: '6.2" FHD+ Dynamic AMOLED 2X, 120Hz',
    camera: '50MP OIS + 10MP 3x Telephoto + 12MP Ultra-wide',
    battery: '4000 mAh, 25W Fast Charging',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 4000 }
    ],
    colors: [
      { name: 'Amber Yellow', hex: '#fde047' },
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Marble Gray', hex: '#94a3b8' }
    ]
  },
  {
    id: 'samsung-galaxy-z-fold6',
    brandId: 'samsung',
    name: 'Samsung Galaxy Z Fold6 5G',
    baseValuation: 88000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 96,
    processor: 'Snapdragon 8 Gen 3 for Galaxy',
    display: '7.6" Main Foldable + 6.3" Cover AMOLED, 120Hz',
    camera: '50MP Triple OIS with AI ProVisual Engine',
    battery: '4400 mAh, 25W Fast Charging',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 7000 }
    ],
    colors: [
      { name: 'Silver Shadow', hex: '#94a3b8' },
      { name: 'Navy Blue', hex: '#1e3a8a' },
      { name: 'Pink', hex: '#f472b6' }
    ]
  },
  {
    id: 'samsung-galaxy-z-flip6',
    brandId: 'samsung',
    name: 'Samsung Galaxy Z Flip6 5G',
    baseValuation: 58000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 94,
    processor: 'Snapdragon 8 Gen 3 with Vapor Chamber',
    display: '6.7" Dynamic AMOLED 2X + 3.4" FlexWindow Cover',
    camera: '50MP Dual Camera with Auto Zoom AI',
    battery: '4000 mAh, 25W Fast Charging',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 6000 }
    ],
    colors: [
      { name: 'Mint', hex: '#a7f3d0' },
      { name: 'Blue', hex: '#60a5fa' },
      { name: 'Silver Shadow', hex: '#94a3b8' }
    ]
  },
  {
    id: 'samsung-galaxy-s23-ultra',
    brandId: 'samsung',
    name: 'Samsung Galaxy S23 Ultra 5G',
    baseValuation: 52000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 96,
    processor: 'Snapdragon 8 Gen 2 for Galaxy',
    display: '6.8" Edge QHD+ Dynamic AMOLED 2X, 120Hz',
    camera: '200MP OIS + 10x Optical Periscope + S-Pen',
    battery: '5000 mAh, 45W Fast Charging',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 5000 }
    ],
    colors: [
      { name: 'Phantom Black', hex: '#0f172a' },
      { name: 'Green', hex: '#14532d' },
      { name: 'Cream', hex: '#fef3c7' }
    ]
  },
  {
    id: 'samsung-galaxy-a55-5g',
    brandId: 'samsung',
    name: 'Samsung Galaxy A55 5G (Metal Frame & Knox Vault)',
    baseValuation: 23500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 85,
    processor: 'Exynos 1480 (AMD Xclipse 530 GPU)',
    display: '6.6" Super AMOLED, 120Hz, Gorilla Glass Victus+',
    camera: '50MP OIS Triple Camera + 12MP Ultra-wide',
    battery: '5000 mAh, 25W Fast Charging',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 2000 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 3500 }
    ],
    colors: [
      { name: 'Awesome Iceblue', hex: '#bae6fd' },
      { name: 'Awesome Navy', hex: '#1e293b' },
      { name: 'Awesome Lilac', hex: '#e9d5ff' }
    ]
  },
  {
    id: 'samsung-galaxy-m55-5g',
    brandId: 'samsung',
    name: 'Samsung Galaxy M55 5G (Super Slim Monster)',
    baseValuation: 17000,
    imageUrl: '',
    category: 'midrange',
    specScore: 82,
    processor: 'Snapdragon 7 Gen 1 (4nm)',
    display: '6.7" Super AMOLED Plus, 120Hz, 1000 nits',
    camera: '50MP OIS + 50MP High-Res Selfie Camera',
    battery: '5000 mAh, 45W Super Fast Charging 2.0',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 1800 }
    ],
    colors: [
      { name: 'Denim Black', hex: '#1e293b' },
      { name: 'Light Green', hex: '#86efac' }
    ]
  },

  // ==========================================
  // 2. MOTOROLA (91mobiles Trending Edge & G Series)
  // ==========================================
  {
    id: 'moto-edge-50-ultra',
    brandId: 'motorola',
    name: 'Motorola Edge 50 Ultra 5G (Real Wood / Pantone Leather)',
    baseValuation: 39000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 93,
    processor: 'Snapdragon 8s Gen 3 + Moto AI',
    display: '6.7" 1.5K 144Hz 3D Curved pOLED, 2500 nits',
    camera: '50MP OIS + 64MP 3x Periscope + 50MP Ultra-wide',
    battery: '4500 mAh, 125W TurboPower + 50W Wireless',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '16 GB', storage: '512 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Nordic Wood', hex: '#b45309' },
      { name: 'Peach Fuzz (Pantone)', hex: '#fb923c' },
      { name: 'Forest Grey', hex: '#334155' }
    ]
  },
  {
    id: 'moto-edge-50-pro',
    brandId: 'motorola',
    name: 'Motorola Edge 50 Pro 5G (125W Fast Charge & IP68)',
    baseValuation: 24500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 89,
    processor: 'Snapdragon 7 Gen 3 (4nm)',
    display: '6.7" 1.5K 144Hz Curved pOLED, Pantone Validated',
    camera: '50MP f/1.4 OIS + 10MP 3x Telephoto + 50MP Selfie',
    battery: '4500 mAh, 125W TurboPower + 50W Wireless',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Luxe Lavender', hex: '#c084fc' },
      { name: 'Black Beauty', hex: '#09090b' },
      { name: 'Moonlight Pearl', hex: '#f8fafc' }
    ]
  },
  {
    id: 'moto-edge-50-fusion',
    brandId: 'motorola',
    name: 'Motorola Edge 50 Fusion 5G (Sony LYTIA 700C OIS)',
    baseValuation: 16500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 85,
    processor: 'Snapdragon 7s Gen 2 (4nm)',
    display: '6.67" 144Hz 3D Curved pOLED, Gorilla Glass 5',
    camera: '50MP Sony LYT-700C OIS + 13MP Macro/Ultra-wide',
    battery: '5000 mAh, 68W TurboPower, IP68 Underwater',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Marshmallow Blue (Vegan Suede)', hex: '#38bdf8' },
      { name: 'Hot Pink', hex: '#ec4899' },
      { name: 'Forest Blue', hex: '#0f172a' }
    ]
  },
  {
    id: 'moto-g85-5g',
    brandId: 'motorola',
    name: 'Moto G85 5G (Segment 1st 3D Curved 120Hz Display)',
    baseValuation: 12500,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 82,
    processor: 'Snapdragon 6s Gen 3 (6nm)',
    display: '6.67" 120Hz Curved pOLED, 1600 nits Peak',
    camera: '50MP Sony LYT-600 OIS + 8MP Ultra-wide/Macro',
    battery: '5000 mAh, 33W TurboPower',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 1500 }
    ],
    colors: [
      { name: 'Cobalt Blue (Vegan Leather)', hex: '#1d4ed8' },
      { name: 'Olive Green', hex: '#65a30d' },
      { name: 'Urban Grey', hex: '#334155' }
    ]
  },

  // ==========================================
  // 3. VIVO (Zeiss Optics, V-Series & T-Series King)
  // ==========================================
  {
    id: 'vivo-x100-pro',
    brandId: 'vivo',
    name: 'Vivo X100 Pro 5G (Zeiss 1-inch & APO Telephoto)',
    baseValuation: 54000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 96,
    processor: 'Dimensity 9300 (4nm) + Vivo V3 Pro Imaging Chip',
    display: '6.78" 1.5K 120Hz LTPO AMOLED, 3000 nits',
    camera: '50MP 1-inch Sony IMX989 OIS + 50MP Zeiss APO Telephoto',
    battery: '5400 mAh, 100W FlashCharge + 50W Wireless',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '16 GB', storage: '512 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Sunset Orange', hex: '#ea580c' },
      { name: 'Asteroid Black', hex: '#0f172a' }
    ]
  },
  {
    id: 'vivo-v40-pro',
    brandId: 'vivo',
    name: 'Vivo V40 Pro 5G (Zeiss Multifocal Portrait Lens)',
    baseValuation: 34000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 89,
    processor: 'Dimensity 9200+ (4nm Flagship)',
    display: '6.78" 1.5K 120Hz 3D Curved AMOLED, 4500 nits',
    camera: '50MP Sony IMX921 OIS + 50MP Sony IMX816 Telephoto + 50MP Selfie',
    battery: '5500 mAh BlueVolt Battery, 80W FlashCharge, IP68',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Ganges Blue', hex: '#0284c7' },
      { name: 'Titanium Grey', hex: '#475569' }
    ]
  },
  {
    id: 'vivo-v40',
    brandId: 'vivo',
    name: 'Vivo V40 5G (Zeiss Ultra-Slim 5500mAh & IP68)',
    baseValuation: 26000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 86,
    processor: 'Snapdragon 7 Gen 3 (4nm)',
    display: '6.78" 1.5K 120Hz Curved AMOLED, 4500 nits',
    camera: '50MP Zeiss OIS + 50MP Zeiss Ultra-wide + 50MP Selfie',
    battery: '5500 mAh, 80W FlashCharge, IP68 Water & Dust Resistant',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 2000 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 4000 }
    ],
    colors: [
      { name: 'Lotus Purple', hex: '#c084fc' },
      { name: 'Ganges Blue', hex: '#38bdf8' },
      { name: 'Titanium Grey', hex: '#334155' }
    ]
  },
  {
    id: 'vivo-t3-ultra',
    brandId: 'vivo',
    name: 'Vivo T3 Ultra 5G (Dimensity 9200+ Flagship Speed)',
    baseValuation: 22000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 88,
    processor: 'Dimensity 9200+ (Score 1.6M+)',
    display: '6.78" 1.5K 120Hz 3D Curved AMOLED, 4500 nits',
    camera: '50MP Sony IMX921 OIS + 8MP Ultra-wide + Aura Light',
    battery: '5500 mAh, 80W FlashCharge, IP68',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 1500 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Lunar Gray', hex: '#64748b' },
      { name: 'Frost Green', hex: '#86efac' }
    ]
  },
  {
    id: 'vivo-t3x-5g',
    brandId: 'vivo',
    name: 'Vivo T3x 5G (6000mAh Monster Battery)',
    baseValuation: 10500,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 80,
    processor: 'Snapdragon 6 Gen 1 (4nm)',
    display: '6.72" 120Hz FHD+ Ultra Vision, 1000 nits',
    camera: '50MP HD Dual Camera + 8MP Selfie',
    battery: '6000 mAh, 44W Fast Charging, Dual Stereo Speakers',
    is5G: true,
    variants: [
      { ram: '4 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '6 GB', storage: '128 GB', priceModifier: 1000 },
      { ram: '8 GB', storage: '128 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Crimson Bliss', hex: '#991b1b' },
      { name: 'Celestial Green', hex: '#166534' }
    ]
  },

  // ==========================================
  // 4. OPPO (Reno AI Series & F27 Armour King)
  // ==========================================
  {
    id: 'oppo-reno-12-pro',
    brandId: 'oppo',
    name: 'Oppo Reno 12 Pro 5G (AI Portrait Camera & Quad Curved)',
    baseValuation: 28000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 88,
    processor: 'MediaTek Dimensity 7300-Energy (4nm)',
    display: '6.7" Quad Curved 120Hz AMOLED, Gorilla Glass Victus 2',
    camera: '50MP Sony LYT-600 OIS + 50MP 2x Telephoto + 50MP AF Selfie',
    battery: '5000 mAh, 80W SUPERVOOC, IP65 Waterproof',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Sunset Gold', hex: '#d97706' },
      { name: 'Space Brown', hex: '#451a03' }
    ]
  },
  {
    id: 'oppo-f27-pro-plus',
    brandId: 'oppo',
    name: 'Oppo F27 Pro+ 5G (India 1st IP69 Waterproof Rugged Phone)',
    baseValuation: 20500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 84,
    processor: 'Dimensity 7050 (6nm) with 360 Armour Body',
    display: '6.7" 120Hz 3D Curved AMOLED, Gorilla Glass Victus 2',
    camera: '64MP Ultra-Clear Dual Camera + 8MP Selfie',
    battery: '5000 mAh, 67W SUPERVOOC, Swiss SGS Military Standard',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Dusk Pink (Leather)', hex: '#f43f5e' },
      { name: 'Midnight Navy (Leather)', hex: '#1e3a8a' }
    ]
  },
  {
    id: 'oppo-find-n3-flip',
    brandId: 'oppo',
    name: 'Oppo Find N3 Flip 5G (Hasselblad Triple Camera Flip)',
    baseValuation: 48000,
    imageUrl: '',
    category: 'flagship',
    specScore: 94,
    processor: 'Dimensity 9200 (4nm Flagship)',
    display: '6.8" 120Hz LTPO Foldable + 3.26" Vertical Intuitive Cover',
    camera: '50MP Sony IMX890 OIS + 32MP Telephoto + 48MP Ultra-wide',
    battery: '4300 mAh, 44W SUPERVOOC',
    is5G: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Cream Gold', hex: '#fef3c7' },
      { name: 'Sleek Black', hex: '#0f172a' }
    ]
  },

  // ==========================================
  // 5. TECNO (Camon 30 & Pova 6 Gaming Battery King)
  // ==========================================
  {
    id: 'tecno-camon-30-premier',
    brandId: 'tecno',
    name: 'Tecno Camon 30 Premier 5G (Quad 50MP Sony Imaging)',
    baseValuation: 27000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 86,
    processor: 'Dimensity 8200 Ultimate 4nm + PolarAce Chip',
    display: '6.77" 1.5K 120Hz LTPO AMOLED, 1400 nits',
    camera: '50MP Sony IMX890 OIS + 50MP 3x Periscope + 50MP Ultra-wide + 50MP Eye-AF Selfie',
    battery: '5000 mAh, 70W Ultra Charge, Dual Stereo Dolby Atmos',
    is5G: true,
    variants: [
      { ram: '12 GB', storage: '512 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Alps Snowy Silver', hex: '#e2e8f0' },
      { name: 'Hawaii Lava Black', hex: '#18181b' }
    ]
  },
  {
    id: 'tecno-pova-6-pro',
    brandId: 'tecno',
    name: 'Tecno Pova 6 Pro 5G (6000mAh & Arc Interface LED)',
    baseValuation: 14000,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 83,
    processor: 'MediaTek Dimensity 6080 5G',
    display: '6.78" 120Hz AMOLED, 1300 nits, Dynamic Port',
    camera: '108MP Ultra-Clear Triple Camera + 32MP Selfie with Flash',
    battery: '6000 mAh, 70W Ultra Charge + 10W Reverse Wired',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 1500 }
    ],
    colors: [
      { name: 'Comet Green', hex: '#16a34a' },
      { name: 'Meteorite Grey', hex: '#334155' }
    ]
  },

  // ==========================================
  // 6. REALME (GT 6 Flagship Killer & 13 Pro+ Monet AI)
  // ==========================================
  {
    id: 'realme-gt-6',
    brandId: 'realme',
    name: 'Realme GT 6 5G (Snapdragon 8s Gen 3 & 6000 nits)',
    baseValuation: 32000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 92,
    processor: 'Snapdragon 8s Gen 3 (Score 1.65M+)',
    display: '6.78" 8T 120Hz LTPO AMOLED, 6000 nits Record Peak',
    camera: '50MP Sony LYT-808 OIS + 50MP 2x Telephoto + 8MP Ultra-wide',
    battery: '5500 mAh, 120W SUPERVOOC Charge in 26 Mins',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 2500 },
      { ram: '16 GB', storage: '512 GB', priceModifier: 5000 }
    ],
    colors: [
      { name: 'Fluid Silver', hex: '#cbd5e1' },
      { name: 'Razor Green', hex: '#065f46' }
    ]
  },
  {
    id: 'realme-13-pro-plus',
    brandId: 'realme',
    name: 'Realme 13 Pro+ 5G (Monet Inspired Dual Sony OIS)',
    baseValuation: 23500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 88,
    processor: 'Snapdragon 7s Gen 2 with HYPERIMAGE+ AI',
    display: '6.7" 120Hz Curved Vision AMOLED, Corning Gorilla Glass 7i',
    camera: '50MP Sony LYT-701 OIS + 50MP Sony LYT-600 3x Periscope',
    battery: '5200 mAh, 80W SUPERVOOC, Swiss SGS Drop Resistance',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 2500 }
    ],
    colors: [
      { name: 'Monet Gold', hex: '#d97706' },
      { name: 'Monet Purple', hex: '#9333ea' },
      { name: 'Emerald Green (Leather)', hex: '#15803d' }
    ]
  },
  {
    id: 'realme-narzo-70-pro',
    brandId: 'realme',
    name: 'Realme Narzo 70 Pro 5G (Sony IMX890 OIS & Air Gestures)',
    baseValuation: 14500,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 82,
    processor: 'MediaTek Dimensity 7050 5G',
    display: '6.67" 120Hz FHD+ AMOLED, 2000 nits, Rainwater Touch',
    camera: '50MP Sony IMX890 Flagship OIS Sensor + 16MP Selfie',
    battery: '5000 mAh, 67W SUPERVOOC Charge',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 1500 }
    ],
    colors: [
      { name: 'Glass Green', hex: '#14532d' },
      { name: 'Glass Gold', hex: '#ca8a04' }
    ]
  },

  // ==========================================
  // 7. XIAOMI / REDMI (14 Ultra, 14 Civi & Note Series)
  // ==========================================
  {
    id: 'xiaomi-14-ultra',
    brandId: 'xiaomi',
    name: 'Xiaomi 14 Ultra (Leica Quad 50MP Stepless Aperture)',
    baseValuation: 55000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 98,
    processor: 'Snapdragon 8 Gen 3 (4nm)',
    display: '6.73" WQHD+ 120Hz All Around Liquid AMOLED, 3000 nits',
    camera: '50MP 1-inch LYT-900 Variable f/1.63-f/4.0 OIS + 3x & 5x Dual Leica Periscope',
    battery: '5000 mAh, 90W HyperCharge + 80W Wireless',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '16 GB', storage: '512 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Titanium Black Leather', hex: '#18181b' },
      { name: 'White Vegan Leather', hex: '#f4f4f5' }
    ]
  },
  {
    id: 'xiaomi-14-civi',
    brandId: 'xiaomi',
    name: 'Xiaomi 14 Civi (Leica Summilux & Dual 32MP Selfie)',
    baseValuation: 27000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 89,
    processor: 'Snapdragon 8s Gen 3 (Score 1.5M+)',
    display: '6.55" 1.5K 120Hz Floating Quad-Curve AMOLED, 3000 nits',
    camera: '50MP Leica Summilux OIS + 50MP 2x Telephoto + Dual 32MP AI Selfie',
    battery: '4700 mAh, 67W Turbo Charge',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Matcha Green (Vegan Leather)', hex: '#84cc16' },
      { name: 'Cruise Blue', hex: '#0284c7' },
      { name: 'Shadow Black', hex: '#09090b' }
    ]
  },
  {
    id: 'redmi-note-13-pro-plus',
    brandId: 'xiaomi',
    name: 'Redmi Note 13 Pro+ 5G (200MP OIS & IP68 Curved)',
    baseValuation: 19500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 87,
    processor: 'MediaTek Dimensity 7200-Ultra (4nm)',
    display: '6.67" 1.5K 120Hz 3D Curved AMOLED, 1800 nits, IP68',
    camera: '200MP Samsung ISOCELL HP3 OIS + 8MP Ultra-wide',
    battery: '5000 mAh, 120W HyperCharge in 19 Mins',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 2500 }
    ],
    colors: [
      { name: 'Fusion Purple (Vegan Leather)', hex: '#a855f7' },
      { name: 'Fusion Black', hex: '#18181b' },
      { name: 'Fusion White', hex: '#f8fafc' }
    ]
  },
  {
    id: 'redmi-13-5g',
    brandId: 'xiaomi',
    name: 'Redmi 13 5G (Crystal Glass Design & 108MP)',
    baseValuation: 9500,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 78,
    processor: 'Snapdragon 4 Gen 2 AE (4nm)',
    display: '6.79" 120Hz FHD+ AdaptiveSync, Gorilla Glass 3',
    camera: '108MP 3x In-Sensor Zoom Dual Camera',
    battery: '5030 mAh, 33W Fast Charging',
    is5G: true,
    variants: [
      { ram: '6 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '128 GB', priceModifier: 1200 }
    ],
    colors: [
      { name: 'Hawaiian Blue', hex: '#38bdf8' },
      { name: 'Black Diamond', hex: '#09090b' },
      { name: 'Orchid Pink', hex: '#f472b6' }
    ]
  },

  // ==========================================
  // 8. ONEPLUS (Flagship 12, 12R & Nord 4 All-Metal)
  // ==========================================
  {
    id: 'oneplus-12',
    brandId: 'oneplus',
    name: 'OnePlus 12 5G (4th Gen Hasselblad & Snapdragon 8 Gen 3)',
    baseValuation: 43000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 96,
    processor: 'Snapdragon 8 Gen 3 + Dual Cryo-velocity VC',
    display: '6.82" 2K 120Hz ProXDR LTPO AMOLED, 4500 nits Peak',
    camera: '50MP Sony LYT-808 OIS + 64MP 3x Periscope + 48MP Ultra-wide',
    battery: '5400 mAh, 100W SUPERVOOC + 50W AIRVOOC',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '16 GB', storage: '512 GB', priceModifier: 5000 }
    ],
    colors: [
      { name: 'Flowy Emerald', hex: '#047857' },
      { name: 'Silky Black', hex: '#18181b' }
    ]
  },
  {
    id: 'oneplus-12r',
    brandId: 'oneplus',
    name: 'OnePlus 12R 5G (Snapdragon 8 Gen 2 & 5500mAh)',
    baseValuation: 28000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 91,
    processor: 'Snapdragon 8 Gen 2 (4nm Flagship)',
    display: '6.78" 1.5K 120Hz 4th Gen LTPO AMOLED, 4500 nits',
    camera: '50MP Sony IMX890 OIS Triple Camera + 16MP Selfie',
    battery: '5500 mAh (Largest in OnePlus), 100W SUPERVOOC',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 2000 },
      { ram: '16 GB', storage: '256 GB', priceModifier: 4000 }
    ],
    colors: [
      { name: 'Cool Blue', hex: '#60a5fa' },
      { name: 'Iron Gray', hex: '#374151' },
      { name: 'Sunset Dune', hex: '#f59e0b' }
    ]
  },
  {
    id: 'oneplus-nord-4',
    brandId: 'oneplus',
    name: 'OnePlus Nord 4 5G (Only Metal Unibody 5G in Segment)',
    baseValuation: 22000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 88,
    processor: 'Snapdragon 7+ Gen 3 (4nm)',
    display: '6.74" 1.5K 120Hz Ultra-bright AMOLED, 2150 nits',
    camera: '50MP Sony LYT-600 OIS + 8MP 112° Ultra-wide',
    battery: '5500 mAh, 100W SUPERVOOC Charge in 28 Mins',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 2000 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 4000 }
    ],
    colors: [
      { name: 'Mercurial Silver', hex: '#cbd5e1' },
      { name: 'Oasis Green', hex: '#15803d' },
      { name: 'Obsidian Midnight', hex: '#0f172a' }
    ]
  },
  {
    id: 'oneplus-nord-ce-4',
    brandId: 'oneplus',
    name: 'OnePlus Nord CE 4 5G (Snapdragon 7 Gen 3 & 100W)',
    baseValuation: 16500,
    imageUrl: '',
    category: 'midrange',
    specScore: 85,
    processor: 'Snapdragon 7 Gen 3 (4nm)',
    display: '6.7" 120Hz FHD+ Fluid AMOLED, Aqua Touch',
    camera: '50MP Sony LYT-600 OIS + RAW HDR Algorithm',
    battery: '5500 mAh, 100W SUPERVOOC Fast Charge',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Celadon Marble', hex: '#a7f3d0' },
      { name: 'Dark Chrome', hex: '#1e293b' }
    ]
  },

  // ==========================================
  // 9. iQOO (Gaming & AnTuTu Performance Benchmark)
  // ==========================================
  {
    id: 'iqoo-12-5g',
    brandId: 'iqoo',
    name: 'iQOO 12 5G (BMW M Motorsport & Snapdragon 8 Gen 3)',
    baseValuation: 38000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 96,
    processor: 'Snapdragon 8 Gen 3 + Supercomputing Chip Q1',
    display: '6.78" 1.5K 144Hz LTPO AMOLED, 3000 nits Peak',
    camera: '50MP 1/1.3" Astro OIS + 64MP 3x Periscope + 50MP Ultra-wide',
    battery: '5000 mAh, 120W FlashCharge in 26 Mins',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '16 GB', storage: '512 GB', priceModifier: 4000 }
    ],
    colors: [
      { name: 'Legend (BMW White Tri-Color)', hex: '#f8fafc' },
      { name: 'Alpha Black (Fluorite AG Glass)', hex: '#09090b' }
    ]
  },
  {
    id: 'iqoo-neo-9-pro',
    brandId: 'iqoo',
    name: 'iQOO Neo 9 Pro 5G (Snapdragon 8 Gen 2 & Q1 Gaming Chip)',
    baseValuation: 26000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 93,
    processor: 'Snapdragon 8 Gen 2 (Score 1.7M+)',
    display: '6.78" 1.5K 144Hz LTPO AMOLED, 3000 nits',
    camera: '50MP Sony IMX920 Night OIS + 8MP Ultra-wide',
    battery: '5160 mAh, 120W FlashCharge',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 1500 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Fiery Red (Dual Tone Leather)', hex: '#dc2626' },
      { name: 'Conqueror Black', hex: '#0f172a' }
    ]
  },
  {
    id: 'iqoo-z9s-pro',
    brandId: 'iqoo',
    name: 'iQOO Z9s Pro 5G (Curved 120Hz & 5500mAh Ultra-Bright)',
    baseValuation: 18500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 87,
    processor: 'Snapdragon 7 Gen 3 (4nm)',
    display: '6.77" 120Hz 3D Curved AMOLED, 4500 nits Local Peak',
    camera: '50MP Sony IMX882 OIS + 8MP Ultra-wide + 4K Video',
    battery: '5500 mAh, 80W FlashCharge, IP64',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 1500 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Luxe Marble', hex: '#f1f5f9' },
      { name: 'Flamboyant Orange (Leather)', hex: '#ea580c' }
    ]
  },

  // ==========================================
  // 10. POCO (Performance Flagship & X Series Speed)
  // ==========================================
  {
    id: 'poco-f6',
    brandId: 'poco',
    name: 'POCO F6 5G (Snapdragon 8s Gen 3 & WildBoost 3.0)',
    baseValuation: 23000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 92,
    processor: 'Snapdragon 8s Gen 3 (Score 1.53M+)',
    display: '6.67" 1.5K 120Hz CrystalRes Flow AMOLED, 2400 nits',
    camera: '50MP Sony IMX882 OIS + 8MP Ultra-wide + 20MP Selfie',
    battery: '5000 mAh, 90W Turbo Charge in 35 Mins',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Titanium Glow', hex: '#71717a' },
      { name: 'Classic Black', hex: '#09090b' }
    ]
  },
  {
    id: 'poco-x6-pro',
    brandId: 'poco',
    name: 'POCO X6 Pro 5G (Dimensity 8300 Ultra Speed King)',
    baseValuation: 19500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 89,
    processor: 'Dimensity 8300-Ultra (4nm Flagship Architecture)',
    display: '6.67" 1.5K 120Hz Flow AMOLED, 1800 nits, Dolby Vision',
    camera: '64MP OIS Triple Camera + 8MP Ultra-wide',
    battery: '5000 mAh, 67W Turbo Charge',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 2500 }
    ],
    colors: [
      { name: 'POCO Yellow (Vegan Leather)', hex: '#facc15' },
      { name: 'Spectre Black', hex: '#09090b' },
      { name: 'Racing Grey', hex: '#475569' }
    ]
  },
  {
    id: 'poco-m6-plus',
    brandId: 'poco',
    name: 'POCO M6 Plus 5G (Dual Glass 108MP 5G Budget King)',
    baseValuation: 9000,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 79,
    processor: 'Snapdragon 4 Gen 2 AE (4nm)',
    display: '6.79" 120Hz FHD+ Adaptive Display, Dual-sided Glass',
    camera: '108MP 3x In-Sensor Zoom + 13MP Selfie',
    battery: '5030 mAh, 33W Fast Charge',
    is5G: true,
    variants: [
      { ram: '6 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '128 GB', priceModifier: 1200 }
    ],
    colors: [
      { name: 'Ice Silver', hex: '#e2e8f0' },
      { name: 'Graphite Black', hex: '#18181b' },
      { name: 'Misty Lavender', hex: '#e9d5ff' }
    ]
  },

  // ==========================================
  // 11. APPLE iPHONE (Official iPhone 16 / 15 / 14 Lineup)
  // ==========================================
  {
    id: 'iphone-16-pro-max',
    brandId: 'apple',
    name: 'iPhone 16 Pro Max (A18 Pro & Camera Control)',
    baseValuation: 96000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 98,
    processor: 'A18 Pro (3nm 6-Core GPU) + Apple Intelligence',
    display: '6.9" Super Retina XDR OLED, 120Hz ProMotion, 2000 nits',
    camera: '48MP Fusion Camera + 48MP Ultra-wide + 12MP 5x Telephoto',
    battery: 'Up to 33 hours video playback, Qi2 & MagSafe',
    is5G: true,
    isAi: true,
    variants: [
      { storage: '256 GB', priceModifier: 0 },
      { storage: '512 GB', priceModifier: 8000 },
      { storage: '1 TB', priceModifier: 16000 }
    ],
    colors: [
      { name: 'Desert Titanium', hex: '#bfa78f' },
      { name: 'Natural Titanium', hex: '#9f9a94' },
      { name: 'White Titanium', hex: '#f3f4f6' },
      { name: 'Black Titanium', hex: '#1f2937' }
    ]
  },
  {
    id: 'iphone-16-pro',
    brandId: 'apple',
    name: 'iPhone 16 Pro (Grade 5 Titanium & 5x Optical)',
    baseValuation: 86000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 97,
    processor: 'A18 Pro Chip with 16-core Neural Engine',
    display: '6.3" Super Retina XDR OLED, 120Hz ProMotion',
    camera: '48MP Main + 48MP Ultra-wide + 12MP 5x Tetraprism Zoom',
    battery: 'Up to 27 hours video, 25W MagSafe Charging',
    is5G: true,
    isAi: true,
    variants: [
      { storage: '128 GB', priceModifier: 0 },
      { storage: '256 GB', priceModifier: 6000 },
      { storage: '512 GB', priceModifier: 12000 }
    ],
    colors: [
      { name: 'Natural Titanium', hex: '#9f9a94' },
      { name: 'Desert Titanium', hex: '#bfa78f' },
      { name: 'Black Titanium', hex: '#1f2937' }
    ]
  },
  {
    id: 'iphone-16',
    brandId: 'apple',
    name: 'iPhone 16 (A18 Bionic & Spatial Video)',
    baseValuation: 58000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 93,
    processor: 'A18 Chip with Apple Intelligence Ready',
    display: '6.1" Super Retina XDR OLED, 2000 nits, Dynamic Island',
    camera: '48MP Fusion 2x Telephoto + 12MP Macro Ultra-wide',
    battery: 'All-day battery life, Type-C Charging',
    is5G: true,
    isAi: true,
    variants: [
      { storage: '128 GB', priceModifier: 0 },
      { storage: '256 GB', priceModifier: 5000 },
      { storage: '512 GB', priceModifier: 10000 }
    ],
    colors: [
      { name: 'Ultramarine Blue', hex: '#3b82f6' },
      { name: 'Teal', hex: '#14b8a6' },
      { name: 'Pink', hex: '#f43f5e' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Black', hex: '#0f172a' }
    ]
  },
  {
    id: 'iphone-15-pro-max',
    brandId: 'apple',
    name: 'iPhone 15 Pro Max',
    baseValuation: 76000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 96,
    processor: 'A17 Pro (3nm) with Hardware Ray Tracing',
    display: '6.7" Super Retina XDR OLED, 120Hz ProMotion',
    camera: '48MP Main + 12MP 5x Periscope + 12MP Ultra-wide',
    battery: '4422 mAh, Type-C USB 3 10Gbps',
    is5G: true,
    isAi: true,
    variants: [
      { storage: '256 GB', priceModifier: 0 },
      { storage: '512 GB', priceModifier: 7000 },
      { storage: '1 TB', priceModifier: 14000 }
    ],
    colors: [
      { name: 'Natural Titanium', hex: '#9f9a94' },
      { name: 'Blue Titanium', hex: '#374151' },
      { name: 'White Titanium', hex: '#f3f4f6' },
      { name: 'Black Titanium', hex: '#1f2937' }
    ]
  },
  {
    id: 'iphone-15',
    brandId: 'apple',
    name: 'iPhone 15 (Dynamic Island & 48MP)',
    baseValuation: 48000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 91,
    processor: 'A16 Bionic Chip',
    display: '6.1" Super Retina XDR OLED, 2000 nits Peak',
    camera: '48MP 2x Telephoto Sensor-shift OIS',
    battery: '3349 mAh, USB Type-C',
    is5G: true,
    variants: [
      { storage: '128 GB', priceModifier: 0 },
      { storage: '256 GB', priceModifier: 4000 }
    ],
    colors: [
      { name: 'Black', hex: '#0f172a' },
      { name: 'Blue', hex: '#93c5fd' },
      { name: 'Green', hex: '#86efac' },
      { name: 'Pink', hex: '#f9a8d4' }
    ]
  },
  {
    id: 'iphone-14',
    brandId: 'apple',
    name: 'iPhone 14 (Crash Detection & Photonic Engine)',
    baseValuation: 39000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 88,
    processor: 'A15 Bionic (5-Core GPU)',
    display: '6.1" Super Retina XDR OLED, Ceramic Shield',
    camera: 'Dual 12MP Photonic Engine with Action Mode',
    battery: '3279 mAh, MagSafe Wireless',
    is5G: true,
    variants: [
      { storage: '128 GB', priceModifier: 0 },
      { storage: '256 GB', priceModifier: 4500 }
    ],
    colors: [
      { name: 'Midnight Black', hex: '#1e293b' },
      { name: 'Starlight', hex: '#f8fafc' },
      { name: 'Blue', hex: '#60a5fa' }
    ]
  },
  {
    id: 'iphone-13',
    brandId: 'apple',
    name: 'iPhone 13 (Cinematic Mode & Super Retina)',
    baseValuation: 32000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 85,
    processor: 'A15 Bionic Chip (4nm)',
    display: '6.1" Super Retina XDR OLED, 1200 nits',
    camera: 'Dual 12MP Sensor-shift OIS',
    battery: '3227 mAh, 20W Fast Charge',
    is5G: true,
    variants: [
      { storage: '128 GB', priceModifier: 0 },
      { storage: '256 GB', priceModifier: 3500 }
    ],
    colors: [
      { name: 'Midnight', hex: '#0f172a' },
      { name: 'Starlight White', hex: '#f8fafc' },
      { name: 'Sierra Blue', hex: '#38bdf8' }
    ]
  },

  // ==========================================
  // 12. NOTHING (Transparent Glyph Architecture)
  // ==========================================
  {
    id: 'nothing-phone-2',
    brandId: 'nothing',
    name: 'Nothing Phone (2) (Glyph Interface & Flagship Power)',
    baseValuation: 29000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 91,
    processor: 'Snapdragon 8+ Gen 1 (4nm)',
    display: '6.7" 120Hz LTPO OLED, 1600 nits, 33 Glyph Zones',
    camera: 'Dual 50MP Sony IMX890 OIS + 32MP Front',
    battery: '4700 mAh, 45W Fast Charging + 15W Wireless',
    is5G: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '512 GB', priceModifier: 3500 }
    ],
    colors: [
      { name: 'Dark Grey', hex: '#334155' },
      { name: 'White', hex: '#ffffff' }
    ]
  },
  {
    id: 'nothing-phone-2a-plus',
    brandId: 'nothing',
    name: 'Nothing Phone (2a) Plus (Dimensity 7350 Pro 5G)',
    baseValuation: 22000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 87,
    processor: 'MediaTek Dimensity 7350 Pro 5G (Exclusive)',
    display: '6.7" 120Hz Flexible AMOLED, 1300 nits, Glyph Light',
    camera: 'Dual 50MP OIS + 50MP 4K Front Camera',
    battery: '5000 mAh, 50W Fast Charge',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Metallic Grey', hex: '#64748b' },
      { name: 'Black', hex: '#18181b' }
    ]
  },
  {
    id: 'nothing-phone-2a',
    brandId: 'nothing',
    name: 'Nothing Phone (2a) Special Edition',
    baseValuation: 16500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 85,
    processor: 'Dimensity 7200 Pro (4nm)',
    display: '6.7" 120Hz AMOLED, 1300 nits Peak',
    camera: 'Dual 50MP Sony OIS + 32MP Front Camera',
    battery: '5000 mAh, 45W Fast Charging',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Special Red/Yellow/Blue Edition', hex: '#2563eb' },
      { name: 'Milk White', hex: '#fafafa' },
      { name: 'Black', hex: '#18181b' }
    ]
  },

  // ==========================================
  // 13. GOOGLE MOBILE (Gemini AI & Tensor G4 Camera King)
  // ==========================================
  {
    id: 'google-pixel-9-pro-xl',
    brandId: 'google',
    name: 'Google Pixel 9 Pro XL (Gemini Nano & Tensor G4)',
    baseValuation: 76000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 97,
    processor: 'Google Tensor G4 + Titan M2 Security Chip',
    display: '6.8" Super Actua 120Hz LTPO OLED, 3000 nits',
    camera: '50MP Octa PD OIS + 48MP 5x Telephoto + 48MP Ultra-wide + 42MP AF Selfie',
    battery: '5060 mAh, 37W Fast Charging + Wireless',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '16 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '16 GB', storage: '512 GB', priceModifier: 6000 }
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#09090b' },
      { name: 'Porcelain White', hex: '#fafafa' },
      { name: 'Hazel', hex: '#71717a' },
      { name: 'Rose Quartz', hex: '#f472b6' }
    ]
  },
  {
    id: 'google-pixel-8a',
    brandId: 'google',
    name: 'Google Pixel 8a 5G (Best AI Camera Under ₹40,000)',
    baseValuation: 29000,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 89,
    processor: 'Google Tensor G3 with Magic Editor & Best Take',
    display: '6.1" Actua 120Hz OLED, 2000 nits, IP67 Waterproof',
    camera: '64MP Quad PD OIS + 13MP Ultra-wide with Real Tone',
    battery: '4492 mAh, 18W Fast Charge + Wireless Qi',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 3000 }
    ],
    colors: [
      { name: 'Bay Blue', hex: '#38bdf8' },
      { name: 'Aloe Green', hex: '#86efac' },
      { name: 'Obsidian', hex: '#18181b' }
    ]
  },

  // ==========================================
  // 14. INFINIX (Cyber Mecha & Fast Charge King)
  // ==========================================
  {
    id: 'infinix-gt-20-pro',
    brandId: 'infinix',
    name: 'Infinix GT 20 Pro 5G (Cyber Mecha LED & 144Hz)',
    baseValuation: 17500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 85,
    processor: 'Dimensity 8200 Ultimate 4nm + Dedicated Pixelworks X5 Turbo',
    display: '6.78" 144Hz FHD+ LTPS AMOLED, 1300 nits',
    camera: '108MP OIS Triple Camera + Mecha Loop RGB LED',
    battery: '5000 mAh, 45W Hyper Charge, Dual JBL Speakers',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '12 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Mecha Blue', hex: '#0284c7' },
      { name: 'Mecha Silver', hex: '#94a3b8' },
      { name: 'Mecha Orange', hex: '#f97316' }
    ]
  },
  {
    id: 'infinix-note-40-pro-plus',
    brandId: 'infinix',
    name: 'Infinix Note 40 Pro+ 5G (100W All-Round FastCharge & 20W MagCharge)',
    baseValuation: 18000,
    imageUrl: '',
    category: 'midrange',
    specScore: 84,
    processor: 'Dimensity 7020 with Cheetah X1 Power Management',
    display: '6.78" 120Hz 3D Curved AMOLED, Gorilla Glass 5',
    camera: '108MP OIS 3x Lossless Zoom + Active Halo AI Lighting',
    battery: '4600 mAh, 100W Multi-Speed Wired + 20W Wireless MagCharge',
    is5G: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Vintage Green (Vegan Leather)', hex: '#15803d' },
      { name: 'Obsidian Black', hex: '#0f172a' }
    ]
  },

  // ==========================================
  // 15. LAVA (Proudly Made In India - Agni & Blaze Series)
  // ==========================================
  {
    id: 'lava-agni-3',
    brandId: 'lava',
    name: 'Lava Agni 3 5G (Dual AMOLED + Action Button Key)',
    baseValuation: 16500,
    imageUrl: '',
    category: 'midrange',
    popular: true,
    specScore: 86,
    processor: 'MediaTek Dimensity 7300X (4nm Octa-core)',
    display: '6.78" 1.5K 120Hz 3D Curved AMOLED + 1.74" Rear Secondary Display',
    camera: '50MP Sony OIS 3x Telephoto + 8MP Ultra-wide + 16MP Selfie',
    battery: '5000 mAh, 66W Fast Charging, Clean Stock Android 14',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 2000 }
    ],
    colors: [
      { name: 'Heather Glass', hex: '#475569' },
      { name: 'Pristine Glass', hex: '#e2e8f0' }
    ]
  },
  {
    id: 'lava-blaze-curve-5g',
    brandId: 'lava',
    name: 'Lava Blaze Curve 5G (3D 120Hz Curved Display & 64MP Sony)',
    baseValuation: 11500,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 81,
    processor: 'MediaTek Dimensity 7050 (6nm)',
    display: '6.67" 120Hz 3D Curved AMOLED, 800 nits, Clean OS',
    camera: '64MP Sony Sensor Triple Camera with EIS',
    battery: '5000 mAh, 33W Fast Charger In Box, Stereo Speakers',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '256 GB', priceModifier: 1500 }
    ],
    colors: [
      { name: 'Iron Glass', hex: '#1e293b' },
      { name: 'Viridian Glass', hex: '#0f766e' }
    ]
  },

  // ==========================================
  // 16. CMF by Nothing (Modular & Community Sensation)
  // ==========================================
  {
    id: 'cmf-phone-1',
    brandId: 'cmf',
    name: 'CMF Phone 1 5G (Modular Design, Dimensity 7300 & Super AMOLED)',
    baseValuation: 12000,
    imageUrl: '',
    category: 'budget',
    popular: true,
    specScore: 84,
    processor: 'MediaTek Dimensity 7300 5G (4nm)',
    display: '6.67" Super AMOLED 120Hz, 2000 nits, In-display Fingerprint',
    camera: '50MP Sony Ultra-Sensing Camera + 16MP Selfie',
    battery: '5000 mAh, 33W Fast Charging, Replaceable Accessory Screws',
    is5G: true,
    variants: [
      { ram: '6 GB', storage: '128 GB', priceModifier: 0 },
      { ram: '8 GB', storage: '128 GB', priceModifier: 1500 }
    ],
    colors: [
      { name: 'Signature Orange (Textured)', hex: '#ea580c' },
      { name: 'Black', hex: '#18181b' },
      { name: 'Light Green', hex: '#84cc16' },
      { name: 'Blue (India Special Edition)', hex: '#2563eb' }
    ]
  },

  // ==========================================
  // 17. HONOR (Studio Harcourt AI Portrait & Anti-Drop)
  // ==========================================
  {
    id: 'honor-200-pro',
    brandId: 'honor',
    name: 'Honor 200 Pro 5G (Studio Harcourt 50MP Dual OIS & Snapdragon 8s Gen 3)',
    baseValuation: 33000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 91,
    processor: 'Snapdragon 8s Gen 3 + Honor C1+ RF Chip',
    display: '6.78" 1.5K 120Hz Quad-curved Eye-Comfort OLED, 4000 nits',
    camera: '50MP H9000 1/1.3" OIS + 50MP Sony IMX856 2.5x Telephoto + 50MP Selfie',
    battery: '5200 mAh Silicon-Carbon, 100W Wired + 66W Wireless',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '12 GB', storage: '512 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Ocean Cyan', hex: '#0891b2' },
      { name: 'Black', hex: '#0f172a' }
    ]
  },
  {
    id: 'honor-x9b-5g',
    brandId: 'honor',
    name: 'Honor X9b 5G (Ultra-Bounce 360° Anti-Drop Display)',
    baseValuation: 16000,
    imageUrl: '',
    category: 'midrange',
    specScore: 82,
    processor: 'Qualcomm Snapdragon 6 Gen 1 (4nm)',
    display: '6.78" 1.5K 120Hz Curved AMOLED with SGS 5-Star Drop Resistance',
    camera: '108MP Lossless Zoom Triple Camera',
    battery: '5800 mAh Ultra-Slim Battery with 3-Year Health Guarantee',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '256 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Sunrise Orange (Vegan Leather)', hex: '#ea580c' },
      { name: 'Midnight Black', hex: '#0f172a' }
    ]
  },

  // ==========================================
  // 18. MICROMAX (Indian Heritage Value)
  // ==========================================
  {
    id: 'micromax-in-note-2',
    brandId: 'micromax',
    name: 'Micromax In Note 2 (AMOLED Glass Design)',
    baseValuation: 6500,
    imageUrl: '',
    category: 'budget',
    specScore: 75,
    processor: 'MediaTek Helio G95 Gaming Processor',
    display: '6.43" FHD+ AMOLED Display, Corning Gorilla Glass',
    camera: '48MP Quad AI Camera + 16MP Selfie',
    battery: '5000 mAh, 30W Fast Charging',
    is5G: false,
    variants: [
      { ram: '4 GB', storage: '64 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Oak Glass', hex: '#78350f' },
      { name: 'Black', hex: '#18181b' }
    ]
  },

  // ==========================================
  // 19. ALCATEL
  // ==========================================
  {
    id: 'alcatel-3l',
    brandId: 'alcatel',
    name: 'Alcatel 3L 5G Smart Edition',
    baseValuation: 5500,
    imageUrl: '',
    category: 'budget',
    specScore: 74,
    processor: 'Octa-core MediaTek Smart Engine',
    display: '6.52" HD+ Vast Display with NXTVISION',
    camera: '48MP AI Triple Camera with Night Mode',
    battery: '4000 mAh All-Day Battery',
    is5G: false,
    variants: [
      { ram: '4 GB', storage: '64 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Jewelry Blue', hex: '#1e40af' },
      { name: 'Jewelry Black', hex: '#18181b' }
    ]
  },

  // ==========================================
  // 20. HUAWEI (Pura & Mate Flagship Imaging)
  // ==========================================
  {
    id: 'huawei-pura-70-ultra',
    brandId: 'huawei',
    name: 'Huawei Pura 70 Ultra (Retractable 1-inch Camera)',
    baseValuation: 68000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 98,
    processor: 'Kirin 9010 Octa-core Satellite Ready',
    display: '6.8" 1-120Hz LTPO OLED, Kunlun Glass 2, 2500 nits',
    camera: '50MP 1-inch Pop-out Retractable OIS + 50MP Macro Telephoto',
    battery: '5200 mAh, 100W SuperCharge + 80W Wireless',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '16 GB', storage: '512 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Chanson Green (Star Pattern Leather)', hex: '#047857' },
      { name: 'Mocha Brown', hex: '#451a03' }
    ]
  },

  // ==========================================
  // 21. BLACKBERRY (Physical QWERTY & Executive Security)
  // ==========================================
  {
    id: 'blackberry-key2',
    brandId: 'blackberry',
    name: 'BlackBerry KEY2 (Smart Physical QWERTY Keyboard)',
    baseValuation: 14000,
    imageUrl: '',
    category: 'midrange',
    specScore: 77,
    processor: 'Qualcomm Snapdragon 660 with DTEK Security',
    display: '4.5" 3:2 Scratch-resistant Display + Backlit Touch QWERTY',
    camera: 'Dual 12MP Camera with Speed Key Shortcuts',
    battery: '3500 mAh, Quick Charge 3.0',
    is5G: false,
    variants: [
      { ram: '6 GB', storage: '64 GB', priceModifier: 0 },
      { ram: '6 GB', storage: '128 GB', priceModifier: 1500 }
    ],
    colors: [
      { name: 'Series 7000 Aluminum Black', hex: '#0f172a' },
      { name: 'Silver Edition', hex: '#94a3b8' }
    ]
  },

  // ==========================================
  // 22. ASUS (ROG Phone Esports Monster)
  // ==========================================
  {
    id: 'asus-rog-phone-8-pro',
    brandId: 'asus',
    name: 'Asus ROG Phone 8 Pro (165Hz LTPO & AniMe Vision Mini-LED)',
    baseValuation: 62000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 97,
    processor: 'Snapdragon 8 Gen 3 with GameCool 8 Conductor System',
    display: '6.78" 165Hz Samsung E6 Flexible LTPO AMOLED, 2500 nits',
    camera: '50MP Sony IMX890 6-Axis Gimbal Stabilizer 3.0 + 32MP 3x OIS',
    battery: '5500 mAh, 65W HyperCharge, IP68 Waterproof',
    is5G: true,
    isAi: true,
    variants: [
      { ram: '16 GB', storage: '512 GB', priceModifier: 0 },
      { ram: '24 GB', storage: '1 TB', priceModifier: 9000 }
    ],
    colors: [
      { name: 'Phantom Black with AniMe Vision', hex: '#09090b' }
    ]
  },

  // ==========================================
  // 23. NUBIA (Red Magic True Fullscreen Under-Display Camera)
  // ==========================================
  {
    id: 'nubia-red-magic-9-pro',
    brandId: 'nubia',
    name: 'Nubia Red Magic 9 Pro 5G (Zero Camera Bump & Built-in Turbo Fan)',
    baseValuation: 52000,
    imageUrl: '',
    category: 'flagship',
    popular: true,
    specScore: 96,
    processor: 'Snapdragon 8 Gen 3 with 22,000 RPM RGB Centrifugal Fan',
    display: '6.8" 120Hz BOE Q9+ Flat AMOLED (Zero Punch-hole Camera)',
    camera: 'Dual 50MP Samsung GN5 OIS Flat Back + 16MP Under-Display Selfie',
    battery: '6500 mAh Massive Battery, 80W Fast Charging',
    is5G: true,
    variants: [
      { ram: '12 GB', storage: '256 GB', priceModifier: 0 },
      { ram: '16 GB', storage: '512 GB', priceModifier: 5000 }
    ],
    colors: [
      { name: 'Sleet (Transparent Silver)', hex: '#94a3b8' },
      { name: 'Cyclone (Transparent Black)', hex: '#0f172a' }
    ]
  },

  // ==========================================
  // 24. LG (Dual Screen & Swivel Icons)
  // ==========================================
  {
    id: 'lg-wing-5g',
    brandId: 'lg',
    name: 'LG Wing 5G (Dual Screen Swivel & Built-in Gimbal Camera)',
    baseValuation: 17500,
    imageUrl: '',
    category: 'midrange',
    specScore: 83,
    processor: 'Qualcomm Snapdragon 765G 5G',
    display: '6.8" P-OLED Swivel Main Screen + 3.9" G-OLED Secondary Display',
    camera: '64MP OIS + 12MP Ultra-wide Gimbal Motion Camera + Pop-up 32MP',
    battery: '4000 mAh, Quick Charge 4.0+ & Wireless Charging',
    is5G: true,
    variants: [
      { ram: '8 GB', storage: '128 GB', priceModifier: 0 }
    ],
    colors: [
      { name: 'Aurora Gray', hex: '#334155' },
      { name: 'Illusion Sky', hex: '#60a5fa' }
    ]
  }
];
