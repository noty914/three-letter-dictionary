/** コレクションの entry.id（例: api.md）を URL 用スラッグ（api）に揃える */
export function termSlug(entryId: string): string {
  return entryId.replace(/\.md$/i, '');
}

/** スラッグ先頭1文字から A–Z 用 CSS 変数 `--az-*` 用のキー（英字以外は null） */
export function azKeyFromSlug(slug: string): string | null {
  const c = slug[0]?.toUpperCase() ?? '';
  return /^[A-Z]$/.test(c) ? c : null;
}
