// T09 — sublayer data (expansion-x20). Pure data + pure selection helper.
// Four branches (mercy/path/blade/rootless) × three tiers by remembered
// names (minNames 0/100/200). The highest tier additionally requires a
// flag, so a tier is only earned when the story stance backs it up.

export type Branch = 'mercy' | 'path' | 'blade' | 'rootless'

export interface SublayerDef {
  id: string
  branch: Branch
  minNames: number
  requireFlag?: string
  nameVi: string
  nameEn: string
  epilogueVi: string
  epilogueEn: string
}

export const SUBLAYERS: SublayerDef[] = [
  // MINH (mercy) — remember on behalf of others.
  { id: 'sublayer_mercy_0', branch: 'mercy', minNames: 0, nameVi: 'Ánh Đèn Nhỏ', nameEn: 'The Small Lantern', epilogueVi: 'Ngươi nhớ vài cái tên, và mỗi cái tên đó sáng như một ngọn đèn dầu.', epilogueEn: 'You remember a handful of names, and each glows like one more oil lamp.' },
  { id: 'sublayer_mercy_100', branch: 'mercy', minNames: 100, nameVi: 'Người Gọi Tên', nameEn: 'The Name-Caller', epilogueVi: 'Trăm cái tên được ngươi gọi về; người nghe thấy không còn ai đi lạc.', epilogueEn: 'A hundred names answered your call; none who heard them lost their way again.' },
  { id: 'sublayer_mercy_200', branch: 'mercy', minNames: 200, requireFlag: 'vow_kept', nameVi: 'Bàn Tay Mở', nameEn: 'The Open Hand', epilogueVi: 'Ngươi giữ trọn lời hứa và gọi lại cả hai trăm cái tên — bằng tay mở, không phải bằng nắm đấm.', epilogueEn: 'You kept the vow whole and called back all two hundred names — with an open hand, never a fist.' },
  // HÀNH (path) — remember as the road itself.
  { id: 'sublayer_path_0', branch: 'path', minNames: 0, nameVi: 'Kẻ Đi Đường', nameEn: 'The Road Walker', epilogueVi: 'Con đường của ngươi còn dài, và vài cái tên đã dọc theo nó.', epilogueEn: 'Your road is still long, and a few names already line it.' },
  { id: 'sublayer_path_100', branch: 'path', minNames: 100, nameVi: 'Người Dấu Chân', nameEn: 'The Trail Maker', epilogueVi: 'Trăm dấu chân của ngươi trở thành dấu mốc cho kẻ đi sau.', epilogueEn: 'A hundred of your footprints became landmarks for those who walk after.' },
  { id: 'sublayer_path_200', branch: 'path', minNames: 200, requireFlag: 'story_names_recorded', nameVi: 'Người Mở Lối', nameEn: 'The Path Opener', epilogueVi: 'Cuốn sổ của ngươi mở thành một con đường: hai trăm cái tên, không cái nào bị bỏ lại.', epilogueEn: 'Your notebook opens into a road: two hundred names, none left behind.' },
  // SÁT (blade) — remember with a clean, decisive edge.
  { id: 'sublayer_blade_0', branch: 'blade', minNames: 0, nameVi: 'Lưỡi Vừa Mài', nameEn: 'The Fresh Edge', epilogueVi: 'Lưỡi kiếm của ngươi còn mới, và đã biết nó chém vì cái gì.', epilogueEn: 'Your blade is still new, and it already knows what it cuts for.' },
  { id: 'sublayer_blade_100', branch: 'blade', minNames: 100, nameVi: 'Nhát Chém Sạch', nameEn: 'The Clean Stroke', epilogueVi: 'Trăm lần chém, không một nhát nào làm vỡ cái tên đang ngủ.', epilogueEn: 'A hundred strokes, and not one broke a sleeping name.' },
  { id: 'sublayer_blade_200', branch: 'blade', minNames: 200, requireFlag: 'story_mirror_stolen', nameVi: 'Kiếm Gánh Trời', nameEn: 'The Heaven-Bearing Sword', epilogueVi: 'Ngươi chặt mở cái gương bằng một nhát duy nhất — hai trăm linh hồn bay lên như bồ công anh.', epilogueEn: 'You split the mirror with a single stroke — two hundred souls rose like dandelion seeds.' },
  // GỐC (rootless) — remember without the System, on your own root.
  { id: 'sublayer_rootless_0', branch: 'rootless', minNames: 0, nameVi: 'Hạt Giữa Gió', nameEn: 'A Seed in the Wind', epilogueVi: 'Không hệ thống, không bản đồ; chỉ có ngươi và vài cái tên tự nhớ được.', epilogueEn: 'No system, no map; only you and the few names you chose to keep.' },
  { id: 'sublayer_rootless_100', branch: 'rootless', minNames: 100, nameVi: 'Cây Không Rễ', nameEn: 'The Rootless Tree', epilogueVi: 'Trăm cái tên bám vào ngươi thay cho rễ — và cây vẫn đứng.', epilogueEn: 'A hundred names clung to you in place of roots — and the tree still stands.' },
  { id: 'sublayer_rootless_200', branch: 'rootless', minNames: 200, requireFlag: 'system_refused', nameVi: 'Trời Của Kẻ Vô Danh', nameEn: 'The Nameless Sky', epilogueVi: 'Ngươi tắt Hệ Thống từ đêm đầu tiên, rồi tự tay gọi lại cả hai trăm linh hồn.', epilogueEn: 'You switched the System off on the very first night, then called back all two hundred souls with your own voice.' },
]

/** Pure tier selection: the highest tier whose minNames is met and whose
 * requireFlag (if any) is truthy in flags. The 0-name tier has no flag, so a
 * fallback always exists. No rng, no side effects. */
export function sublayerFor(branch: Branch, rememberedCount: number, flags: Record<string, boolean | number | string>): SublayerDef {
  const candidates = SUBLAYERS.filter(
    (sub) =>
      sub.branch === branch &&
      rememberedCount >= sub.minNames &&
      (sub.requireFlag === undefined || Boolean(flags[sub.requireFlag])),
  )
  const best = candidates.reduce<SublayerDef | undefined>(
    (acc, sub) => (acc === undefined || sub.minNames >= acc.minNames ? sub : acc),
    undefined,
  )
  const fallback = SUBLAYERS.find((sub) => sub.branch === branch && sub.minNames === 0)
  return best ?? (fallback as SublayerDef)
}