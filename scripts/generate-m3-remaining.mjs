import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { processRawIconToStandardPng } from './process-ui-icon.mjs';
import { verifyFile } from './verify-ui-icons.mjs';

const INK = '#180F09';
const CINNABAR = '#AC1922';

const ICONS = [
  {
    filename: 'herbalist-dan.png',
    name: 'herbalist-dan (cối giã thuốc bằng đá + thảo dược)',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <defs>
    <radialGradient id="mortarGrad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#3A2E24"/>
      <stop offset="70%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="#0D0704"/>
    </radialGradient>
  </defs>

  <!-- Shadow under mortar -->
  <ellipse cx="256" cy="450" rx="160" ry="24" fill="${INK}" opacity="0.3"/>

  <!-- Heavy stone mortar body -->
  <path d="M 120 230 C 110 350 160 440 256 440 C 352 440 402 350 392 230 Z" fill="url(#mortarGrad)" stroke="${INK}" stroke-width="8"/>
  
  <!-- Mortar rim ellipse -->
  <ellipse cx="256" cy="230" rx="136" ry="42" fill="#281C14" stroke="${INK}" stroke-width="8"/>
  <ellipse cx="256" cy="230" rx="112" ry="30" fill="#150E09"/>

  <!-- Ground herbal powder & paste inside mortar -->
  <ellipse cx="256" cy="235" rx="85" ry="20" fill="#24331C"/>

  <!-- Angled heavy stone pestle -->
  <g transform="rotate(-28 270 210)">
    <!-- Pestle body -->
    <path d="M 245 70 C 240 60 270 60 275 70 L 285 240 C 290 270 240 270 235 240 Z" fill="${INK}" stroke="#3A2E24" stroke-width="6"/>
    <!-- Red cord wrapping around pestle handle -->
    <rect x="246" y="100" width="28" height="8" rx="2" fill="${CINNABAR}"/>
    <rect x="247" y="114" width="28" height="8" rx="2" fill="${CINNABAR}"/>
    <rect x="248" y="128" width="28" height="8" rx="2" fill="${CINNABAR}"/>
    <!-- Red cord knot & flying ribbon -->
    <path d="M 275 114 Q 310 120 305 150 Q 295 180 320 195" fill="none" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round"/>
  </g>

  <!-- Fresh medicinal herbs spilling out of mortar -->
  <!-- Herb stems and leaves -->
  <path d="M 220 230 Q 150 200 130 150 Q 170 160 200 210" fill="${INK}" stroke="${INK}" stroke-width="4"/>
  <path d="M 160 175 Q 120 170 100 135 Q 135 140 165 170" fill="${INK}"/>
  <path d="M 180 195 Q 140 220 110 205 Q 130 190 170 190" fill="${INK}"/>

  <!-- Right side wild ginseng roots & leaves -->
  <path d="M 290 230 Q 360 210 390 160 Q 355 175 315 220" fill="${INK}" stroke="${INK}" stroke-width="4"/>
  <path d="M 350 190 Q 400 185 415 155 Q 380 165 345 185" fill="${INK}"/>

  <!-- Bright Vermilion medicinal berries (Thảo dược chu quả) -->
  <circle cx="125" cy="140" r="10" fill="${CINNABAR}"/>
  <circle cx="105" cy="160" r="9" fill="${CINNABAR}"/>
  <circle cx="140" cy="165" r="8" fill="${CINNABAR}"/>
  <circle cx="115" cy="180" r="7" fill="${CINNABAR}"/>
  <circle cx="395" cy="150" r="11" fill="${CINNABAR}"/>
  <circle cx="415" cy="170" r="8.5" fill="${CINNABAR}"/>
  <circle cx="375" cy="165" r="9" fill="${CINNABAR}"/>

  <!-- Stone mortar engraved archaic motif in cinnabar -->
  <path d="M 200 320 Q 256 360 312 320 Q 256 335 200 320 Z" fill="${CINNABAR}"/>
  <circle cx="256" cy="355" r="10" fill="${CINNABAR}"/>
  <circle cx="256" cy="355" r="5" fill="${INK}"/>

  <!-- Ink splatter dots around herbs -->
  <circle cx="90" cy="120" r="4" fill="${INK}"/>
  <circle cx="150" cy="115" r="5" fill="${INK}"/>
  <circle cx="420" cy="130" r="4.5" fill="${INK}"/>
  <circle cx="380" cy="110" r="3.5" fill="${INK}"/>
</svg>
`
  },
  {
    filename: 'gatherer-hue.png',
    name: 'gatherer-hue (gùi thuốc đeo lưng + liềm con)',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Shadow -->
  <ellipse cx="256" cy="460" rx="140" ry="20" fill="${INK}" opacity="0.28"/>

  <!-- Woven bamboo herb basket backpack (gùi thuốc) -->
  <!-- Basket main body -->
  <path d="M 150 170 L 362 170 L 330 430 L 182 430 Z" fill="#241B15" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>

  <!-- Woven pattern texture strokes -->
  <g stroke="${INK}" stroke-width="6" opacity="0.75">
    <line x1="160" y1="210" x2="352" y2="210"/>
    <line x1="166" y1="255" x2="346" y2="255"/>
    <line x1="172" y1="300" x2="340" y2="300"/>
    <line x1="176" y1="345" x2="336" y2="345"/>
    <line x1="180" y1="390" x2="332" y2="390"/>
    <!-- Diagonal weave crosses -->
    <line x1="170" y1="170" x2="310" y2="430"/>
    <line x1="220" y1="170" x2="330" y2="380"/>
    <line x1="340" y1="170" x2="200" y2="430"/>
    <line x1="290" y1="170" x2="182" y2="380"/>
  </g>

  <!-- Sturdy bamboo basket rim -->
  <rect x="136" y="152" width="240" height="24" rx="8" fill="${INK}"/>

  <!-- Vermilion shoulder straps (quai gùi màu son đỏ) -->
  <path d="M 180 176 C 110 220 100 360 170 420" fill="none" stroke="${CINNABAR}" stroke-width="16" stroke-linecap="round"/>
  <path d="M 332 176 C 402 220 412 360 342 420" fill="none" stroke="${CINNABAR}" stroke-width="16" stroke-linecap="round"/>
  <!-- Central vermilion tie knot & tassels -->
  <circle cx="256" cy="270" r="16" fill="${CINNABAR}"/>
  <path d="M 256 286 Q 240 330 245 360" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
  <path d="M 256 286 Q 272 330 267 360" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>

  <!-- Mountain medicinal flora brimming out of top -->
  <path d="M 180 156 Q 160 90 200 60 Q 210 110 215 156" fill="${INK}"/>
  <path d="M 240 156 Q 256 70 275 45 Q 285 100 270 156" fill="${INK}"/>
  <path d="M 300 156 Q 340 80 320 60 Q 300 110 295 156" fill="${INK}"/>
  <!-- Red lingzhi mushroom cap sticking out -->
  <path d="M 210 80 C 190 40 270 30 260 75 Z" fill="${CINNABAR}"/>

  <!-- Small herb gatherer sickle (liềm con hái thuốc) tucked in front -->
  <g transform="rotate(25 350 250)">
    <!-- Wooden handle -->
    <rect x="335" y="240" width="22" height="110" rx="6" fill="${INK}" stroke="#3A2E24" stroke-width="4"/>
    <rect x="333" y="270" width="26" height="10" fill="${CINNABAR}"/>
    <!-- Curved sharp sickle hook blade -->
    <path d="M 346 240 C 346 160 270 140 240 170 C 270 175 320 190 324 240 Z" fill="${INK}" stroke="#221710" stroke-width="6"/>
  </g>
</svg>
`
  },
  {
    filename: 'ox-cart-hien.png',
    name: 'ox-cart-hien (bánh xe gỗ lớn + roi mây)',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Shadow -->
  <ellipse cx="256" cy="465" rx="165" ry="22" fill="${INK}" opacity="0.32"/>

  <!-- Big sturdy wooden cart wheel (bánh xe bò) -->
  <!-- Outer rim -->
  <circle cx="240" cy="260" r="170" fill="none" stroke="${INK}" stroke-width="28"/>
  <circle cx="240" cy="260" r="150" fill="none" stroke="#2B1E16" stroke-width="6"/>

  <!-- Wheel Hub center -->
  <circle cx="240" cy="260" r="48" fill="${INK}"/>
  <!-- Heavy iron axle pin in vermilion cinnabar -->
  <circle cx="240" cy="260" r="28" fill="${CINNABAR}"/>
  <circle cx="240" cy="260" r="14" fill="${INK}"/>

  <!-- Radiating heavy wooden spokes (nan hoa bánh xe) -->
  <g stroke="${INK}" stroke-width="16" stroke-linecap="round">
    <line x1="240" y1="95" x2="240" y2="215"/>
    <line x1="240" y1="305" x2="240" y2="425"/>
    <line x1="75" y1="260" x2="195" y2="260"/>
    <line x1="285" y1="260" x2="405" y2="260"/>
    <line x1="123" y1="143" x2="208" y2="228"/>
    <line x1="272" y1="292" x2="357" y2="377"/>
    <line x1="123" y1="377" x2="208" y2="292"/>
    <line x1="272" y1="228" x2="357" y2="143"/>
  </g>

  <!-- Reinforcing rim studs in Cinnabar red -->
  <g fill="${CINNABAR}">
    <circle cx="240" cy="90" r="7"/>
    <circle cx="240" cy="430" r="7"/>
    <circle cx="70" cy="260" r="7"/>
    <circle cx="410" cy="260" r="7"/>
    <circle cx="120" cy="140" r="7"/>
    <circle cx="360" cy="380" r="7"/>
    <circle cx="120" cy="380" r="7"/>
    <circle cx="360" cy="140" r="7"/>
  </g>

  <!-- Phu xe's long rattan whip (roi mây điều khiển xe bò) -->
  <g>
    <!-- Whip bamboo/rattan handle -->
    <path d="M 370 80 L 440 220" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <!-- Vermilion handle wrapping cords -->
    <line x1="375" y1="90" x2="385" y2="110" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>
    <line x1="390" y1="120" x2="400" y2="140" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>
    <line x1="405" y1="150" x2="415" y2="170" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>
    <!-- Coiling leather whip lash sweeping across -->
    <path d="M 440 220 Q 480 320 440 390 Q 400 450 330 440 Q 250 430 300 370 Q 360 300 420 330" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <!-- Vermilion whip cracker tip -->
    <path d="M 420 330 Q 450 340 460 310" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
  </g>
</svg>
`
  },
  {
    filename: 'woodcutter-bong.png',
    name: 'woodcutter-bong (rìu đốn củi + khúc gỗ sồi)',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Ground shadow -->
  <ellipse cx="256" cy="460" rx="170" ry="24" fill="${INK}" opacity="0.32"/>

  <!-- Sturdy oak log / tree stump (khúc gỗ sồi) -->
  <!-- Main stump cylinder -->
  <path d="M 120 270 C 120 250 256 230 392 270 L 375 440 C 375 455 256 465 137 440 Z" fill="#241910" stroke="${INK}" stroke-width="10"/>

  <!-- Top stump cross-section with growth rings -->
  <ellipse cx="256" cy="270" rx="136" ry="38" fill="#3B2B1F" stroke="${INK}" stroke-width="8"/>
  <ellipse cx="256" cy="270" rx="100" ry="26" fill="none" stroke="${INK}" stroke-width="5"/>
  <ellipse cx="256" cy="270" rx="60" ry="16" fill="none" stroke="${INK}" stroke-width="5"/>

  <!-- Radial wood splits / cracks -->
  <path d="M 256 270 L 170 260 M 256 270 L 330 280 M 256 270 L 230 300" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>

  <!-- Heavy woodcutter's iron felling axe wedged into log -->
  <!-- Steel axe head embedded -->
  <path d="M 235 240 L 320 210 L 305 130 L 220 150 Z" fill="${INK}" stroke="#3A2E24" stroke-width="8"/>
  <!-- Axe wedge blade line -->
  <path d="M 220 150 L 235 240" stroke="#FFFFFF" stroke-width="3" opacity="0.8"/>

  <!-- Long curved wooden axe handle -->
  <path d="M 260 180 C 230 110 170 60 120 40 L 105 60 C 150 85 210 135 240 200 Z" fill="${INK}"/>

  <!-- Vermilion grip wrap on handle -->
  <g fill="${CINNABAR}">
    <path d="M 135 55 L 147 64 L 140 76 L 128 67 Z"/>
    <path d="M 152 68 L 164 77 L 157 89 L 145 80 Z"/>
    <path d="M 169 81 L 181 90 L 174 102 L 162 93 Z"/>
  </g>
  <!-- Red tassel tied to handle pommel -->
  <circle cx="108" cy="48" r="8" fill="${CINNABAR}"/>
  <path d="M 108 56 Q 95 85 105 115" fill="none" stroke="${CINNABAR}" stroke-width="6" stroke-linecap="round"/>

  <!-- Flying wood chips & autumn oak leaves in Vermilion -->
  <g fill="${CINNABAR}">
    <!-- Autumn oak leaf -->
    <path d="M 360 130 C 375 110 410 125 400 150 C 380 170 350 155 360 130 Z"/>
    <path d="M 330 90 C 340 75 365 85 355 105 C 340 120 320 105 330 90 Z"/>
    <!-- Small wood chips -->
    <circle cx="280" cy="180" r="5"/>
    <circle cx="335" cy="185" r="6"/>
    <circle cx="210" cy="210" r="5.5"/>
  </g>

  <!-- Flying ink splatters -->
  <circle cx="340" cy="150" r="4.5" fill="${INK}"/>
  <circle cx="370" cy="180" r="6" fill="${INK}"/>
  <circle cx="190" cy="170" r="5" fill="${INK}"/>
  <circle cx="160" cy="230" r="4" fill="${INK}"/>
</svg>
`
  },
  {
    filename: 'exile-ba.png',
    name: 'exile-ba (vòng xiềng xích gãy + vạt áo rách)',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Shadow -->
  <ellipse cx="256" cy="460" rx="160" ry="20" fill="${INK}" opacity="0.3"/>

  <!-- Torn ragged hemp exile robe fabric (vạt áo rách) fluttering in wind -->
  <path d="M 160 140 Q 240 180 320 130 Q 360 220 380 330 Q 330 310 300 370 Q 270 320 220 400 Q 200 330 160 360 Q 180 260 150 210 Z" fill="#2A2018" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  
  <!-- Fabric frayed threads & ink wash texture -->
  <path d="M 180 200 L 210 330 M 230 190 L 260 340 M 280 180 L 310 320" stroke="${INK}" stroke-width="6" opacity="0.6"/>

  <!-- Vermilion torn cloth hem & cinnabar exile talisman remnant -->
  <path d="M 150 210 Q 180 270 160 360 Q 200 330 220 400" fill="none" stroke="${CINNABAR}" stroke-width="10" stroke-linecap="round"/>
  <!-- Broken crimson seal cloth strip hanging from shackle -->
  <path d="M 235 240 Q 210 310 240 370 Q 220 420 235 445" fill="none" stroke="${CINNABAR}" stroke-width="12" stroke-linecap="round"/>

  <!-- Broken heavy iron shackle collar (vòng gông cùm vỡ nát) -->
  <!-- Left shackle half -->
  <path d="M 210 140 C 130 160 110 270 180 330 L 210 290 C 160 250 170 190 225 180 Z" fill="${INK}" stroke="#3A2E24" stroke-width="6"/>
  <!-- Right shackle half bursting apart -->
  <path d="M 270 130 C 350 140 390 230 345 310 L 310 280 C 340 220 310 170 260 170 Z" fill="${INK}" stroke="#3A2E24" stroke-width="6"/>

  <!-- Heavy fractured chain links snapping apart -->
  <!-- Center shattered link with bursting metal sparks -->
  <g fill="${INK}">
    <!-- Snapped chain link left -->
    <path d="M 160 310 C 140 330 130 360 150 380 C 170 400 200 390 210 370 L 190 355 C 180 370 165 370 160 360 C 155 350 160 335 170 325 Z"/>
    <!-- Snapped chain link right flying off -->
    <path d="M 330 300 C 350 315 365 340 355 365 C 345 385 315 390 295 375 L 305 355 C 320 365 335 360 340 350 C 345 340 335 325 320 315 Z"/>
    <!-- Broken link fragment flying -->
    <rect x="240" y="110" width="25" height="14" rx="4" transform="rotate(35 240 110)"/>
    <rect x="290" y="95" width="22" height="12" rx="4" transform="rotate(-40 290 95)"/>
  </g>

  <!-- Vermilion sparks & seal blood droplets from the shattered shackle -->
  <g fill="${CINNABAR}">
    <circle cx="245" cy="155" r="8"/>
    <circle cx="265" cy="140" r="6"/>
    <circle cx="230" cy="180" r="7"/>
    <circle cx="285" cy="175" r="5.5"/>
    <circle cx="205" cy="350" r="7"/>
    <circle cx="310" cy="340" r="6.5"/>
  </g>

  <!-- Flying ink spatters -->
  <circle cx="120" cy="170" r="5" fill="${INK}"/>
  <circle cx="390" cy="180" r="6" fill="${INK}"/>
  <circle cx="370" cy="270" r="4.5" fill="${INK}"/>
</svg>
`
  },
  {
    filename: 'exorcist-diem.png',
    name: 'exorcist-diem (lá bùa chu sa + chuông đồng trừ tà)',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- Shadow -->
  <ellipse cx="256" cy="460" rx="150" ry="20" fill="${INK}" opacity="0.28"/>

  <!-- Daoist peach-wood exorcism sword (kiếm đào trừ tà) angled in background -->
  <g transform="rotate(-35 256 256)">
    <!-- Sword blade -->
    <polygon points="256,40 240,320 272,320" fill="${INK}" stroke="#3A2E24" stroke-width="4"/>
    <!-- Blade center ridge in white/ink wash -->
    <line x1="256" y1="50" x2="256" y2="320" stroke="#FFFFFF" stroke-width="2" opacity="0.6"/>
    <!-- Sword guard -->
    <rect x="220" y="320" width="72" height="18" rx="4" fill="${INK}"/>
    <!-- Sword hilt & pommel -->
    <rect x="246" y="338" width="20" height="70" fill="${INK}"/>
    <circle cx="256" cy="415" r="14" fill="${INK}"/>
    <!-- Red sword tassel hanging down -->
    <path d="M 256 425 Q 230 470 245 500" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- Yellowish parchment Daoist Talisman Paper (Lá bùa chu sa) -->
  <g transform="rotate(8 230 240)">
    <!-- Parchment sheet -->
    <rect x="150" y="110" width="140" height="260" rx="4" fill="#F4E8D0" stroke="${INK}" stroke-width="8"/>
    <!-- Mysterious Daoist Occult Seal Script in rich Cinnabar vermilion -->
    <g fill="${CINNABAR}" stroke="${CINNABAR}">
      <!-- Header trident crown mark -->
      <path d="M 200 130 L 220 150 L 240 130 L 220 160 Z"/>
      <circle cx="220" cy="170" r="8"/>
      <!-- Core talisman vertical thunder characters -->
      <path d="M 190 190 Q 220 185 250 190 L 220 215 L 245 220 L 205 250 L 235 255 L 185 295" fill="none" stroke-width="8" stroke-linecap="round"/>
      <!-- Talisman spiral seal lock at bottom -->
      <path d="M 220 305 C 245 305 245 340 220 340 C 200 340 200 315 220 315" fill="none" stroke-width="6" stroke-linecap="round"/>
    </g>
  </g>

  <!-- Bronze Exorcism Hand Bell (Chuông đồng trừ tà / Tam thanh linh) -->
  <g transform="translate(60, 20)">
    <!-- Bell handle top (Vajra / trident handle) -->
    <path d="M 260 140 L 260 210" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <circle cx="260" cy="140" r="12" fill="${INK}"/>
    <!-- Vermilion tassel knot on bell neck -->
    <rect x="246" y="195" width="28" height="12" rx="3" fill="${CINNABAR}"/>

    <!-- Flared bronze bell body -->
    <path d="M 245 210 C 245 210 220 270 200 340 C 230 355 290 355 320 340 C 300 270 275 210 275 210 Z" fill="${INK}" stroke="#3A2E24" stroke-width="6"/>
    
    <!-- Bell rim engraving in Cinnabar -->
    <path d="M 206 332 Q 260 348 314 332" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
    
    <!-- Bell clapper and hanging long vermilion cord -->
    <circle cx="260" cy="355" r="10" fill="${CINNABAR}"/>
    <path d="M 260 365 Q 245 410 265 440" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- Ghost banishing talisman sparks & ink aura -->
  <g fill="${CINNABAR}">
    <circle cx="130" cy="160" r="6"/>
    <circle cx="160" cy="110" r="5"/>
    <circle cx="380" cy="150" r="7"/>
    <circle cx="410" cy="200" r="6"/>
  </g>
  <circle cx="115" cy="210" r="4.5" fill="${INK}"/>
  <circle cx="400" cy="240" r="5" fill="${INK}"/>
</svg>
`
  },
  {
    filename: 'crane-spirit.png',
    name: 'crane-spirit (lông vũ tiên hạc phát sáng)',
    svg: `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <defs>
    <!-- Radiant celestial halo -->
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="60%" stop-color="#E8ECE8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Subtle spiritual cloud mist circles -->
  <circle cx="256" cy="256" r="200" fill="url(#halo)"/>
  
  <!-- Swirling celestial ink wind / cloud trails -->
  <g stroke="${INK}" fill="none" stroke-linecap="round" opacity="0.35">
    <path d="M 120 380 Q 200 450 300 420 Q 400 390 420 300" stroke-width="8"/>
    <path d="M 380 130 Q 300 60 200 90 Q 100 120 90 220" stroke-width="8"/>
  </g>

  <!-- Main Celestial Crane Feather (Lông tiên hạc) sweeping diagonally -->
  <!-- Central quill shaft (cuống lông hạc) -->
  <path d="M 130 430 C 200 350 280 230 380 90" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>

  <!-- Feather vanes (phiến lông hạc mềm mại uốn lượn) -->
  <!-- Left/Upper vane -->
  <path d="M 380 90 C 330 110 240 160 170 280 C 190 280 220 270 250 250 C 280 220 330 160 380 90 Z" fill="#F4F4F6" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <!-- Right/Lower vane -->
  <path d="M 380 90 C 350 140 310 240 220 360 C 240 345 270 320 290 280 C 330 210 360 140 380 90 Z" fill="#E8E8EC" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>

  <!-- Detailed feather barbs (nét bút lông mực chi tiết) -->
  <g stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity="0.7">
    <line x1="350" y1="120" x2="310" y2="150"/>
    <line x1="325" y1="150" x2="280" y2="185"/>
    <line x1="300" y1="185" x2="250" y2="225"/>
    <line x1="270" y1="225" x2="215" y2="270"/>
    <line x1="345" y1="140" x2="315" y2="190"/>
    <line x1="315" y1="185" x2="280" y2="245"/>
    <line x1="285" y1="235" x2="250" y2="300"/>
  </g>

  <!-- Vermilion Crane Red Crown Crest accent on quill base and plume tip -->
  <!-- Red crown plume tip (đỉnh hạc chu sa) -->
  <path d="M 380 90 C 405 70 420 50 410 40 C 390 50 375 70 380 90 Z" fill="${CINNABAR}" stroke="${CINNABAR}" stroke-width="4"/>
  <circle cx="415" cy="45" r="8" fill="${CINNABAR}"/>

  <!-- Spiritual talisman ribbon wrapped at the base of the quill -->
  <rect x="155" y="385" width="22" height="12" rx="3" transform="rotate(-40 155 385)" fill="${CINNABAR}"/>
  <path d="M 140 400 Q 110 420 120 450 Q 130 475 110 490" fill="none" stroke="${CINNABAR}" stroke-width="8" stroke-linecap="round"/>

  <!-- Floating glowing spiritual motes / sparks in Cinnabar & Ink -->
  <g fill="${CINNABAR}">
    <circle cx="380" cy="180" r="7"/>
    <circle cx="330" cy="100" r="6"/>
    <circle cx="210" cy="240" r="6.5"/>
    <circle cx="160" cy="330" r="5.5"/>
    <circle cx="270" cy="370" r="6"/>
  </g>
  <circle cx="420" cy="120" r="4.5" fill="${INK}"/>
  <circle cx="170" cy="220" r="5" fill="${INK}"/>
  <circle cx="290" cy="140" r="4" fill="${INK}"/>
</svg>
`
  }
];

async function main() {
  console.log(`Starting generation for remaining ${ICONS.length} NPC pin icons...`);

  for (const item of ICONS) {
    const tempJpg = path.join(process.cwd(), `temp-${path.basename(item.filename, '.png')}.jpg`);
    const targetPng = path.join(process.cwd(), 'src/assets/art/pins/npc', item.filename);

    console.log(`\nRendering ${item.name}...`);
    await sharp(Buffer.from(item.svg))
      .flatten({ background: '#FFFFFF' })
      .jpeg({ quality: 98 })
      .toFile(tempJpg);

    const procRes = await processRawIconToStandardPng(tempJpg, targetPng);
    console.log(`Processed ${item.filename}: ${procRes.width}x${procRes.height}, ${procRes.sizeBytes} bytes`);

    const check = await verifyFile(targetPng);
    console.log(`Verification for ${item.filename}:`, check);

    if (fs.existsSync(tempJpg)) {
      fs.unlinkSync(tempJpg);
    }

    if (!check.ok) {
      console.error(`FAILED verification for ${item.filename}: ${check.error}`);
      process.exit(1);
    }
  }

  console.log('\nAll remaining 7 icons successfully generated, processed, and verified!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
