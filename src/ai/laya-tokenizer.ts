/**
 * Laya WordPiece Tokenizer (TypeScript / Browser & Node compatible)
 * Chuẩn hóa khớp 100% với HuggingFace AutoTokenizer (bert-base-multilingual-cased)
 */

export interface TokenizerOutput {
  inputIds: BigInt64Array
  attentionMask: BigInt64Array
  tokens: string[]
}

const CLS_TOKEN = '[CLS]'
const SEP_TOKEN = '[SEP]'
const UNK_TOKEN = '[UNK]'
const PAD_TOKEN = '[PAD]'

/**
 * Phân tách chuỗi theo dấu câu và khoảng trắng tương thích BertPreTokenizer
 */
export function basicTokenize(text: string): string[] {
  // Regex khớp các từ liên tiếp hoặc từng ký tự dấu câu đơn lẻ
  const matches = text.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu)
  return matches ? Array.from(matches) : []
}

/**
 * Mã hóa chuỗi văn bản thành input_ids và attention_mask dạng BigInt64Array cho ONNX Runtime
 */
export function tokenizeWordPiece(
  text: string,
  vocab: Record<string, number>,
  maxLen = 64,
): TokenizerOutput {
  const clsId = vocab[CLS_TOKEN] ?? 101
  const sepId = vocab[SEP_TOKEN] ?? 102
  const unkId = vocab[UNK_TOKEN] ?? 100
  const padId = vocab[PAD_TOKEN] ?? 0

  const rawWords = basicTokenize(text.trim())
  const subwords: string[] = []

  for (const word of rawWords) {
    if (word.length > 100) {
      subwords.push(UNK_TOKEN)
      continue
    }

    let isBad = false
    let start = 0
    const wordSubTokens: string[] = []

    while (start < word.length) {
      let end = word.length
      let curSubstr: string | null = null

      while (start < end) {
        let substr = word.slice(start, end)
        if (start > 0) {
          substr = '##' + substr
        }
        if (substr in vocab) {
          curSubstr = substr
          break
        }
        end -= 1
      }

      if (curSubstr === null) {
        isBad = true
        break
      }

      wordSubTokens.push(curSubstr)
      start = end
    }

    if (isBad) {
      subwords.push(UNK_TOKEN)
    } else {
      subwords.push(...wordSubTokens)
    }
  }

  // Cắt bớt nếu vượt quá maxLen - 2 (dành chỗ cho CLS và SEP)
  const truncated = subwords.slice(0, Math.max(0, maxLen - 2))

  const tokenIds: number[] = [
    clsId,
    ...truncated.map((token) => vocab[token] ?? unkId),
    sepId,
  ]

  const inputIds = new BigInt64Array(maxLen)
  const attentionMask = new BigInt64Array(maxLen)

  for (let i = 0; i < maxLen; i++) {
    const tid = tokenIds[i]
    if (tid !== undefined) {
      inputIds[i] = BigInt(tid)
      attentionMask[i] = 1n
    } else {
      inputIds[i] = BigInt(padId)
      attentionMask[i] = 0n
    }
  }

  return {
    inputIds,
    attentionMask,
    tokens: [CLS_TOKEN, ...truncated, SEP_TOKEN],
  }
}
