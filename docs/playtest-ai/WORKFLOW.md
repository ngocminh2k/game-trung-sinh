# Vòng Playtest 4 Pha (Playtest Loop)

Quy trình chuẩn cho **một vòng**. Chạy 20 vòng thì lặp lại 20 lần.

> Một vòng **chỉ được tính là xong** khi code đã vào codebase và test xanh. Báo cáo lý thuyết không phải là một vòng.

---

## 4 pha

| # | Pha | Đầu vào | Đầu ra bắt buộc | Bằng chứng |
|---|-----|---------|-----------------|------------|
| 1 | **CHƠI** | build đang chạy + persona | nhật ký hành vi: làm gì → game nói gì → cảm giác gì | `shots/pNN-*.png`, `telemetry/pNN.json`, `errors` |
| 2 | **HỎI & ĐÁP** | nhật ký + `docs/` | mỗi phát hiện phải đối chiếu một tài liệu cụ thể và **đo được** | trích dẫn `file:line` hoặc số liệu đo |
| 3 | **CHỐT** | bản triage | spec: phạm vi, hành vi trước/sau, tiêu chí nghiệm thu, rủi ro | mục spec trong `round-NN.md` |
| 4 | **CODE** | spec | diff trong `src/` + test chạy xanh | lệnh + kết quả dán thật |

Pha 2 mà không có bằng chứng đo được thì không phải pha 2 — chỉ là ý kiến.

## Song song 3–10 agent

Mặc định **6 agent**, chia theo pha — không theo số vòng:

| Pha | Số agent | Vai |
|-----|:---:|-----|
| 1 CHƠI | 3–5 | mỗi agent 1 persona, browser session riêng, seed riêng |
| 2 HỎI & ĐÁP | 2 | một truy vết code (`file:line`), một đối chiếu tài liệu `docs/` |
| 3 CHỐT | 1 | adjudicator — chỉ một agent được chốt spec, tránh tranh chấp |
| 4 CODE | 1–2 | chia theo ranh giới `src/engine` vs `src/ui`, KHÔNG chồng file |

Giữ context chính sạch: sub-agent trả **kết quả có cấu trúc** (schema), không trả transcript. Agent chơi game đọc screenshot bằng chính mắt nó — ảnh không bao giờ vào context chính.

### Cổng chất lượng giữa các pha

- Pha 2 không được bắt đầu khi pha 1 chưa dump xong telemetry (`telemetry/pNN.json` mất khi session bị xoá).
- Pha 4 không được bắt đầu khi spec pha 3 chưa có tiêu chí nghiệm thu dạng lệnh chạy được.
- Hai agent code song song phải khác file. Cùng file → giao cho một agent, hoặc tách tuần tự.

## Chống báo cáo sai

Luật rút ra từ vòng 7d (một ghi chú "4/4 đỏ, im lặng" sai cả hai vế):

- Agent khai gì thì phải kèm lệnh + kết quả thật. Không có output = không tính.
- Kết quả mâu thuẫn giữa các agent phải hoà giải **trước khi** viết kết luận vòng, không viết kết luận rồi mới đi kiểm.
- Pha 4 ghi rõ test nào chạy, test nào bỏ và vì sao.

## Chạy

```bash
# 1. server điều khiển trình duyệt
node scripts/browser-use-server.mjs

# 2. một vòng (xem .claude/workflows/playtest-round.js)
```

## Hồ sơ một vòng

```
docs/playtest-ai/
  campaign-N/round-NN.md     # biên bản: chơi | đối chiếu | spec | code + verify
  rounds/LEDGER.md           # một dòng mỗi vấn đề từng thấy (append-only)
```

Vé trong LEDGER chỉ đóng khi có bằng chứng chạy lại. `fixed-verified` cần lệnh + kết quả.
