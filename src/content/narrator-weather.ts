import type { Locale } from '../engine/types'
import { isBloodMoon } from '../engine/weather'

export interface WeatherNarration {
  vi: string[]
  en: string[]
}

/**
 * 4 Seasons × 4 Weather states = 16 combinations (3 variations each = 48 lines)
 * Plus Blood Moon variations (4 lines).
 * Total: 52 rich xianxia literary phrases.
 */
export const WEATHER_NARRATIONS: Record<string, WeatherNarration> = {
  // ── MÙA XUÂN (Spring) ──
  xuan_quang: {
    vi: [
      'Gió xuân mơn man, linh khí đất trời khẽ cựa mình như mầm non đội đất.',
      'Nắng xuân ấm áp rọi xuống đỉnh núi, vạn vật bừng tỉnh sau giấc đông miên.',
      'Trời quang mây tạnh, chim linh hót vang giữa rặng tùng xanh biếc.',
    ],
    en: [
      'Spring breeze caresses the earth; world-qi stirs like green shoots breaking soil.',
      'Gentle spring sunlight bathes the peaks; all creation awakens from winter slumber.',
      'Clear skies and calm clouds; spirit birds sing among emerald pines.',
    ],
  },
  xuan_mua: {
    vi: [
      'Mưa xuân lất phất như tơ liễu, tưới mát cỏ cây hoa lá khắp sườn đồi.',
      'Làn mưa bụi mỏng manh giăng mắc, thấm đẫm linh dược đầu mùa.',
      'Mưa phùn đầu xuân mang theo sinh cơ dạt dào khắp nẻo đường đất.',
    ],
    en: [
      'Spring drizzle falls like silk threads, bathing the hillsides in soft moisture.',
      'A tender veil of rain drifts down, soaking the early season spirit herbs.',
      'Early spring mist-rain brings surging vitality to every mountain trail.',
    ],
  },
  xuan_suong: {
    vi: [
      'Sương xuân la đà trên ngọn cỏ, đọng lại thành những giọt ngọc long lanh.',
      'Làn sương mỏng mang hơi thở hồi sinh bao phủ thung lũng.',
      'Sương mù mờ ảo quyện cùng hương thảo mộc đâm chồi nảy lộc.',
    ],
    en: [
      'Spring mist hovers over grass tips, gathering into glistening pearls of dew.',
      'A thin morning mist carrying the breath of rebirth drapes the valley.',
      'Faint mist mingles with the fragrant scent of freshly sprouting herbs.',
    ],
  },
  xuan_bao: {
    vi: [
      'Sấm đầu xuân nổ vang rền chuyển đất trời — xuân lôi kinh động vạn linh.',
      'Gió lốc cuộn theo cánh hoa tàn, sấm chớp báo hiệu trời đất chuyển mình.',
      'Mây đen vần vũ xé toạc bầu trời xuân, cuồng phong quét qua rặng núi.',
    ],
    en: [
      'First spring thunder rumbles across heaven and earth, shaking all living souls.',
      'Gales whirl fallen petals; lightning heralds the shifting of heaven seasons.',
      'Dark clouds tear open the spring sky as tempests sweep over the crags.',
    ],
  },

  // ── MÙA HẠ (Summer) ──
  ha_quang: {
    vi: [
      'Nắng hạ như thiêu như đốt, luồng nhiệt khí bốc lên ngùn ngụt từ vách đá.',
      'Trời quang không một gợn mây, dương khí dồi dào chiếu rọi đỉnh ngọn linh sơn.',
      'Ve ngân râm ran giữa trưa hè oi ả, bóng cây râm mát trở thành nơi tị nóng hiếm hoi.',
    ],
    en: [
      'Summer sun blazes like a furnace; shimmering heat waves rise from stone crags.',
      'Cloudless skies above; boundless yang qi pours down onto the holy mountain.',
      'Cicadas drone in the sweltering noon; tree shade becomes a rare sanctuary.',
    ],
  },
  ha_mua: {
    vi: [
      'Cơn mưa rào mùa hạ xối xả trút xuống, rửa trôi cái nóng hầm hập của đất đai.',
      'Mưa rào dội lên phiến đá nứt nẻ, hơi nước bốc lên mù mịt mờ nhân ảnh.',
      'Trận mưa giông giải tỏa cơn khát bỏng cháy của vạn vật sau chuỗi ngày oi ả.',
    ],
    en: [
      'A sudden summer deluge pours down, washing away the oppressive earth-heat.',
      'Torrents drum against parched stones, raising thick vapor that blinds the eye.',
      'Thunderous showers quench the burning thirst of all creatures after stifling days.',
    ],
  },
  ha_suong: {
    vi: [
      'Hơi sương nóng ẩm bốc lên sau cơn mưa hè, ngưng đọng thành làn khói lững lờ.',
      'Khí ẩm dày đặc che khuất tầm nhìn, đường núi ẩm ướt trơn trượt.',
      'Làn sương độc mùa hè bảng lảng dưới chân thác nước sủi bọt.',
    ],
    en: [
      'Steamy mist rises from the soaked earth, hanging heavy in the summer heat.',
      'Heavy humidity chokes the trails, turning mountain paths slick and treacherous.',
      'A lingering summer haze curls at the foot of frothing waterfalls.',
    ],
  },
  ha_bao: {
    vi: [
      'Cuồng phong bão hạ quét qua sườn núi, sấm sét xé toạc màn trời u tối.',
      'Lôi đình thịnh nộ giáng xuống các đỉnh cao, đất đá lăn rào rào theo dòng nước lũ.',
      'Gió gầm chớp giật kinh hồn bạt vía, cuồng phong quật đổ những thân cây cổ thụ.',
    ],
    en: [
      'Fierce summer squalls ravage the ridges; lightning tears through darkened skies.',
      'Wrathful thunderbolts strike the peaks; rocks tumble down swelling torrents.',
      'Tempests howl and lightning cracks terrifyingly, uprooting ancient mountain trees.',
    ],
  },

  // ── MÙA THU (Autumn) ──
  thu_quang: {
    vi: [
      'Trời thu trong vắt cao vời vợi, gió heo may se lạnh thổi lá vàng bay lượn.',
      'Ánh tà dương mùa thu nhuộm đỏ rực sườn non, không khí tĩnh lặng thanh khiết.',
      'Khí trời thu thanh tịnh khô ráo, lòng người tu đạo dễ bề tĩnh tâm minh ngộ.',
    ],
    en: [
      'Autumn sky stretches high and limpid; crisp breezes send golden leaves dancing.',
      'Autumn sunset dyes the mountain slopes crimson; the air is quiet and pristine.',
      'Cool, dry autumn air clears the mind, lending tranquility to spiritual meditation.',
    ],
  },
  thu_mua: {
    vi: [
      'Mưa thu rả rích dầm dề suốt ngày đêm, nhuốm màu buồn man mác lên rừng cây.',
      'Giọt mưa lạnh ngắt rơi trên lá đỏ tơi bời, từng đợt gió rét len lỏi qua khe áo.',
      'Mưa thu mang theo hàn ý ngấm sâu vào da thịt, cỏ cây héo hon rụng rơi.',
    ],
    en: [
      'Plaintive autumn rain patters ceaselessly, draping woods in melancholic chill.',
      'Cold rain droplets pelt scarlet leaves; chilly gusts seep through traveller robes.',
      'Autumn showers carry deep chill into the bone as vegetation withers and decays.',
    ],
  },
  thu_suong: {
    vi: [
      'Sương thu trắng xóa phủ kín mặt hồ, mặt nước phẳng lặng như gương cổ.',
      'Làn sương lạnh bảng lảng che khuất chân trời, cảnh vật mờ ảo như bức tranh thủy mặc.',
      'Hàn sương buổi sớm giăng mắc trên rặng cỏ úa, bước chân lữ khách thấm đẫm hơi lạnh.',
    ],
    en: [
      'Pale autumn mist carpets the lake, still as an ancient mirror.',
      'Drifting frost-mist obscures the horizon, turning the realm into a monochrome scroll.',
      'Early cold dew clings to withered reeds, chilling the steps of passing wanderers.',
    ],
  },
  thu_bao: {
    vi: [
      'Bão thu gầm rú cuốn phăng thảm lá rụng, không khí tràn ngập hàn khí đìu hiu.',
      'Gió giật từng cơn lạnh buốt thấu xương, mây xám nặng trĩu đè thấp xuống triền đồi.',
      'Cơn thịnh nộ cuối thu trút mưa đá lạnh buốt, báo hiệu mùa đông sắp tràn về.',
    ],
    en: [
      'Autumn gale howls through barren woods, sweeping away dry leaves with bitter chill.',
      'Bone-piercing gusts surge across ridges as heavy gray clouds press upon the hills.',
      'Late autumn fury hurls icy hail, heralding the imminent arrival of harsh winter.',
    ],
  },

  // ── MÙA ĐÔNG (Winter) ──
  dong_quang: {
    vi: [
      'Trời đông quang đãng nhưng rét căm căm, nắng hanh vàng vọt không đủ sưởi ấm đá tảng.',
      'Bầu trời đông xanh ngắt lạnh lùng, hơi thở thở ra ngưng đọng thành từng làn khói trắng.',
      'Ánh nắng mùa đông rọi lên sườn núi hoang vu, đất trời tịch mịch không một tiếng chim.',
    ],
    en: [
      'Winter skies are clear yet bitterly cold; pale sun fails to warm the frozen stones.',
      'A cold azure winter sky looms above; each breath condenses into puffs of white fog.',
      'Feeble winter light rests on desolate slopes; heaven and earth sit in silence without bird calls.',
    ],
  },
  dong_mua: {
    vi: [
      'Mưa đá lẫn tuyết lạnh buốt rơi lộp độp, mặt đường đất đóng băng trơn trượt hiểm trở.',
      'Cơn mưa đông buốt giá như hàng ngàn mũi kim châm, vạn vật co ro trong hàn khí.',
      'Mưa tuyết dày đặc trút xuống không ngừng, biến non ngàn thành một màu trắng xóa u hoài.',
    ],
    en: [
      'Freezing rain and sleet clatter down, glazing the mountain paths in slick ice.',
      'Freezing winter rain stings like thousands of needles; all creation cowers in bitter cold.',
      'Dense sleet falls endlessly, burying the wilderness in sorrowful white desolation.',
    ],
  },
  dong_suong: {
    vi: [
      'Sương muối dày đặc đông kết thành lớp băng mỏng bao phủ cành cây ngọn cỏ.',
      'Màn sương lạnh giá phong tỏa thung lũng, hàn khí ngưng trệ khiến linh lực khó lưu thông.',
      'Sương giá mịt mùng mờ mịt lối đi, bóng cây khô khốc hiện lên như ma quỷ chập chờn.',
    ],
    en: [
      'Heavy frost-mist congeals into brittle rime, coating every branch and reed.',
      'Frigid haze locks the valley tight; stagnant cold slows the flow of inner spiritual qi.',
      'Dense rime-fog swallows the trail; skeletal trees loom like phantoms in the mist.',
    ],
  },
  dong_bao: {
    vi: [
      'Bão tuyết thét gào xé nát không gian, cuồng phong mang theo băng giá vùi lấp muôn loài.',
      'Bão tuyết gầm thét dữ dội suốt ngày đêm, tuyết phủ ngập đầu gối chia cắt mọi lối mòn.',
      'Cơn bão băng giá tột độ của mùa đông kéo đến, thiên địa vạn vật chìm trong tuyệt vọng lạnh giá.',
    ],
    en: [
      'Blizzard winds roar through the void, howling gusts of ice burying all under heaven.',
      'Raging blizzards howl day and night, deep snowdrifts cutting off every known trail.',
      'The peak frost-tempest of winter descends, plunging heaven and earth into frozen despair.',
    ],
  },
}

/**
 * Blood Moon (Đêm Trăng Máu — Day 15 of 28-day cycle) ominous narrations.
 */
export const BLOOD_MOON_NARRATIONS: WeatherNarration = {
  vi: [
    'Vầng trăng tròn đỏ quạch như máu treo lơ lửng giữa trời đêm, yêu khí bốn bề cuộn trào tanh tưởi.',
    'Huyết Nguyệt giáng lâm, vầng trăng đỏ ma quái kích động sát khí cuồng bạo của muôn loài yêu dị.',
    'Ánh trăng máu rực rỡ nhuộm đỏ rực cả bầu trời, linh khí trở nên hung bạo, sát phạt ngập tràn.',
    'Đêm rằm Huyết Nguyệt, ánh tà quang chiếu rọi đỉnh núi, cả thiên địa dường như rỉ máu.',
  ],
  en: [
    'A round moon, crimson as fresh blood, hangs in the night sky; malevolent beast-qi surges foully.',
    'The Blood Moon ascends; eerie red light stirs frenzied bloodlust in every demonic creature.',
    'Glaring bloodlight bathes the firmament; spiritual qi turns violent with the scent of slaughter.',
    'Full moon of blood; sinister radiance drenches the peaks as if heaven itself were bleeding.',
  ],
}

/**
 * Resolves a descriptive literary weather narration based on season, weather kind, and day.
 */
export function getWeatherNarration(
  weather: { season: string; kind: string; id?: string },
  locale: Locale,
  day: number = 1,
): string {
  if (isBloodMoon(day)) {
    const list = locale === 'vi' ? BLOOD_MOON_NARRATIONS.vi : BLOOD_MOON_NARRATIONS.en
    const index = Math.abs(day) % list.length
    return list[index] ?? list[0] ?? ''
  }

  const key = `${weather.season}_${weather.kind}`
  const entry = WEATHER_NARRATIONS[key]
  if (entry !== undefined) {
    const list = locale === 'vi' ? entry.vi : entry.en
    const index = Math.abs(day) % list.length
    return list[index] ?? list[0] ?? ''
  }

  // Fallback to basic weather description
  const fallbacks: Record<string, { vi: string; en: string }> = {
    quang: { vi: 'Trời quang đãng, gió mát.', en: 'Clear skies, a cool breeze.' },
    mua: { vi: 'Mưa lất phất làm ẩm đường đất.', en: 'Gentle rain wets the earthen paths.' },
    suong: { vi: 'Sương mù giăng kín lối đi.', en: 'Dense mist veils the mountain trails.' },
    bao: { vi: 'Mây đen cuồn cuộn, sấm chớp rền vang.', en: 'Storm clouds churn; thunder rumbles across the peaks.' },
  }
  const fallback = fallbacks[weather.kind]
  if (fallback !== undefined) {
    return locale === 'vi' ? fallback.vi : fallback.en
  }
  return ''
}
