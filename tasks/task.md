# Hojyoo — タスク管理

> システム: 補助金・助成金 自動申請支援WEBアプリ  
> GitHub: https://github.com/yugen0203/hojyoo  
> ローカル: /Volumes/PortableSSD/Cloud Code/hojyoo  
> 開始日: 2026-05-16

---

## ステータス凡例
- `✅` 完了
- `🔄` 進行中
- `⏳` 未着手
- `❓` 要確認

---

## Phase 1 — MVP

### ドキュメント
- [x] ✅ 要件定義書 作成 (`README.md`)
- [x] ✅ デザイン仕様書 作成 (`design.md`)
- [x] ✅ GitHub リポジトリ作成・push (https://github.com/yugen0203/hojyoo)

### 環境構築
- [ ] ⏳ Next.js 14 プロジェクト初期化 (TypeScript + Tailwind + shadcn/ui)
- [ ] ⏳ Supabase プロジェクト作成 (Pro plan)
- [ ] ⏳ Supabase テーブル作成 (マイグレーション)
- [ ] ⏳ Cloudflare Pages 設定
- [ ] ⏳ 環境変数 (.env.local) 設定

### 機能実装

#### ① 会社情報フォーム
- [ ] ⏳ ステップ式フォーム UI (Step1: 必須 / Step2: 任意 / Step3: 会員登録)
- [ ] ⏳ フォームバリデーション (Zod + React Hook Form)
- [ ] ⏳ Supabase Auth 会員登録（メール確認なし）
- [ ] ⏳ 会社情報 DB 保存 (`company_profiles` テーブル)
- [ ] ⏳ パスワード表示/非表示トグル (目アイコン)
- [ ] ⏳ 登録完了モーダル

#### ② 補助金検索
- [ ] ⏳ Claude API 補助金検索ロジック実装
- [ ] ⏳ 検索結果カード UI（補助金名・満額・助成率・ステータス・おすすめ費目）
- [ ] ⏳ ステータスバッジ（一次公募中 / 二次公募予定 / 公募なし）
- [ ] ⏳ お気に入り機能（DB保存・ログイン必須）
- [ ] ⏳ 検索結果の Supabase キャッシュ保存

#### ③ 書類自動作成
- [ ] ⏳ Python マイクロサービス構築 (FastAPI + openpyxl + python-docx)
- [ ] ⏳ 書類テンプレート取得ロジック
- [ ] ⏳ 会社情報自動入力処理
- [ ] ⏳ ZIP生成（書類 + 申請手順PDF）
- [ ] ⏳ Supabase Storage 一時保存（24時間TTL）
- [ ] ⏳ 生成中モーダル（進捗バー・残り時間・キャンセル）
- [ ] ⏳ ZIPダウンロードボタン（署名付きURL）

#### ダッシュボード
- [ ] ⏳ マイページ（申請予定リスト・作成済み書類）
- [ ] ⏳ 会社情報編集

### インフラ・デプロイ
- [ ] ⏳ Cloudflare Pages デプロイ設定
- [ ] ⏳ Python サービス Render/Railway デプロイ
- [ ] ⏳ GitHub Actions CI/CD 設定

---

## Phase 2 — 本番化（独自ドメイン）

- [ ] ⏳ Cloudflare 独自ドメイン設定
- [ ] ⏳ 書類完成時メール通知
- [ ] ⏳ 管理者ダッシュボード
- [ ] ⏳ 補助金情報 定期クロール・自動更新
- [ ] ⏳ Stripe 連携（料金プラン）

---

## Phase 3 — 拡張

- [ ] ⏳ 外部API提供
- [ ] ⏳ 電子申請対応
- [ ] ⏳ 採択実績データ分析
- [ ] ⏳ 士業（社労士・中小企業診断士）連携

---

## 要確認事項

| # | 項目 | ステータス |
|---|---|---|
| 1 | Python書類生成サービスのホスティング先（Render / Railway / Cloud Run） | ❓ |
| 2 | 補助金テンプレートの取得方法（自動クロール vs 手動登録） | ❓ |
| 3 | 未登録ユーザーのセッション保持期間 | ❓ |
| 4 | 書類生成の推定時間SLA（何分を目安にするか） | ❓ |
| 5 | お気に入りの上限数 | ❓ |

---

## 技術スタック（確定）

| カテゴリ | 技術 |
|---|---|
| Frontend | Next.js 14 / TypeScript / Tailwind CSS / shadcn/ui |
| Database | Supabase (Pro) |
| Auth | Supabase Auth |
| AI | Claude API (claude-sonnet-4-6) |
| 書類生成 | Python / openpyxl / python-docx / FastAPI |
| Hosting | Cloudflare Pages (Phase1) |
| バージョン管理 | GitHub |

---

## 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-05-16 | プロジェクト開始。README.md・design.md作成・GitHub push完了 |
