# CONTRACT — 150 quest (đóng băng ID)

> Tổng = 25 quest hiện có (GIỮ NGUYÊN) + 125 quest mới. ID mới bắt buộc theo bảng dưới.
> **Canon 2026-08-31**: 12 quest MAIN được Hệ Thống phát (xem `contracts/story-canon.md` §2.6) —
> `giverNpcId` vẫn là NPC bàn giao (ràng buộc schema); phần thưởng main nên dùng Linh Thạch
> trong `descVi/descEn` ("Hệ Thống trả"). Thông báo 【Hệ Thống】 do T12/T14 lo, quest chỉ cần
> ghi chú trong desc.
> **Quyết định thiết kế thay thế mâu thuẫn của file gốc**: chỉ **15 NPC** có chuỗi aff-chain
> (10 NPC core + 5 NPC major) — KHÔNG phải 60 NPC × 3 quest. Điều này chốt lại xung đột §6.2 vs §8.

## Quy tắc chung cho MỌI quest mới

1. `giverNpcId` phải là id trong `contracts/npc-registry.md` (60 id).
2. ≥ 2 steps; step cuối `isTurnInStep: true` và có `completeItems` hoặc `completeFlags` hoặc `completeNpcTalk`.
3. `requiredItems: {}` (bắt buộc khai báo, có thể rỗng); `rewardGold` trong khoảng 5–60;
   `rewardItems` tối đa 2 món từ `contracts/item-ids.md`.
4. `aliases`: ≥ 2, chữ thường không dấu.
5. `secret: true` cho nhóm SECRET; `deadlineDays: 1–3` cho nhóm TIMED (bắt buộc).
6. Cấm trùng id, cấm dùng lại id của 25 quest cũ.

## Bảng phân bổ 125 quest MỚI (đếm = chính xác 125)

| Nhóm | Scheme ID | Số lượng | Ghi chú |
|---|---|---|---|
| MAIN (main story) | `q_main_branch_oath`, `q_main_sect_trial`, `q_main_peak_four`, `q_main_sublayer_vow` | 4 | 8 main cũ + 4 = 12 |
| SIDE | `q_vil_01..q_vil_08` (8), `q_mkt_01..q_mkt_08` (8), `q_vth_01..q_vth_06` (6), `q_sec_01..q_sec_07` (7), `q_for_01..q_for_06` (6), `q_rif_01..q_rif_05` (5), `q_frz_01..q_frz_04` (4), `q_dun_01..q_dun_03` (3), `q_lak_01..q_lak_03` (3) | **50** | mỗi NPC ≥ 1 quest — phủ 60 NPC cùng nhóm aff |
| SECRET | `q_secret_<area>_01..02` × 8 area: vil, mkt, vth, sec, for, rif, frz, lak | **16** | `requiredFlags` 1–2 flag; 4 secret cũ giữ nguyên |
| TIMED | `q_timed_01..q_timed_15` | **15** | `deadlineDays` 1–3; 3 world cũ giữ nguyên |
| EXPLORATION | `q_find_01..q_find_25` | **25** | tìm NPC ẩn; `secret: true` + hoàn thành khi talk đúng NPC |
| AFFINITY | `q_aff_01..q_aff_15` | **15** | chuỗi 3 bước × 5 NPC core (meihua, ngo, bao, vo, bach); mở khi aff ≥ 3/6/9 qua `requiredFlags: ['aff_n_x >= 3']` — dùng flag do T12 set |

Tổng: 4 + 50 + 16 + 15 + 25 + 15 = **125**. 25 cũ + 125 mới = **150**.

## Sự kiện đêm Chương 1 (4 đêm) — ánh xạ quest

4 sự kiện đêm KHÔNG tạo quest riêng; chúng là 4 name-memories nhóm `night` trong `contracts` của
T10 (mỗi sự kiện mở 1 trang sổ = 10 tên). Cấm tạo `q_night_*`.

## Kiểm đếm (làm xong T04)

`Select-String -Path src\content\quests.ts -Pattern "\{ id: 'q_" | Measure-Object | % Count` → **150**

## Chuỗi test bắt buộc (T04)

- Mỗi step `completeItems` chỉ chứa item id có thật (validate sẵn có).
- Với MỖI id trong npc-registry: tồn tại ít nhất 1 quest có `giverNpcId` = id đó.
  Viết 1 test unit kiểm tra điều này (`test/quest-coverage.test.ts` — thuộc T13, T04 tự audit bằng lệnh).
