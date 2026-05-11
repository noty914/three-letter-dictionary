/**
 * GitHub Pages など base が /repo/ のとき、内部リンクに必須のプレフィックスを付ける。
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.replace(/^\//, '');
  return clean ? base + clean : base;
}
