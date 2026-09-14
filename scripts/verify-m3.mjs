import { verifyFile } from './verify-ui-icons.mjs';

const M3_FILES = [
  'elder-meihua.png',
  'storyteller-ngo.png',
  'merchant-bao.png',
  'hermit-coc.png',
  'rival-khoa.png',
  'master-vo.png',
  'lost-soul-ha.png',
  'innkeeper-hanh.png',
  'alchemist-sam.png',
  'hunter-son.png',
  'guard-truong.png',
  'kid-xiaobao.png',
  'farmer-tu.png',
  'fortune-lien.png',
  'cook-phung.png',
  'smith-duc.png',
  'scholar-minh.png',
  'pedlar-quyen.png',
  'tea-ma.png',
  'tailor-yen.png',
  'senior-lan.png',
  'keeper-anh.png',
  'monk-thien.png',
  'herbalist-dan.png',
  'gatherer-hue.png',
  'ox-cart-hien.png',
  'woodcutter-bong.png',
  'exile-ba.png',
  'exorcist-diem.png',
  'crane-spirit.png'
];

async function run() {
  console.log('--- UI ICON SHORTFALL: WORKER M3 VERIFICATION AUDIT ---');
  let passCount = 0;
  for (let i = 0; i < M3_FILES.length; i++) {
    const f = M3_FILES[i];
    const relPath = 'src/assets/art/pins/npc/' + f;
    const res = await verifyFile(relPath);
    if (res.ok) {
      passCount++;
      console.log(`[${String(i + 1).padStart(2, '0')}/30 PASS] ${f.padEnd(24)} | ${res.dimensions} | ${res.transparentPct.padStart(6)} transparent | ${res.sizeBytes} bytes`);
    } else {
      console.error(`[${String(i + 1).padStart(2, '0')}/30 FAIL] ${f.padEnd(24)} | ERROR: ${res.error}`);
    }
  }

  console.log('-------------------------------------------------------');
  console.log(`FINAL RESULT: ${passCount}/${M3_FILES.length} ICONS PASSED QUALITY GATE.`);
  if (passCount === M3_FILES.length) {
    console.log('STATUS: SUCCESS - All Worker M3 assets meet Tier 1 & Tier 2 standards.');
    process.exit(0);
  } else {
    console.error('STATUS: FAILURE - Some assets did not pass.');
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
