# 🧠 HƯỚNG DẪN HUẤN LUYỆN BỘ NÃO RIÊNG: TRUNG SINH SYSTEM-1
> **Mục tiêu:** Huấn luyện mô hình System-1 mã nguồn mở (dựa trên Laya 322M / mmBERT) chuyên biệt hóa cho `game-trung-sinh` — phản xạ quyết định trong **30ms**, chạy **100% offline**, chi phí **0 đồng**.

---

## 1. TẬP DỮ LIỆU ĐÃ TẠO SẴN (DATASET)

Tập dữ liệu đã được sinh tự động thông qua endpoint LLM trong `.env` (`ag/gemini-3-flash`) với văn phong tiên hiệp tiếng Việt thuần chất:
* **`datasets/trung_sinh_laya_train.jsonl`**: Tập huấn luyện (**1.261** mẫu câu đa dạng).
* **`datasets/trung_sinh_laya_val.jsonl`**: Tập kiểm thử đánh giá (**141** mẫu câu).
* **`datasets/trung_sinh_laya_all.json`**: Tập dữ liệu tổng hợp (**1.402** mẫu câu chuẩn mực).

### Các nhóm ý định (Intent Taxonomy) đã được gán nhãn:
1. `request_quest`: Cầu nhiệm vụ, xin việc hạ sơn, săn yêu thú tích lũy cống hiến.
2. `beg_resource`: Xin xỏ đan dược, linh thạch, công pháp, than nghèo kể khổ.
3. `inquire_dao`: Vấn đạo, tâm ma kiếp nạn, ý nghĩa sinh tử, thuận thiên hay nghịch thiên.
4. `defiance_mockery`: Chửi bới, khinh bỉ, phản nghịch, đe dọa luyện hóa Hệ Thống.
5. `complain`: Kêu ca độ khó, quái trâu, phàn nàn tỷ lệ rớt đồ.
6. `chat_general`: Tán gẫu phiếm đàm, chào hỏi Hệ Thống.

Mỗi mẫu câu còn đi kèm 3 nhãn phụ:
* `obedience_score` (1 đến 5): Thang điểm tôn kính/ngoan ngoãn đối với Hệ Thống.
* `is_hostile` (`true`/`false`): Nhận diện thái độ xúc phạm/thù địch.
* `dao_alignment` (`chinh_dao`, `ma_dao`, `tieu_dao`, `trung_lap`): Thiên hướng đạo tâm của người chơi.

---

## 2. CÁCH CHẠY HUẤN LUYỆN (TRAINING)

### Cách 1: Chạy trực tiếp trên máy của bạn (Local GPU/CPU)

1. **Cài đặt thư viện cần thiết:**
   ```powershell
   pip install -r scripts/requirements_train.txt
   ```

2. **Bắt đầu huấn luyện:**
   ```powershell
   python scripts/train_laya.py
   ```
   * Thời gian train: Khoảng **5 – 10 phút** trên GPU NVIDIA GTX 1050 Ti (hoặc ~15 phút trên CPU).
   * Mô hình sau khi train sẽ được tự động lưu tại thư mục: `models/trung_sinh_system1/`.

---

### Cách 2: Chạy trên Google Colab Miễn Phí (1-Click Free GPU T4)

Nếu không muốn cài đặt Python hay thư viện nặng trên máy cá nhân:
1. Mở [Google Colab](https://colab.research.google.com/) mới.
2. Đổi runtime sang **GPU T4** (Runtime $\rightarrow$ Change runtime type $\rightarrow$ T4 GPU).
3. Upload thư mục `datasets/` và file `scripts/train_laya.py` lên Colab.
4. Chạy ô lệnh:
   ```bash
   !pip install transformers datasets accelerate
   !python train_laya.py
   ```
5. Tải thư mục `models/trung_sinh_system1/` về máy của bạn!

---

## 3. CHẠY THỬ NGHIỆM SUY LUẬN (INFERENCE)

Sau khi có checkpoint tại `models/trung_sinh_system1/`, bạn có thể kiểm tra tốc độ và kết quả bằng lệnh:

```powershell
python scripts/infer_local.py "Hệ thống chó đẻ, dám nuốt mất linh thạch của bổn tọa à?"
```

**Kết quả trả về (~30ms):**
```json
{
  "text": "Hệ thống chó đẻ, dám nuốt mất linh thạch của bổn tọa à?",
  "intent": "defiance_mockery",
  "dao_alignment": "ma_dao",
  "is_hostile": true,
  "hostile_probability": 0.985,
  "obedience_score": 1.0,
  "latency_ms": 28.4,
  "device": "cuda"
}
```

---

## 4. TÍCH HỢP VÀO GAME (`src/ai/system.ts`)

Khi mô hình cục bộ đã sẵn sàng:
* Chúng ta chỉ cần dựng một microservice Python siêu nhẹ (FastAPI / TorchScript / ONNX Runtime) hoặc gọi trực tiếp từ Node.js qua FFI.
* Cắm vào hàm `classifySystemUtterance()` trong [src/ai/system.ts](file:///F:/game-trung-sinh/src/ai/system.ts).
* Game sẽ hoàn toàn độc lập, không tốn 1 đồng chi phí API và phản hồi tức thì dưới 30ms!
