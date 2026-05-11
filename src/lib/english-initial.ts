/**
 * 英語正式名（titleEn）を、用語スラッグの英字（例: zip -> Z I P）に対応する文字を
 * titleEn 内で順番に強調できるよう分割する。
 *
 * 例:
 * - ZIP archive format -> Z I P を強調
 * - Identity and Access Management -> I A M を強調
 */
export type EnglishTitleSegment =
  | { type: 'text'; text: string }
  | { type: 'letter'; letter: string }; // A–Z（表示・CSS変数用）

const MAX_HIGHLIGHT = 12;
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

function slugLatinLetters(termSlug: string): string[] {
  const base = termSlug.replace(/\.md$/i, '').toLowerCase();
  return base.split('').filter((c) => /[a-z]/.test(c));
}

type WordMeta = {
  word: string;
  start: number;
  initialAbs: number;
  initialLetter: string;
};

function splitWordsWithMeta(titleEn: string): WordMeta[] {
  const out: WordMeta[] = [];
  let i = 0;
  while (i < titleEn.length) {
    while (i < titleEn.length && /[\s\-–—]/.test(titleEn[i] ?? '')) i += 1;
    if (i >= titleEn.length) break;
    const start = i;
    while (i < titleEn.length && !/[\s\-–—]/.test(titleEn[i] ?? '')) i += 1;
    const word = titleEn.slice(start, i);

    let initialOffset = -1;
    for (let j = 0; j < word.length; j += 1) {
      const ch = word[j];
      if (ch && /[A-Za-z]/.test(ch)) {
        initialOffset = j;
        break;
      }
    }
    if (initialOffset < 0) continue;

    out.push({
      word,
      start,
      initialAbs: start + initialOffset,
      initialLetter: word[initialOffset] ?? '',
    });
  }
  return out;
}

function buildSegmentsByIndexMap(
  titleEn: string,
  highlightMap: Map<number, string>,
): EnglishTitleSegment[] {
  const out: EnglishTitleSegment[] = [];
  let textBuffer = '';
  for (let i = 0; i < titleEn.length; i += 1) {
    const replacement = highlightMap.get(i);
    if (!replacement) {
      textBuffer += titleEn[i] ?? '';
      continue;
    }
    if (textBuffer) {
      out.push({ type: 'text', text: textBuffer });
      textBuffer = '';
    }
    out.push({ type: 'letter', letter: replacement.toUpperCase() });
  }
  if (textBuffer) out.push({ type: 'text', text: textBuffer });
  return out.length > 0 ? out : [{ type: 'text', text: titleEn }];
}

function splitByWordInitials(titleEn: string, slugLetters: string[]): EnglishTitleSegment[] | null {
  const words = splitWordsWithMeta(titleEn);
  if (words.length === 0 || slugLetters.length === 0) return null;

  const indexMap = new Map<number, string>();
  let cursor = 0;

  for (const target of slugLetters) {
    const candidates: { idx: number; item: WordMeta }[] = [];
    for (let wi = cursor; wi < words.length; wi += 1) {
      const item = words[wi]!;
      if (item.initialLetter.toLowerCase() === target.toLowerCase()) {
        candidates.push({ idx: wi, item });
      }
    }
    if (candidates.length === 0) return null;

    const preferred =
      candidates.find(({ item }) => !STOP_WORDS.has(item.word.toLowerCase())) ?? candidates[0]!;

    indexMap.set(preferred.item.initialAbs, target.toUpperCase());
    cursor = preferred.idx + 1;
  }

  return buildSegmentsByIndexMap(titleEn, indexMap);
}

function splitBySlugLetters(titleEn: string, slugLetters: string[]): EnglishTitleSegment[] | null {
  if (!titleEn.trim()) return null;
  if (slugLetters.length === 0) return [{ type: 'text', text: titleEn }];

  const indexMap = new Map<number, string>();
  let matchIndex = 0;
  for (let i = 0; i < titleEn.length; i += 1) {
    const ch = titleEn[i] ?? '';
    const target = slugLetters[matchIndex];
    const canMatch =
      !!target && /[A-Za-z]/.test(ch) && ch.toLowerCase() === target.toLowerCase();
    if (!canMatch) continue;
    indexMap.set(i, target.toUpperCase());
    matchIndex += 1;
    if (matchIndex >= slugLetters.length) break;
  }

  // 略語の全英字を titleEn 内で順に見つけられない場合は未強調表示へ戻す。
  if (matchIndex < slugLetters.length) {
    return [{ type: 'text', text: titleEn }];
  }

  return buildSegmentsByIndexMap(titleEn, indexMap);
}

export function buildEnglishTitleSegments(
  titleEn: string,
  termSlug: string,
): EnglishTitleSegment[] | null {
  const slugLetters = slugLatinLetters(termSlug).slice(0, MAX_HIGHLIGHT);
  return splitByWordInitials(titleEn, slugLetters) ?? splitBySlugLetters(titleEn, slugLetters);
}
