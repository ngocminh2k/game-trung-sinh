import type { RomanceTrack } from '../engine/content-types'

type Beat = readonly [string, string, string, string]
type TrackSeed = { npcId: string; locationId: string; beats: readonly Beat[] }

const meihua: readonly Beat[] = [
  ['Hương cũ', 'Old Scent', 'Cụ Mai Hoa hong một túi lá khô. Mùi hương khiến ngươi nhớ một đêm trăng chưa từng sống.', 'Meihua airs a pouch of dried leaves. Its scent recalls a moonlit night you never lived.'],
  ['Sợi chỉ đỏ', 'Red Thread', 'Bà đưa ngươi đầu chỉ đỏ, bảo chỉ người biết chờ mới buộc được nút thẳng.', 'She gives you red thread and says only one who can wait ties a straight knot.'],
  ['Bậc hiên mưa', 'Rainy Steps', 'Mưa đánh lên hiên. Hai người im lặng nghe tên làng trôi trong máng nước.', 'Rain strikes the porch. You listen together as the village name runs through the gutter.'],
  ['Trăng non', 'New Moon', 'Mai Hoa chỉ mảnh trăng mỏng: lời hứa không cần tròn ngay từ đầu.', 'Meihua points to the thin moon: a promise need not be whole at its beginning.'],
  ['Ấm trà thứ hai', 'Second Teapot', 'Bà pha thêm trà dù đã khuya, như thể chừa một chỗ cho ngươi trong thói quen.', 'She steeps a second pot despite the hour, making room for you in her habit.'],
  ['Tên trên giấy', 'A Name on Paper', 'Một tên bị nhòe trong sổ làng hiện rõ khi hai người cùng giữ tờ giấy.', 'A blurred name on the village roll clears when you both hold the page.'],
  ['Vườn mộc lan', 'Magnolia Garden', 'Bà dạy ngươi tỉa cành: cắt đi không phải là bỏ rơi.', 'She teaches you to prune: cutting away is not abandonment.'],
  ['Dây chuông gió', 'Wind Chimes', 'Chuông gió rung khi ngươi đến. Mai Hoa bảo chúng không phân biệt khách và người nhà.', 'Wind chimes sound at your arrival. Meihua says they do not distinguish guest from home.'],
  ['Lời đồn', 'Rumor', 'Có người gọi sự gần gũi này là sai. Bà chỉ khép cửa, đợi ngươi nói trước.', 'Someone calls this closeness wrong. She only shuts the door and waits for you to speak.'],
  ['Đêm không ngủ', 'Sleepless Night', 'Ngươi bắt gặp bà vá áo dưới đèn, những đường chỉ kiên nhẫn hơn mọi lời khuyên.', 'You find her mending by lamplight, each stitch more patient than advice.'],
  ['Bài học cũ', 'Old Lesson', 'Mai Hoa kể lần bà rời một ngôi nhà để cứu chính mình.', 'Meihua tells of leaving a home once to save herself.'],
  ['Sương đầu ngõ', 'Lane Mist', 'Sương che lối làng. Bà nắm tay áo ngươi, không kéo lại, chỉ giữ một nhịp thở.', 'Mist hides the lane. She holds your sleeve, not pulling you back, only sharing a breath.'],
  ['Trâm ngọc', 'Jade Pin', 'Chiếc trâm cũ nằm giữa hai người, nhẹ mà mang cả một đời chưa nói.', 'An old jade pin rests between you, light yet carrying an unspoken life.'],
  ['Đọc tên nhau', 'Speaking Names', 'Bà gọi tên thật của mình; đổi lại, bà xin được nghe tên ngươi không có kiếp trước.', 'She speaks her true name and asks for yours without the past life.'],
  ['Gió đổi mùa', 'Turning Season', 'Lá rụng đầy sân. Mai Hoa hỏi ngươi có sợ một mái nhà không.', 'Leaves cover the yard. Meihua asks if you fear having a home.'],
  ['Cổng làng', 'Village Gate', 'Trước cổng làng, bà không đi cùng ngươi. Bà chỉ trao chìa khóa rồi quay vào.', 'At the village gate, she does not walk with you. She gives a key and turns back.'],
  ['Mảnh thư', 'Letter Fragment', 'Một lá thư cũ không ký tên xin được tha thứ. Hai người cùng đốt nó.', 'An unsigned old letter asks forgiveness. You burn it together.'],
  ['Đèn trước hiên', 'Porch Lamp', 'Ngọn đèn được để lại sáng hơn thường lệ; không ai nói nó đang chờ ai.', 'The porch lamp is left brighter than usual; nobody says whom it awaits.'],
  ['Trăng tròn', 'Full Moon', 'Dưới trăng, Mai Hoa hỏi đường dài của ngươi có còn chỗ cho một người đi chậm.', 'Under the full moon, Meihua asks whether your long road has room for someone slow.'],
  ['Nút dây cuối', 'The Last Knot', 'Sợi chỉ đỏ chỉ còn một nút. Lần này, cả hai đều biết nó có nghĩa gì.', 'Only one knot remains in the red thread. This time you both know what it means.'],
  // P1-Narrative #4 — one-line beat (cadence variation, NOT the final knot)
  ['Một nắm lá', 'One Handful of Leaves', 'Mai Hoa đưa cho ngươi một nắm lá vừa hong.', 'Meihua hands you a handful of freshly aired leaves.'],
  // P1-Narrative #4 — question beat (cadence variation)
  ['Câu hỏi cuối cùng', 'The Last Question', 'Bà nhìn ngươi, không đòi lời đáp: "Ngươi có muốn ở lại đến sáng mai không?"', 'She looks at you, asking no answer: "Do you wish to stay until morning?"'],
]
const ha: readonly Beat[] = [
  ['Đốm lửa lạnh', 'Cold Flame', 'Hà giữ một đốm lửa xanh trong lòng bàn tay không còn ấm.', 'Ha holds a blue flame in a palm no longer warm.'],
  ['Tên chưa mất', 'Name Unlost', 'Ngươi gọi tên Hà thật khẽ; hang đá trả lời bằng tiếng vọng dịu hơn.', 'You say Ha’s name softly; the cave answers with a gentler echo.'],
  ['Bên dòng ngầm', 'Underground River', 'Nước ngầm mang những lời chưa kịp nói. Hà ngồi nghe như người còn sống.', 'The underground river carries unsaid words. Ha listens like one alive.'],
  ['Bàn tay xuyên sương', 'Hand Through Mist', 'Ngón tay cô đi qua tay ngươi, nhưng ký ức va vào nhau như thật.', 'Her fingers pass through yours, but your memories meet as if real.'],
  ['Lời xin lỗi muộn', 'Late Apology', 'Hà xin lỗi một người đã chết từ lâu; ngươi không hứa sẽ sửa được mọi thứ.', 'Ha apologizes to someone long dead; you do not promise to mend everything.'],
  ['Mảnh gương', 'Mirror Shard', 'Trong mảnh gương, Hà vẫn có bóng. Cô sợ nhìn lâu sẽ quên mình là ai.', 'In a mirror shard, Ha still has a reflection. She fears looking too long.'],
  ['Bài hát không lời', 'Wordless Song', 'Cô ngân một giai điệu, và linh căn phế của ngươi giữ được nhịp cuối.', 'She hums a tune, and your broken root holds its final beat.'],
  ['Cửa phong ấn', 'Sealed Door', 'Phong ấn mở một khe. Hà hỏi ngươi có muốn cô bước qua không.', 'The seal opens a crack. Ha asks whether you want her to cross.'],
  ['Mùa hoa chết', 'Season of Dead Flowers', 'Cô kể về khu vườn mình không thể trở về; ngươi gieo một hạt xuống đá.', 'She tells of a garden she cannot return to; you press a seed into stone.'],
  ['Ký ức mượn', 'Borrowed Memory', 'Hà cho ngươi xem ngày cuối của cô, nhưng giữ lại phần đau nhất.', 'Ha shows you her last day, but keeps the worst pain back.'],
  ['Dây buộc hồn', 'Soul Thread', 'Một sợi hồn tuyến nối cổ tay hai người. Cắt nó dễ hơn giữ nó.', 'A soul-thread joins your wrists. Cutting it would be easier than keeping it.'],
  ['Ánh sáng ngoài hang', 'Light Beyond Cave', 'Hà đứng nơi nắng chạm đến và run rẩy như lần đầu biết lạnh.', 'Ha stands where sunlight reaches and trembles as if learning cold anew.'],
  ['Người làm chứng', 'Witness', 'Ngươi làm chứng rằng Hà từng sống, không chỉ từng chết.', 'You testify that Ha once lived, not merely died.'],
  ['Đêm qua gương', 'Night Through Glass', 'Mặt gương gọi Hà về phía bên kia. Cô quay lại đợi ngươi quyết.', 'The mirror calls Ha beyond it. She turns and waits for your decision.'],
  ['Lời hẹn vô thường', 'Impermanent Vow', 'Cả hai thừa nhận không biết ngày mai Hà còn ở đây hay không.', 'You both admit you do not know whether Ha will remain tomorrow.'],
  ['Đường siêu thoát', 'Way of Release', 'Một con đường mở cho Hà đi một mình. Ngươi không bước lên trước cô.', 'A road opens for Ha alone. You do not step onto it before her.'],
  ['Hoa dưới nước', 'Flower Underwater', 'Bông hoa phát sáng trong dòng ngầm chỉ nở khi có người buông tay.', 'A glowing flower blooms in the underground current only when someone lets go.'],
  ['Hơi thở cuối', 'Final Breath', 'Hà mượn một hơi thở của ngươi để nói điều cô đã giấu.', 'Ha borrows one of your breaths to say what she hid.'],
  ['Bình minh lạ', 'Unfamiliar Dawn', 'Trời sáng trên hang phong ấn; cô vẫn ở đây, nhưng không còn thuộc về nơi này.', 'Dawn reaches the sealed cave; she remains, but belongs here no longer.'],
  ['Cánh cửa mở', 'Open Door', 'Hà không xin được giữ lại. Cô chỉ hỏi ngươi sẽ nhớ cô bằng cách nào.', 'Ha does not ask to be kept. She only asks how you will remember her.'],
  // P1-Narrative #4 — one-line beat (cadence variation)
  ['Một hơi thở', 'One Breath', 'Hà cười khẽ trong gương.', 'Ha smiles faintly inside the mirror.'],
  // P1-Narrative #4 — question beat (cadence variation)
  ['Lời hỏi vọng', 'Echoing Question', 'Trước khi mờ đi, cô hỏi: "Ngươi đã sẵn sàng để tôi đi chưa?"', 'Before fading, she asks: "Are you ready to let me go?"'],
]
const sam: readonly Beat[] = [
  ['Lò đan nứt', 'Cracked Furnace', 'Sâm nhìn lò đan nứt và cười như vừa tìm được một bài toán khó.', 'Sam studies a cracked furnace and grins as if finding a difficult problem.'],
  ['Mùi thuốc cháy', 'Burnt Herbs', 'Mùi thuốc cháy bám áo hai người; Sâm bảo đó là mùi của việc không bỏ cuộc.', 'Burnt herbs cling to you both; Sam calls it the scent of not giving up.'],
  ['Đếm nhịp lửa', 'Counting Flame', 'Ngươi cùng Sâm đếm nhịp lửa thay vì đoán mò.', 'You count the flame’s rhythm with Sam instead of guessing.'],
  ['Viên đan méo', 'Crooked Pill', 'Viên đan méo không cứu được ai, nhưng Sâm cất nó như một chiến công.', 'The crooked pill saves nobody, but Sam keeps it as a victory.'],
  ['Sổ tay lem mực', 'Ink-Stained Notes', 'Sâm cho ngươi xem sổ tay đầy lỗi; mỗi lỗi đều có một ngày tháng.', 'Sam shows you notes full of mistakes; every error has a date.'],
  ['Cỏ thuốc đêm', 'Night Herbs', 'Hai người hái cỏ dưới trăng vì ban ngày Sâm ngại bị cười.', 'You gather herbs by moonlight because Sam hates being laughed at by day.'],
  ['Nước đắng', 'Bitter Water', 'Sâm pha một bát thuốc quá đắng rồi tự uống trước.', 'Sam brews a bowl far too bitter and drinks first.'],
  ['Một lần thành', 'One Success', 'Lần đầu lò đan không nổ. Sâm im lặng lâu hơn cả tiếng reo.', 'For once the furnace does not explode. Sam is silent longer than any cheer.'],
  ['Vết bỏng', 'Burn Scar', 'Ngươi băng vết bỏng cho Sâm; bàn tay kia vẫn giữ chặt kẹp đan.', 'You dress Sam’s burn; the other hand still grips the tongs.'],
  ['Lời thề nghề nghiệp', 'Craft Vow', 'Sâm không thề thành danh, chỉ thề không bán thuốc giả.', 'Sam vows not fame, only never to sell false medicine.'],
  ['Đan phương mất nửa', 'Half Recipe', 'Một nửa đan phương thiếu chữ. Cả hai phải tin vào phần còn lại.', 'Half a formula is missing. You must trust what remains.'],
  ['Khách bệnh đầu tiên', 'First Patient', 'Một đứa trẻ đến xin thuốc. Sâm run tay hơn lúc đối mặt lò nổ.', 'A child comes for medicine. Sam shakes more than before any explosion.'],
  ['Lời cảm ơn', 'Thanks', 'Người bệnh khỏi rồi để lại một bông hoa trước cửa đan phòng.', 'The patient recovers and leaves a flower at the alchemy door.'],
  ['Mẻ thuốc thất bại', 'Failed Batch', 'Mẻ thuốc hỏng sạch. Sâm không khóc, chỉ hỏi ngươi có còn ở lại không.', 'The batch fails completely. Sam does not cry, only asks if you will stay.'],
  ['Tay nghề', 'Steady Hands', 'Lần này Sâm đưa cho ngươi giữ lửa, tin vào nhịp thở của ngươi.', 'This time Sam lets you tend the fire, trusting your breath.'],
  ['Bình thuốc đôi', 'Paired Vials', 'Sâm làm hai bình thuốc giống nhau, một bình ghi tên ngươi.', 'Sam makes two matching vials; one bears your name.'],
  ['Cửa hàng nhỏ', 'Small Shop', 'Sâm mơ về một cửa hàng không ai bị đuổi vì không đủ tiền.', 'Sam dreams of a shop where nobody is turned away for lacking coin.'],
  ['Mùa dược mới', 'New Herb Season', 'Cỏ thuốc lên xanh quanh đan phòng. Sâm thôi gọi đó là may mắn.', 'Herbs green around the furnace room. Sam stops calling it luck.'],
  ['Nồi thuốc sáng', 'Bright Cauldron', 'Ánh lửa soi hai gương mặt; Sâm nói nghề này nhẹ hơn khi có người cùng nhìn.', 'Firelight finds both faces; Sam says the craft is lighter when shared.'],
  ['Đơn thuốc cuối', 'Final Prescription', 'Sâm hỏi cuộc đời chung của hai người nên kê đơn thế nào.', 'Sam asks what prescription you would write for your shared life.'],
]
const khoa: readonly Beat[] = [
  ['Lời thách đấu', 'Challenge', 'Khoa chặn đường, đòi so một thế kiếm; giọng cậu sắc hơn lưỡi kiếm.', 'Khoa blocks your path for one sword form; his voice is sharper than steel.'],
  ['Thua một chiêu', 'Lose One Form', 'Ngươi thua một chiêu sạch sẽ. Khoa bối rối vì ngươi không viện cớ.', 'You lose one form cleanly. Khoa is unsettled that you make no excuse.'],
  ['Băng bó im lặng', 'Silent Bandage', 'Vết rách trên tay Khoa cần băng. Cậu để ngươi làm mà không cảm ơn.', 'Khoa’s hand needs bandaging. He lets you do it without thanks.'],
  ['Cùng quét sân', 'Shared Courtyard', 'Bị phạt quét sân, hai người tranh nhau cây chổi tốt hơn.', 'Punished to sweep, you fight over the better broom.'],
  ['Kiếm gỗ', 'Wooden Sword', 'Khoa đưa ngươi kiếm gỗ cũ của cậu, bảo đừng hiểu lầm.', 'Khoa gives you an old wooden sword and tells you not to misunderstand.'],
  ['Tin đồn tông môn', 'Sect Rumor', 'Có người nói ngươi được ưu ái. Khoa là người đầu tiên cãi lại.', 'Someone says you are favored. Khoa is first to argue back.'],
  ['Mưa trên thao trường', 'Rainy Training Yard', 'Mưa làm sân trơn; Khoa nắm cổ tay ngươi trước khi ngươi ngã.', 'Rain makes the yard slick; Khoa catches your wrist before you fall.'],
  ['Một bữa cơm', 'One Meal', 'Khoa chia phần cơm, rồi giả vờ chỉ ăn không nổi.', 'Khoa shares a meal, then pretends to have no appetite.'],
  ['Đấu thật', 'Real Duel', 'Lần này hai người đánh đến kiệt sức, rồi cùng cười vì một đòn vụng.', 'This time you fight to exhaustion, then laugh at one clumsy strike.'],
  ['Tên gọi cũ', 'Old Name', 'Khoa kể vì sao cậu ghét bị gọi là thiên tài.', 'Khoa tells why he hates being called a genius.'],
  ['Vai kề vai', 'Shoulder to Shoulder', 'Một con yêu thú ép hai người lưng tựa lưng; không ai rút lui.', 'A beast forces you back-to-back; neither retreats.'],
  ['Lời nói dở', 'Poorly Said', 'Khoa định cảm ơn rồi đổi thành một câu cà khịa vụng về.', 'Khoa tries to thank you and changes it into an awkward jab.'],
  ['Thư không gửi', 'Unsent Letter', 'Ngươi tìm thấy thư Khoa viết xin lỗi nhưng chưa gửi.', 'You find an apology Khoa wrote but never sent.'],
  ['Bậc thang sau núi', 'Mountain Steps', 'Hai người ngồi trên bậc đá, lần đầu không cần so ai đi cao hơn.', 'You sit on stone steps, for once not measuring who climbed higher.'],
  ['Ghen tị', 'Envy', 'Khoa thừa nhận cậu từng ghen với sự bền bỉ của ngươi.', 'Khoa admits envying your endurance.'],
  ['Kiếm pháp chung', 'Shared Form', 'Một thế kiếm chỉ hoàn chỉnh khi hai người đổi chỗ cho nhau.', 'A sword form is whole only when you exchange places.'],
  ['Trước cửa phòng', 'At the Door', 'Khoa đứng trước cửa phòng ngươi rất lâu, rồi gõ ba tiếng.', 'Khoa stands outside your door a long while, then knocks three times.'],
  ['Bình minh luyện kiếm', 'Dawn Practice', 'Cậu chờ ngươi từ lúc trời chưa sáng, không còn lấy cớ thi đấu.', 'He waits before dawn, no longer pretending it is for a match.'],
  ['Không còn đối thủ', 'No Longer Rivals', 'Khoa hỏi nếu không còn là đối thủ, hai người là gì.', 'Khoa asks what you are if no longer rivals.'],
  ['Thanh kiếm đặt xuống', 'Sword Laid Down', 'Khoa đặt kiếm xuống giữa hai người, chờ một câu trả lời không cần thắng thua.', 'Khoa lays his sword between you and waits for an answer without victory.'],
]
const son: readonly Beat[] = [
  ['Dấu chân cỏ', 'Grass Tracks', 'Sơn chỉ dấu chân trên cỏ, dạy ngươi rừng cũng có cách kể chuyện.', 'Son points to tracks in grass, teaching that forest tells stories too.'],
  ['Bẫy rỗng', 'Empty Snare', 'Chiếc bẫy rỗng vì Sơn đã thả con thú non đi.', 'The snare is empty because Son released the young beast.'],
  ['Lửa trại', 'Campfire', 'Bên lửa trại, Sơn nói nhiều hơn khi nhìn vào than hồng.', 'At campfire, Son speaks more while looking into embers.'],
  ['Mùi mưa', 'Rain Scent', 'Sơn ngửi gió và đoán mưa. Ngươi học cách tin điều không nhìn thấy.', 'Son smells rain in the wind. You learn to trust what is unseen.'],
  ['Dao săn', 'Hunting Knife', 'Sơn mài dao thật chậm, bảo vội vàng là cách tự làm mình lạc.', 'Son sharpens a knife slowly, saying haste is how one gets lost.'],
  ['Đường mòn cũ', 'Old Trail', 'Một đường mòn dẫn về căn nhà Sơn từng rời đi.', 'A trail leads to the home Son once left.'],
  ['Con hươu què', 'Lame Deer', 'Cả hai theo con hươu què đến một suối kín, rồi không săn nó.', 'You follow a lame deer to a hidden spring, then do not hunt it.'],
  ['Áo khoác mượn', 'Borrowed Coat', 'Sơn cho ngươi mượn áo khi sương xuống, rồi giả vờ không lạnh.', 'Son lends a coat when mist falls, then pretends not to be cold.'],
  ['Tiếng còi xa', 'Distant Whistle', 'Tiếng còi của Sơn gọi chim về, nhưng lần này gọi cả ngươi.', 'Son’s whistle calls birds home; this time it calls you too.'],
  ['Bản đồ tay', 'Hand Drawn Map', 'Sơn vẽ bản đồ bằng than, đánh dấu nơi có cỏ ngon và nước sạch.', 'Son draws a map in charcoal, marking sweet grass and clean water.'],
  ['Đêm giữa đồng', 'Night on the Plain', 'Trời rộng đến mức hai người thấy nhỏ bé mà không cô đơn.', 'The sky is so wide you feel small without feeling alone.'],
  ['Mũi tên gãy', 'Broken Arrow', 'Mũi tên gãy giữa chừng; Sơn không trách tay ngươi, chỉ sửa thế đứng.', 'An arrow breaks midflight; Son does not blame your hand, only adjusts your stance.'],
  ['Chuyện gia đình', 'Family Story', 'Sơn kể về người thân không hiểu vì sao cậu chọn sống ngoài rìa.', 'Son tells of family who never understood life at the edge.'],
  ['Cơn bão', 'Storm', 'Bão ép hai người trú chung dưới một tảng đá thấp.', 'A storm forces you beneath one low rock.'],
  ['Đường tự do', 'Free Road', 'Sơn sợ mọi lời hứa đều sẽ thành dây buộc.', 'Son fears every promise will become a tether.'],
  ['Mùa săn kết thúc', 'Hunt’s End', 'Sơn cất cung khi mùa săn hết, dành ngày dài để trồng cỏ.', 'Son puts away the bow when hunting ends and spends long days planting grass.'],
  ['Con đường hai người', 'Two-Person Trail', 'Một đường mòn mới chỉ vừa đủ cho hai người đi cạnh nhau.', 'A new trail is only wide enough for two walking side by side.'],
  ['Bình nước chung', 'Shared Flask', 'Sơn đưa bình nước không hỏi; ngươi biết đó là tin cậy.', 'Son passes the flask without asking; you recognize trust.'],
  ['Đồng cỏ mở', 'Open Meadow', 'Đồng cỏ mở ra phía trước, không có cổng cũng không có chủ.', 'The meadow opens ahead, with neither gate nor owner.'],
  ['Tiếng còi về nhà', 'Homeward Whistle', 'Sơn thổi một tiếng còi ngắn, hỏi ngươi có muốn gọi nơi này là nhà.', 'Son gives one short whistle and asks whether you would call this place home.'],
]

const seeds: readonly TrackSeed[] = [
  { npcId: 'n_elder_meihua', locationId: 'village', beats: meihua },
  { npcId: 'n_lost_soul_ha', locationId: 'sealed_cave', beats: ha },
  { npcId: 'n_alchemist_sam', locationId: 'sect', beats: sam },
  { npcId: 'n_rival_khoa', locationId: 'sect', beats: khoa },
  { npcId: 'n_hunter_son', locationId: 'misty_forest', beats: son },
]

const slug = (npcId: string) => npcId.replace(/^n_/, '')

export const ROMANCE_TRACKS: RomanceTrack[] = seeds.map(({ npcId, locationId, beats }) => ({
  npcId,
  nodes: beats.map(([titleVi, titleEn, textVi, textEn], index) => {
    const id = `${slug(npcId)}_${String(index + 1).padStart(2, '0')}`
    const final = index === beats.length - 1
    return {
      id,
      trigger: { locationId, dayMin: 1, affMin: index === 0 ? 1 : index + 1 },
      requires: index === 0 ? undefined : [`romance_${npcId}_node_${slug(npcId)}_${String(index).padStart(2, '0')}`],
      titleVi,
      titleEn,
      textVi,
      textEn,
      effects: { aff: 1 },
      choices: final
        ? [
          { id: 'commitment', labelVi: 'Buộc lời hứa này vào đường đời của hai người.', labelEn: 'Bind this promise into both your lives.', effect: { aff: 3, flag: `romance_${npcId}_commitment` } },
          { id: 'bittersweet', labelVi: 'Giữ nhau trong ký ức, không giữ chân nhau.', labelEn: 'Keep each other in memory, not in chains.', effect: { aff: 1, flag: `romance_${npcId}_bittersweet` } },
          { id: 'friend', labelVi: 'Gọi nhau là tri kỷ, để đường vẫn rộng.', labelEn: 'Name each other kindred spirits, leaving the road wide.', effect: { aff: 1, flag: `romance_${npcId}_friend` } },
        ]
        : [
          { id: 'stay', labelVi: 'Ở lại và nghe hết điều họ chưa nói.', labelEn: 'Stay and hear what remains unsaid.', effect: { aff: 2 }, next: `${slug(npcId)}_${String(index + 2).padStart(2, '0')}` },
          { id: 'honest', labelVi: 'Nói thật lòng mình, dù lời chưa trọn.', labelEn: 'Speak honestly, though the words are unfinished.', effect: { aff: 1 }, next: `${slug(npcId)}_${String(index + 2).padStart(2, '0')}` },
        ],
    }
  }),
}))

export function romanceTrackFor(npcId: string): RomanceTrack | undefined {
  return ROMANCE_TRACKS.find((track) => track.npcId === npcId)
}
