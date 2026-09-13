import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { processRawIconToStandardPng } from './process-ui-icon.mjs';
import { verifyFile } from './verify-ui-icons.mjs';

const INK = '#180F09';
const CINNABAR = '#AC1922';

const icons = [
  {
    num: 50,
    filename: 'ash-priest-cuu.png',
    name: 'Tư tế Cửu',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Smoke trails curling up in ink-wash style -->
  <g stroke="${INK}" fill="none" stroke-linecap="round">
    <path d="M 256 190 Q 230 140 250 100 T 220 30" stroke-width="14" opacity="0.6"/>
    <path d="M 270 185 Q 310 130 280 80 T 310 20" stroke-width="10" opacity="0.5"/>
    <path d="M 240 180 Q 200 130 220 70" stroke-width="8" opacity="0.4"/>
    <!-- drifting embers & ash flakes -->
    <circle cx="210" cy="110" r="6" fill="${INK}"/>
    <circle cx="310" cy="90" r="5" fill="${INK}"/>
    <circle cx="270" cy="45" r="7" fill="${INK}"/>
    <circle cx="230" cy="35" r="4.5" fill="${INK}"/>
    <circle cx="245" cy="80" r="5" fill="${CINNABAR}"/>
    <circle cx="295" cy="130" r="4" fill="${CINNABAR}"/>
    <circle cx="190" cy="65" r="3.5" fill="${CINNABAR}"/>
  </g>

  <!-- Three-legged bronze censer body -->
  <ellipse cx="256" cy="215" rx="130" ry="35" fill="${INK}"/>
  <ellipse cx="256" cy="215" rx="118" ry="26" fill="${CINNABAR}"/>
  <ellipse cx="256" cy="215" rx="90" ry="18" fill="#5A0B10"/>
  <ellipse cx="256" cy="215" rx="65" ry="10" fill="#FF4500" opacity="0.7"/>

  <!-- Censer bowl -->
  <path d="M 126 215 C 126 335 170 380 256 380 C 342 380 386 335 386 215 Z" fill="${INK}"/>

  <!-- Cloud relief in Vermilion -->
  <path d="M 150 240 Q 256 295 362 240 Q 256 265 150 240 Z" fill="${CINNABAR}"/>
  <circle cx="256" cy="285" r="14" fill="${CINNABAR}"/>
  <circle cx="256" cy="285" r="7" fill="${INK}"/>
  <path d="M 200 280 Q 256 325 312 280" fill="none" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round"/>

  <!-- Looped ear handles -->
  <path d="M 130 225 C 70 205 70 290 134 290" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
  <path d="M 382 225 C 442 205 442 290 378 290" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>

  <!-- Vermilion cords -->
  <path d="M 90 280 Q 80 340 100 370" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
  <path d="M 422 280 Q 432 340 412 370" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>

  <!-- Three tripod legs -->
  <path d="M 175 365 C 160 410 145 445 160 465 C 175 470 195 460 205 375 Z" fill="${INK}"/>
  <path d="M 337 365 C 352 410 367 445 352 465 C 337 470 317 460 307 375 Z" fill="${INK}"/>
  <path d="M 243 375 L 243 470 C 243 480 269 480 269 470 L 269 375 Z" fill="${INK}"/>

  <!-- Shadow ground -->
  <ellipse cx="256" cy="475" rx="140" ry="14" fill="${INK}" opacity="0.25"/>
</svg>
`
  },
  {
    num: 51,
    filename: 'name-collector-tra.png',
    name: 'Sưu tập tên Trà',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Ghostly soul wisps -->
  <path d="M 120 180 C 90 140 130 90 100 60" fill="none" stroke="${INK}" stroke-width="6" opacity="0.3" stroke-linecap="round"/>
  <path d="M 390 190 C 430 150 380 90 420 50" fill="none" stroke="${INK}" stroke-width="6" opacity="0.3" stroke-linecap="round"/>
  <circle cx="100" cy="55" r="5" fill="${CINNABAR}" opacity="0.7"/>
  <circle cx="425" cy="45" r="5" fill="${CINNABAR}" opacity="0.7"/>

  <!-- Leather Memorial Ledger Book (Open Book) -->
  <!-- Left page leather backing -->
  <path d="M 256 120 C 210 110 120 120 70 140 C 65 142 60 148 60 155 L 75 410 C 75 418 82 422 90 420 C 140 405 210 400 256 415 Z" fill="${INK}"/>
  <!-- Right page leather backing -->
  <path d="M 256 120 C 302 110 392 120 442 140 C 447 142 452 148 452 155 L 437 410 C 437 418 430 422 422 420 C 372 405 302 400 256 415 Z" fill="${INK}"/>

  <!-- Aged Parchment Pages Inner (Deckled Edges) -->
  <path d="M 254 135 C 212 125 130 135 85 152 L 98 395 C 140 382 210 378 254 395 Z" fill="#E8DEC8"/>
  <path d="M 258 135 C 300 125 382 135 427 152 L 414 395 C 372 382 302 378 258 395 Z" fill="#E8DEC8"/>

  <!-- Book Spine Groove & Ribbon -->
  <line x1="256" y1="120" x2="256" y2="415" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  <path d="M 256 110 Q 280 60 260 20 Q 240 60 256 110" fill="${CINNABAR}"/>

  <!-- Hanging Vermilion Silk Bookmark -->
  <path d="M 256 220 Q 240 320 230 460 Q 235 480 250 465 Q 260 410 256 220 Z" fill="${CINNABAR}"/>

  <!-- Calligraphic Column Entries (Ancient Name Inscriptions) -->
  <g stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity="0.8">
    <line x1="130" y1="175" x2="130" y2="350"/>
    <line x1="165" y1="170" x2="165" y2="355"/>
    <line x1="200" y1="165" x2="200" y2="360"/>
    <line x1="310" y1="165" x2="310" y2="360"/>
    <line x1="345" y1="170" x2="345" y2="355"/>
    <line x1="380" y1="175" x2="380" y2="350"/>
  </g>

  <!-- Vermilion Official Name Memorial Seals on Pages -->
  <rect x="185" y="325" width="26" height="26" rx="4" fill="${CINNABAR}"/>
  <circle cx="330" cy="338" r="13" fill="${CINNABAR}"/>

  <!-- Traditional Calligraphy Brush lying diagonally -->
  <g transform="rotate(-35 340 300)">
    <!-- Brush Handle -->
    <rect x="330" y="80" width="16" height="280" rx="8" fill="#5A3D28"/>
    <!-- Ferrule & Red Thread -->
    <rect x="328" y="360" width="20" height="24" rx="3" fill="${CINNABAR}"/>
    <!-- Bristle Tip with Dark Soot Ink -->
    <path d="M 328 384 C 328 420 338 450 338 450 C 338 450 348 420 348 384 Z" fill="${INK}"/>
  </g>
</svg>
`
  },
  {
    num: 52,
    filename: 'ice-hermit-bang.png',
    name: 'Ẩn sĩ Băng',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Radiating Cold Frost Mist & Vapor -->
  <g stroke="${INK}" fill="none" stroke-linecap="round" opacity="0.4">
    <path d="M 120 260 C 80 230 70 170 110 130" stroke-width="10"/>
    <path d="M 390 260 C 430 230 440 170 400 130" stroke-width="10"/>
    <path d="M 170 100 C 190 60 230 50 256 30" stroke-width="8"/>
    <path d="M 340 100 C 320 60 280 50 256 30" stroke-width="8"/>
    <circle cx="100" cy="180" r="4" fill="${INK}"/>
    <circle cx="410" cy="180" r="4" fill="${INK}"/>
    <circle cx="150" cy="70" r="5" fill="${INK}"/>
    <circle cx="360" cy="70" r="5" fill="${INK}"/>
  </g>

  <!-- Perpetual Frost Ice Monolith (Faceted Crystal Prism) -->
  <!-- Base Rock & Frost Pedestal -->
  <path d="M 130 440 L 256 470 L 382 440 L 330 410 L 180 410 Z" fill="${INK}"/>

  <!-- Central Great Ice Crystal Tower -->
  <!-- Back Facets (Darker Ink) -->
  <polygon points="256,60 160,200 256,430" fill="#2D3748" opacity="0.8"/>
  <polygon points="256,60 352,200 256,430" fill="#1A202C" opacity="0.9"/>
  <!-- Front Facets -->
  <polygon points="256,60 210,230 256,430" fill="#E2E8F0" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <polygon points="256,60 302,230 256,430" fill="#CBD5E1" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>

  <!-- Flanking Ice Crystals -->
  <!-- Left Crystal -->
  <polygon points="130,170 180,120 210,240 160,380 110,280" fill="#94A3B8" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <polygon points="180,120 210,240 160,380" fill="#E2E8F0" opacity="0.85"/>
  <!-- Right Crystal -->
  <polygon points="382,170 332,120 302,240 352,380 402,280" fill="#64748B" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <polygon points="332,120 302,240 352,380" fill="#E2E8F0" opacity="0.85"/>

  <!-- Internal Glowing Spiritual Core (Vermilion Heart of Ice) -->
  <ellipse cx="256" cy="250" rx="36" ry="55" fill="${CINNABAR}" opacity="0.9"/>
  <ellipse cx="256" cy="250" rx="20" ry="32" fill="#FF4D4D"/>
  <ellipse cx="256" cy="250" rx="10" ry="16" fill="#FFFFFF" opacity="0.95"/>

  <!-- Frost Fractures / Runes radiating in Vermilion -->
  <path d="M 256 195 L 256 140 M 256 305 L 256 370 M 220 250 L 165 240 M 292 250 L 347 240" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round"/>

  <!-- Sharp Ink Accent Lines & Droplets -->
  <g stroke="${INK}" stroke-width="7" stroke-linecap="round">
    <line x1="256" y1="60" x2="256" y2="430"/>
    <line x1="256" y1="60" x2="160" y2="200"/>
    <line x1="256" y1="60" x2="352" y2="200"/>
    <line x1="160" y1="200" x2="256" y2="430"/>
    <line x1="352" y1="200" x2="256" y2="430"/>
  </g>
</svg>
`
  },
  {
    num: 53,
    filename: 'snow-guard-han.png',
    name: 'Vệ binh Hàn',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Frost Spear Crossing Behind Shield -->
  <g transform="rotate(35 256 256)">
    <!-- Spear Shaft (Dark Hardwood) -->
    <rect x="246" y="20" width="20" height="470" rx="10" fill="#3D2614" stroke="${INK}" stroke-width="6"/>
    <!-- Spear Socket & Vermilion Tassel -->
    <rect x="238" y="90" width="36" height="30" rx="4" fill="${CINNABAR}"/>
    <path d="M 238 120 Q 210 180 200 240 Q 225 210 248 120 Z" fill="${CINNABAR}"/>
    <path d="M 274 120 Q 300 180 310 240 Q 285 210 264 120 Z" fill="${CINNABAR}"/>
    <!-- Frost Spear Blade (Chiseled Steel & Ice) -->
    <polygon points="256,20 286,85 264,100 256,100 248,100 226,85" fill="#E2E8F0" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <line x1="256" y1="20" x2="256" y2="100" stroke="${INK}" stroke-width="6"/>
  </g>

  <!-- Bear-Hide Tribal Round Shield -->
  <!-- Outer Fur Rimming (Dark Jagged Ink Strokes) -->
  <circle cx="256" cy="270" r="160" fill="${INK}"/>
  <circle cx="256" cy="270" r="145" fill="#4A3525"/>

  <!-- Heavy Studded Iron / Bronze Rim -->
  <circle cx="256" cy="270" r="130" fill="${INK}"/>
  <circle cx="256" cy="270" r="120" fill="#78350F"/>

  <!-- Shield Boss Face with Vermilion Bear Paw / Clan Totem -->
  <circle cx="256" cy="270" r="95" fill="${INK}"/>
  <circle cx="256" cy="270" r="85" fill="${CINNABAR}"/>

  <!-- Central Bronze Spike Boss -->
  <circle cx="256" cy="270" r="40" fill="${INK}"/>
  <circle cx="256" cy="270" r="28" fill="#F59E0B"/>
  <polygon points="256,240 275,270 256,300 237,270" fill="${INK}"/>

  <!-- Bronze Rim Rivets -->
  <circle cx="256" cy="150" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>
  <circle cx="256" cy="390" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>
  <circle cx="136" cy="270" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>
  <circle cx="376" cy="270" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>
  <circle cx="170" cy="184" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>
  <circle cx="342" cy="184" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>
  <circle cx="170" cy="356" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>
  <circle cx="342" cy="356" r="8" fill="#F59E0B" stroke="${INK}" stroke-width="4"/>

  <!-- Frost & Snow Flurries -->
  <g fill="${INK}">
    <circle cx="80" cy="160" r="4"/>
    <circle cx="110" cy="120" r="6"/>
    <circle cx="430" cy="380" r="5"/>
    <circle cx="400" cy="420" r="4"/>
  </g>
</svg>
`
  },
  {
    num: 54,
    filename: 'caravan-duong.png',
    name: 'Thủ lĩnh Dương',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Desert Wind & Sand Swirls -->
  <path d="M 60 410 Q 180 380 256 420 T 450 400" fill="none" stroke="${INK}" stroke-width="8" opacity="0.3" stroke-linecap="round"/>

  <!-- Leather Water Canteen (Bota Flask) on Left -->
  <g transform="rotate(-15 190 280)">
    <!-- Hanging Shoulder Strap in Vermilion -->
    <path d="M 190 140 C 140 80 110 80 90 180" fill="none" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round"/>
    <!-- Flask Body (Rich Stitched Leather) -->
    <path d="M 130 180 C 80 220 70 340 140 380 C 210 420 260 360 250 280 C 240 200 170 170 130 180 Z" fill="#854D0E" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
    <!-- Decorative Center Seam with Vermilion Stitching -->
    <path d="M 145 190 Q 155 290 185 375" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-dasharray="12 10" stroke-linecap="round"/>
    <!-- Wooden / Brass Stopper & Spout -->
    <rect x="122" y="150" width="26" height="35" rx="5" fill="#3D2614" stroke="${INK}" stroke-width="8"/>
    <ellipse cx="135" cy="150" rx="14" ry="7" fill="${CINNABAR}"/>
  </g>

  <!-- Large Heavy Bronze Camel Bell on Right -->
  <g transform="translate(140, 20)">
    <!-- Top Bell Hanger Loop & Vermilion Knot -->
    <path d="M 180 180 C 180 120 220 120 220 180" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
    <!-- Vermilion Braided Caravan Knot -->
    <circle cx="200" cy="150" r="22" fill="${CINNABAR}"/>
    <path d="M 180 150 Q 200 110 220 150 Q 200 190 180 150 Z" fill="#FF4D4D"/>

    <!-- Trapezoidal Camel Bell Body -->
    <path d="M 160 180 L 140 360 L 260 360 L 240 180 Z" fill="#B45309" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/>
    <!-- Engraved Clan / Caravan Runes -->
    <line x1="150" y1="270" x2="250" y2="270" stroke="${INK}" stroke-width="10"/>
    <circle cx="200" cy="270" r="18" fill="${CINNABAR}" stroke="${INK}" stroke-width="6"/>

    <!-- Bell Clapper emerging at bottom -->
    <circle cx="200" cy="385" r="20" fill="${INK}"/>
    <!-- Hanging Vermilion Silk Tassel -->
    <path d="M 200 395 Q 180 470 190 490 Q 210 470 200 395 Z" fill="${CINNABAR}"/>
  </g>
</svg>
`
  },
  {
    num: 55,
    filename: 'dune-guide-sa.png',
    name: 'Hướng dẫn Sa',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Swirling Desert Dune Dust & Wind -->
  <path d="M 40 120 Q 256 80 470 140" fill="none" stroke="${INK}" stroke-width="10" opacity="0.3" stroke-linecap="round"/>
  <path d="M 60 420 Q 256 460 460 390" fill="none" stroke="${INK}" stroke-width="12" opacity="0.4" stroke-linecap="round"/>

  <!-- Desert Linen Headwrap Scarf (Keffiyeh / Shemagh) Framing -->
  <path d="M 100 160 C 140 100 372 100 412 160 C 452 220 440 350 400 390 C 360 430 152 430 112 390 C 72 350 60 220 100 160 Z" fill="#D4B996" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/>

  <!-- Vermilion Woven Border Trim on Scarf -->
  <path d="M 90 200 Q 256 240 422 200" fill="none" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round"/>
  <path d="M 120 370 Q 256 410 392 370" fill="none" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>

  <!-- Ancient Brass Sand Goggles (Kính Chắn Cát Thô Sơ) -->
  <!-- Heavy Leather Strap Crossing Behind -->
  <path d="M 60 260 L 452 260" stroke="#3D2614" stroke-width="26" stroke-linecap="round"/>
  <path d="M 60 260 L 452 260" stroke="${INK}" stroke-width="28" stroke-linecap="round" stroke-dasharray="14 18"/>

  <!-- Center Bridge Connector (Tied Leather & Brass Ring) -->
  <rect x="236" y="246" width="40" height="28" rx="8" fill="#B45309" stroke="${INK}" stroke-width="8"/>
  <circle cx="256" cy="260" r="8" fill="${CINNABAR}"/>

  <!-- Left Eyepiece (Brass Bezel & Tinted Slit Lens) -->
  <ellipse cx="180" cy="260" rx="65" ry="55" fill="#92400E" stroke="${INK}" stroke-width="14"/>
  <ellipse cx="180" cy="260" rx="52" ry="42" fill="#1C1917"/>
  <!-- Horizontal Vision Slit & Dark Amber Glass -->
  <line x1="140" y1="260" x2="220" y2="260" stroke="#FBBF24" stroke-width="10" stroke-linecap="round"/>
  <circle cx="180" cy="260" r="12" fill="${CINNABAR}"/>

  <!-- Right Eyepiece (Brass Bezel & Tinted Slit Lens) -->
  <ellipse cx="332" cy="260" rx="65" ry="55" fill="#92400E" stroke="${INK}" stroke-width="14"/>
  <ellipse cx="332" cy="260" rx="52" ry="42" fill="#1C1917"/>
  <!-- Horizontal Vision Slit & Dark Amber Glass -->
  <line x1="292" y1="260" x2="372" y2="260" stroke="#FBBF24" stroke-width="10" stroke-linecap="round"/>
  <circle cx="332" cy="260" r="12" fill="${CINNABAR}"/>

  <!-- Trailing Scarf Tassels at Bottom -->
  <path d="M 160 410 Q 140 480 150 495" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>
  <path d="M 352 410 Q 372 480 362 495" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>
  <path d="M 256 420 L 256 490" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round"/>
</svg>
`
  },
  {
    num: 56,
    filename: 'lake-keeper-trang.png',
    name: 'Người giữ hồ Trang',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Luminous Full/Crescent Moon High Above -->
  <path d="M 280 40 C 230 50 190 95 190 150 C 190 215 245 265 310 260 C 270 250 240 210 240 160 C 240 105 270 60 280 40 Z" fill="#FBBF24" stroke="${INK}" stroke-width="8"/>
  <!-- Vermilion Cloud Accent across Moon -->
  <path d="M 160 130 Q 230 110 320 145" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>

  <!-- Wooden Water Ladle (Gầu Múc Nước Gỗ) Dipping in Water -->
  <g transform="rotate(-20 256 310)">
    <!-- Long Bamboo / Hardwood Handle -->
    <path d="M 80 160 L 260 300" stroke="#451A03" stroke-width="22" stroke-linecap="round"/>
    <path d="M 80 160 L 260 300" stroke="${INK}" stroke-width="26" stroke-linecap="round" opacity="0.3"/>
    <!-- Vermilion Binding Cord around Handle Neck -->
    <rect x="230" y="270" width="28" height="24" rx="4" fill="${CINNABAR}" transform="rotate(38 244 282)"/>

    <!-- Round Wooden Ladle Bowl -->
    <ellipse cx="320" cy="350" rx="90" ry="70" fill="#78350F" stroke="${INK}" stroke-width="16"/>
    <!-- Water Pool inside Ladle reflecting moon -->
    <ellipse cx="320" cy="345" rx="72" ry="52" fill="#0284C7"/>
    <!-- Moon Reflection in Ladle Water -->
    <path d="M 335 325 C 315 330 300 345 300 365 C 325 365 345 345 335 325 Z" fill="#FEF08A"/>
  </g>

  <!-- Rippling Water Waves at Lake Surface -->
  <g stroke="${INK}" fill="none" stroke-linecap="round">
    <path d="M 80 430 Q 180 390 256 425 Q 350 460 440 420" stroke-width="14"/>
    <path d="M 120 460 Q 220 435 290 465 Q 380 485 420 455" stroke-width="10" opacity="0.7"/>
    <path d="M 160 400 Q 220 375 280 405" stroke-width="8" opacity="0.5"/>
  </g>

  <!-- Splashing Water Droplets with Vermilion Spangle -->
  <circle cx="390" cy="270" r="8" fill="#38BDF8" stroke="${INK}" stroke-width="4"/>
  <circle cx="430" cy="310" r="6" fill="#38BDF8" stroke="${INK}" stroke-width="4"/>
  <circle cx="360" cy="230" r="5" fill="${CINNABAR}"/>
  <circle cx="415" cy="260" r="4" fill="${CINNABAR}"/>
</svg>
`
  },
  {
    num: 57,
    filename: 'ferryman-cau.png',
    name: 'Người chở đò Câu',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Ancient Weathered Wooden Boat Oar (Mái Chèo Gỗ) -->
  <g transform="rotate(-30 256 256)">
    <!-- Oar Shaft / Pole -->
    <rect x="244" y="30" width="24" height="320" rx="10" fill="#5C3A21" stroke="${INK}" stroke-width="10"/>

    <!-- Grip Handle Top -->
    <rect x="232" y="30" width="48" height="24" rx="6" fill="#2E1B0E" stroke="${INK}" stroke-width="8"/>

    <!-- Vermilion Red Cord Tassel tied to neck -->
    <rect x="238" y="270" width="36" height="24" rx="4" fill="${CINNABAR}"/>
    <path d="M 238 294 Q 210 350 215 410 Q 235 380 250 294 Z" fill="${CINNABAR}"/>

    <!-- Wide Flared Oar Paddle Blade -->
    <path d="M 244 320 C 220 340 190 380 190 440 C 190 480 210 495 256 495 C 302 495 322 480 322 440 C 322 380 292 340 268 320 Z" fill="#78350F" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
    <!-- Notched Blade Grain Lines -->
    <line x1="256" y1="330" x2="256" y2="485" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M 225 380 Q 256 420 287 380" fill="none" stroke="${INK}" stroke-width="6"/>
  </g>

  <!-- Surging River Waves & Water Swirls Around Paddle -->
  <g stroke="${INK}" fill="none" stroke-linecap="round">
    <path d="M 60 380 C 120 320 200 440 270 370 C 340 300 420 400 470 350" stroke-width="16"/>
    <path d="M 80 430 C 150 370 230 480 310 410 C 380 350 430 430 460 410" stroke-width="12" opacity="0.75"/>
    <path d="M 130 475 Q 256 430 390 480" stroke-width="10" opacity="0.5"/>
  </g>

  <!-- Vermilion Floating Marker / Fishing Bobber -->
  <ellipse cx="140" cy="350" rx="18" ry="14" fill="${CINNABAR}" stroke="${INK}" stroke-width="6"/>
  <circle cx="140" cy="340" r="5" fill="#FFFFFF"/>
</svg>
`
  },
  {
    num: 58,
    filename: 'dice-master-luc.png',
    name: 'Bậc thầy Lục',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Shallow Porcelain Gambling Dish / Bowl (Đĩa Sứ Đổ Xúc Xắc) -->
  <ellipse cx="256" cy="380" rx="190" ry="75" fill="#E2E8F0" stroke="${INK}" stroke-width="18"/>
  <ellipse cx="256" cy="375" rx="170" ry="60" fill="#F8FAFC" stroke="${INK}" stroke-width="8"/>
  <!-- Vermilion Rim Band on Bowl -->
  <ellipse cx="256" cy="375" rx="160" ry="54" fill="none" stroke="${CINNABAR}" stroke-width="10"/>

  <!-- Three Ivory Gaming Dice (Tumbling with Big Red Cinnabar Dots) -->

  <!-- Dice 1: Left Center (showing Ace "1" in big bold Vermilion red) -->
  <g transform="translate(130, 210) rotate(-15)">
    <!-- Die Cube Body -->
    <path d="M 20 40 L 90 20 L 140 50 L 140 120 L 70 140 L 20 110 Z" fill="#FFFBEB" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M 20 40 L 70 70 L 140 50" fill="none" stroke="${INK}" stroke-width="8"/>
    <line x1="70" y1="70" x2="70" y2="140" stroke="${INK}" stroke-width="8"/>
    <!-- Top Face: Large Vermilion Ace "1" Point Son -->
    <ellipse cx="80" cy="45" rx="18" ry="12" fill="${CINNABAR}"/>
    <!-- Left Face: 2 dots in ink -->
    <circle cx="45" cy="85" r="7" fill="${INK}"/>
    <circle cx="55" cy="115" r="7" fill="${INK}"/>
    <!-- Right Face: 3 dots in ink -->
    <circle cx="95" cy="85" r="6" fill="${INK}"/>
    <circle cx="105" cy="105" r="6" fill="${INK}"/>
    <circle cx="115" cy="125" r="6" fill="${INK}"/>
  </g>

  <!-- Dice 2: Center Top (Tumbling High in Air) -->
  <g transform="translate(210, 80) rotate(25)">
    <path d="M 25 35 L 85 15 L 135 45 L 135 105 L 75 125 L 25 95 Z" fill="#FFFBEB" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M 25 35 L 75 65 L 135 45" fill="none" stroke="${INK}" stroke-width="8"/>
    <line x1="75" y1="65" x2="75" y2="125" stroke="${INK}" stroke-width="8"/>
    <!-- Top Face: 4 dots in Vermilion Red (Traditional East Asian 4 is red!) -->
    <circle cx="60" cy="35" r="6" fill="${CINNABAR}"/>
    <circle cx="100" cy="35" r="6" fill="${CINNABAR}"/>
    <circle cx="60" cy="55" r="6" fill="${CINNABAR}"/>
    <circle cx="100" cy="55" r="6" fill="${CINNABAR}"/>
    <!-- Left Face: 5 dots in ink -->
    <circle cx="40" cy="75" r="5" fill="${INK}"/>
    <circle cx="60" cy="75" r="5" fill="${INK}"/>
    <circle cx="50" cy="90" r="5" fill="${CINNABAR}"/>
    <circle cx="40" cy="105" r="5" fill="${INK}"/>
    <circle cx="60" cy="105" r="5" fill="${INK}"/>
  </g>

  <!-- Dice 3: Right (Settling into Dish) -->
  <g transform="translate(270, 240) rotate(10)">
    <path d="M 20 40 L 85 20 L 135 50 L 135 115 L 70 135 L 20 105 Z" fill="#FFFBEB" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M 20 40 L 70 70 L 135 50" fill="none" stroke="${INK}" stroke-width="8"/>
    <line x1="70" y1="70" x2="70" y2="135" stroke="${INK}" stroke-width="8"/>
    <!-- Top Face: 6 dots in ink -->
    <circle cx="50" cy="38" r="5" fill="${INK}"/>
    <circle cx="75" cy="38" r="5" fill="${INK}"/>
    <circle cx="105" cy="38" r="5" fill="${INK}"/>
    <circle cx="50" cy="55" r="5" fill="${INK}"/>
    <circle cx="75" cy="55" r="5" fill="${INK}"/>
    <circle cx="105" cy="55" r="5" fill="${INK}"/>
    <!-- Left Face: Big Vermilion Ace "1" -->
    <circle cx="45" cy="98" r="14" fill="${CINNABAR}"/>
  </g>
</svg>
`
  },
  {
    num: 59,
    filename: 'map-seller-man.png',
    name: 'Bán bản đồ Mẫn',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Leather Map Scroll Case Tube (Ống Đựng Bản Đồ Da) -->
  <g transform="rotate(-35 256 256)">
    <!-- Case Cylinder -->
    <rect x="220" y="50" width="72" height="380" rx="20" fill="#78350F" stroke="${INK}" stroke-width="14"/>
    <!-- Heavy Stitching & Reinforcing Bands -->
    <rect x="216" y="90" width="80" height="26" fill="#451A03" stroke="${INK}" stroke-width="8"/>
    <rect x="216" y="360" width="80" height="26" fill="#451A03" stroke="${INK}" stroke-width="8"/>
    <!-- Vermilion Red Leather Cap & Cord -->
    <rect x="214" y="50" width="84" height="30" rx="10" fill="${CINNABAR}" stroke="${INK}" stroke-width="8"/>
    <!-- Carrying Leather Strap Loop -->
    <path d="M 216 100 C 140 160 140 300 216 360" fill="none" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round"/>
  </g>

  <!-- Partially Unrolled Ancient Maritime Sea Chart (Hải Đồ Cổ) -->
  <g transform="translate(100, 180) rotate(15)">
    <!-- Unrolled Parchment Sheet -->
    <path d="M 50 40 L 220 10 L 250 200 L 80 230 Z" fill="#FEF3C7" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
    <!-- Rolled End Spools -->
    <ellipse cx="50" cy="135" rx="12" ry="95" fill="#DEB887" stroke="${INK}" stroke-width="8"/>
    <ellipse cx="235" cy="105" rx="12" ry="95" fill="#DEB887" stroke="${INK}" stroke-width="8"/>

    <!-- Sea Waves & Island Coastlines in Ink -->
    <path d="M 90 90 Q 130 70 160 100 Q 190 80 210 110" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M 100 150 Q 140 130 170 160 Q 190 140 210 170" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <!-- Island Outline -->
    <polygon points="120,110 145,100 155,125 130,135" fill="${INK}"/>

    <!-- Vermilion 8-Point Compass Rose Navigation Star -->
    <g transform="translate(170, 70)">
      <polygon points="0,-24 5,-7 22,0 5,7 0,24 -5,7 -22,0 -5,-7" fill="${CINNABAR}"/>
      <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
    </g>
    <!-- Vermilion Official Navigational Seal -->
    <rect x="90" y="175" width="28" height="28" rx="4" fill="${CINNABAR}"/>
  </g>
</svg>
`
  },
  {
    num: 60,
    filename: 'ward-carver-khue.png',
    name: 'Thợ khắc Khuê',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Array Formation Talisman Stone Slab (Phiến Đá Trận) -->
  <!-- Heavy Octagonal Runestone Slab -->
  <polygon points="160,70 352,70 442,160 442,352 352,442 160,442 70,352 70,160" fill="#334155" stroke="${INK}" stroke-width="18" stroke-linejoin="round"/>
  <!-- Inner Chiseled Stone Recess -->
  <polygon points="175,95 337,95 417,175 417,337 337,417 175,417 95,337 95,175" fill="#1E293B" stroke="${INK}" stroke-width="10"/>

  <!-- Engraved Geometric Array Formations in Glowing Vermilion -->
  <!-- Outer Array Circle -->
  <circle cx="256" cy="256" r="130" fill="none" stroke="${CINNABAR}" stroke-width="10"/>
  <!-- Inner Array Circle -->
  <circle cx="256" cy="256" r="75" fill="none" stroke="${CINNABAR}" stroke-width="8"/>

  <!-- Interlocking Talisman Ward Hexagram -->
  <polygon points="256,130 365,320 147,320" fill="none" stroke="${CINNABAR}" stroke-width="6"/>
  <polygon points="256,382 147,192 365,192" fill="none" stroke="${CINNABAR}" stroke-width="6"/>

  <!-- Center Ward Core Node -->
  <circle cx="256" cy="256" r="24" fill="${CINNABAR}" stroke="${INK}" stroke-width="6"/>
  <circle cx="256" cy="256" r="10" fill="#FDE047"/>

  <!-- Array Nodes at 8 cardinal points -->
  <circle cx="256" cy="126" r="8" fill="${CINNABAR}"/>
  <circle cx="256" cy="386" r="8" fill="${CINNABAR}"/>
  <circle cx="126" cy="256" r="8" fill="${CINNABAR}"/>
  <circle cx="386" cy="256" r="8" fill="${CINNABAR}"/>

  <!-- Rune-Carving Steel Chisel Knife (Dao Khắc Phù Văn) Incising Stone -->
  <g transform="translate(320, 100) rotate(40)">
    <!-- Wooden Grip Handle -->
    <rect x="0" y="0" width="26" height="150" rx="8" fill="#78350F" stroke="${INK}" stroke-width="10"/>
    <!-- Brass Ferrule Collar & Red Cord -->
    <rect x="-3" y="145" width="32" height="20" rx="3" fill="${CINNABAR}" stroke="${INK}" stroke-width="6"/>
    <!-- Hardened Chisel Steel Blade -->
    <polygon points="0,165 26,165 20,260 6,260" fill="#CBD5E1" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <!-- Sharp Beveled Cutting Tip Point -->
    <polygon points="6,260 20,260 13,285" fill="#F8FAFC" stroke="${INK}" stroke-width="6"/>
  </g>

  <!-- Chiseled Sparks and Stone Chips Flying -->
  <circle cx="370" cy="290" r="5" fill="#FBBF24"/>
  <circle cx="395" cy="265" r="4" fill="${CINNABAR}"/>
  <circle cx="350" cy="320" r="4.5" fill="#CBD5E1"/>
  <circle cx="320" cy="340" r="3.5" fill="${CINNABAR}"/>
</svg>
`
  }
];

const targetDir = 'src/assets/art/pins/npc';

for (const icon of icons) {
  console.log(`Processing [${icon.num}/60] ${icon.filename} (${icon.name})...`);
  const tempJpg = `temp-m4-${icon.num}.jpg`;
  const targetPath = path.join(targetDir, icon.filename);

  await sharp(Buffer.from(icon.svg))
    .flatten({ background: '#FFFFFF' })
    .jpeg({ quality: 98 })
    .toFile(tempJpg);

  const res = await processRawIconToStandardPng(tempJpg, targetPath);
  console.log(`  Processed: ${res.width}x${res.height}, ${res.sizeBytes} bytes`);

  const check = await verifyFile(targetPath);
  if (!check.ok) {
    console.error(`  FAILED: ${check.error}`);
    process.exit(1);
  }
  console.log(`  PASSED: ${check.transparentPct} transparent, ${check.dimensions}`);

  if (fs.existsSync(tempJpg)) {
    fs.unlinkSync(tempJpg);
  }
}

console.log('\\nAll M4 icons generated and verified successfully!');
