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
  {
    id: 'thousand_herbs_valley',
    nameVi: 'Vạn Thảo Cốc',
    nameEn: 'Thousand Herbs Valley',
    descVi: 'Sương thơm đậu trên vạn lá thuốc, mỗi bước đều có mùi đan dược.',
    descEn: 'Fragrant dew rests on ten thousand medicinal leaves; every step smells of alchemy.',
    danger: 0,
  },
  {
    id: 'blackwind_dunes',
    nameVi: 'Hắc Phong Sa Mạc',
    nameEn: 'Blackwind Dunes',
    descVi: 'Cát đen đổi hình theo gió, dấu chân chưa kịp nhìn đã bị xóa.',
    descEn: 'Black sand shifts with the wind; footprints vanish before they can be studied.',
    danger: 1,
  },
  {
    id: 'frozen_peak',
    nameVi: 'Hàn Băng Phong',
    nameEn: 'Frozen Peak',
    descVi: 'Băng phủ như gương, phản chiếu một bầu trời lạnh hơn thực tại.',
    descEn: 'Ice sheets mirror a sky colder than the real one.',
    danger: 2,
  },
  {
    id: 'wandering_market',
    nameVi: 'Hành Thương Thị',
    nameEn: 'Wandering Market',
    descVi: 'Chợ dựng theo bánh xe, sáng ở đây tối đã sang một chân trời khác.',
    descEn: 'A market built on wheels, here by dawn and beyond another horizon by dusk.',
    danger: 0,
  },
  {
    id: 'moon_lake',
    nameVi: 'Nguyệt Ảnh Hồ',
    nameEn: 'Moonshadow Lake',
    descVi: 'Mặt hồ giữ lại ánh trăng ngay cả khi trời còn sáng.',
    descEn: 'The lake keeps moonlight even after the sun has risen.',
    danger: 0,
  },
  {
    id: 'bone_ash_ruins',
    nameVi: 'Cốt Hôi Cổ Tích',
    nameEn: 'Bone Ash Ruins',
    descVi: 'Tường đổ phủ tro xương, tiếng chuông vỡ còn mắc trong gió.',
    descEn: 'Fallen walls lie under bone ash; broken bells still catch in the wind.',
    danger: 3,
  },
  {
    id: 'spirit_beast_ridge',
    nameVi: 'Linh Thú Lĩnh',
    nameEn: 'Spirit Beast Ridge',
    descVi: 'Mỏm núi đầy vết vuốt, nơi linh thú quan sát người qua đường.',
    descEn: 'A ridge scored with claws, where spirit beasts watch travelers pass.',
    danger: 2,
  },
  {
    id: 'azure_pavilion',
    nameVi: 'Thanh Vân Các',
    nameEn: 'Azure Cloud Pavilion',
    descVi: 'Lầu các treo giữa mây xanh, dành cho những người chưa chịu dừng học.',
    descEn: 'A pavilion suspended in blue cloud for those unwilling to stop learning.',
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

/**
 * World-route sketch (all links are bidirectional):
 * village ↔ market; village ↔ moon_lake; market ↔ thousand_herbs_valley ↔
 * wandering_market ↔ blackwind_dunes; sect ↔ azure_pavilion; misty_forest ↔
 * spirit_beast_ridge; cursed_rift ↔ bone_ash_ruins; cloud_peak ↔ frozen_peak.
 * The pre-existing village → forest → cave → rift → peak route remains intact.
 */
export const REGION_MAPS: RegionMapDef[] = [
  region('village', 'plain', { x: 3, y: 3 }, {
    market: { x: 3, y: 3 }, sect: { x: 3, y: 3 }, herb_field: { x: 3, y: 3 }, misty_forest: { x: 3, y: 3 }, moon_lake: { x: 3, y: 3 },
  }, [
    ...rim('water'),
    { x: 1, y: 1, terrain: 'forest', node: node('village-bamboo', 'Lũy tre', 'Bamboo hedge', 'event') },
    { x: 2, y: 2, terrain: 'road', node: node('village-elder-porch', 'Hiên nhà Cụ Mai Hoa', 'Elder Meihua’s Porch', 'npc') },
    { x: 2, y: 3, terrain: 'road', node: node('village-elder-home', 'Cửa nhà Cụ Mai Hoa', 'Elder Meihua’s Door', 'npc') },
    { x: 3, y: 1, terrain: 'road', node: node('village-forest-exit', 'Đường vào rừng sương', 'Misty Woods trail', 'exit'), exitTo: 'misty_forest' },
    { x: 1, y: 3, terrain: 'road', node: node('village-market-exit', 'Cổng chợ Vân Tập', 'Cloudgather Market gate', 'exit'), exitTo: 'market' },
    { x: 3, y: 3, terrain: 'road', node: node('village-home', 'Nhà cũ của ngươi', 'Your old hut', 'event') },
    { x: 5, y: 3, terrain: 'road', node: node('village-sect-exit', 'Sơn môn Vân Ẩn', 'Hidden Cloud Sect road', 'exit'), exitTo: 'sect' },
    { x: 3, y: 5, terrain: 'road', node: node('village-herb-exit', 'Bờ ruộng linh thảo', 'Herb terrace path', 'exit'), exitTo: 'herb_field' },
    { x: 5, y: 4, terrain: 'road', node: node('village-moon-exit', 'Đường ven Nguyệt Ảnh Hồ', 'Moonshadow Lake shore road', 'exit'), exitTo: 'moon_lake' },
    { x: 5, y: 5, terrain: 'water', node: node('village-well', 'Giếng làng', 'Village well', 'event') },
  ]),
  region('market', 'road', { x: 4, y: 3 }, { village: { x: 4, y: 3 }, thousand_herbs_valley: { x: 4, y: 4 } }, [
    ...rim('mountain'),
    { x: 4, y: 3, terrain: 'road', node: node('market-village-exit', 'Đường về Thanh Mộc', 'Road to Greenwood', 'exit'), exitTo: 'village' },
    { x: 4, y: 4, terrain: 'road', node: node('market-herbs-exit', 'Đường xe qua Vạn Thảo Cốc', 'Caravan road to Thousand Herbs Valley', 'exit'), exitTo: 'thousand_herbs_valley' },
    { x: 3, y: 3, terrain: 'road', node: node('market-square', 'Quảng trường Vân Tập', 'Cloudgather square', 'npc') },
    { x: 2, y: 2, terrain: 'road', node: node('market-lottery', 'Quầy quay vận mệnh', 'Fortune draw stall', 'event') },
    { x: 2, y: 4, terrain: 'road', node: node('market-stalls', 'Dãy hàng linh vật', 'Spirit-goods stalls', 'npc') },
    { x: 5, y: 2, terrain: 'water' },
    { x: 5, y: 3, terrain: 'plain', node: node('market-teahouse', 'Trà quán nghe chuyện', 'Storyteller teahouse', 'event') },
  ]),
  region('sect', 'plain', { x: 3, y: 3 }, { village: { x: 3, y: 3 }, azure_pavilion: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 3, terrain: 'road', node: node('sect-village-exit', 'Bậc đá xuống núi', 'Mountain stair to Greenwood', 'exit'), exitTo: 'village' },
    { x: 3, y: 4, terrain: 'road', node: node('sect-azure-exit', 'Cầu mây lên Thanh Vân Các', 'Cloud bridge to Azure Pavilion', 'exit'), exitTo: 'azure_pavilion' },
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
  region('misty_forest', 'forest', { x: 3, y: 4 }, { village: { x: 3, y: 4 }, sealed_cave: { x: 3, y: 3 }, spirit_beast_ridge: { x: 4, y: 3 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('forest-village-exit', 'Lối về Thanh Mộc', 'Trail to Greenwood', 'exit'), exitTo: 'village' },
    { x: 3, y: 3, terrain: 'road', node: node('forest-crossroads', 'Ngã ba sương dày', 'Fogbound crossroads', 'event') },
    { x: 3, y: 2, terrain: 'cave', node: node('forest-cave-exit', 'Dấu ấn cổ bên hang', 'Ancient seal trail', 'exit'), exitTo: 'sealed_cave' },
    { x: 4, y: 3, terrain: 'road', node: node('forest-ridge-exit', 'Sống núi linh thú', 'Spirit-beast ridge trail', 'exit'), exitTo: 'spirit_beast_ridge' },
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
  region('cursed_rift', 'rift', { x: 3, y: 3 }, { sealed_cave: { x: 3, y: 3 }, cloud_peak: { x: 3, y: 4 }, bone_ash_ruins: { x: 4, y: 3 } }, [
    ...rim('mountain'),
    { x: 3, y: 3, terrain: 'rift', node: node('rift-cave-exit', 'Khe đá về hang phong ấn', 'Passage to the Sealed Cave', 'exit'), exitTo: 'sealed_cave' },
    { x: 3, y: 2, terrain: 'road', node: node('rift-peak-exit', 'Bậc mây lên đỉnh', 'Cloud stair to the peak', 'exit'), exitTo: 'cloud_peak' },
    { x: 4, y: 3, terrain: 'road', node: node('rift-ruins-exit', 'Cầu xương tới cổ tích', 'Bone bridge to ancient ruins', 'exit'), exitTo: 'bone_ash_ruins' },
    { x: 2, y: 3, terrain: 'rift', node: node('rift-heart', 'Tâm khe nứt', 'Rift heart', 'danger') },
    { x: 4, y: 4, terrain: 'rift', node: node('rift-wanderer', 'Kẻ lữ hành mất tên', 'Nameless wanderer', 'npc') },
  ]),
  region('cloud_peak', 'plain', { x: 3, y: 4 }, { cursed_rift: { x: 3, y: 4 }, frozen_peak: { x: 3, y: 3 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('peak-rift-exit', 'Bậc mây xuống khe', 'Cloud stair to the rift', 'exit'), exitTo: 'cursed_rift' },
    { x: 3, y: 3, terrain: 'road', node: node('peak-frozen-exit', 'Bậc băng lên Hàn Băng Phong', 'Ice stair to Frozen Peak', 'exit'), exitTo: 'frozen_peak' },
    { x: 2, y: 2, terrain: 'plain', node: node('peak-master', 'Bóng người trong mây', 'Figure in the clouds', 'npc') },
    { x: 5, y: 3, terrain: 'plain', node: node('peak-wind', 'Vách gió kể chuyện', 'Storytelling wind cliff', 'event') },
  ]),
  region('thousand_herbs_valley', 'plain', { x: 3, y: 4 }, { market: { x: 3, y: 4 }, wandering_market: { x: 3, y: 3 } }, [
    ...rim('water'),
    { x: 3, y: 4, terrain: 'road', node: node('herbs-market-exit', 'Lối về chợ Vân Tập', 'Trail to Cloudgather Market', 'exit'), exitTo: 'market' },
    { x: 3, y: 3, terrain: 'road', node: node('herbs-wandering-exit', 'Đường xe hàng', 'Caravan road', 'exit'), exitTo: 'wandering_market' },
    { x: 2, y: 2, terrain: 'forest', node: node('herbs-dew-garden', 'Vườn sương dược', 'Dew herb garden', 'event') },
    { x: 4, y: 2, terrain: 'plain', node: node('herbs-pill-seller', 'Lều luyện đan', 'Pill-maker’s tent', 'npc') },
    { x: 5, y: 4, terrain: 'forest', node: node('herbs-bee-hollow', 'Hốc ong linh', 'Spirit-bee hollow', 'danger') },
  ]),
  region('blackwind_dunes', 'plain', { x: 3, y: 4 }, { wandering_market: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('dunes-market-exit', 'Vệt bánh xe về Hành Thương Thị', 'Cart tracks to Wandering Market', 'exit'), exitTo: 'wandering_market' },
    { x: 3, y: 3, terrain: 'plain', node: node('dunes-blackwind', 'Mắt bão hắc phong', 'Blackwind eye', 'danger') },
    { x: 2, y: 2, terrain: 'plain', node: node('dunes-oasis', 'Ốc đảo cạn', 'Dry oasis', 'event') },
    { x: 5, y: 3, terrain: 'plain', node: node('dunes-sword-wanderer', 'Kiếm khách che mặt', 'Veiled sword wanderer', 'npc') },
  ]),
  region('frozen_peak', 'plain', { x: 3, y: 4 }, { cloud_peak: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('frozen-cloud-exit', 'Bậc băng xuống Đỉnh Mây', 'Ice stair to Cloud Peak', 'exit'), exitTo: 'cloud_peak' },
    { x: 3, y: 3, terrain: 'plain', node: node('frozen-mirror', 'Băng kính thiên quang', 'Sky-mirror ice', 'event') },
    { x: 2, y: 2, terrain: 'plain', node: node('frozen-hermit', 'Am cốc hàn tu', 'Cold hermit shrine', 'npc') },
    { x: 5, y: 3, terrain: 'cave', node: node('frozen-crevasse', 'Khe băng thở sương', 'Frost-breath crevasse', 'danger') },
  ]),
  region('wandering_market', 'road', { x: 3, y: 4 }, { thousand_herbs_valley: { x: 3, y: 4 }, blackwind_dunes: { x: 3, y: 3 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('wandering-herbs-exit', 'Xe hàng về Vạn Thảo Cốc', 'Caravan to Thousand Herbs Valley', 'exit'), exitTo: 'thousand_herbs_valley' },
    { x: 3, y: 3, terrain: 'road', node: node('wandering-dunes-exit', 'Đoàn xe ra Hắc Phong', 'Caravan to Blackwind Dunes', 'exit'), exitTo: 'blackwind_dunes' },
    { x: 2, y: 2, terrain: 'road', node: node('wandering-auction', 'Sạp bán đấu giá', 'Auction stall', 'event') },
    { x: 4, y: 2, terrain: 'road', node: node('wandering-artificer', 'Quầy pháp khí', 'Spirit-tool stall', 'npc') },
    { x: 5, y: 4, terrain: 'road', node: node('wandering-tea', 'Trà lều hành thương', 'Caravan tea tent', 'event') },
  ]),
  region('moon_lake', 'plain', { x: 3, y: 4 }, { village: { x: 3, y: 4 } }, [
    ...rim('water'),
    { x: 3, y: 4, terrain: 'road', node: node('moon-village-exit', 'Đường về Thanh Mộc', 'Trail to Greenwood', 'exit'), exitTo: 'village' },
    { x: 3, y: 3, terrain: 'plain', node: node('moon-reflection', 'Mặt nước phản nguyệt', 'Moon-reflecting water', 'event') },
    { x: 2, y: 2, terrain: 'plain', node: node('moon-fisher', 'Ngư ông áo xanh', 'Blue-robed fisher', 'npc') },
    { x: 5, y: 3, terrain: 'water', node: node('moon-lotus', 'Bãi sen đêm', 'Night lotus shoal', 'event') },
  ]),
  region('bone_ash_ruins', 'plain', { x: 3, y: 4 }, { cursed_rift: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('ruins-rift-exit', 'Cầu xương về khe nứt', 'Bone bridge to the rift', 'exit'), exitTo: 'cursed_rift' },
    { x: 3, y: 3, terrain: 'rift', node: node('ruins-altar', 'Tế đàn tro xương', 'Bone-ash altar', 'danger') },
    { x: 2, y: 2, terrain: 'plain', node: node('ruins-inscription', 'Bia văn đổ vỡ', 'Broken inscription', 'event') },
    { x: 5, y: 3, terrain: 'cave', node: node('ruins-exile', 'Đạo nhân nhặt tro', 'Ash-gathering cultivator', 'npc') },
  ]),
  region('spirit_beast_ridge', 'forest', { x: 3, y: 4 }, { misty_forest: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('ridge-forest-exit', 'Lối mòn về rừng sương', 'Trail to Misty Woods', 'exit'), exitTo: 'misty_forest' },
    { x: 3, y: 3, terrain: 'forest', node: node('ridge-claw-stone', 'Đá vuốt linh thú', 'Spirit-beast clawstone', 'danger') },
    { x: 2, y: 2, terrain: 'forest', node: node('ridge-feather-nest', 'Tổ lông mây', 'Cloud-feather nest', 'event') },
    { x: 5, y: 3, terrain: 'plain', node: node('ridge-beast-tamer', 'Lều ngự thú sư', 'Beast-tamer’s shelter', 'npc') },
  ]),
  region('azure_pavilion', 'plain', { x: 3, y: 4 }, { sect: { x: 3, y: 4 } }, [
    ...rim('mountain'),
    { x: 3, y: 4, terrain: 'road', node: node('azure-sect-exit', 'Cầu mây về Vân Ẩn', 'Cloud bridge to Hidden Cloud Sect', 'exit'), exitTo: 'sect' },
    { x: 3, y: 3, terrain: 'plain', node: node('azure-library', 'Tàng thư vân các', 'Cloud pavilion library', 'event') },
    { x: 2, y: 2, terrain: 'plain', node: node('azure-disciple', 'Đệ tử áo lam', 'Azure-robed disciple', 'npc') },
    { x: 5, y: 3, terrain: 'plain', node: node('azure-bell', 'Chuông phong vân', 'Wind-cloud bell', 'event') },
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
