import type { Season } from '../engine/weather'

/**
 * Narrative layer for hybrid pills (T07, expansion-x20).
 * Refinement recipes own the mechanics; this table only carries lore and the
 * season of each recipe's main herb so the UI can hint when a recipe will bear
 * fruit. Every recipeId matches refinement.ts exactly.
 */

export interface HybridRecipeLore {
  recipeId: string
  nameVi: string
  nameEn: string
  loreVi: string
  loreEn: string
  /** Season code of the recipe's main herb: 'xuan' | 'ha' | 'thu' | 'dong'. */
  seasonVi: Season
  /** English display name of that season. */
  seasonEn: string
}

export const HYBRID_RECIPES: HybridRecipeLore[] = [
  {
    recipeId: 'r_hybrid_silk_heart',
    nameVi: 'Tơ băng hoàn',
    nameEn: 'Silk-Heart Pill',
    loreVi: 'Người Vạn Thảo Cốc nói tơ đỏ xuân phải ôm lấy băng tâm mới hóa đan; nóng lạnh gặp nhau, mạch khí mở.',
    loreEn: 'Valley adepts say spring silk must embrace an ice heart to become a pill; heat meets cold and the meridians open.',
    seasonVi: 'xuan',
    seasonEn: 'Spring',
  },
  {
    recipeId: 'r_hybrid_blood_dew',
    nameVi: 'Huyết lộ đan',
    nameEn: 'Blood-Dew Pill',
    loreVi: 'Huyết sâm thu hái lúc lá rụng, nhúng vào sương vân là hết vị đắng gắt.',
    loreEn: 'Blood ginseng picked as the leaves fall, dipped in cloud dew, loses its harsh bite.',
    seasonVi: 'thu',
    seasonEn: 'Autumn',
  },
  {
    recipeId: 'r_hybrid_moon_fire',
    nameVi: 'Nguyệt hỏa đan',
    nameEn: 'Moon-Fire Pill',
    loreVi: 'Hỏa liên mùa hè cháy quá mạnh, chỉ có ánh trăng thu mới níu được.',
    loreEn: 'Summer fire lotus burns too fiercely; only autumn moonlight can hold it back.',
    seasonVi: 'ha',
    seasonEn: 'Summer',
  },
  {
    recipeId: 'r_hybrid_banner_daisy',
    nameVi: 'Phan cúc hoàn',
    nameEn: 'Banner-Daisy Pill',
    loreVi: 'Cờ trắng giữa chiều hè, cúc tím thu về — hai mùa gặp nhau trong một viên hoàn.',
    loreEn: 'A white banner on a summer noon, a purple daisy at autumn’s edge — two seasons meet in one pill.',
    seasonVi: 'ha',
    seasonEn: 'Summer',
  },
  {
    recipeId: 'r_hybrid_marrow_bamboo',
    nameVi: 'Tủy trúc đan',
    nameEn: 'Marrow-Bamboo Pill',
    loreVi: 'Địa tủy đông cứng cả mùa đông, phải dùng hư trúc rỗng ruột làm ống dẫn khí.',
    loreEn: 'Earth marrow hardens all winter; hollow void bamboo must carry the qi through.',
    seasonVi: 'dong',
    seasonEn: 'Winter',
  },
  {
    recipeId: 'r_hybrid_cloud_lotus',
    nameVi: 'Vân liên đan',
    nameEn: 'Cloud-Lotus Pill',
    loreVi: 'Sương vân xuân đọng trên cánh liên; viên đan thành ra nhẹ như chưa từng có trọng lượng.',
    loreEn: 'Spring cloud dew settles on the lotus petal, and the finished pill weighs no more than breath.',
    seasonVi: 'xuan',
    seasonEn: 'Spring',
  },
  {
    recipeId: 'r_hybrid_ice_ginseng',
    nameVi: 'Băng sâm hoàn',
    nameEn: 'Ice-Ginseng Pill',
    loreVi: 'Băng tâm giữ nguyên hơi lạnh, huyết sâm phải đợi đến mùa đông mới chịu tan.',
    loreEn: 'The ice heart keeps its chill; blood ginseng only agrees to melt in winter.',
    seasonVi: 'dong',
    seasonEn: 'Winter',
  },
  {
    recipeId: 'r_hybrid_dew_daisy',
    nameVi: 'Lộ cúc hoàn',
    nameEn: 'Dew-Daisy Pill',
    loreVi: 'Lộ sớm xuân nhỏ lên cúc tím muộn mùa; vị thuốc thành ra dịu với người mới tu.',
    loreEn: 'Early spring dew falls on a late-autumn daisy; the result is gentle enough for new cultivators.',
    seasonVi: 'xuan',
    seasonEn: 'Spring',
  },
  {
    recipeId: 'r_hybrid_earth_fire',
    nameVi: 'Địa hỏa đan',
    nameEn: 'Earth-Fire Pill',
    loreVi: 'Đất đông mà lửa không chịu đông; viên đan nóng đến mùa xuân vẫn còn ấm.',
    loreEn: 'The ground freezes but the fire refuses to; the pill stays warm until spring.',
    seasonVi: 'dong',
    seasonEn: 'Winter',
  },
  {
    recipeId: 'r_hybrid_silk_dew',
    nameVi: 'Tơ lộ hoàn',
    nameEn: 'Silk-Dew Pill',
    loreVi: 'Tơ hồng quấn lấy dây thanh đằng đẫm sương, tức khí chạy mềm như nước.',
    loreEn: 'Red silk winds around dew-heavy green vine, and qi runs soft as water.',
    seasonVi: 'xuan',
    seasonEn: 'Spring',
  },
  {
    recipeId: 'r_hybrid_moon_marrow',
    nameVi: 'Nguyệt tủy đan',
    nameEn: 'Moon-Marrow Pill',
    loreVi: 'Trăng thu rót xuống địa tủy; người đan này uống xong thường mơ thấy cả một đời.',
    loreEn: 'The autumn moon pours into earth marrow; those who take it dream of whole lifetimes.',
    seasonVi: 'thu',
    seasonEn: 'Autumn',
  },
  {
    recipeId: 'r_hybrid_wind_heart',
    nameVi: 'Phong tâm hoàn',
    nameEn: 'Wind-Heart Pill',
    loreVi: 'Gió xuân thổi qua tre, bụng trúc vẫn giữ một mảnh băng; viên hoàn kêu khe khẽ khi lắc.',
    loreEn: 'Spring wind passes through bamboo, yet a shard of ice stays inside; the pill rattles softly when shaken.',
    seasonVi: 'xuan',
    seasonEn: 'Spring',
  },
]

/** All hybrid recipe ids whose main herb belongs to the given season. */
export function hybridForSeason(season: Season): string[] {
  return HYBRID_RECIPES.filter((recipe) => recipe.seasonVi === season).map((recipe) => recipe.recipeId)
}
