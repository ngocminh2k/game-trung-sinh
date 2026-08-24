import { getLocation } from '../content'
import { nextInt } from './rng'

export interface DangerWarning {
  level: number
  locationId: string
  messageVi: string
  messageEn: string
}

export function dangerWarning(locationId: string): DangerWarning | null {
  const loc = getLocation(locationId)
  if (loc === undefined || loc.danger <= 0) return null
  if (loc.id === 'sealed_cave') {
    return {
      level: loc.danger,
      locationId,
      messageVi: 'Phong ấn yếu dần — không có bùa hộ thân thì đừng ôm vọng vào.',
      messageEn: 'The seal is failing — enter without a warding talisman at your own peril.',
    }
  }
  if (loc.id === 'cursed_rift') {
    return {
      level: loc.danger,
      locationId,
      messageVi: 'Khe nứt rít lên tiếng thở. Lần này có thể là lần cuối.',
      messageEn: 'The rift hisses with breath. This visit could be your last.',
    }
  }
  return {
    level: loc.danger,
    locationId,
    messageVi: `Sương mù dày đặc ở ${loc.nameVi}. Cẩn thận từng bước.`,
    messageEn: `Thick mist blankets ${loc.nameEn}. Watch every step.`,
  }
}

export const LOW_HP_WARNING = {
  vi: 'Khí huyết yếu rồi — nghỉ một đêm trước khi liều tiếp.',
  en: 'Your blood-qi is fading — rest before you push further.',
} as const

export function damageRoll(rng: number, danger: number): [number, number] {
  const [extra, next] = nextInt(rng, 0, 6)
  return [danger * 10 + extra, next]
}
