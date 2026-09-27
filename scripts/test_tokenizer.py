import re
import json
from transformers import AutoTokenizer

with open('models/trung_sinh_system1/tokenizer.json', 'r', encoding='utf-8') as f:
    vocab = json.load(f)['model']['vocab']

def tokenize(text, max_len=64):
    raw_words = re.findall(r'\w+|[^\w\s]', text, re.UNICODE)
    subwords = []
    for word in raw_words:
        if len(word) > 100:
            subwords.append('[UNK]')
            continue
        is_bad = False
        start = 0
        sub_tokens = []
        while start < len(word):
            end = len(word)
            cur_substr = None
            while start < end:
                substr = word[start:end]
                if start > 0:
                    substr = '##' + substr
                if substr in vocab:
                    cur_substr = substr
                    break
                end -= 1
            if cur_substr is None:
                is_bad = True
                break
            sub_tokens.append(cur_substr)
            start = end
        if is_bad:
            subwords.append('[UNK]')
        else:
            subwords.extend(sub_tokens)

    subwords = subwords[:max_len - 2]
    ids = [vocab['[CLS]']] + [vocab.get(t, vocab['[UNK]']) for t in subwords] + [vocab['[SEP]']]
    mask = [1] * len(ids)
    while len(ids) < max_len:
        ids.append(vocab['[PAD]'])
        mask.append(0)
    return ids, mask, subwords

hf_tok = AutoTokenizer.from_pretrained('models/trung_sinh_system1')

test_sentences = [
    'cho ta xin nhiem vu voi he thong',
    'dcm he thong rac phe vat!!',
    'lam sao de dot pha truc co ky?',
    'hello ad 123'
]

all_match = True
for s in test_sentences:
    hf_ids = hf_tok(s, max_length=64, padding='max_length', truncation=True)['input_ids']
    my_ids, my_mask, subs = tokenize(s, 64)
    if hf_ids == my_ids:
        print(f'✅ Match: "{s}"')
    else:
        print(f'❌ Diff for "{s}":')
        print('  HF:', hf_ids[:10])
        print('  My:', my_ids[:10])
        all_match = False
if all_match:
    print('🎉 ALL SENTENCES MATCHED HF EXACTLY!')
