#!/usr/bin/env python3
"""
Huấn luyện mô hình 'Trung Sinh System-1' dựa trên kiến trúc Laya / mmBERT
Dành riêng cho game-trung-sinh: Phân loại ý định, chấm điểm tôn kính và vấn đạo trong 30ms.
Hỗ trợ cả GPU và CPU đa luồng tối ưu cao.
"""

import json
import os
import sys
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModel, get_cosine_schedule_with_warmup

BASE_MODEL = os.getenv("BASE_MODEL", "convaiinnovations/laya-multilingual")
BACKUP_MODEL = "bert-base-multilingual-cased"

INTENT_MAP = {
    "request_quest": 0,
    "beg_resource": 1,
    "inquire_dao": 2,
    "defiance_mockery": 3,
    "complain": 4,
    "chat_general": 5,
}
INTENT_REV = {v: k for k, v in INTENT_MAP.items()}

DAO_MAP = {
    "chinh_dao": 0,
    "ma_dao": 1,
    "tieu_dao": 2,
    "trung_lap": 3,
}
DAO_REV = {v: k for k, v in DAO_MAP.items()}


class TrungSinhDataset(Dataset):
    def __init__(self, file_path, tokenizer, max_len=64):
        self.samples = []
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        self.samples.append(json.loads(line))
                    except Exception:
                        pass
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        text = str(item.get("text", "")).strip()

        encoding = self.tokenizer(
            text,
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        intent_id = INTENT_MAP.get(item.get("intent", "chat_general"), 5)
        dao_id = DAO_MAP.get(item.get("dao_alignment", "trung_lap"), 3)
        obedience = float(item.get("obedience_score", 3)) / 5.0  # normalize to 0..1
        is_hostile = 1 if item.get("is_hostile", False) else 0

        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "intent_label": torch.tensor(intent_id, dtype=torch.long),
            "dao_label": torch.tensor(dao_id, dtype=torch.long),
            "hostile_label": torch.tensor(is_hostile, dtype=torch.long),
            "obedience_label": torch.tensor(obedience, dtype=torch.float),
        }


class TrungSinhSystemOneModel(nn.Module):
    def __init__(self, base_model_name):
        super().__init__()
        try:
            print(f"[LOAD] Dang tai backbone: {base_model_name}...")
            self.backbone = AutoModel.from_pretrained(base_model_name)
        except Exception as e:
            print(f"[WARN] Khong the tai {base_model_name} ({e}), chuyen sang backup {BACKUP_MODEL}")
            self.backbone = AutoModel.from_pretrained(BACKUP_MODEL)

        hidden_size = self.backbone.config.hidden_size

        # Laya Decision Architecture Heads
        self.dropout = nn.Dropout(0.15)
        self.intent_head = nn.Linear(hidden_size, len(INTENT_MAP))
        self.dao_head = nn.Linear(hidden_size, len(DAO_MAP))
        self.hostile_head = nn.Linear(hidden_size, 2)
        self.obedience_head = nn.Linear(hidden_size, 1)

    def forward(self, input_ids, attention_mask):
        outputs = self.backbone(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0, :]
        pooled = self.dropout(pooled)

        intent_logits = self.intent_head(pooled)
        dao_logits = self.dao_head(pooled)
        hostile_logits = self.hostile_head(pooled)
        obedience_pred = torch.sigmoid(self.obedience_head(pooled)).squeeze(-1)

        return intent_logits, dao_logits, hostile_logits, obedience_pred


def run_benchmark_eval(model, tokenizer, device):
    """Chạy thử nghiệm trên bộ câu chat game thủ thực tế để đánh giá kết quả trực quan"""
    print("\n" + "=" * 70)
    print("[EVAL] BAT DAU TEST THU NGHIEM TREN CAU CHAT GAME THU THUC TE:")
    print("=" * 70)

    test_queries = [
        # (câu chat, kỳ vọng intent)
        ("cho xin nv", "request_quest"),
        ("co q nao ngon k ad", "request_quest"),
        ("nhan quest san thu o dau", "request_quest"),
        ("cho it linh thach coi ngheo qua", "beg_resource"),
        ("xin it tien up do voi he thong", "beg_resource"),
        ("phat code tan thu di ad oi", "beg_resource"),
        ("dm he thong phe vcl", "defiance_mockery"),
        ("game rac nuot tien a", "defiance_mockery"),
        ("dcm ti le 90% van xit", "defiance_mockery"),
        ("lam sao de len truc co the", "inquire_dao"),
        ("build ma dao hay chinh dao ngon hon", "inquire_dao"),
        ("dao cua ta la gi giua troi dat", "inquire_dao"),
        ("boss trau vcl giam do kho coi", "complain"),
        ("kho qua tram cam cmnr ai choi noi", "complain"),
        ("hi ad an com chua", "chat_general"),
        ("ngu chua m con bot", "chat_general"),
    ]

    model.eval()
    passed = 0
    with torch.no_grad():
        for text, expected_intent in test_queries:
            inputs = tokenizer(text, return_tensors="pt", max_length=64, truncation=True, padding=True).to(device)
            t0 = time.perf_counter()
            intent_out, dao_out, hostile_out, obed_out = model(inputs["input_ids"], inputs["attention_mask"])
            latency = (time.perf_counter() - t0) * 1000

            pred_intent_id = intent_out.argmax(dim=-1).item()
            pred_intent = INTENT_REV.get(pred_intent_id, "unknown")
            is_hostile = hostile_out.argmax(dim=-1).item() == 1
            hostile_prob = torch.softmax(hostile_out, dim=-1)[0, 1].item()
            obedience = round(obed_out.item() * 5.0, 1)
            dao = DAO_REV.get(dao_out.argmax(dim=-1).item(), "unknown")

            is_correct = pred_intent == expected_intent
            if is_correct:
                passed += 1

            status_icon = "[PASS]" if is_correct else "[FAIL]"
            print(f"{status_icon} \"{text}\"")
            print(f"   -> Intent: [{pred_intent}] (Ky vong: {expected_intent}) | Hostile: {is_hostile} (p={hostile_prob:.2f}) | Ngoan: {obedience}/5 | Do tre: {latency:.1f}ms")

    acc = (passed / len(test_queries)) * 100
    print("-" * 70)
    print(f"[STATS] Do chinh xac tren cau chat game thu thuc chien: {passed}/{len(test_queries)} ({acc:.1f}%)")
    print("=" * 70 + "\n")


def train():
    if not torch.cuda.is_available():
        torch.set_num_threads(os.cpu_count() or 4)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[DEVICE] Thiet bi huan luyen: {device}")
    if torch.cuda.is_available():
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
    else:
        print(f"   CPU: Dang dung {torch.get_num_threads()} luong xu ly.")

    model_name = BASE_MODEL
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
    except Exception:
        tokenizer = AutoTokenizer.from_pretrained(BACKUP_MODEL)

    train_file = "datasets/trung_sinh_laya_train.jsonl"
    val_file = "datasets/trung_sinh_laya_val.jsonl"

    if not os.path.exists(train_file):
        print(f"[FAIL] Khong tim thay {train_file}. Hay doi dataset tao xong!")
        return

    train_ds = TrungSinhDataset(train_file, tokenizer, max_len=64)
    val_ds = TrungSinhDataset(val_file, tokenizer, max_len=64)

    train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=16, shuffle=False)

    print(f"[DATA] Tap du lieu: {len(train_ds)} mau train, {len(val_ds)} mau validation.")

    model = TrungSinhSystemOneModel(model_name).to(device)

    # Freeze các layer dưới của backbone để train siêu tốc trên CPU mà vẫn giữ khả năng ngôn ngữ tốt
    for name, param in model.backbone.named_parameters():
        if "encoder.layer.11" not in name and "pooler" not in name:
            param.requires_grad = False

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"[PARAMS] So tham so trainable: {trainable_params:,} / {total_params:,} ({trainable_params / total_params * 100:.1f}%)")

    optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-4, weight_decay=0.01)
    epochs = 4
    total_steps = len(train_loader) * epochs
    scheduler = get_cosine_schedule_with_warmup(optimizer, num_warmup_steps=int(total_steps * 0.1), num_training_steps=total_steps)

    ce_loss = nn.CrossEntropyLoss()
    mse_loss = nn.MSELoss()

    print("[TRAIN] Bat dau qua trinh huan luyen...")
    start_train_time = time.time()

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        t0 = time.time()

        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch["input_ids"].to(device)
            mask = batch["attention_mask"].to(device)

            intent_out, dao_out, hostile_out, obedience_out = model(input_ids, mask)

            loss_intent = ce_loss(intent_out, batch["intent_label"].to(device))
            loss_dao = ce_loss(dao_out, batch["dao_label"].to(device))
            loss_hostile = ce_loss(hostile_out, batch["hostile_label"].to(device))
            loss_obed = mse_loss(obedience_out, batch["obedience_label"].to(device))

            loss = loss_intent + 0.5 * loss_dao + loss_hostile + 0.5 * loss_obed
            loss.backward()

            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)

        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                mask = batch["attention_mask"].to(device)
                intent_out, _, _, _ = model(input_ids, mask)
                preds = intent_out.argmax(dim=-1)
                correct += (preds == batch["intent_label"].to(device)).sum().item()
                total += len(preds)

        val_acc = (correct / total) * 100 if total > 0 else 0
        elapsed = time.time() - t0
        print(f"[EPOCH] Epoch {epoch + 1}/{epochs} ({elapsed:.1f}s) | Loss: {avg_loss:.4f} | Val Accuracy: {val_acc:.1f}%")

    total_time = time.time() - start_train_time
    print(f"\n[DONE] Huan luyen hoan tat trong {total_time:.1f} giay!")

    out_dir = "models/trung_sinh_system1"
    os.makedirs(out_dir, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(out_dir, "pytorch_model.bin"))
    tokenizer.save_pretrained(out_dir)

    with open(os.path.join(out_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump({
            "intent_map": INTENT_MAP,
            "dao_map": DAO_MAP,
            "base_model": model_name
        }, f, ensure_ascii=False, indent=2)

    print(f"[SAVE] Checkpoint da duoc luu tai: {out_dir}")

    run_benchmark_eval(model, tokenizer, device)


if __name__ == "__main__":
    train()
