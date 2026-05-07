/**
 * サイト表示名・既定の meta 説明文。
 *
 * GitHub Pages の URL は `https://<ユーザー>.github.io/three-letter-dictionary/` のように
 * **リポジトリ名 `three-letter-dictionary`** と揃えると分かりやすいです（GitHub でリネーム後、再デプロイ）。
 */
/** サイト名（ヘッダ・フッター・検索結果の title に使用） */
export const SITE_NAME = '3文字アルファベット辞典';

/** トップのリード文（日本語のまま：読者は国内想定） */
export const SITE_LEDE_PRIMARY =
  'よく使われる略語を、<strong>①初級</strong>（会議やニュースでの見え方）、<strong>②中級</strong>（仕組みの輪郭）、<strong>③上級</strong>（技術寄りのニュアンス）に分けて整理します。正式名称は英語併記です。';

export const SITE_LEDE_SECOND =
  '上部の <strong>A–Z</strong> から頭文字で絞り込み、検索、または下の一覧から用語を選んでください。';

/** 既定の meta description（検索スニペット用・日本語） */
export const SITE_DESCRIPTION =
  'IT・ビジネスでよく出る3文字略語を、初級・中級・上級に分けて解説する無料の辞典サイトです。';

export const SITE_FOOTER = `${SITE_NAME} · static site`;
