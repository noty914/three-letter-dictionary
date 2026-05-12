import { TAG_CATALOG } from '@/data/tag-catalog';
import { collectAllTags } from '@/lib/tags';

type TermLike = { data: { tags?: string[] } };

/** 用語で使われているタグと TAG_CATALOG のキーが完全一致することをビルド時に保証する */
export function assertTagCatalogMatchesTerms(terms: TermLike[]): void {
  const used = collectAllTags(terms);
  const catalogKeys = Object.keys(TAG_CATALOG) as (keyof typeof TAG_CATALOG)[];
  const usedSet = new Set(used);
  const missing = used.filter((t) => !(t in TAG_CATALOG));
  const orphans = catalogKeys.filter((k) => !usedSet.has(k));
  if (missing.length === 0 && orphans.length === 0) return;
  const parts: string[] = [];
  if (missing.length)
    parts.push(`カタログ未定義のタグ: ${missing.join('、')}`);
  if (orphans.length)
    parts.push(`用語で未使用のタグ定義: ${orphans.join('、')}`);
  throw new Error(`TAG_CATALOG と用語の tags が一致しません。${parts.join(' ')}`);
}
