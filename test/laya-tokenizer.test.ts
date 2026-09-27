import { describe, expect, it } from 'vitest'
import { basicTokenize, tokenizeWordPiece } from '../src/ai/laya-tokenizer'

describe('Laya WordPiece Tokenizer', () => {
  const mockVocab: Record<string, number> = {
    '[PAD]': 0,
    '[UNK]': 100,
    '[CLS]': 101,
    '[SEP]': 102,
    cho: 11257,
    xin: 77178,
    n: 182,
    '##v': 10477,
    he: 10261,
    th: 77586,
    '##ong': 13891,
    '!': 999,
  }

  it('phân tách từ cơ bản và dấu câu chính xác', () => {
    const tokens = basicTokenize('cho xin nv! he-thong')
    expect(tokens).toEqual(['cho', 'xin', 'nv', '!', 'he', '-', 'thong'])
  })

  it('mã hóa subword chuẩn xác theo thuật toán WordPiece', () => {
    const res = tokenizeWordPiece('cho xin nv', mockVocab, 8)
    expect(res.tokens).toEqual(['[CLS]', 'cho', 'xin', 'n', '##v', '[SEP]'])
    expect(Array.from(res.inputIds)).toEqual([
      101n,
      11257n,
      77178n,
      182n,
      10477n,
      102n,
      0n,
      0n,
    ])
    expect(Array.from(res.attentionMask)).toEqual([
      1n,
      1n,
      1n,
      1n,
      1n,
      1n,
      0n,
      0n,
    ])
  })

  it('xử lý từ lạ ngoài từ điển thành [UNK]', () => {
    const res = tokenizeWordPiece('xyzalienword', mockVocab, 6)
    expect(res.tokens).toEqual(['[CLS]', '[UNK]', '[SEP]'])
    expect(res.inputIds[1]).toBe(100n)
  })

  it('cắt ngắn khi vượt quá maxLen', () => {
    const res = tokenizeWordPiece('cho xin nv cho xin nv', mockVocab, 5)
    // maxLen = 5 => CLS + 3 subwords + SEP
    expect(res.inputIds.length).toBe(5)
    expect(res.inputIds[0]).toBe(101n)
    expect(res.inputIds[4]).toBe(102n)
  })
})
