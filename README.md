# WMS System

Supabase MCPとNext.jsを使用した倉庫管理システム（WMS）です。

## 機能

- **在庫管理**: 商品の在庫確認、移動、調整、画像表示機能
- **商品マスタ**: 商品情報の登録・編集・削除、画像アップロード機能（メイン画像1枚+追加画像3枚）
- **倉庫管理**: 倉庫マスタの登録・編集・削除
- **ロケーション管理**: 階層構造ロケーション（ゾーン・通路・ラック・レベル・ビン）
- **レポート機能**: インタラクティブなチャートによる在庫分析
- **ダッシュボード**: 折りたたみ可能なサイドバー、レスポンシブデザイン

## 技術スタック

- **フロントエンド**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Supabase Cloud (PostgreSQL), MCP Server
- **画像管理**: Base64エンコード、ドラッグ&ドロップアップロード
- **チャート**: Chart.js / React-chartjs-2
- **開発ツール**: pnpm (モノレポ), ESLint, TypeScript

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、Supabaseの認証情報を設定してください。

```bash
cp .env.example .env
```

### 3. データベースの設定

Supabase Cloudを使用してデータベースを作成し、マイグレーションを実行してください。

```sql
-- supabase/migrations/ 内のSQLファイルを順番に実行
-- 1. 20240101000001_create_base_tables.sql
-- 2. 20240101000002_sample_data.sql
-- 3. 20240615000001_add_product_images.sql (商品画像機能)
```

### 4. 開発サーバーの起動

```bash
# すべてのサービスを起動
pnpm dev

# または個別に起動
pnpm dev:mcp    # MCPサーバーのみ
pnpm dev:web    # Next.jsのみ
```

## プロジェクト構造

```
supabase-mcp/
├── packages/
│   ├── mcp-server/      # WMS MCP Server
│   │   ├── src/
│   │   │   ├── tools/   # MCPツール実装
│   │   │   ├── db/      # Supabaseクライアント
│   │   │   └── index.ts # サーバーエントリーポイント
│   │   └── package.json
│   └── web/             # Next.js Frontend
│       ├── app/         # App Router pages
│       ├── components/  # React components
│       ├── lib/         # ユーティリティ
│       └── package.json
├── supabase/
│   └── migrations/      # データベーススキーマ
├── pnpm-workspace.yaml  # モノレポ設定
└── package.json
```

## データベーススキーマ

- **warehouses**: 倉庫マスタ
- **locations**: ロケーションマスタ（階層構造サポート）
- **products**: 商品マスタ（画像カラム追加: main_image_url, additional_image_1-3_url）
- **inventory**: 在庫テーブル
- **inventory_movements**: 在庫移動履歴
- **inbound_orders**: 入庫予定
- **inbound_order_items**: 入庫予定明細
- **outbound_orders**: 出庫予定
- **outbound_order_items**: 出庫予定明細
- **picking_tasks**: ピッキングタスク
- **inventory_adjustments**: 在庫調整
- **system_logs**: システムログ

## MCPツール

- `inventory_check`: 在庫確認
- `inventory_transfer`: 在庫移動
- `product_manage`: 商品マスタCRUD

## 開発コマンド

```bash
# 開発
pnpm dev         # 全サービス起動（ポート3000でNext.js起動）
pnpm dev:mcp     # MCPサーバーのみ
pnpm dev:web     # Next.jsのみ

# ビルド
pnpm build       # 全パッケージビルド

# Lint
pnpm lint        # 全パッケージLint
```

## 主要機能

### 商品画像管理
- **画像アップロード**: ドラッグ&ドロップ対応のImageUploadコンポーネント
- **画像プレビュー**: 商品編集フォームでの画像プレビュー機能
- **ライトボックス表示**: ImageLightboxコンポーネントによる拡大表示
  - ズーム機能（0.5x - 3.0x）
  - 複数画像のナビゲーション
  - サムネイル表示
  - キーボードショートカット対応
  - クリックで閉じる機能

### UI/UXコンポーネント
- **折りたたみ可能サイドバー**: シェブロンアイコンによるトグル
- **レスポンシブデザイン**: モバイルフレンドリーなレイアウト
- **インタラクティブチャート**: Chart.jsによる在庫分析
- **リアルタイム検索**: 商品・在庫・ロケーション検索機能

### データ管理
- **Supabase Cloud**: リアルタイムデータベース
- **TypeScript**: 型安全なデータ操作
- **Base64画像保存**: データベース内画像ストレージ

## ライセンス

MIT License