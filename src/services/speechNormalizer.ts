/**
 * Vietnamese Speech Normalizer for Robot BiTi Grade 3 Informatics
 * Produces phonetically accurate, clear Vietnamese text for TTS engines
 * while keeping original display text pristine in the UI.
 */

// Informatics & Grade 3 Specific Pronunciation Dictionary
const INFORMATICS_DICTIONARY: [RegExp, string][] = [
  // Robot BiTi
  [/\bBiTi\b/gi, 'Bi-Ti'],
  [/\bBi Ti\b/gi, 'Bi-Ti'],

  // Hardware and Keys
  [/\bCPU\b/gi, 'C-P-U'],
  [/\bUSB\b/gi, 'U-S-B'],
  [/\bRAM\b/gi, 'bộ nhớ Ram'],
  [/\bROM\b/gi, 'bộ nhớ Rom'],
  [/\bEnter\b/gi, 'phím En-tơ'],
  [/\bShift\b/gi, 'phím Síp'],
  [/\bSpace\b/gi, 'phím Cách'],
  [/\bBackspace\b/gi, 'phím Xóa lùi'],
  [/\bDelete\b/gi, 'phím Đê-lét'],
  [/\bCaps Lock\b/gi, 'phím Cáp-lốc'],
  [/\bTab\b/gi, 'phím Táp'],
  [/\bEsc\b/gi, 'phím Thoát Ét-kép'],
  [/\bCtrl\b/gi, 'phím Cân-tơ-rôn'],
  [/\bAlt\b/gi, 'phím An'],

  // Software & Operating Systems
  [/\bPaint\b/gi, 'phần mềm Pen'],
  [/\bWindows\b/gi, 'Win-đao'],
  [/\bInternet\b/gi, 'In-tơ-nét'],
  [/\bLaptop\b/gi, 'máy tính xách tay'],
  [/\bFolder\b/gi, 'thư mục'],
  [/\bFile\b/gi, 'tệp'],
  [/\bOnline\b/gi, 'trực tuyến'],
  [/\bWebsite\b/gi, 'trang mạng'],
  [/\bWeb\b/gi, 'trang mạng'],
  [/\bWi-Fi\b/gi, 'Oai-phai'],
  [/\bWifi\b/gi, 'Oai-phai'],

  // Units & Abbreviations
  [/\bGDPT\b/gi, 'Giáo dục phổ thông'],
  [/\bSGK\b/gi, 'sách giáo khoa'],
  [/\b(\d+)\s*cm\b/gi, '$1 xen-ti-mét'],
  [/\b(\d+)\s*mm\b/gi, '$1 mi-li-mét'],
  [/\b(\d+)\s*km\b/gi, '$1 ki-lô-mét'],
  [/\b(\d+)\s*GB\b/gi, '$1 ghi-ga-bai'],
  [/\b(\d+)\s*MB\b/gi, '$1 mê-ga-bai'],
];

/**
 * Prepares raw text from Gemini into a Vietnamese phonetic script for TTS
 */
export function prepareVietnameseSpeechText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 0. Remove any system prompt instructions or TTS style guides that might precede the answer
  cleaned = cleaned.replace(/^Đọc to bằng tiếng Việt tự nhiên.*?[.:\n]/gi, '');
  cleaned = cleaned.replace(/^Đọc bằng tiếng Việt tự nhiên.*?[.:\n]/gi, '');
  cleaned = cleaned.replace(/^Hãy đọc bằng tiếng Việt.*?[.:\n]/gi, '');
  cleaned = cleaned.replace(/^\[.*?\]\s*/gm, '');

  // 1. Remove markdown images & links: ![alt](url) -> "" and [text](url) -> text
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '');
  cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  // 2. Remove markdown formatting markers (*, **, _, __, `, #, ~)
  cleaned = cleaned.replace(/\*{1,3}(.*?)\*{1,3}/g, '$1');
  cleaned = cleaned.replace(/_{1,3}(.*?)_{1,3}/g, '$1');
  cleaned = cleaned.replace(/~{1,2}(.*?)~{1,2}/g, '$1');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/https?:\/\/\S+/g, '');

  // 3. Format lists with natural pedagogical pauses
  // Numbered list at start of line: "1. Gõ chữ" -> "Bước 1: Gõ chữ"
  cleaned = cleaned.replace(/^\s*(\d+)\.\s+/gm, 'Bước $1: ');
  // Bullet points at start of line -> clean sentence separator
  cleaned = cleaned.replace(/^\s*[-*•]\s+/gm, '. ');

  // 4. Strip emojis that confuse TTS pronunciation (e.g. 🤖, 💻, ⌨️, 🖱️, ✨, 🌟, ↩️)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu, '');

  // 5. Apply Informatics Pronunciation Dictionary
  for (const [pattern, replacement] of INFORMATICS_DICTIONARY) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // 6. Clean punctuation & whitespace
  // Replace multiple periods with a single period
  cleaned = cleaned.replace(/\.{2,}/g, '. ');
  // Replace multiple exclamation/question marks
  cleaned = cleaned.replace(/!{2,}/g, '! ');
  cleaned = cleaned.replace(/\?{2,}/g, '? ');
  // Remove technical symbols: < >, |, /, \, ^, @, #, $, %
  cleaned = cleaned.replace(/[<>|/\\^@#$%]/g, ' ');
  // Normalize extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Splits long text into natural sentence chunks (max 400 chars each) to prevent TTS timeout
 */
export function chunkVietnameseText(text: string, maxChunkLength: number = 400): string[] {
  const prepared = prepareVietnameseSpeechText(text);
  if (prepared.length <= maxChunkLength) {
    return [prepared];
  }

  const sentences = prepared.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).length <= maxChunkLength) {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [prepared];
}
