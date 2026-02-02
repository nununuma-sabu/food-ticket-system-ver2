# Self-Ordering Kiosk System (セルフオーダーキオスクシステム)

飲食店向けのセルフオーダーキオスクおよび管理システムです。
お客様用注文画面（キオスク）と、厨房・管理者用ダッシュボード（管理画面）を備えています。

## 機能概要

### 🍔 お客様向け機能 (キオスク)
- **メニュー閲覧**: カテゴリ分けされた商品一覧表示
- **詳細カスタマイズ**: オプション選択（大盛り、トッピング等）
- **カート機能**: 注文内容の確認と編集
- **注文送信**: 厨房へのリアルタイム注文送信
- **お会計**: 模擬決済フロー（現金、カード等）
- **ステータス確認**: 「調理中」から「提供済み」へのステータス自動更新

### 👨‍🍳 管理者向け機能 (管理画面)
- **ダッシュボード**: 売上サマリー、注文ランキング、最新履歴のリアルタイム表示
- **注文管理**: 注文状況の確認とステータス更新（調理中 ↔ 提供済み）
- **在庫連携**: 注文確定時の自動在庫減算
- **商品管理**: 商品の追加・編集・削除、在庫数の調整

## 技術スタック

### Frontend
- **Framework**: React 19, Vite
- **Language**: TypeScript
- **Styling**: CSS Modules / Vanilla CSS
- **Routing**: React Router DOM v7
- **Testing**: Vitest, React Testing Library

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite (SQLAlchemy)
- **Auth**: JWT Authentication (OAuth2)
- **Testing**: pytest, pytest-cov (Coverage 100%)

## セットアップ手順

### 前提条件
- Node.js (v20以上推奨)
- Python (3.10以上)

### 1. バックエンドのセットアップ
```bash
cd backend
# 仮想環境の作成と有効化 (推奨)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存パッケージのインストール
pip install -r requirements.txt

# サーバー起動 (ポート8000)
uvicorn main:app --reload
```

初回起動時に `sql_app.db` が自動生成され、初期データが投入されます。
管理画面の初期アカウント: `admin` / `adminpassword`

### 2. フロントエンドのセットアップ
```bash
cd frontend
# 依存パッケージのインストール
npm install

# 開発サーバー起動 (ポート5173等)
npm run dev
```

## 実行方法

1. **お客様用画面**: ブラウザで `http://localhost:5173/` にアクセス
2. **管理画面**: ブラウザで `http://localhost:5173/admin/login` にアクセス
   - ログイン後、ダッシュボードや注文管理画面が利用できます。

## テストの実行

### バックエンド (全テスト & カバレッジ)
```bash
cd backend
pytest --cov=backend --cov-report=term-missing backend/tests/
```

### フロントエンド (主要コンポーネント & ロジック)
```bash
cd frontend
npm test  # または npm run coverage
```
