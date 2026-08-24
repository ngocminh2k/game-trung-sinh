import type { CellDef, LocationDef } from '../engine/content-types'

export const MAP_WIDTH = 7
export const MAP_HEIGHT = 7

export const LOCATIONS: LocationDef[] = [
  {
    id: 'village',
    nameVi: 'Làng Thanh Mộc',
    nameEn: 'Greenwood Village',
    descVi: 'Lũy tre, giếng nước, mùi cơm chiều.',
    descEn: 'Bamboo hedges, a well, the smell of supper rice.',
    danger: 0,
  },
  {
    id: 'market',
    nameVi: 'Chợ Vân Tập',
    nameEn: 'Cloudgather Market',
    descVi: 'Rẻ quạt xào xạc, tiếng rao chen tiếng vé số.',
    descEn: 'Fluttering fans, hawkers calling over lottery criers.',
    danger: 0,
  },
  {
    id: 'sect',
    nameVi: 'Tông Vân Ẩn',
    nameEn: 'Hidden Cloud Sect',
    descVi: 'Sân đá rêu phong, chuông sớm vang trong mây.',
    descEn: 'Mossy stone courtyards; morning bells drift through cloud.',
    danger: 0,
  },
  {
    id: 'herb_field',
    nameVi: 'Điền Linh Thảo',
    nameEn: 'Herb Terraces',
    descVi: 'Ruộng bậc thang thơm mùi thuốc, ong vàng lượn lờ.',
    descEn: 'Terraces smelling of herbs; golden bees loop lazily.',
    danger: 0,
  },
  {
    id: 'misty_forest',
    nameVi: 'Rừng Sương Mù',
    nameEn: 'Misty Woods',
    descVi: 'Sương dày đến mức tiếng chim cũng nghe ướt.',
    descEn: 'Fog so thick even birdsong sounds damp.',
    danger: 1,
  },
  {
    id: 'sealed_cave',
    nameVi: 'Hang Phong Ấn',
    nameEn: 'The Sealed Cave',
    descVi: 'Miệng hang đầy phù hiệu cũ, gió thổi ra lạnh gáy.',
    descEn: 'Its mouth crowded with old sigils; the wind chills your neck.',
    danger: 2,
  },
  {
    id: 'cursed_rift',
    nameVi: 'Khe Hở Nguyền Rủa',
    nameEn: 'The Cursed Rift',
    descVi: 'Vết nứt đen như một nét mạch bị vạch ngang.',
    descEn: 'A black split in the earth, like a stroke crossed out mid-line.',
    danger: 3,
  },
  {
    id: 'cloud_peak',
    nameVi: 'Đỉnh Mây',
    nameEn: 'Cloud Peak',
    descVi: 'Nơi gió kể chuyện những kẻ đã phi thăng.',
    descEn: 'Where the wind retells the tales of those who ascended.',
    danger: 0,
  },
]

const BLOCKED_TERRAIN = new Set(['water', 'mountain'])

function cell(x: number, y: number, terrain: CellDef['terrain'], locationId?: string): CellDef {
  return locationId === undefined ? { x, y, terrain } : { x, y, terrain, locationId }
}

export const CELLS: CellDef[] = [
  cell(0, 0, 'mountain'),
  cell(1, 0, 'mountain'),
  cell(2, 0, 'road'),
  cell(3, 0, 'road'),
  cell(4, 0, 'road'),
  cell(5, 0, 'road'),
  cell(6, 0, 'cave', 'sealed_cave'),
  cell(0, 1, 'plain'),
  cell(1, 1, 'water'),
  cell(2, 1, 'water'),
  cell(3, 1, 'road'),
  cell(4, 1, 'forest', 'misty_forest'),
  cell(5, 1, 'plain'),
  cell(6, 1, 'plain'),
  cell(0, 2, 'plain'),
  cell(1, 2, 'water'),
  cell(2, 2, 'plain'),
  cell(3, 2, 'plain'),
  cell(4, 2, 'plain'),
  cell(5, 2, 'mountain'),
  cell(6, 2, 'plain'),
  cell(0, 3, 'plain'),
  cell(1, 3, 'plain'),
  cell(2, 3, 'road', 'market'),
  cell(3, 3, 'road', 'village'),
  cell(4, 3, 'road', 'sect'),
  cell(5, 3, 'plain'),
  cell(6, 3, 'plain'),
  cell(0, 4, 'plain'),
  cell(1, 4, 'plain', 'herb_field'),
  cell(2, 4, 'plain'),
  cell(3, 4, 'plain'),
  cell(4, 4, 'mountain'),
  cell(5, 4, 'mountain'),
  cell(6, 4, 'plain'),
  cell(0, 5, 'plain'),
  cell(1, 5, 'plain'),
  cell(2, 5, 'plain'),
  cell(3, 5, 'plain'),
  cell(4, 5, 'plain'),
  cell(5, 5, 'plain'),
  cell(6, 5, 'rift', 'cursed_rift'),
  cell(0, 6, 'plain'),
  cell(1, 6, 'plain'),
  cell(2, 6, 'plain'),
  cell(3, 6, 'plain'),
  cell(4, 6, 'plain'),
  cell(5, 6, 'plain'),
  cell(6, 6, 'plain', 'cloud_peak'),
]

export function cellAt(x: number, y: number): CellDef | undefined {
  return CELLS.find((c) => c.x === x && c.y === y)
}

export function isPassable(c: CellDef): boolean {
  return !BLOCKED_TERRAIN.has(c.terrain)
}

export function getLocation(locationId: string): LocationDef | undefined {
  return LOCATIONS.find((l) => l.id === locationId)
}

export function locationDanger(locationId: string): number {
  return getLocation(locationId)?.danger ?? 0
}
