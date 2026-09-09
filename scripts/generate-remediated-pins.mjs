#!/usr/bin/env node
/**
 * scripts/generate-remediated-pins.mjs
 *
 * Remediation Generator for UI Icons:
 * - 18 NPC map pin icons (items 24–30 and 50–60)
 * - banker-tin.png (no Chinese characters, antique Vietnamese coin + gold ingot motif)
 * - storyteller-ngo.png (clean folding fan with vermilion tassel, NO Chinese calligraphy)
 *
 * All artwork strictly follows:
 * - Vietnamese ink-wash aesthetics (mực tàu giấy bản: deep ink #180F09, paper tone, calligraphic brush strokes)
 * - Category accent: Vermilion red #AC1922 (son đỏ oklch(48% 0.18 25))
 * - Zero Chinese characters, zero emojis, zero 3D, zero fake checkerboards
 * - Clean alpha matting to 128x128 PNG with 104x104 inner envelope
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { processRawIconToStandardPng } from './process-ui-icon.mjs';
import { verifyFile } from './verify-ui-icons.mjs';

const INK = '#180F09';
const INK_DARK = '#0D0704';
const INK_MID = '#3A2E24';
const INK_LIGHT = '#6E5D4F';
const CINNABAR = '#AC1922';
const CINNABAR_BRIGHT = '#D92534';
const GOLD = '#DDB049';

const REMEDIATION_ICONS = [
  // ----------------------------------------------------
  // Item 24: herbalist-dan.png (Dược sư Đàn — cân thuốc + thảo mộc)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/herbalist-dan.png',
    name: 'herbalist-dan',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <defs>
    <radialGradient id="hDanMetal" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#5A4738"/>
      <stop offset="60%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="${INK_DARK}"/>
    </radialGradient>
  </defs>
  <!-- Hand Balance Scale Beam (Cân Tiểu Ly) -->
  <path d="M 90 200 Q 256 185 430 220" stroke="${INK_DARK}" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M 90 200 Q 256 185 430 220" stroke="${INK_MID}" stroke-width="6" stroke-linecap="round" fill="none"/>
  
  <!-- Center suspension loop & Vermilion cord -->
  <circle cx="256" cy="192" r="10" fill="${INK_DARK}"/>
  <path d="M 256 182 L 256 90" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="256" cy="85" r="14" fill="${CINNABAR}"/>
  <path d="M 256 85 Q 285 70 275 40" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round" fill="none"/>

  <!-- Left suspension cords and brass pan -->
  <path d="M 120 202 L 95 310" stroke="${INK_LIGHT}" stroke-width="4"/>
  <path d="M 155 204 L 180 310" stroke="${INK_LIGHT}" stroke-width="4"/>
  <path d="M 137 203 L 137 312" stroke="${INK_LIGHT}" stroke-width="4"/>
  <!-- Shallow weighing pan -->
  <ellipse cx="137" cy="315" rx="55" ry="16" fill="url(#hDanMetal)" stroke="${INK_DARK}" stroke-width="6"/>
  
  <!-- Right sliding poise counterweight (Quả cân) -->
  <path d="M 380 216 L 380 270" stroke="${INK_LIGHT}" stroke-width="4"/>
  <path d="M 370 270 L 390 270 L 386 310 L 374 310 Z" fill="${INK_DARK}" stroke="${INK_MID}" stroke-width="4"/>
  <!-- Vermilion tassel on poise -->
  <path d="M 380 310 Q 395 340 390 370" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round" fill="none"/>

  <!-- Wild Medicinal Herbal Roots & Leaves spilling around pan -->
  <!-- Wild Ginseng Root body & rootlets -->
  <path d="M 125 315 Q 110 360 125 410 Q 135 440 120 465" stroke="${INK_DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M 120 410 Q 95 435 85 460" stroke="${INK_MID}" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M 128 385 Q 160 415 170 450" stroke="${INK_MID}" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- Rootlet hairs -->
  <path d="M 122 430 Q 140 450 145 475" stroke="${INK_LIGHT}" stroke-width="4" fill="none"/>
  <path d="M 112 365 Q 90 380 80 405" stroke="${INK_LIGHT}" stroke-width="5" fill="none"/>

  <!-- Green/Ink Herbal Leaves -->
  <path d="M 140 310 Q 200 280 230 240 Q 190 265 140 305" fill="${INK_DARK}"/>
  <path d="M 145 300 Q 185 245 175 210 Q 155 250 135 295" fill="${INK_MID}"/>
  <path d="M 120 310 Q 70 280 45 250 Q 80 270 120 305" fill="${INK_DARK}"/>

  <!-- Vermilion Cinnabar Medicinal Berries (Chu Quả) -->
  <circle cx="215" cy="235" r="10" fill="${CINNABAR}"/>
  <circle cx="235" cy="225" r="9" fill="${CINNABAR_BRIGHT}"/>
  <circle cx="225" cy="250" r="8" fill="${CINNABAR}"/>
  <circle cx="175" cy="215" r="9" fill="${CINNABAR}"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 25: gatherer-hue.png (Thợ hái Huệ — giỏ tre + liềm)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/gatherer-hue.png',
    name: 'gatherer-hue',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Woven Bamboo Collecting Basket (Giỏ Tre Đan Nan) -->
  <!-- Basket Rim -->
  <ellipse cx="230" cy="260" rx="140" ry="45" fill="#E8D5B5" stroke="${INK_DARK}" stroke-width="12"/>
  <ellipse cx="230" cy="260" rx="122" ry="32" fill="#3D2E22"/>

  <!-- Basket Body Woven Bamboo Texture -->
  <path d="M 95 265 C 105 390 145 460 230 460 C 315 460 355 390 365 265 Z" fill="#D2B58C" stroke="${INK_DARK}" stroke-width="14"/>
  <!-- Cross-hatch woven slats -->
  <path d="M 120 300 Q 230 350 340 300" stroke="${INK_DARK}" stroke-width="6" fill="none"/>
  <path d="M 135 350 Q 230 400 325 350" stroke="${INK_DARK}" stroke-width="6" fill="none"/>
  <path d="M 160 405 Q 230 440 300 405" stroke="${INK_DARK}" stroke-width="6" fill="none"/>
  <path d="M 170 270 L 185 450" stroke="${INK_MID}" stroke-width="6"/>
  <path d="M 230 275 L 230 460" stroke="${INK_MID}" stroke-width="7"/>
  <path d="M 290 270 L 275 450" stroke="${INK_MID}" stroke-width="6"/>

  <!-- Herbs spilling from basket -->
  <path d="M 160 255 Q 110 200 80 160 Q 130 180 175 240" fill="${INK_DARK}"/>
  <path d="M 210 250 Q 180 170 195 120 Q 215 170 225 245" fill="${INK_MID}"/>
  <path d="M 260 250 Q 300 180 340 140 Q 315 190 275 250" fill="${INK_DARK}"/>

  <!-- Curved Harvesting Sickle (Liềm Gặt Thuốc) hooked over rim -->
  <!-- Wooden Handle -->
  <path d="M 330 380 L 410 450" stroke="${INK_DARK}" stroke-width="26" stroke-linecap="round"/>
  <path d="M 330 380 L 410 450" stroke="#78350F" stroke-width="18" stroke-linecap="round"/>
  <!-- Vermilion Handle Wrap Cord -->
  <path d="M 360 410 L 375 425" stroke="${CINNABAR}" stroke-width="8"/>
  <path d="M 370 420 L 385 435" stroke="${CINNABAR}" stroke-width="8"/>
  <path d="M 405 445 Q 435 470 450 490" stroke="${CINNABAR}" stroke-width="7" stroke-linecap="round" fill="none"/>

  <!-- Steel Sickle Blade: Sharp sweeping crescent -->
  <path d="M 325 375 C 340 280 380 180 310 100 C 370 140 430 250 335 385 Z" fill="${INK_DARK}" stroke="${INK_DARK}" stroke-width="6"/>
  <path d="M 320 370 C 335 285 375 195 315 115 C 355 155 405 250 330 375 Z" fill="#E2E8F0"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 26: ox-cart-hien.png (Xe bò Hiền — bánh xe bò)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/ox-cart-hien.png',
    name: 'ox-cart-hien',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Heavy Rustic Wooden Ox-Cart Wheel (Bánh Xe Bò Cổ) -->
  <!-- Outer Iron Rim (Niềng sắt) -->
  <circle cx="256" cy="256" r="195" fill="none" stroke="${INK_DARK}" stroke-width="24"/>
  <!-- Wooden Felloe Rim (Vành bánh xe gỗ) -->
  <circle cx="256" cy="256" r="176" fill="none" stroke="#A16207" stroke-width="20"/>
  <circle cx="256" cy="256" r="162" fill="none" stroke="${INK_DARK}" stroke-width="8"/>

  <!-- 12 Radiating Chiseled Wooden Spokes (Nan Hoa Gỗ) -->
  <g stroke="${INK_DARK}" stroke-width="14" stroke-linecap="round">
    <line x1="256" y1="95" x2="256" y2="195"/>
    <line x1="256" y1="317" x2="256" y2="417"/>
    <line x1="95" y1="256" x2="195" y2="256"/>
    <line x1="317" y1="256" x2="417" y2="256"/>
    <line x1="142" y1="142" x2="213" y2="213"/>
    <line x1="299" y1="299" x2="370" y2="370"/>
    <line x1="370" y1="142" x2="299" y2="213"/>
    <line x1="213" y1="299" x2="142" y2="370"/>
    <!-- intermediate angled spokes -->
    <line x1="180" y1="110" x2="230" y2="200"/>
    <line x1="332" y1="402" x2="282" y2="312"/>
    <line x1="110" y1="332" x2="200" y2="282"/>
    <line x1="402" y1="180" x2="312" y2="230"/>
  </g>

  <!-- Heavy Wooden Axle Hub (Trục bánh xe / Đùm gỗ) -->
  <circle cx="256" cy="256" r="62" fill="#78350F" stroke="${INK_DARK}" stroke-width="12"/>
  <circle cx="256" cy="256" r="42" fill="${INK_DARK}"/>

  <!-- Linchpin & Axle Hole with Vermilion Binding Ribbon -->
  <circle cx="256" cy="256" r="24" fill="${CINNABAR}"/>
  <rect x="248" y="210" width="16" height="92" rx="6" fill="${INK_DARK}" stroke="${INK_MID}" stroke-width="4"/>
  <!-- Vermilion Silk Tassel knotted around axle -->
  <circle cx="256" cy="256" r="12" fill="${CINNABAR_BRIGHT}"/>
  <path d="M 256 256 Q 280 320 270 380 Q 255 430 275 465" stroke="${CINNABAR}" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M 260 330 Q 300 370 295 420" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round" fill="none"/>

  <!-- Iron studs on rim (Đinh sắt tán vành) -->
  <g fill="${INK_DARK}">
    <circle cx="256" cy="74" r="7"/>
    <circle cx="256" cy="438" r="7"/>
    <circle cx="74" cy="256" r="7"/>
    <circle cx="438" cy="256" r="7"/>
    <circle cx="127" cy="127" r="7"/>
    <circle cx="385" cy="385" r="7"/>
    <circle cx="385" cy="127" r="7"/>
    <circle cx="127" cy="385" r="7"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // Item 27: woodcutter-bong.png (Tiều phu Bồng — rìu + củi đẵn)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/woodcutter-bong.png',
    name: 'woodcutter-bong',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Heavy Tree Stump (Gốc cây xẻ củi) -->
  <ellipse cx="256" cy="370" rx="140" ry="40" fill="#D4A373" stroke="${INK_DARK}" stroke-width="12"/>
  <path d="M 116 370 C 110 430 130 465 256 465 C 382 465 402 430 396 370 Z" fill="#8C532B" stroke="${INK_DARK}" stroke-width="12"/>
  <!-- Growth rings and fracture crack on stump -->
  <ellipse cx="256" cy="370" rx="100" ry="26" fill="none" stroke="${INK_DARK}" stroke-width="5" opacity="0.6"/>
  <ellipse cx="256" cy="370" rx="60" ry="16" fill="none" stroke="${INK_DARK}" stroke-width="5" opacity="0.6"/>
  <path d="M 256 370 L 320 380 L 360 375" stroke="${INK_DARK}" stroke-width="8" fill="none"/>

  <!-- Split Firewood Logs on sides -->
  <g transform="rotate(-30 150 390)">
    <rect x="120" y="340" width="40" height="90" rx="10" fill="#A47148" stroke="${INK_DARK}" stroke-width="8"/>
    <ellipse cx="140" cy="340" rx="20" ry="10" fill="#E8C39E" stroke="${INK_DARK}" stroke-width="6"/>
  </g>
  <g transform="rotate(25 360 400)">
    <rect x="340" y="350" width="38" height="85" rx="8" fill="#A47148" stroke="${INK_DARK}" stroke-width="8"/>
    <ellipse cx="359" cy="350" rx="19" ry="9" fill="#E8C39E" stroke="${INK_DARK}" stroke-width="6"/>
  </g>

  <!-- Heavy Iron Splitting Axe (Rìu tiều phu chém sâu vào thớt gỗ) -->
  <!-- Long Ash Wood Handle -->
  <g transform="rotate(-38 256 360)">
    <path d="M 242 70 L 260 70 L 266 370 L 236 370 Z" fill="#D4A373" stroke="${INK_DARK}" stroke-width="10"/>
    <!-- Vermilion Grip Wrap (Dây quấn chuôi rìu) -->
    <rect x="238" y="110" width="26" height="12" rx="3" fill="${CINNABAR}"/>
    <rect x="239" y="130" width="26" height="12" rx="3" fill="${CINNABAR}"/>
    <rect x="240" y="150" width="26" height="12" rx="3" fill="${CINNABAR}"/>
    <path d="M 250 80 Q 220 50 210 20" stroke="${CINNABAR}" stroke-width="7" stroke-linecap="round" fill="none"/>

    <!-- Forged Steel Axe Head (Lưỡi rìu thép nặng) -->
    <path d="M 230 330 L 150 310 C 130 360 140 410 160 450 L 240 400 Z" fill="${INK_DARK}" stroke="${INK_DARK}" stroke-width="8"/>
    <!-- Sharp cutting edge in silver wash -->
    <path d="M 152 315 C 135 360 145 405 162 445 L 175 435 C 160 400 152 360 165 325 Z" fill="#E2E8F0"/>
    <!-- Axe butt poll hammer -->
    <rect x="258" y="340" width="28" height="45" rx="4" fill="${INK_MID}" stroke="${INK_DARK}" stroke-width="6"/>
  </g>

  <!-- Flying woodchips (Mảnh gỗ bay) in ink wash -->
  <polygon points="190,260 210,250 205,270" fill="${INK_DARK}"/>
  <polygon points="310,270 330,285 305,290" fill="${INK_DARK}"/>
  <polygon points="270,220 285,210 280,230" fill="${INK_MID}"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 28: exile-ba.png (Kẻ lưu đày Bá — gông cùm nứt)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/exile-ba.png',
    name: 'exile-ba',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Heavy Wooden Cangue Neck-Yoke (Gông Cổ Lưu Đày) -->
  <!-- Two split wooden halves held together with pins -->
  <g transform="rotate(8 256 256)">
    <!-- Main heavy rectangular wooden block -->
    <path d="M 70 160 L 442 160 C 455 160 462 170 460 185 L 440 340 C 438 355 425 365 410 365 L 102 365 C 88 365 75 355 72 340 L 52 185 C 50 170 58 160 70 160 Z" fill="#854D0E" stroke="${INK_DARK}" stroke-width="14"/>
    
    <!-- Central Neck Hole (Lỗ gông cổ) -->
    <circle cx="256" cy="262" r="58" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="14"/>
    <!-- Two smaller wrist holes (Lỗ cùm tay) -->
    <circle cx="135" cy="262" r="28" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="10"/>
    <circle cx="377" cy="262" r="28" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="10"/>

    <!-- Dramatic fracture cracks splitting the cangue -->
    <path d="M 230 160 L 245 204 L 235 220" stroke="${INK_DARK}" stroke-width="10" fill="none"/>
    <path d="M 270 304 L 260 330 L 285 365" stroke="${INK_DARK}" stroke-width="12" fill="none"/>
    <path d="M 150 280 L 170 320 L 160 365" stroke="${INK_DARK}" stroke-width="8" fill="none"/>

    <!-- Iron corner brackets & rivets -->
    <path d="M 68 165 L 105 165 L 68 202 Z" fill="${INK_DARK}"/>
    <path d="M 444 165 L 407 165 L 444 202 Z" fill="${INK_DARK}"/>
    <path d="M 70 360 L 105 360 L 70 325 Z" fill="${INK_DARK}"/>
    <path d="M 442 360 L 407 360 L 442 325 Z" fill="${INK_DARK}"/>

    <!-- Vermilion Exile Imperial Seal Stamp (Dấu Đỏ Đày Ải - phong cách triện trừu tượng, KHÔNG chữ Hán) -->
    <rect x="285" y="180" width="55" height="55" rx="6" fill="${CINNABAR}" stroke="${CINNABAR_BRIGHT}" stroke-width="4"/>
    <circle cx="312" cy="207" r="16" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <rect x="306" y="201" width="12" height="12" fill="#FFFFFF"/>
  </g>

  <!-- Snapped Heavy Iron Shackles & Broken Chain (Xích sắt gãy đứt) -->
  <g stroke="${INK_DARK}" stroke-width="12" fill="none" stroke-linecap="round">
    <!-- Left hanging chain links -->
    <path d="M 130 280 Q 90 350 110 420 Q 120 460 100 485"/>
    <circle cx="105" cy="430" r="12" fill="${INK_MID}" stroke="${INK_DARK}" stroke-width="8"/>
    <!-- Right snapped link flying -->
    <path d="M 380 280 Q 420 340 400 410"/>
    <!-- Broken open link -->
    <path d="M 390 415 C 410 410 430 435 415 455 C 400 470 375 450 385 435" stroke-dasharray="28 14"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // Item 29: exorcist-diem.png (Trừ tà Diễm — kiếm đào + bùa)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/exorcist-diem.png',
    name: 'exorcist-diem',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Sacred Peach-Wood Demon-Slaying Sword (Kiếm Gỗ Đào) angled diagonally -->
  <g transform="rotate(-35 256 256)">
    <!-- Peachwood Blade with Lightning / Flame ridges -->
    <path d="M 246 60 L 256 30 L 266 60 L 268 350 L 244 350 Z" fill="#D97706" stroke="${INK_DARK}" stroke-width="8"/>
    <!-- Center spine ridge -->
    <line x1="256" y1="35" x2="256" y2="350" stroke="${INK_DARK}" stroke-width="4"/>
    
    <!-- Cloud & Flame Crossguard (Chắn kiếm hình mây đào) -->
    <path d="M 210 350 Q 256 330 302 350 Q 256 375 210 350 Z" fill="#92400E" stroke="${INK_DARK}" stroke-width="8"/>
    <circle cx="256" cy="355" r="8" fill="${CINNABAR}"/>

    <!-- Handle & Pommel -->
    <rect x="247" y="360" width="18" height="75" rx="5" fill="#78350F" stroke="${INK_DARK}" stroke-width="6"/>
    <!-- Pommel ring with Vermilion silk cord -->
    <circle cx="256" cy="445" r="16" fill="${INK_DARK}"/>
    <circle cx="256" cy="445" r="8" fill="#FFFFFF"/>
    <!-- Vermilion Sword Tassel (Tua kiếm đỏ son) -->
    <path d="M 256 460 Q 275 485 265 520" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M 256 460 Q 240 490 250 520" stroke="${CINNABAR_BRIGHT}" stroke-width="8" stroke-linecap="round" fill="none"/>
  </g>

  <!-- Fluttering Yellow Daoist Talisman Paper (Lá Phù Trừ Tà) wrapping around blade -->
  <g transform="translate(190, 160) rotate(12)">
    <!-- Yellow talisman parchment banner -->
    <path d="M 0 0 Q 30 20 65 0 L 75 140 Q 35 160 5 140 Z" fill="#FDE047" stroke="${INK_DARK}" stroke-width="8"/>
    <!-- Vermilion Rune Calligraphy on Talisman (Phù văn chu sa - hoa văn sấm sét, KHÔNG chữ Hán) -->
    <path d="M 35 15 L 35 35" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="35" cy="45" r="6" fill="${CINNABAR}"/>
    <path d="M 20 60 L 50 60 L 25 80 L 45 80 L 20 110 L 40 110 L 35 130" stroke="${CINNABAR}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- Lightning zap sparkles around blade tip -->
    <path d="M 90 60 L 110 50 L 100 70 L 125 60" stroke="${CINNABAR}" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // Item 30: crane-spirit.png (Tiên hạc — lông hạc trắng)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/crane-spirit.png',
    name: 'crane-spirit',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Luminous White Spirit Crane Feather (Lông Tiên Hạc) -->
  <!-- Central Feather Rachis (Sống lông) -->
  <path d="M 120 440 Q 240 320 370 100" stroke="${INK_DARK}" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M 120 440 Q 240 320 370 100" stroke="#CBD5E1" stroke-width="5" stroke-linecap="round" fill="none"/>

  <!-- Delicate Upper Feather Vanes (Phiến lông hạc tơ trắng) -->
  <!-- Right side vanes -->
  <path d="M 370 100 Q 420 180 380 270 Q 320 330 250 360 Q 290 270 340 190 Z" fill="#F8FAFC" stroke="${INK_DARK}" stroke-width="8"/>
  <!-- Left side vanes with graceful separation gaps -->
  <path d="M 370 100 Q 300 160 250 240 Q 200 320 150 400 Q 200 300 280 200 Z" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="8"/>
  
  <!-- Black ink tip marking on crane wing feather -->
  <path d="M 370 100 Q 355 130 340 150 Q 365 140 370 100 Z" fill="${INK_DARK}"/>
  <path d="M 370 100 Q 385 130 395 155 Q 380 140 370 100 Z" fill="${INK_DARK}"/>

  <!-- Soft airy down barbules near quill base -->
  <g stroke="${INK_MID}" stroke-width="4" fill="none" stroke-linecap="round">
    <path d="M 160 400 Q 140 380 120 390"/>
    <path d="M 175 385 Q 150 360 130 375"/>
    <path d="M 190 370 Q 180 340 160 350"/>
    <path d="M 180 410 Q 200 420 220 410"/>
    <path d="M 195 395 Q 220 400 240 390"/>
  </g>

  <!-- Glowing Vermilion Cinnabar Spirit Jewel Bead at Quill Base (Hạt ngọc đan sa tiên khí) -->
  <circle cx="120" cy="440" r="18" fill="${CINNABAR}"/>
  <circle cx="116" cy="436" r="6" fill="${CINNABAR_BRIGHT}"/>
  <!-- Ethereal spirit mist spirals -->
  <path d="M 120 440 Q 90 420 80 445 Q 75 470 105 475" stroke="${CINNABAR}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M 120 440 Q 145 460 160 445 Q 170 425 150 415" stroke="${CINNABAR}" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 50: ash-priest-cuu.png (Tư tế Cửu — bình tro + xương)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/ash-priest-cuu.png',
    name: 'ash-priest-cuu',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <defs>
    <radialGradient id="ashUrn" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#4A3B32"/>
      <stop offset="60%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="${INK_DARK}"/>
    </radialGradient>
  </defs>

  <!-- Rising Spirit Smoke Trails from Urn -->
  <g stroke="${INK_DARK}" fill="none" stroke-linecap="round">
    <path d="M 256 180 Q 220 120 250 80 Q 280 40 240 15" stroke-width="12" opacity="0.7"/>
    <path d="M 275 175 Q 315 130 290 85 Q 270 45 300 20" stroke-width="8" opacity="0.5"/>
    <path d="M 235 170 Q 195 125 215 75" stroke-width="7" opacity="0.4"/>
  </g>

  <!-- Ancient Ritual Bone Ash Urn (Bình Tro Cốt Cổ) -->
  <!-- Urn Rim & Lid Opening -->
  <ellipse cx="256" cy="190" rx="110" ry="32" fill="${INK_DARK}" stroke="${INK_DARK}" stroke-width="8"/>
  <ellipse cx="256" cy="190" rx="92" ry="22" fill="#1C140E"/>

  <!-- Urn Body (Thân bình gốm tro) -->
  <path d="M 146 190 C 130 280 160 380 256 380 C 352 380 382 280 366 190 Z" fill="url(#ashUrn)" stroke="${INK_DARK}" stroke-width="10"/>

  <!-- Ritual Bone / Horn handles on sides -->
  <path d="M 148 210 C 80 220 90 300 155 300" fill="none" stroke="${INK_DARK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M 364 210 C 432 220 422 300 357 300" fill="none" stroke="${INK_DARK}" stroke-width="16" stroke-linecap="round"/>

  <!-- Ritual Bone Fragments (Mảnh linh cốt trắng) carved on urn front -->
  <!-- Crossed bone relics -->
  <path d="M 210 260 L 302 320" stroke="#F1F5F9" stroke-width="12" stroke-linecap="round"/>
  <path d="M 210 320 L 302 260" stroke="#F1F5F9" stroke-width="12" stroke-linecap="round"/>
  <circle cx="206" cy="256" r="8" fill="#F1F5F9"/>
  <circle cx="214" cy="256" r="8" fill="#F1F5F9"/>
  <circle cx="306" cy="324" r="8" fill="#F1F5F9"/>
  <circle cx="298" cy="324" r="8" fill="#F1F5F9"/>

  <!-- Tripod Feet (Chân vạc ba chạc) -->
  <path d="M 180 370 L 165 445 L 195 440 L 205 378 Z" fill="${INK_DARK}"/>
  <path d="M 332 370 L 347 445 L 317 440 L 307 378 Z" fill="${INK_DARK}"/>
  <path d="M 246 380 L 246 450 L 266 450 L 266 380 Z" fill="${INK_DARK}"/>

  <!-- Vermilion Braided Cord & Knotted Tassels (Dây chu sa trừ linh) -->
  <ellipse cx="256" cy="225" rx="112" ry="12" fill="none" stroke="${CINNABAR}" stroke-width="8"/>
  <!-- Center talisman seal knot -->
  <circle cx="256" cy="235" r="14" fill="${CINNABAR}"/>
  <path d="M 256 245 L 256 340" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
  <path d="M 256 245 Q 240 280 235 325" stroke="${CINNABAR_BRIGHT}" stroke-width="6" stroke-linecap="round"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 51: name-collector-tra.png (Sưu tập tên Trà — bài vị không chữ)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/name-collector-tra.png',
    name: 'name-collector-tra',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Blank Ancestral Spirit Tablet (Bài Vị Không Chữ — Tẩy Xóa Tên) -->
  <!-- Tiered Pedestal Base (Chân đế bài vị) -->
  <rect x="130" y="420" width="252" height="30" rx="6" fill="#78350F" stroke="${INK_DARK}" stroke-width="10"/>
  <rect x="160" y="390" width="192" height="32" rx="4" fill="#92400E" stroke="${INK_DARK}" stroke-width="8"/>
  <!-- Lotus petals on pedestal -->
  <path d="M 160 390 Q 256 365 352 390" fill="none" stroke="${INK_DARK}" stroke-width="6"/>

  <!-- Main Tablet Board (Thân bài vị sơn then viền son) -->
  <path d="M 180 130 L 332 130 L 322 390 L 190 390 Z" fill="#2E1B10" stroke="${INK_DARK}" stroke-width="12"/>
  
  <!-- Ornate Carved Crown Header (Mũ bài vị chạm vân mây) -->
  <path d="M 160 135 C 160 80 210 60 256 50 C 302 60 352 80 352 135 Z" fill="#92400E" stroke="${INK_DARK}" stroke-width="10"/>
  <!-- Vermilion Crown Crest (Đỉnh mây son) -->
  <circle cx="256" cy="75" r="14" fill="${CINNABAR}"/>
  <path d="M 230 100 Q 256 80 282 100 Q 256 120 230 100 Z" fill="${CINNABAR_BRIGHT}"/>

  <!-- Central Inner Plaque: STRICTLY BLANK (Không Chữ — biểu tượng tên bị xóa sổ) -->
  <rect x="205" y="145" width="102" height="230" rx="4" fill="#F8FAFC" stroke="${INK_DARK}" stroke-width="8"/>
  <rect x="212" y="152" width="88" height="216" fill="#EDE8DF"/>

  <!-- Vermilion Border Inlay around blank tablet -->
  <rect x="208" y="148" width="96" height="224" fill="none" stroke="${CINNABAR}" stroke-width="4"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 52: ice-hermit-bang.png (Ẩn sĩ Băng — băng tinh + râu đóng băng)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/ice-hermit-bang.png',
    name: 'ice-hermit-bang',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Glacial Frost Crystals & Icicles (Băng Tinh Tự Nhiên - KHÔNG sci-fi!) -->
  <!-- Main vertical central frost shard -->
  <polygon points="256,40 285,180 256,310 227,180" fill="#E0F2FE" stroke="${INK_DARK}" stroke-width="10"/>
  <line x1="256" y1="45" x2="256" y2="305" stroke="${INK_DARK}" stroke-width="5"/>

  <!-- Flanking sharp natural ice crystal facets -->
  <polygon points="256,120 340,160 300,280 256,230" fill="#BAE6FD" stroke="${INK_DARK}" stroke-width="9"/>
  <polygon points="256,120 172,160 212,280 256,230" fill="#F0F9FF" stroke="${INK_DARK}" stroke-width="9"/>
  <polygon points="310,210 390,240 340,320 280,280" fill="#E0F2FE" stroke="${INK_DARK}" stroke-width="8"/>
  <polygon points="202,210 122,240 172,320 232,280" fill="#BAE6FD" stroke="${INK_DARK}" stroke-width="8"/>

  <!-- Frozen Silver-White Beard & Icicle Whisker Strands (Râu đóng băng giá tuyết) -->
  <g stroke="${INK_DARK}" fill="none" stroke-linecap="round">
    <!-- Flowing frozen beard curls sweeping downward -->
    <path d="M 230 290 Q 210 360 220 440 Q 225 475 210 495" stroke-width="12"/>
    <path d="M 256 310 Q 256 390 250 455 Q 248 485 256 500" stroke-width="14"/>
    <path d="M 282 290 Q 302 360 292 440 Q 287 475 302 495" stroke-width="12"/>
    
    <!-- White frosted frost highlights on beard strands -->
    <path d="M 233 295 Q 215 365 224 435" stroke="#FFFFFF" stroke-width="6"/>
    <path d="M 256 315 Q 257 395 252 450" stroke="#FFFFFF" stroke-width="7"/>
    <path d="M 279 295 Q 297 365 288 435" stroke="#FFFFFF" stroke-width="6"/>
    
    <!-- Side frozen whiskers (Râu mép đóng băng rủ xuống) -->
    <path d="M 180 300 Q 150 350 140 400" stroke-width="9"/>
    <path d="M 332 300 Q 362 350 372 400" stroke-width="9"/>
  </g>

  <!-- Glowing Vermilion Cinnabar Heart within Core Crystal (Lõi đan sa băng hỏa) -->
  <polygon points="256,150 270,195 256,230 242,195" fill="${CINNABAR}" stroke="${CINNABAR_BRIGHT}" stroke-width="4"/>
  <circle cx="256" cy="195" r="8" fill="#FFFFFF"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 53: snow-guard-han.png (Vệ binh Hàn — giáo + áo lông)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/snow-guard-han.png',
    name: 'snow-guard-han',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Frost-Forged Heavy Iron Spear (Ngọn Giáo Tuyết Hàn Băng) -->
  <!-- Broad Spearhead Blade (Mũi giáo lá ngô dày) -->
  <g transform="rotate(22 256 256)">
    <!-- Long stout wooden spear shaft -->
    <line x1="256" y1="180" x2="256" y2="480" stroke="${INK_DARK}" stroke-width="22" stroke-linecap="round"/>
    <line x1="256" y1="180" x2="256" y2="480" stroke="#78350F" stroke-width="14" stroke-linecap="round"/>

    <!-- Forged Steel Spearhead -->
    <path d="M 256 30 L 285 100 L 275 200 L 256 215 L 237 200 L 227 100 Z" fill="#E2E8F0" stroke="${INK_DARK}" stroke-width="12"/>
    <!-- Center reinforcing blood ridge -->
    <line x1="256" y1="35" x2="256" y2="210" stroke="${INK_DARK}" stroke-width="6"/>

    <!-- Thick Winter Beast Fur Collar / Mantle (Cổ áo lông tuyết quấn cổ giáo) -->
    <!-- Cloud-like fluffy fur collar in calligraphic strokes -->
    <path d="M 210 200 C 170 190 170 250 200 270 C 180 290 220 320 256 310 C 292 320 332 290 312 270 C 342 250 342 190 302 200 Z" fill="#F8FAFC" stroke="${INK_DARK}" stroke-width="12"/>
    <!-- Fur texture tufts -->
    <path d="M 215 220 Q 230 250 215 270" stroke="${INK_MID}" stroke-width="5" fill="none"/>
    <path d="M 297 220 Q 282 250 297 270" stroke="${INK_MID}" stroke-width="5" fill="none"/>
    <path d="M 245 230 Q 256 270 267 230" stroke="${INK_MID}" stroke-width="5" fill="none"/>

    <!-- Fluttering Vermilion Spear Tassel (Tua giáo lông đỏ son) -->
    <circle cx="256" cy="305" r="14" fill="${CINNABAR}"/>
    <path d="M 256 315 Q 310 360 330 420 Q 310 460 345 490" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M 256 315 Q 280 370 295 440" stroke="${CINNABAR_BRIGHT}" stroke-width="8" stroke-linecap="round" fill="none"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // Item 54: caravan-duong.png (Thủ lĩnh Dương — cờ đoàn xe)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/caravan-duong.png',
    name: 'caravan-duong',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Caravan Merchant Battle Banner / Pennant (Cờ Đoàn Xe Thương Buôn - KHÔNG bình nước!) -->
  <!-- Tall Wooden Flagpole Staff -->
  <line x1="120" y1="40" x2="120" y2="480" stroke="${INK_DARK}" stroke-width="18" stroke-linecap="round"/>
  <line x1="120" y1="40" x2="120" y2="480" stroke="#78350F" stroke-width="10" stroke-linecap="round"/>

  <!-- Ornate Spearhead Flagpole Finial (Ngọn cờ nhọn bọc đồng) -->
  <polygon points="120,20 135,55 120,65 105,55" fill="${INK_DARK}"/>
  <circle cx="120" cy="65" r="10" fill="${CINNABAR}"/>

  <!-- Flying Silk Banner Streamer (Lá cờ đuôi nheo lộng gió) -->
  <path d="M 120 75 L 390 130 Q 430 140 400 190 L 330 215 L 420 260 Q 440 290 390 310 L 120 270 Z" fill="#FEF08A" stroke="${INK_DARK}" stroke-width="14" stroke-linejoin="round"/>

  <!-- Serrated Silk Fringe / Tassels on Trailing Hem -->
  <path d="M 120 270 L 140 300 L 160 273 L 180 305 L 200 277 L 220 310 L 240 280 L 260 315 L 280 285 L 300 320 L 320 290" stroke="${INK_DARK}" stroke-width="6" fill="${INK_DARK}"/>

  <!-- Prominent Vermilion Caravan Crest (Huy Hiệu Đoàn Xe Mặt Trời Son Đỏ) -->
  <!-- Radiating sun-wheel crest -->
  <circle cx="235" cy="175" r="45" fill="${CINNABAR}" stroke="${INK_DARK}" stroke-width="8"/>
  <circle cx="235" cy="175" r="28" fill="#FEF08A" stroke="${INK_DARK}" stroke-width="6"/>
  <circle cx="235" cy="175" r="14" fill="${CINNABAR}"/>
  <!-- 8 Cardinal Rays on Crest -->
  <g stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round">
    <line x1="235" y1="120" x2="235" y2="135"/>
    <line x1="235" y1="215" x2="235" y2="230"/>
    <line x1="180" y1="175" x2="195" y2="175"/>
    <line x1="275" y1="175" x2="290" y2="175"/>
  </g>

  <!-- Vermilion Pole Ribbon Streamers whipping below banner -->
  <path d="M 120 280 Q 90 340 70 410 Q 55 450 75 470" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M 120 280 Q 140 350 130 420 Q 120 460 140 480" stroke="${CINNABAR_BRIGHT}" stroke-width="8" stroke-linecap="round" fill="none"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 55: dune-guide-sa.png (Hướng dẫn Sa — la bàn + cát chảy)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/dune-guide-sa.png',
    name: 'dune-guide-sa',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Undulating Desert Sand Dunes (Đụn Cát Sa Mạc Lộng Gió) -->
  <g stroke="${INK_DARK}" stroke-linecap="round" fill="none">
    <path d="M 40 380 Q 180 340 290 385 Q 390 420 480 370" stroke-width="16"/>
    <path d="M 20 440 Q 150 400 270 435 Q 380 465 490 430" stroke-width="14"/>
    <path d="M 80 320 Q 200 285 320 325 Q 400 350 470 315" stroke-width="10" opacity="0.4"/>
  </g>

  <!-- Ancient Octagonal Geomantic Feng-Shui Compass (La Bàn Sa Mạc Cổ - KHÔNG kính minion!) -->
  <g transform="translate(0, -30)">
    <!-- Octagonal Brass Outer Case (Vỏ đồng bát giác) -->
    <polygon points="256,90 365,135 410,244 365,353 256,398 147,353 102,244 147,135" fill="#D97706" stroke="${INK_DARK}" stroke-width="14" stroke-linejoin="round"/>
    
    <!-- Circular Dial Face (Mặt kính la bàn) -->
    <circle cx="256" cy="244" r="120" fill="#FEF3C7" stroke="${INK_DARK}" stroke-width="12"/>
    <circle cx="256" cy="244" r="95" fill="none" stroke="${INK_MID}" stroke-width="4" stroke-dasharray="8 6"/>
    <circle cx="256" cy="244" r="65" fill="none" stroke="${INK_MID}" stroke-width="3"/>

    <!-- Compass Degree & Cardinal Notches (Vạch phương hướng) -->
    <g stroke="${INK_DARK}" stroke-width="6" stroke-linecap="round">
      <line x1="256" y1="130" x2="256" y2="150"/>
      <line x1="256" y1="338" x2="256" y2="358"/>
      <line x1="142" y1="244" x2="162" y2="244"/>
      <line x1="350" y1="244" x2="370" y2="244"/>
    </g>

    <!-- Balanced Dynamic Magnetic Needle (Kim Nam Châm Chỉ Hướng) -->
    <!-- North Pointing Arrow (Vermilion Red Cinnabar Tip) -->
    <polygon points="256,145 272,244 256,236 240,244" fill="${CINNABAR}" stroke="${INK_DARK}" stroke-width="6"/>
    <!-- South Pointing Arrow (Deep Ink Dark Tip) -->
    <polygon points="256,343 272,244 256,252 240,244" fill="${INK_DARK}" stroke="${INK_DARK}" stroke-width="6"/>

    <!-- Center Pivot Brass Jewel (Trục kim la bàn) -->
    <circle cx="256" cy="244" r="14" fill="${GOLD}" stroke="${INK_DARK}" stroke-width="6"/>
    <circle cx="256" cy="244" r="6" fill="${CINNABAR_BRIGHT}"/>

    <!-- Top Hanging Brass Loop & Vermilion Cord -->
    <circle cx="256" cy="80" r="18" fill="none" stroke="${INK_DARK}" stroke-width="10"/>
    <path d="M 256 62 Q 285 30 270 10" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round" fill="none"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // Item 56: lake-keeper-trang.png (Người giữ hồ Trang — đèn hồ + lưới)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/lake-keeper-trang.png',
    name: 'lake-keeper-trang',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Water Ripples (Sóng nước hồ Nguyệt Ảnh) -->
  <g stroke="${INK_DARK}" stroke-width="8" stroke-linecap="round" fill="none">
    <path d="M 60 430 Q 160 415 256 435 Q 360 450 460 425"/>
    <path d="M 110 465 Q 210 450 290 465 Q 380 480 430 460"/>
  </g>

  <!-- Bamboo & Silk Floating Lake Lantern (Đèn Thả Hồ) -->
  <!-- Wooden Float Base Plaque -->
  <ellipse cx="256" cy="390" rx="120" ry="32" fill="#854D0E" stroke="${INK_DARK}" stroke-width="12"/>
  
  <!-- Octagonal Lantern Framework (Khung đèn lồng nan tre) -->
  <!-- Lantern glowing translucent paper body -->
  <path d="M 170 380 L 195 190 L 317 190 L 342 380 Z" fill="#FEF08A" stroke="${INK_DARK}" stroke-width="12"/>
  
  <!-- Bamboo corner struts (Nan góc tre) -->
  <line x1="195" y1="190" x2="170" y2="380" stroke="${INK_DARK}" stroke-width="10"/>
  <line x1="317" y1="190" x2="342" y2="380" stroke="${INK_DARK}" stroke-width="10"/>
  <line x1="256" y1="190" x2="256" y2="385" stroke="${INK_DARK}" stroke-width="10"/>

  <!-- Lantern Pagoda-Style Roof (Mái đèn cong) -->
  <path d="M 160 195 C 200 175 240 140 256 120 C 272 140 312 175 352 195 Z" fill="#92400E" stroke="${INK_DARK}" stroke-width="12"/>
  <circle cx="256" cy="120" r="12" fill="${CINNABAR}"/>

  <!-- Glowing Vermilion Oil Flame Core (Ngọn lửa hoa đăng đỏ ấm) -->
  <ellipse cx="256" cy="285" rx="28" ry="45" fill="${CINNABAR}" stroke="${CINNABAR_BRIGHT}" stroke-width="4"/>
  <ellipse cx="256" cy="295" rx="14" ry="24" fill="#FEF08A"/>

  <!-- Gossamer Fishing Net (Lưới Đánh Cá) draped artfully over lantern -->
  <g stroke="${INK_MID}" stroke-width="4" fill="none">
    <!-- Diamond mesh draped from lantern rim into water -->
    <path d="M 170 380 Q 230 350 280 430"/>
    <path d="M 190 380 Q 250 360 310 435"/>
    <path d="M 210 380 Q 270 370 340 440"/>
    <path d="M 280 380 Q 230 400 170 430"/>
    <path d="M 310 380 Q 260 410 200 445"/>
    <path d="M 335 380 Q 290 420 230 455"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // Item 57: ferryman-cau.png (Người chở đò Câu — sào chống + thuyền con)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/ferryman-cau.png',
    name: 'ferryman-cau',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- River Currents & Waves (Sóng nước bến đò) -->
  <g stroke="${INK_DARK}" stroke-width="8" stroke-linecap="round" fill="none">
    <path d="M 50 410 Q 150 395 240 415 Q 340 430 460 405"/>
    <path d="M 90 445 Q 190 430 280 445 Q 380 460 440 440"/>
  </g>

  <!-- Traditional Wooden Sampan Ferry Boat (Thuyền Tam Bản Con) -->
  <!-- Boat Hull seen in sweeping perspective -->
  <path d="M 70 340 C 130 385 360 385 440 310 C 370 355 150 355 70 340 Z" fill="#92400E" stroke="${INK_DARK}" stroke-width="12"/>
  <path d="M 70 340 C 150 375 360 375 440 310 L 415 285 C 345 330 160 330 95 315 Z" fill="#78350F" stroke="${INK_DARK}" stroke-width="10"/>

  <!-- Wooden Thwart / Bench inside boat (Ván ngồi chèo) -->
  <polygon points="210,335 270,335 285,348 220,348" fill="#451A03" stroke="${INK_DARK}" stroke-width="6"/>

  <!-- Long Bamboo Punt Pole (Sào Chống Đò) resting diagonally across boat -->
  <line x1="80" y1="460" x2="430" y2="80" stroke="${INK_DARK}" stroke-width="18" stroke-linecap="round"/>
  <line x1="80" y1="460" x2="430" y2="80" stroke="#CA8A04" stroke-width="10" stroke-linecap="round"/>
  <!-- Bamboo joints / nodes -->
  <line x1="140" y1="395" x2="148" y2="387" stroke="${INK_DARK}" stroke-width="6"/>
  <line x1="220" y1="308" x2="228" y2="300" stroke="${INK_DARK}" stroke-width="6"/>
  <line x1="300" y1="221" x2="308" y2="213" stroke="${INK_DARK}" stroke-width="6"/>
  <line x1="380" y1="134" x2="388" y2="126" stroke="${INK_DARK}" stroke-width="6"/>

  <!-- Vermilion Bow Painter Mooring Rope (Dây mũi thuyền đỏ son buộc cọc) -->
  <circle cx="78" cy="336" r="10" fill="${CINNABAR}"/>
  <path d="M 78 336 Q 60 300 45 250 Q 55 220 70 230" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M 78 336 Q 100 300 90 260" stroke="${CINNABAR_BRIGHT}" stroke-width="6" stroke-linecap="round" fill="none"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 58: dice-master-luc.png (Bậc thầy Lục — đĩa + hai viên xúc xắc)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/dice-master-luc.png',
    name: 'dice-master-luc',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Celadon Porcelain Gambling Dish / Saucer (Đĩa Men Ngọc Đổ Xúc Xắc) -->
  <ellipse cx="256" cy="275" rx="195" ry="120" fill="#E2E8F0" stroke="${INK_DARK}" stroke-width="16"/>
  <ellipse cx="256" cy="275" rx="165" ry="95" fill="#F8FAFC" stroke="${INK_DARK}" stroke-width="8"/>
  <ellipse cx="256" cy="275" rx="125" ry="70" fill="#E2E8F0" stroke="${INK_MID}" stroke-width="4"/>

  <!-- Two Tumbling Ivory Bone Dice (Hai Viên Xúc Xắc Ngà Voi) -->
  <!-- Die 1: Upper Left (Showing Face 1 with Large Vermilion Pip & Faces 2, 3) -->
  <g transform="translate(165, 195) rotate(-14)">
    <!-- Cube faces in isometric projection -->
    <!-- Top Face (Showing single prominent Cinnabar One pip) -->
    <polygon points="40,0 90,18 50,45 0,25" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="45" cy="22" r="12" fill="${CINNABAR}"/>

    <!-- Left Face (Showing 2 dark pips) -->
    <polygon points="0,25 50,45 50,105 0,82" fill="#E2E8F0" stroke="${INK_DARK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="25" cy="52" r="5" fill="${INK_DARK}"/>
    <circle cx="25" cy="78" r="5" fill="${INK_DARK}"/>

    <!-- Right Face (Showing 3 dark pips) -->
    <polygon points="50,45 90,18 90,75 50,105" fill="#CBD5E1" stroke="${INK_DARK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="65" cy="62" r="5" fill="${INK_DARK}"/>
    <circle cx="75" cy="74" r="5" fill="${INK_DARK}"/>
    <circle cx="85" cy="86" r="5" fill="${INK_DARK}"/>
  </g>

  <!-- Die 2: Lower Right (Showing Face 4 with Four Cinnabar Pips & Faces 5, 6) -->
  <g transform="translate(265, 230) rotate(18)">
    <!-- Top Face (Showing 4 prominent Vermilion pips - traditional East Asian dice!) -->
    <polygon points="45,0 95,20 52,50 0,28" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="32" cy="18" r="6" fill="${CINNABAR}"/>
    <circle cx="62" cy="22" r="6" fill="${CINNABAR}"/>
    <circle cx="25" cy="32" r="6" fill="${CINNABAR}"/>
    <circle cx="55" cy="38" r="6" fill="${CINNABAR}"/>

    <!-- Left Face (Showing 5 dark pips) -->
    <polygon points="0,28 52,50 52,110 0,86" fill="#E2E8F0" stroke="${INK_DARK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="16" cy="50" r="5" fill="${INK_DARK}"/>
    <circle cx="36" cy="58" r="5" fill="${INK_DARK}"/>
    <circle cx="26" cy="69" r="5" fill="${INK_DARK}"/>
    <circle cx="16" cy="78" r="5" fill="${INK_DARK}"/>
    <circle cx="36" cy="88" r="5" fill="${INK_DARK}"/>

    <!-- Right Face (Showing 6 dark pips) -->
    <polygon points="52,50 95,20 95,78 52,110" fill="#CBD5E1" stroke="${INK_DARK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="68" cy="60" r="5" fill="${INK_DARK}"/>
    <circle cx="82" cy="50" r="5" fill="${INK_DARK}"/>
    <circle cx="68" cy="78" r="5" fill="${INK_DARK}"/>
    <circle cx="82" cy="68" r="5" fill="${INK_DARK}"/>
    <circle cx="68" cy="95" r="5" fill="${INK_DARK}"/>
    <circle cx="82" cy="85" r="5" fill="${INK_DARK}"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // Item 59: map-seller-man.png (Bán bản đồ Mẫn — cuộn bản đồ + la bàn)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/map-seller-man.png',
    name: 'map-seller-man',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Partially Unrolled Antique Map Scroll (Cuộn Bản Đồ Cổ) -->
  <g transform="rotate(-15 256 256)">
    <!-- Unrolled parchment sheet -->
    <path d="M 120 120 L 360 120 C 375 120 380 135 380 150 L 375 360 C 375 375 365 385 350 385 L 110 385 C 95 385 90 370 90 355 L 95 145 C 95 130 105 120 120 120 Z" fill="#FDE68A" stroke="${INK_DARK}" stroke-width="12"/>
    
    <!-- Rolled scroll curl cylinders at top and bottom ends -->
    <ellipse cx="108" cy="252" rx="14" ry="118" fill="#D97706" stroke="${INK_DARK}" stroke-width="10"/>
    <ellipse cx="377" cy="252" rx="14" ry="118" fill="#B45309" stroke="${INK_DARK}" stroke-width="10"/>

    <!-- Antique Ink Contours on Map (Hải trình, dãy núi, dòng sông vẽ mực tàu) -->
    <!-- Mountain ranges in calligraphic wash -->
    <path d="M 150 200 L 175 160 L 200 200 L 225 150 L 250 200" fill="none" stroke="${INK_DARK}" stroke-width="6"/>
    <path d="M 230 280 L 255 240 L 280 280 L 305 235 L 330 280" fill="none" stroke="${INK_DARK}" stroke-width="6"/>
    <!-- River / Shoreline route -->
    <path d="M 160 330 Q 230 300 250 240 Q 280 180 340 160" stroke="${INK_MID}" stroke-width="5" stroke-dasharray="8 6" fill="none"/>
  </g>

  <!-- Heavy Brass Navigation Compass (La bàn định hướng) resting on map -->
  <g transform="translate(190, 160)">
    <circle cx="100" cy="100" r="65" fill="#D97706" stroke="${INK_DARK}" stroke-width="10"/>
    <circle cx="100" cy="100" r="50" fill="#FEF3C7" stroke="${INK_DARK}" stroke-width="6"/>
    <!-- Dial Crosshairs -->
    <line x1="100" y1="55" x2="100" y2="145" stroke="${INK_LIGHT}" stroke-width="3"/>
    <line x1="55" y1="100" x2="145" y2="100" stroke="${INK_LIGHT}" stroke-width="3"/>
    <!-- Vermilion Magnetic Needle -->
    <polygon points="100,60 108,100 100,95 92,100" fill="${CINNABAR}" stroke="${INK_DARK}" stroke-width="4"/>
    <polygon points="100,140 108,100 100,105 92,100" fill="${INK_DARK}" stroke="${INK_DARK}" stroke-width="4"/>
    <circle cx="100" cy="100" r="7" fill="${GOLD}"/>
  </g>

  <!-- Vermilion Braided Silk Tie Ribbon on Scroll (Dây lụa son đỏ buộc cuộn đồ) -->
  <path d="M 100 260 Q 60 300 40 370 Q 30 420 50 450" stroke="${CINNABAR}" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M 100 260 Q 110 320 95 380 Q 85 430 110 460" stroke="${CINNABAR_BRIGHT}" stroke-width="7" stroke-linecap="round" fill="none"/>
</svg>`
  },

  // ----------------------------------------------------
  // Item 60: ward-carver-khue.png (Thợ khắc Khuê — đục + tấm phù)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/ward-carver-khue.png',
    name: 'ward-carver-khue',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Wooden Protective Talisman Plaque (Tấm Phù Gỗ Hộ Mệnh Đang Khắc) -->
  <g transform="rotate(-12 256 256)">
    <!-- Heavy Hardwood Plaque -->
    <rect x="130" y="110" width="230" height="310" rx="16" fill="#854D0E" stroke="${INK_DARK}" stroke-width="14"/>
    <rect x="146" y="126" width="198" height="278" rx="8" fill="#A16207" stroke="${INK_DARK}" stroke-width="6"/>

    <!-- Hand-Carved Protective Talisman Ward Grooves filled with Cinnabar Ink -->
    <!-- Header cloud arch -->
    <path d="M 190 165 Q 245 135 300 165 Q 245 185 190 165 Z" fill="${CINNABAR}" stroke="${INK_DARK}" stroke-width="4"/>
    <!-- Sacred talisman swirls & lightning spirals -->
    <path d="M 245 190 L 245 230" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="245" cy="248" r="12" fill="${CINNABAR}"/>
    <path d="M 215 275 Q 245 250 275 275 Q 245 320 215 300 Q 245 350 275 340" stroke="${CINNABAR}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="245" cy="370" r="10" fill="${CINNABAR}"/>

    <!-- Sharp Steel Woodcarving Chisel (Đục Khắc Gỗ) angled dynamically -->
    <!-- Steel Chisel Blade with beveled gouge edge -->
    <g transform="translate(190, 180) rotate(52)">
      <!-- Beveled cutting gouge scoring the wood -->
      <polygon points="0,0 24,-10 24,180 0,180" fill="#E2E8F0" stroke="${INK_DARK}" stroke-width="8"/>
      <line x1="12" y1="-5" x2="12" y2="180" stroke="${INK_MID}" stroke-width="4"/>
      
      <!-- Hardwood Chisel Handle with Brass Ferrule -->
      <rect x="-4" y="180" width="32" height="20" rx="2" fill="${GOLD}" stroke="${INK_DARK}" stroke-width="6"/>
      <path d="M -8 200 L 32 200 L 26 320 L -2 320 Z" fill="#78350F" stroke="${INK_DARK}" stroke-width="8"/>
      <!-- Iron striking hoop at top -->
      <rect x="-6" y="315" width="36" height="12" rx="4" fill="${INK_DARK}"/>
    </g>

    <!-- Curling wood shavings (Phoi gỗ xoăn) flying from chisel cut -->
    <path d="M 285 240 Q 325 210 320 250 Q 300 270 290 255" stroke="${GOLD}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M 295 280 Q 335 270 330 300" stroke="${GOLD}" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
</svg>`
  },

  // ----------------------------------------------------
  // banker-tin.png (Chủ tiệm cầm đồ Tín — đồng xu cổ + thỏi vàng, NO Chinese glyphs)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/banker-tin.png',
    name: 'banker-tin',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <defs>
    <radialGradient id="goldIngotGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#854D0E"/>
    </radialGradient>
  </defs>

  <!-- Grand Gold Sycee / Ingot (Thỏi Vàng Kim Nguyên Bảo / Thỏi Vàng Thuyền Cổ) -->
  <g transform="translate(0, -10)">
    <!-- Base body of ingot -->
    <path d="M 140 330 C 130 420 382 420 372 330 C 412 280 432 220 392 200 C 352 180 320 230 256 230 C 192 230 160 180 120 200 C 80 220 100 280 140 330 Z" fill="url(#goldIngotGrad)" stroke="${INK_DARK}" stroke-width="14" stroke-linejoin="round"/>
    <!-- Ingot upper center mound -->
    <ellipse cx="256" cy="235" rx="75" ry="30" fill="#FACC15" stroke="${INK_DARK}" stroke-width="8"/>
    <ellipse cx="256" cy="232" rx="45" ry="16" fill="#FEF08A"/>
  </g>

  <!-- Antique Vietnamese Cast Cash Coins (Đồng Tiền Tròn Lỗ Vuông Cổ) overlapping in front -->
  <!-- Coin 1: Front Left Coin with square hole -->
  <g transform="translate(160, 270) rotate(-12)">
    <circle cx="65" cy="65" r="70" fill="#CA8A04" stroke="${INK_DARK}" stroke-width="12"/>
    <circle cx="65" cy="65" r="56" fill="none" stroke="${INK_DARK}" stroke-width="4"/>
    <!-- Center square hole (Lỗ vuông đồng tiền) -->
    <rect x="42" y="42" width="46" height="46" rx="4" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="10"/>
    <!-- Four decorative antique knot marks (KHÔNG CHỮ HÁN, dùng họa tiết mây/chấm cổ) -->
    <circle cx="65" cy="24" r="7" fill="${INK_DARK}"/>
    <circle cx="65" cy="106" r="7" fill="${INK_DARK}"/>
    <circle cx="24" cy="65" r="7" fill="${INK_DARK}"/>
    <circle cx="106" cy="65" r="7" fill="${INK_DARK}"/>
  </g>

  <!-- Coin 2: Front Right Coin -->
  <g transform="translate(250, 290) rotate(16)">
    <circle cx="65" cy="65" r="65" fill="#A16207" stroke="${INK_DARK}" stroke-width="12"/>
    <circle cx="65" cy="65" r="52" fill="none" stroke="${INK_DARK}" stroke-width="4"/>
    <rect x="44" y="44" width="42" height="42" rx="4" fill="#FFFFFF" stroke="${INK_DARK}" stroke-width="9"/>
    <circle cx="65" cy="26" r="6" fill="${INK_DARK}"/>
    <circle cx="65" cy="104" r="6" fill="${INK_DARK}"/>
    <circle cx="26" cy="65" r="6" fill="${INK_DARK}"/>
    <circle cx="104" cy="65" r="6" fill="${INK_DARK}"/>
  </g>

  <!-- Vermilion Cinnabar Wealth Ribbon & Tassel (Dây xâu tiền đỏ thắm) -->
  <path d="M 210 270 Q 235 220 256 215 Q 275 220 300 270" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round" fill="none"/>
  <!-- Knotted wealth tassel hanging down center -->
  <circle cx="256" cy="225" r="14" fill="${CINNABAR}"/>
  <path d="M 256 235 L 256 390" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>
  <path d="M 256 390 Q 240 435 250 480" stroke="${CINNABAR_BRIGHT}" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M 256 390 Q 272 435 262 480" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round" fill="none"/>
</svg>`
  },

  // ----------------------------------------------------
  // storyteller-ngo.png (Ngo kể chuyện — quạt xếp mở sạch sẽ, NO Chinese calligraphy)
  // ----------------------------------------------------
  {
    filename: 'src/assets/art/pins/npc/storyteller-ngo.png',
    name: 'storyteller-ngo',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Elegant Traditional Vietnamese Folding Fan (Quạt Xếp Mực Tàu Mở Rộng) -->
  <!-- Fan Silk Leaf Body (Mặt quạt lụa ngà giấy bản) -->
  <path d="M 80 340 C 95 210 160 110 256 80 C 352 110 417 210 432 340 L 340 375 C 330 280 295 200 256 185 C 217 200 182 280 172 375 Z" fill="#FDFBF7" stroke="${INK_DARK}" stroke-width="14" stroke-linejoin="round"/>
  
  <!-- Subtle Misty Mountain Landscape on Fan Leaf (Sơn thủy mờ nhạt mực tàu, KHÔNG CHỮ) -->
  <path d="M 195 240 Q 230 195 256 220 Q 285 180 320 240 Z" fill="#E2E8F0" stroke="${INK_MID}" stroke-width="4" opacity="0.7"/>
  <path d="M 140 285 Q 185 235 230 270 Q 275 230 330 275 Q 365 245 385 285 Z" fill="#CBD5E1" stroke="${INK_MID}" stroke-width="5" opacity="0.6"/>

  <!-- 14 Slender Bamboo Fan Ribs (Nan quạt tre chuốt mảnh) radiating from pivot -->
  <g stroke="${INK_DARK}" stroke-width="6" stroke-linecap="round">
    <line x1="256" y1="440" x2="80" y2="340"/>
    <line x1="256" y1="440" x2="105" y2="280"/>
    <line x1="256" y1="440" x2="135" y2="225"/>
    <line x1="256" y1="440" x2="170" y2="175"/>
    <line x1="256" y1="440" x2="210" y2="135"/>
    <line x1="256" y1="440" x2="256" y2="110"/>
    <line x1="256" y1="440" x2="302" y2="135"/>
    <line x1="256" y1="440" x2="342" y2="175"/>
    <line x1="256" y1="440" x2="377" y2="225"/>
    <line x1="256" y1="440" x2="407" y2="280"/>
    <line x1="256" y1="440" x2="432" y2="340"/>
  </g>

  <!-- Heavy Outer Guard Ribs (Hai nan quạt cái bằng tre già) -->
  <path d="M 256 440 L 72 340 L 84 330 L 256 430 Z" fill="#78350F" stroke="${INK_DARK}" stroke-width="8"/>
  <path d="M 256 440 L 440 340 L 428 330 L 256 430 Z" fill="#78350F" stroke="${INK_DARK}" stroke-width="8"/>

  <!-- Polished Brass Pivot Rivet (Đinh tán trục quạt) -->
  <circle cx="256" cy="440" r="14" fill="${GOLD}" stroke="${INK_DARK}" stroke-width="8"/>
  <circle cx="256" cy="440" r="5" fill="${INK_DARK}"/>

  <!-- Graceful Vermilion Silk Tassel (Tua quạt đỏ thắm bay nhẹ) -->
  <circle cx="256" cy="458" r="8" fill="${CINNABAR}"/>
  <path d="M 256 465 Q 240 485 245 510" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M 256 465 Q 270 485 265 510" stroke="${CINNABAR_BRIGHT}" stroke-width="8" stroke-linecap="round" fill="none"/>
</svg>`
  }
];

async function main() {
  console.log('====================================================');
  console.log('  GENERATING REMEDIATED NPC & ICON ASSETS           ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const item of REMEDIATION_ICONS) {
    const svgBuf = Buffer.from(item.svg);
    // Rasterize high-resolution 1024x1024 PNG from SVG
    const rasterBuf = await sharp(svgBuf, { density: 300 })
      .resize(1024, 1024)
      .png()
      .toBuffer();

    try {
      await processRawIconToStandardPng(rasterBuf, item.filename);
      const v = await verifyFile(item.filename);
      if (v.ok) {
        passed++;
        console.log(`[PASS] ${item.name.padEnd(20)} -> ${item.filename} (${v.transparentPct})`);
      } else {
        failed++;
        console.log(`[FAIL] ${item.name.padEnd(20)} -> ${v.error}`);
      }
    } catch (err) {
      failed++;
      console.error(`[ERROR] ${item.name}: ${err.message}`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Remediation Generation: ${passed}/${REMEDIATION_ICONS.length} passed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
