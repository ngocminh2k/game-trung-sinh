import type { CellDef, LocationDef, MapNodeDef, RegionCellDef, RegionMapDef, Terrain } from '../engine/content-types'

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

type RegionCellPatch = {
  x: number
  y: number
  terrain?: Terrain
  node?: MapNodeDef
  exitTo?: string
}

const node = (id: string, nameVi: string, nameEn: string, kind: MapNodeDef['kind']): MapNodeDef => ({ id, nameVi, nameEn, kind })

/**
 * A region is a playable local scene, not a label on the old overview map.
 * The default terrain gives each scene a readable body; patches create paths,
 * impassable edges, named event points and exits.  Keeping all 49 cells
 * authored via this factory also makes map validation straightforward.
 */
function region(
  locationId: string,
  baseTerrain: Terrain,
  entry: RegionMapDef['entry'],
  arrivals: RegionMapDef['arrivals'],
  patches: RegionCellPatch[],
): RegionMapDef {
  const byPosition = new Map(patches.map((patch) => [`${patch.x},${patch.y}`, patch]))
  const cells: RegionCellDef[] = []
  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const patch = byPosition.get(`${x},${y}`)
      cells.push({ x, y, terrain: patch?.terrain ?? baseTerrain, node: patch?.node, exitTo: patch?.exitTo })
    }
  }
  return { locationId, cells, entry, arrivals }
}

const rim = (terrain: Terrain = 'mountain'): RegionCellPatch[] => [
  ...Array.from({ length: MAP_WIDTH }, (_, x) => ({ x, y: 0, terrain })),
  ...Array.from({ length: MAP_WIDTH }, (_, x) => ({ x, y: MAP_HEIGHT - 1, terrain })),
  ...Array.from({ length: MAP_HEIGHT - 2 }, (_, index) => ({ x: 0, y: index + 1, terrain })),
  ...Array.from({ length: MAP_HEIGHT - 2 }, (_, index) => ({ x: MAP_WIDTH - 1, y: index + 1, terrain })),
]

/** All Scenario I locations have an independent, walkable local map. */
export const REGION_MAPS: RegionMapDef[] = [
  region('village', 'plain', { x: 3, y: 3 }, {
    market: { x: 3, y: 3 }, sect: { x: 3, y: 3 }, herb_field: { x: 3, y: 3 }, misty_forest: { x: 3, y: 3 },
  }, [
    ...rim('water'),
    { x: 1, y: 1, terrain: 'forest', node: node('village-bamboo', 'Lũy tre', 'Bamboo hedge', 'event') },
    { x: 2, y: 2, terrain: 'road', node: node('village-elder', 'Hiên nhà Cụ Mai Hoa', 'Elder Mai Hoa’s porch', 'npc') },
    { x: 3, y: 2, terrain: 'road', node: node('village-forest-exit', 'Đường vào rừng sương', 'Misty Woods trail', 'exit'), exitTo: 'misty_forest' },
    { x: 2, y: 3, terrain: 'road', node: node('village-market-exit', 'Cổng chợ Vân Tập', 'Cloudgather Market gate', 'exit'), exitTo: 'market' },
    { x: 3, y: 3, terrain: 'road', node: node('village-home', 'Nhà cũ của ngươi', 'Your old hut', 'event') },
    { x: 4, y: 3, terrain: 'road', node: node('village-sect-exit', 'Sơn môn Vân Ẩn', 'Hidden Cloud Sect road', 'exit'), exitTo: 'sect' },
    { x: 3, y: 4, terrain: 'road', node: node('village-herb-exit', 'Bờ ruộng linh thảo', 'Herb terrace path', 'exit'), exitTo: 'herb_field' },
    { x: 5, y: 4, terrain: 'water', node: node('village-well', 'Giếng làng', 'Village well', 'event') },
  ]),
  region('market', 'road', { x: 4, y: 3 }, { village: { x: 4, y: 3 } }, [
    ...rim('mountain'),
    { x: 4, y: 3, terrain: 'road', node: node('market-village-exit', 'Đường về Thanh Mộc', 'Road to Greenwood', 'exit'), exitTo: 'village' },
    { x: 3, y: 3, terrain: 'road', node: node('market-square', 'Quảng trường Vân Tập', 'Cloudgather square', 'npc') },
    { x: 2, y: 2, terrain: 'road', node: node('market-lottery', 'Quầy quay vận mệnh', 'Fortune draw stall', 'event') },
    { x: 2, y: 4, terrain: 'road', node: node('market-stalls', 'Dãy hàng linh vật', 'Spirit-goods stalls', 'npc') },
    { x: 5, y: 2, terrain: 'water' },
    { x: 5, y: 3, terrain: 'plain', node: node('market-teahouse', 'Trà quán nghe chuyện', 'Storyteller teahouse', 'event') },
  ]),
  region('sect', 'plain', { x: 3, y: 3 }, { village: { x: 3, y: 3 } }, [
    ...rim('mountain'),
    { x: 3, y: 3, terrain: 'road', node: node('sect-village-exit', 'Bậc đá xuống núi', 'Mountain stair to Greenwood', 'exit'), exitTo: 'village' },
    { x: 4, y: 3, terrain: 'road', node: node('sect-training', 'Diễn võ trường', 'Training court', 'event') },
    { x: 2, y: 2, terrain: 'road', node: node('sect-hall', 'Chính điện Vân Ẩn', 'Hidden Cloud hall', 'npc') },
    { x: 2, y: 4, terrain: 'road', node: node('sect-storehouse', 'Tàng vật các', 'Storehouse', 'event') },
    { x: 3, y: 4, terrain: 'mountain' },
    { x: 5, y: 4, terrain: 'forest', node: node('sect-meditation', 'Vách tĩnh tâm', 'Meditation cliff', 'event') },
  ]),
  region('herb_field', 'plain', { x: 3, y: 3 }, { village: { x: 3, y: 3 } }, [
    ...rim('water'),
    { x: 3, y: 3, terrain: 'road', node: node('herb-village-exit', 'Đường về làng', 'Path to Greenwood', 'exit'), exitTo: 'village' },
    { x: 3, y: 2, terrain: 'road', node: node('herb-garden', 'Ruộng linh thảo', 'Spirit herb plots', 'event') },
    { x: 2, y: 4, terrain: 'plain', node: node('herb-keeper', 'Lều người trông ruộng', 'Terrace keeper’s shed', 'npc') },
    { x: 5, y: 2, terrain: 'water' },
    { x: 4, y: 4, terrain: 'forest', node: node('herb-hive', 'Tổ ong linh', 'Spirit-bee hive', 'danger') },
  ]),
  region('misty_forest', 'forest', { x: 3, y: 4 }, { village: { x: 3, y: 4 }, sealed_cave: { x: 3, y: 3 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('forest-village-exit', 'Lối về Thanh Mộc', 'Trail to Greenwood', 'exit'), exitTo: 'village' },
    { x: 3, y: 3, terrain: 'road', node: node('forest-crossroads', 'Ngã ba sương dày', 'Fogbound crossroads', 'event') },
    { x: 3, y: 2, terrain: 'cave', node: node('forest-cave-exit', 'Dấu ấn cổ bên hang', 'Ancient seal trail', 'exit'), exitTo: 'sealed_cave' },
    { x: 4, y: 1, terrain: 'forest', node: node('forest-wolf', 'Dấu chân lang yêu', 'Demon-wolf tracks', 'danger') },
    { x: 2, y: 3, terrain: 'forest', node: node('forest-herbalist', 'Chòi người hái thuốc', 'Herbalist’s shelter', 'npc') },
  ]),
  region('sealed_cave', 'cave', { x: 3, y: 4 }, { misty_forest: { x: 3, y: 4 }, cursed_rift: { x: 3, y: 3 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('cave-forest-exit', 'Cửa hang nhìn về rừng', 'Cave mouth to the woods', 'exit'), exitTo: 'misty_forest' },
    { x: 3, y: 3, terrain: 'cave', node: node('cave-seal', 'Phong ấn nứt vỡ', 'Cracked seal', 'danger') },
    { x: 4, y: 3, terrain: 'rift', node: node('cave-rift-exit', 'Khe đá đen', 'Black stone passage', 'exit'), exitTo: 'cursed_rift' },
    { x: 2, y: 2, terrain: 'cave', node: node('cave-tablet', 'Bia đá vô danh', 'Nameless stone tablet', 'event') },
    { x: 5, y: 4, terrain: 'cave', node: node('cave-prisoner', 'Bóng người sau phù', 'Figure behind talismans', 'npc') },
  ]),
  region('cursed_rift', 'rift', { x: 3, y: 3 }, { sealed_cave: { x: 3, y: 3 }, cloud_peak: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 3, terrain: 'rift', node: node('rift-cave-exit', 'Khe đá về hang phong ấn', 'Passage to the Sealed Cave', 'exit'), exitTo: 'sealed_cave' },
    { x: 3, y: 2, terrain: 'road', node: node('rift-peak-exit', 'Bậc mây lên đỉnh', 'Cloud stair to the peak', 'exit'), exitTo: 'cloud_peak' },
    { x: 2, y: 3, terrain: 'rift', node: node('rift-heart', 'Tâm khe nứt', 'Rift heart', 'danger') },
    { x: 4, y: 4, terrain: 'rift', node: node('rift-wanderer', 'Kẻ lữ hành mất tên', 'Nameless wanderer', 'npc') },
  ]),
  region('cloud_peak', 'plain', { x: 3, y: 4 }, { cursed_rift: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('peak-rift-exit', 'Bậc mây xuống khe', 'Cloud stair to the rift', 'exit'), exitTo: 'cursed_rift' },
    { x: 3, y: 3, terrain: 'plain', node: node('peak-summit', 'Đài vọng thiên', 'Heavenwatch dais', 'event') },
    { x: 2, y: 2, terrain: 'plain', node: node('peak-master', 'Bóng người trong mây', 'Figure in the clouds', 'npc') },
    { x: 5, y: 3, terrain: 'plain', node: node('peak-wind', 'Vách gió kể chuyện', 'Storytelling wind cliff', 'event') },
  ]),
]

export function cellAt(x: number, y: number): CellDef | undefined {
  return CELLS.find((c) => c.x === x && c.y === y)
}

export function getRegionMap(locationId: string): RegionMapDef | undefined {
  return REGION_MAPS.find((map) => map.locationId === locationId)
}

export function regionCellAt(locationId: string, x: number, y: number): RegionCellDef | undefined {
  return getRegionMap(locationId)?.cells.find((cell) => cell.x === x && cell.y === y)
}

export function entryPositionFor(locationId: string, fromLocationId?: string): { x: number; y: number } {
  const map = getRegionMap(locationId)
  if (map === undefined) return { x: 3, y: 3 }
  return fromLocationId === undefined ? map.entry : (map.arrivals[fromLocationId] ?? map.entry)
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
