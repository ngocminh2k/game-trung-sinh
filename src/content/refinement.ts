import type { RefinementRecipeDef } from '../engine/content-types'

/**
 * The market buys every ingredient individually, but these exchanges let a
 * player carry a compact survival tool back into danger instead.  The values
 * intentionally do not dominate a straight sale: safety and momentum compete
 * with immediate capital for manuals and equipment.
 */
export const RECIPES: RefinementRecipeDef[] = [
  {
    id: 'warding_exchange',
    nameVi: 'Bùa hồi lộ',
    nameEn: 'Homeward Ward',
    descVi: 'Ép một chiếc nha thú và linh thảo thành bùa hộ thân, đủ che một lần bước vào hiểm địa.',
    descEn: 'Press a beast fang and spirit herb into one protective ward, enough to cover a single step into high danger.',
    locationId: 'market',
    ingredients: { beast_fang: 1, spirit_herb: 1 },
    output: { itemId: 'warding_talisman', qty: 1 },
  },
  {
    id: 'qi_tonic_exchange',
    nameVi: 'Tán tụ khí',
    nameEn: 'Qi-Gathering Powder',
    descVi: 'Nghiền linh thảo thành bột mịn; đổi hai bó lấy một lần tu luyện không bị hụt hơi.',
    descEn: 'Grind spirit herbs into a fine powder; trade two bundles for one cultivation push without running dry.',
    locationId: 'market',
    ingredients: { spirit_herb: 2 },
    output: { itemId: 'pill_qi', qty: 1 },
  },
  {
    id: 'moonmoss_exchange',
    nameVi: 'Hoàn nguyên sương nguyệt',
    nameEn: 'Moonmoss Restoration',
    descVi: 'Rêu nguyệt và linh thảo đổi thành một viên hồi nguyên: bớt tiền trong túi, thêm đường về nhà.',
    descEn: 'Moonmoss and a spirit herb become a restoration pill: less coin in your purse, more road home.',
    locationId: 'market',
    ingredients: { moon_moss: 1, spirit_herb: 1 },
    output: { itemId: 'pill_hp', qty: 1 },
  },
]

export function getRecipe(recipeId: string): RefinementRecipeDef | undefined {
  return RECIPES.find((recipe) => recipe.id === recipeId)
}
