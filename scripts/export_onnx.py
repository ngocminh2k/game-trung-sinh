#!/usr/bin/env python3
"""
Xuất mô hình Trung Sinh System-1 (Laya fine-tuned) sang định dạng ONNX
Quy trình:
1. Export sang FP32 ONNX
2. Fused & Optimized Transformer Graph bằng onnxruntime.transformers.optimizer
3. Trích xuất vocab.json siêu nhẹ (~1.9MB)
4. Đồng bộ toàn bộ sang public/models/trung_sinh_system1/ phục vụ lazy load
5. Kiểm thử suy luận đối chiếu kết quả
"""

import os
import sys
import json
import time
import shutil

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import torch
import torch.nn as nn
from transformers import AutoTokenizer

from train_laya import TrungSinhSystemOneModel, INTENT_REV, DAO_REV

class OnnxExportWrapper(nn.Module):
    def __init__(self, core_model):
        super().__init__()
        self.core = core_model

    def forward(self, input_ids, attention_mask):
        intent_logits, dao_logits, hostile_logits, obedience_pred = self.core(input_ids, attention_mask)
        if obedience_pred.dim() == 1:
            obedience_pred = obedience_pred.unsqueeze(-1)
        return intent_logits, dao_logits, hostile_logits, obedience_pred

def export_model(model_dir="models/trung_sinh_system1", output_dir="models/trung_sinh_system1"):
    weights_path = os.path.join(model_dir, "pytorch_model.bin")
    if not os.path.exists(weights_path):
        print(f"❌ Không tìm thấy weights tại {weights_path}")
        return False

    with open(os.path.join(model_dir, "metadata.json"), "r", encoding="utf-8") as f:
        meta = json.load(f)

    print("=" * 60)
    print("🚀 BẮT ĐẦU XUẤT MÔ HÌNH TRUNG SINH SYSTEM-1 SANG ONNX")
    print("=" * 60)

    device = torch.device("cpu")
    print("[1/5] Khởi tạo mô hình PyTorch và nạp checkpoint...")
    base_model = meta.get("base_model", "bert-base-multilingual-cased")
    raw_model = TrungSinhSystemOneModel(base_model)
    raw_model.load_state_dict(torch.load(weights_path, map_location=device))
    raw_model.eval()

    model = OnnxExportWrapper(raw_model)
    model.eval()

    tokenizer = AutoTokenizer.from_pretrained(model_dir)

    dummy_text = "xin he thong ban cho nhiem vu moi"
    inputs = tokenizer(dummy_text, max_length=64, padding="max_length", truncation=True, return_tensors="pt")
    dummy_input_ids = inputs["input_ids"]
    dummy_attention_mask = inputs["attention_mask"]

    raw_onnx_path = os.path.join(output_dir, "model_raw.onnx")
    final_onnx_path = os.path.join(output_dir, "model.onnx")
    print(f"[2/5] Đang xuất mô hình ONNX sang {raw_onnx_path}...")

    torch.onnx.export(
        model,
        (dummy_input_ids, dummy_attention_mask),
        raw_onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input_ids", "attention_mask"],
        output_names=["intent_logits", "dao_logits", "hostile_logits", "obedience_pred"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "seq_len"},
            "attention_mask": {0: "batch_size", 1: "seq_len"},
            "intent_logits": {0: "batch_size"},
            "dao_logits": {0: "batch_size"},
            "hostile_logits": {0: "batch_size"},
            "obedience_pred": {0: "batch_size"},
        },
        dynamo=False,
    )

    # Optimize transformer graph
    print("[3/5] Tối ưu hóa đồ thị Transformer (Fusion & Optimization)...")
    try:
        from onnxruntime.transformers.optimizer import optimize_model
        opt_model = optimize_model(
            raw_onnx_path,
            model_type="bert",
            num_heads=12,
            hidden_size=768
        )
        opt_model.save_model_to_file(final_onnx_path)
        if os.path.exists(raw_onnx_path):
            os.remove(raw_onnx_path)
        print(f"✅ Đồ thị tối ưu hoàn tất! Đã lưu tại {final_onnx_path}")
    except Exception as e:
        print(f"⚠️ Không thể tối ưu hóa đồ thị ({e}), sử dụng mô hình gốc...")
        if os.path.exists(raw_onnx_path):
            shutil.move(raw_onnx_path, final_onnx_path)

    # Extract compact vocab
    print("[4/5] Trích xuất vocabulary gọn nhẹ (vocab.json)...")
    with open(os.path.join(model_dir, "tokenizer.json"), "r", encoding="utf-8") as f:
        tok_data = json.load(f)
        vocab = tok_data.get("model", {}).get("vocab", {})
    
    vocab_path = os.path.join(output_dir, "vocab.json")
    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, separators=(",", ":"))
    print(f"✅ Đã trích xuất {len(vocab)} từ khóa sang {vocab_path}")

    # Verify inference
    print("\n[5/5] Kiểm thử suy luận đối chứng:")
    import onnxruntime as ort
    import numpy as np

    sess = ort.InferenceSession(final_onnx_path, providers=["CPUExecutionProvider"])
    test_queries = [
        ("cho xin nv", "request_quest"),
        ("dcm he thong rac phe vat", "defiance_mockery"),
        ("lam sao de dot pha truc co ky", "inquire_dao"),
        ("cho it tien tieu voi", "beg_resource"),
    ]

    print("-" * 55)
    for q, expected in test_queries:
        encoded = tokenizer(q, max_length=64, padding="max_length", truncation=True, return_tensors="np")
        t0 = time.perf_counter()
        outs = sess.run(None, {
            "input_ids": encoded["input_ids"].astype(np.int64),
            "attention_mask": encoded["attention_mask"].astype(np.int64),
        })
        lat = (time.perf_counter() - t0) * 1000
        intent = INTENT_REV.get(int(np.argmax(outs[0][0])), "unknown")
        hostile = bool(np.argmax(outs[2][0]) == 1)
        obed = round(float(outs[3][0][0]) * 5.0, 1)
        ok = "PASS" if intent == expected else "WARN"
        print(f"[{ok}] \"{q}\" -> [{intent}] | hostile={hostile} | ngoan={obed}/5 | {lat:.1f}ms")
    print("-" * 55)

    # Copy to public folder
    pub_dir = "public/models/trung_sinh_system1"
    os.makedirs(pub_dir, exist_ok=True)
    for f in ["metadata.json", "model.onnx", "vocab.json", "tokenizer.json", "tokenizer_config.json"]:
        src = os.path.join(output_dir, f)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(pub_dir, f))
    print(f"✅ Đã đồng bộ sang {pub_dir}/ cho ứng dụng web.")
    print("=" * 60)
    print("🎉 HOÀN THÀNH XUẤT ONNX CHO HỆ THỐNG TRUNG SINH!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    export_model()
