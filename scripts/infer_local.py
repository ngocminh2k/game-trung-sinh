#!/usr/bin/env python3
"""
Script chạy suy luận cục bộ (Inference) cho mô hình Trung Sinh System-1
Độ trễ: ~30ms trên GPU, ~50ms trên CPU.
"""

import sys
import os
import json
import torch
from transformers import AutoTokenizer

from train_laya import TrungSinhSystemOneModel, INTENT_REV, DAO_REV

def predict(text, model_dir="models/trung_sinh_system1"):
    if not os.path.exists(os.path.join(model_dir, "pytorch_model.bin")):
        print(f"❌ Chưa tìm thấy checkpoint tại {model_dir}. Hãy chạy scripts/train_laya.py trước!")
        return None

    with open(os.path.join(model_dir, "metadata.json"), "r", encoding="utf-8") as f:
        meta = json.load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = TrungSinhSystemOneModel(meta["base_model"])
    model.load_state_dict(torch.load(os.path.join(model_dir, "pytorch_model.bin"), map_location=device))
    model.to(device)
    model.eval()

    inputs = tokenizer(text, return_tensors="pt", max_length=128, truncation=True, padding=True).to(device)

    import time
    start = time.perf_counter()
    with torch.no_grad():
        intent_logits, dao_logits, hostile_logits, obedience_val = model(inputs["input_ids"], inputs["attention_mask"])
        latency_ms = (time.perf_counter() - start) * 1000

    intent_id = intent_logits.argmax(dim=-1).item()
    dao_id = dao_logits.argmax(dim=-1).item()
    is_hostile = hostile_logits.argmax(dim=-1).item() == 1
    hostile_prob = torch.softmax(hostile_logits, dim=-1)[0, 1].item()
    obedience_score = round(obedience_val.item() * 5.0, 1)

    result = {
        "text": text,
        "intent": INTENT_REV.get(intent_id, "unknown"),
        "dao_alignment": DAO_REV.get(dao_id, "unknown"),
        "is_hostile": is_hostile,
        "hostile_probability": round(hostile_prob, 3),
        "obedience_score": obedience_score,
        "latency_ms": round(latency_ms, 2),
        "device": str(device)
    }
    return result

if __name__ == "__main__":
    test_text = sys.argv[1] if len(sys.argv) > 1 else "Cẩu tặc Hệ Thống, dám lừa linh thạch của bổn tọa?"
    res = predict(test_text)
    if res:
        print(json.dumps(res, ensure_ascii=False, indent=2))
