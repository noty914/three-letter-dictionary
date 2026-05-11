import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * プロジェクト直下の `.env.pages` を読み、まだ未設定の process.env にだけ反映する。
 * CI（GITHUB_REPOSITORY が既に入っている）では上書きしない。
 */
export function applyEnvPages() {
  const abs = path.resolve(process.cwd(), '.env.pages');
  if (!existsSync(abs)) return;
  const text = readFileSync(abs, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}
