import { Buffer } from 'node:buffer';

/** タグを URL セグメント用の ASCII のみのキーに変換（日本語・記号OK） */
export function tagToParam(tag: string): string {
  return Buffer.from(tag, 'utf8').toString('base64url');
}

export function paramToTag(param: string | undefined): string {
  if (!param) return '';
  try {
    return Buffer.from(param, 'base64url').toString('utf8');
  } catch {
    return '';
  }
}

export function collectAllTags(
  terms: { data: { tags?: string[] } }[],
): string[] {
  const set = new Set<string>();
  for (const t of terms) {
    for (const tag of t.data.tags ?? []) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
}
