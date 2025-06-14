# WMS System

Supabase MCPとNext.jsを使用した倉庫管理システム（WMS）です。

## 機能

- **在庫管理**: 商品の在庫確認、移動、調整
- **商品マスタ**: 商品情報の登録・編集・削除
- **入庫管理**: 入庫予定の作成と入庫処理
- **出庫管理**: 出庫予定の作成とピッキング処理
- **ダッシュボード**: リアルタイムKPI表示

## 技術スタック

- **フロントエンド**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Supabase (PostgreSQL), MCP Server
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

Supabase MCPを使用してデータベースを作成し、マイグレーションを実行してください。

```sql
-- supabase/migrations/ 内のSQLファイルを順番に実行
-- 1. 20240101000001_create_base_tables.sql
-- 2. 20240101000002_sample_data.sql
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
- **locations**: ロケーションマスタ
- **products**: 商品マスタ
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
pnpm dev         # 全サービス起動
pnpm dev:mcp     # MCPサーバーのみ
pnpm dev:web     # Next.jsのみ

# ビルド
pnpm build       # 全パッケージビルド

# Lint
pnpm lint        # 全パッケージLint

# Supabase（ローカル開発）
pnpm supabase:start  # ローカルSupabase起動
pnpm supabase:stop   # ローカルSupabase停止
```

## ライセンス

MIT License