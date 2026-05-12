/**
 * タグ一覧・タグ別ページで共有する、タグ名ごとの一行説明。
 * 用語 frontmatter の tags 文字列とキーを完全一致させること。
 */
export const TAG_CATALOG = {
  AI: {
    description: '機械学習や生成 AI など、知的な処理を自動化する技術まわりの用語。',
  },
  クラウド: {
    description: 'インターネット経由でコンピューティング資源を使うサービスや基盤の用語。',
  },
  データ: {
    description: '指標・集計・データ活用など、数値や情報そのものに関する用語。',
  },
  セキュリティ: {
    description: '認証・暗号・脅威対策など、安全に使うための用語。',
  },
  ネットワーク: {
    description: '通信・接続・つながりの仕組みなど、インフラの経路まわりの用語。',
  },
  開発: {
    description: 'プログラミング・ソフトウェア制作・実行環境に近い用語。',
  },
  法務: {
    description: '契約・守秘・コンプライアンスなど、法律や社内規程まわりの用語。',
  },
  業務システム: {
    description: '基幹・販売支援など、会社の業務を支える IT システムの用語。',
  },
  業務運用: {
    description: '手順・社内連絡・日々のオペレーションなど、現場の進め方の用語。',
  },
  プロジェクト: {
    description: '計画・検証・調達など、ものごとを前に進める進め方の用語。',
  },
  経営: {
    description: '目標・評価・事業判断など、経営やマネジメント視点の用語。',
  },
} as const;

export type CatalogTag = keyof typeof TAG_CATALOG;

export function getTagCatalogDescription(tag: string): string | undefined {
  if (tag in TAG_CATALOG) {
    return TAG_CATALOG[tag as CatalogTag].description;
  }
  return undefined;
}
