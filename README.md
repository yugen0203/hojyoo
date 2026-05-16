# Hojyoo — 補助金・助成金 自動申請支援システム

> 最新の日本国内補助金・助成金を検索し、自社に最適な補助金を提案。申請書類の自動作成まで一気通貫で完結するWEBアプリ。

---

## 目次

1. [システム概要](#システム概要)
2. [機能要件](#機能要件)
3. [データベース設計](#データベース設計)
4. [API設計](#api設計)
5. [画面構成](#画面構成)
6. [技術スタック](#技術スタック)
7. [フェーズ計画](#フェーズ計画)
8. [ディレクトリ構成](#ディレクトリ構成)
9. [環境変数](#環境変数)
10. [セットアップ手順](#セットアップ手順)

---

## システム概要

**システム名**: Hojyoo（ホジョー）  
**種別**: WEBアプリ（SaaS）  
**対象ユーザー**: 日本国内の中小企業・個人事業主  

### 解決する課題
- 補助金・助成金の情報収集に膨大な時間がかかる
- 自社に適用できるか判断が難しい
- 申請書類の作成が煩雑で専門知識が必要

### システムの価値
1. 会社情報を一度入力するだけで最新の補助金を自動マッチング
2. 地方自治体の補助金も含む網羅的な検索
3. 申請書類（Excel/Word）への自動入力 → ZIPダウンロード → あとは提出するだけ

---

## 機能要件

### ① 会社情報フォーム（Company Profile Form）

#### 概要
ユーザーが会社情報を入力するステップ式フォーム。入力後に会員登録オプションを提示。

#### 必須入力項目
| フィールド | 型 | 説明 |
|---|---|---|
| 事業形態 | enum | `個人事業主` / `法人` |
| 会社名 / 屋号 | string | 正式名称 |
| 法人登記住所 | string | 法人の場合は必須（都道府県・市区町村・番地） |
| 業種 | enum | 農業・製造・IT・飲食・小売・建設・医療・その他 等 |
| 事業内容 | text | 具体的な事業説明（200文字以内） |
| 従業員数 | number | 正社員数（パート・アルバイト含む選択肢あり） |

#### 任意入力項目
| フィールド | 型 | 説明 |
|---|---|---|
| 資本金 | number | 万円単位 |
| 設立年月日 | date | 法人設立日 または 開業日 |
| 年間売上 | enum | ～500万/500万～1000万/1000万～5000万/5000万～1億/1億以上 |
| 事業エリア | string | 主な事業活動の都道府県・市区町村 |
| 抱えている課題 | text | 解決したい経営課題（自由記述） |
| 導入予定の設備・システム | text | 補助金で購入・開発したいもの（自由記述） |
| 事業計画概要 | text | 今後の計画（任意） |
| ウェブサイトURL | url | 会社・事業のウェブサイト |
| 担当者名 | string | フォーム担当者 |
| 電話番号 | string | 連絡先 |

#### 会員登録フロー
```
フォーム完了
  ↓
「データを保存して会員登録する」チェックボックス表示
  ↓（チェックあり）
メールアドレス入力
パスワード入力（目のアイコンで表示/非表示切替）
  ↓
「登録する」ボタン
  ↓
登録完了モーダル表示
  ↓
補助金検索画面へ遷移
```

- メールアクティベート（確認メール）は不要
- 登録データ = フォームデータ + メールアドレス + パスワード（ハッシュ化）
- 未登録でもフォーム回答・補助金検索は可能（セッション保持のみ）

---

### ② 補助金検索（Subsidy Search）

#### 概要
①で入力した会社情報をもとに Claude API が最新の補助金・助成金をピックアップ・マッチング。

#### 検索対象
- 国（経済産業省・厚生労働省・農林水産省等）が管轄する補助金・助成金
- 都道府県・市区町村が独自に実施する地方補助金
- 業種特化型補助金（IT補助金・ものづくり補助金等）

#### 検索結果表示項目（カード形式）
| 項目 | 説明 |
|---|---|
| 補助金・助成金名 | 正式名称 |
| 管轄省庁 / 自治体 | 国・都道府県・市区町村 |
| 満額支給額 | 最大いくら出るか |
| 助成率 | 例：補助率2/3、助成率1/2 |
| 公募ステータス | `一次公募中` / `二次公募予定（○月○日〜）` / `現在公募なし` / `通年受付` |
| おすすめ申請費目 | 例：システム開発費、設備購入費、広告宣伝費 |
| マッチ度 | AI判定のマッチングスコア（★1〜5） |
| 詳細リンク | 公式サイトURL |

#### アクション
- **「この補助金を申請する」ボタン** — 書類作成フローへ
- **「お気に入り」ボタン（★）** — 会員のみ保存可能
- **「詳細を見る」** — 公式ページへ外部リンク

#### お気に入り機能
- 検索後、気になる補助金をお気に入りに追加
- ダッシュボードの「申請予定リスト」で管理

---

### ③ 書類自動作成（Document Generation）

#### 概要
申請する補助金の最新書類テンプレートをダウンロードし、会社情報・必要項目を自動入力してZIP形式で提供。

#### フロー
```
「この補助金を申請する」ボタン押下
  ↓
追加情報入力ページ（任意入力だった項目 + 補助金固有の必須項目）
  ↓
「資料を作成する」ボタン
  ↓
作成モーダル表示
  ┌─────────────────────────────┐
  │ 資料を作成中です...          │
  │ 資料作成まで残り約○分予定    │
  │ [████████░░░░░░░] 60%        │
  │                    [キャンセル]│
  └─────────────────────────────┘
  ↓（完了）
「ZIPファイルをダウンロード」ボタン表示
  ↓
ZIPダウンロード
```

#### ZIPファイル内容
```
hojyoo_申請書類_[補助金名]_[日付].zip
├── 申請書.xlsx（自動入力済み）
├── 事業計画書.docx（自動入力済み）
├── その他必要書類.xlsx（あれば）
└── 申請手順ガイド.pdf（申請方法・提出先・注意事項）
```

#### 書類生成仕様
- Python マイクロサービス（openpyxl / python-docx）で処理
- 最新テンプレートは公式サイトから都度取得
- 入力内容：会社名・住所・代表者名・事業内容・申請額等
- 生成完了後、署名付きURLで安全にダウンロード提供
- ファイルはSupabase Storageに一時保存（24時間後自動削除）

---

## データベース設計

### Supabase テーブル一覧

#### `users`（Supabase Auth 管理）
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK（Supabase Auth自動生成） |
| email | text | ログインメール |
| created_at | timestamptz | 登録日時 |

#### `company_profiles`（会社情報）
| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users.id, NULL許容 | 未登録ユーザーはNULL |
| session_id | text | NULL許容 | 未登録ユーザーのセッション識別子 |
| business_type | text | NOT NULL | `individual` / `corporation` |
| company_name | text | NOT NULL | 会社名・屋号 |
| registered_address | text | NULL許容 | 法人登記住所 |
| industry | text | NOT NULL | 業種コード |
| business_description | text | NOT NULL | 事業内容 |
| employee_count | integer | NOT NULL | 従業員数 |
| capital | bigint | NULL | 資本金（万円） |
| established_at | date | NULL | 設立年月日 |
| annual_revenue_range | text | NULL | 年間売上レンジ |
| business_area | text | NULL | 事業エリア（都道府県） |
| challenges | text | NULL | 課題・要望 |
| target_items | text | NULL | 導入予定設備・システム |
| business_plan | text | NULL | 事業計画概要 |
| website_url | text | NULL | ウェブサイト |
| contact_name | text | NULL | 担当者名 |
| phone | text | NULL | 電話番号 |
| created_at | timestamptz | DEFAULT NOW() | |
| updated_at | timestamptz | DEFAULT NOW() | |

#### `subsidy_searches`（検索履歴）
| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| company_profile_id | uuid | FK → company_profiles.id | |
| searched_at | timestamptz | DEFAULT NOW() | |
| results | jsonb | NOT NULL | Claude APIからの検索結果 |

#### `subsidies`（補助金マスタ・キャッシュ）
| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| name | text | NOT NULL | 補助金名 |
| authority | text | NOT NULL | 管轄省庁・自治体 |
| max_amount | bigint | | 最大支給額（円） |
| subsidy_rate | text | | 助成率（例: "2/3"） |
| status | text | | 公募ステータス |
| next_recruitment_date | date | | 次回公募予定日 |
| recommended_expenses | text[] | | おすすめ申請費目 |
| official_url | text | | 公式URL |
| template_urls | text[] | | 書類テンプレートURL |
| region | text | | 地域（全国・都道府県コード） |
| industry_codes | text[] | | 対象業種コード |
| last_updated | timestamptz | | 情報更新日時 |

#### `favorites`（お気に入り）
| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users.id | NOT NULL |
| subsidy_id | uuid | FK → subsidies.id | NOT NULL |
| created_at | timestamptz | DEFAULT NOW() | |

#### `applications`（申請管理）
| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users.id | |
| subsidy_id | uuid | FK → subsidies.id | |
| company_profile_id | uuid | FK → company_profiles.id | |
| status | text | | `generating` / `completed` / `cancelled` |
| zip_storage_path | text | | Supabase Storage パス |
| zip_expires_at | timestamptz | | 24時間後に削除 |
| created_at | timestamptz | DEFAULT NOW() | |

#### `document_sessions`（書類生成セッション）
| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| application_id | uuid | FK → applications.id | |
| estimated_minutes | integer | | 推定残り時間 |
| progress_pct | integer | | 進捗（0〜100） |
| error_message | text | NULL | エラー詳細 |
| started_at | timestamptz | | 開始時刻 |
| completed_at | timestamptz | NULL | 完了時刻 |

---

## API設計

### エンドポイント一覧

#### 認証 (`/api/auth`)
| Method | Path | 説明 |
|---|---|---|
| POST | `/api/auth/register` | 会員登録（メール確認なし） |
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/logout` | ログアウト |

#### 会社情報 (`/api/company`)
| Method | Path | 説明 |
|---|---|---|
| POST | `/api/company/profile` | 会社情報の新規保存 |
| GET | `/api/company/profile` | 会社情報の取得 |
| PUT | `/api/company/profile` | 会社情報の更新 |

#### 補助金検索 (`/api/subsidies`)
| Method | Path | 説明 |
|---|---|---|
| POST | `/api/subsidies/search` | 補助金検索（Claude API呼び出し） |
| GET | `/api/subsidies/:id` | 補助金詳細取得 |
| POST | `/api/subsidies/:id/favorite` | お気に入り追加 |
| DELETE | `/api/subsidies/:id/favorite` | お気に入り解除 |
| GET | `/api/subsidies/favorites` | お気に入り一覧 |

#### 書類作成 (`/api/documents`)
| Method | Path | 説明 |
|---|---|---|
| POST | `/api/documents/generate` | 書類生成開始 |
| GET | `/api/documents/status/:sessionId` | 生成進捗確認（ポーリング） |
| GET | `/api/documents/download/:applicationId` | 署名付きダウンロードURL取得 |
| DELETE | `/api/documents/cancel/:sessionId` | 生成キャンセル |

---

## 画面構成

```
/                         ランディングページ（Hojyoo紹介・CTA）
/form                     会社情報フォーム（ステップ式）
  └── Step1: 基本情報（必須）
  └── Step2: 詳細情報（任意）
  └── Step3: 会員登録オプション
/register                 会員登録完了モーダル → 自動遷移
/login                    ログイン
/dashboard                マイダッシュボード（要ログイン）
  ├── 申請予定リスト（お気に入り）
  ├── 作成済み書類
  └── 会社情報編集
/search                   補助金検索結果一覧
/subsidies/:id            補助金詳細
/apply/:subsidyId         追加情報入力 → 書類作成
/apply/:subsidyId/status  書類生成進捗（モーダル）
```

---

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | 14+ |
| 言語 | TypeScript | 5+ |
| スタイリング | Tailwind CSS | 3+ |
| UIコンポーネント | shadcn/ui | latest |
| データベース | Supabase (PostgreSQL) | Pro Plan |
| 認証 | Supabase Auth | — |
| ファイルストレージ | Supabase Storage | — |
| AI | Claude API (claude-sonnet-4-6) | latest |
| 書類生成 | Python (openpyxl / python-docx) | 3.11+ |
| Pythonホスティング | Render / Railway (無料枠) | — |
| フロントホスティング | Cloudflare Pages | — |
| APIルーティング | Cloudflare Workers | — |
| バリデーション | Zod | 3+ |
| フォーム | React Hook Form | 7+ |
| HTTP クライアント | Axios / fetch | — |
| ZIP生成 | zipfile (Python標準) | — |
| バージョン管理 | GitHub | — |

---

## フェーズ計画

### Phase 1（MVP）
**目標**: コアフローの実装・Cloudflare無料枠で動作確認

- [x] 要件定義・設計書作成
- [ ] Supabase プロジェクト作成・テーブル設計
- [ ] Next.js プロジェクト初期化
- [ ] 会社情報フォーム実装（必須項目）
- [ ] Supabase Auth 会員登録・ログイン
- [ ] Claude API 補助金検索実装
- [ ] 検索結果表示 UI
- [ ] お気に入り機能
- [ ] Python書類生成マイクロサービス
- [ ] 書類自動入力・ZIPダウンロード
- [ ] 申請手順PDF生成
- [ ] Cloudflare Pages デプロイ
- [ ] ローディングモーダル・進捗表示

### Phase 2（本番化）
**目標**: 独自ドメイン・品質向上

- [ ] 独自ドメイン設定（Cloudflare）
- [ ] メール通知（書類完成時）
- [ ] 管理者ダッシュボード
- [ ] 補助金情報の定期クロール・更新
- [ ] 多言語対応（英語）
- [ ] 料金プラン設定（Stripe連携）
- [ ] モバイル最適化

### Phase 3（拡張）
- [ ] API提供（外部連携）
- [ ] 書類の電子申請対応
- [ ] 採択実績データ分析
- [ ] 公認サポーター（社労士・中小企業診断士）連携

---

## ディレクトリ構成

```
hojyoo/
├── README.md
├── design.md
├── .env.local
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # ランディングページ
│   ├── form/
│   │   └── page.tsx              # 会社情報フォーム
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── search/
│   │   └── page.tsx              # 補助金検索結果
│   ├── subsidies/
│   │   └── [id]/
│   │       └── page.tsx          # 補助金詳細
│   └── apply/
│       └── [subsidyId]/
│           ├── page.tsx          # 追加情報入力
│           └── status/
│               └── page.tsx      # 生成進捗
│
├── components/
│   ├── ui/                       # shadcn/ui ベース
│   ├── form/
│   │   ├── CompanyFormStep1.tsx
│   │   ├── CompanyFormStep2.tsx
│   │   └── RegisterStep.tsx
│   ├── subsidy/
│   │   ├── SubsidyCard.tsx
│   │   ├── SubsidyList.tsx
│   │   └── FavoriteButton.tsx
│   ├── document/
│   │   ├── GenerateModal.tsx     # 生成中モーダル
│   │   └── DownloadButton.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── RegisterModal.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── claude/
│   │   └── searchSubsidies.ts   # Claude API 補助金検索
│   └── utils.ts
│
├── api/                          # Cloudflare Workers (別管理も可)
│   └── routes/
│
├── python-service/               # 書類生成マイクロサービス
│   ├── main.py                   # FastAPI エントリポイント
│   ├── generators/
│   │   ├── excel_generator.py
│   │   ├── word_generator.py
│   │   └── pdf_guide_generator.py
│   ├── templates/                # テンプレートキャッシュ
│   ├── requirements.txt
│   └── Dockerfile
│
├── supabase/
│   ├── migrations/               # DBマイグレーション
│   └── seed.sql
│
└── public/
    └── assets/
```

---

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic Claude API
ANTHROPIC_API_KEY=

# Python書類生成サービス
DOCUMENT_SERVICE_URL=
DOCUMENT_SERVICE_SECRET=

# その他
NEXT_PUBLIC_APP_URL=
```

---

## セットアップ手順

```bash
# 1. リポジトリクローン
git clone https://github.com/YOUR_ORG/hojyoo.git
cd hojyoo

# 2. 依存パッケージインストール
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.local を編集して各キーを設定

# 4. Supabase マイグレーション実行
npx supabase db push

# 5. 開発サーバー起動
npm run dev

# 6. Pythonサービス起動（別ターミナル）
cd python-service
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## GitHub 管理方針

- **ブランチ戦略**: `main`（本番）/ `develop`（開発）/ `feature/*`（機能別）
- **コミット規約**: `feat:` / `fix:` / `docs:` / `refactor:` / `chore:`
- **PR**: `develop` → `main` は必ずレビュー経由
- **Issues**: 機能・バグ・改善を GitHub Issues で管理
- **Projects**: GitHub Projects でフェーズ別タスク管理

---

## 補足・未確定事項（要確認）

- [ ] 補助金テンプレートのURL取得方法（定期クロール vs 手動登録）
- [ ] Python書類生成サービスのホスティング先（Render / Railway / Cloud Run）
- [ ] 未登録ユーザーのセッション保持期間
- [ ] 書類生成の推定時間（SLA目安）
- [ ] お気に入り上限数
- [ ] ログイン後のリダイレクト先

---

*最終更新: 2026-05-16*
