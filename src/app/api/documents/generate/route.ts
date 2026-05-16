import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import * as XLSX from "xlsx";

// In-memory store for sessions and generated ZIPs
export const sessions = new Map<
  string,
  {
    progress_pct: number;
    estimated_minutes: number;
    completed_at?: string;
    error_message?: string;
    zip_base64?: string;
    subsidy_name?: string;
    company_name?: string;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subsidy_name, company_profile, project_title, project_description, expected_effect, budget_amount } = body;

    if (!subsidy_name) {
      return NextResponse.json({ error: "補助金名が必要です" }, { status: 400 });
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    sessions.set(sessionId, {
      progress_pct: 0,
      estimated_minutes: 1,
      subsidy_name,
      company_name: company_profile?.company_name ?? "会社名未設定",
    });

    // 非同期でZIP生成
    generateZip(sessionId, {
      subsidy_name,
      company_profile,
      project_title,
      project_description,
      expected_effect,
      budget_amount,
    }).catch((err) => {
      const s = sessions.get(sessionId);
      if (s) {
        s.error_message = String(err?.message ?? "生成中にエラーが発生しました");
        sessions.set(sessionId, s);
      }
    });

    return NextResponse.json({ session_id: sessionId, message: "書類生成を開始しました" });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "書類生成の開始に失敗しました" }, { status: 500 });
  }
}

async function generateZip(
  sessionId: string,
  data: {
    subsidy_name: string;
    company_profile: Record<string, unknown> | null;
    project_title: string;
    project_description: string;
    expected_effect: string;
    budget_amount: string;
  }
) {
  const updateProgress = (pct: number) => {
    const s = sessions.get(sessionId);
    if (s) { s.progress_pct = pct; sessions.set(sessionId, s); }
  };

  const cp = data.company_profile ?? {};
  const today = new Date().toLocaleDateString("ja-JP");
  const subsidyName = data.subsidy_name;
  const companyName = (cp.company_name as string) ?? "株式会社サンプル";
  const industry = (cp.industry as string) ?? "IT・情報通信";
  const employeeCount = (cp.employee_count as number) ?? 10;
  const businessType = cp.business_type === "corporation" ? "法人" : "個人事業主";
  const address = (cp.registered_address as string) ?? "東京都渋谷区";

  updateProgress(10);
  await sleep(800);

  // ① 申請書.xlsx を生成
  const wb = XLSX.utils.book_new();

  const sheetData = [
    ["補助金申請書", "", "", ""],
    ["", "", "", ""],
    ["申請日", today, "", ""],
    ["補助金名", subsidyName, "", ""],
    ["", "", "", ""],
    ["【申請者情報】", "", "", ""],
    ["事業形態", businessType, "", ""],
    ["会社名・屋号", companyName, "", ""],
    ["業種", industry, "", ""],
    ["所在地", address, "", ""],
    ["従業員数", `${employeeCount}名`, "", ""],
    ["", "", "", ""],
    ["【事業計画】", "", "", ""],
    ["事業タイトル", data.project_title, "", ""],
    ["", "", "", ""],
    ["事業概要", "", "", ""],
    [data.project_description, "", "", ""],
    ["", "", "", ""],
    ["期待される効果", "", "", ""],
    [data.expected_effect, "", "", ""],
    ["", "", "", ""],
    ["【申請額】", "", "", ""],
    ["申請金額（円）", Number(data.budget_amount).toLocaleString(), "", ""],
    ["", "", "", ""],
    ["【誓約事項】", "", "", ""],
    ["上記の内容は事実と相違ないことを誓約します。", "", "", ""],
    ["", "", "", ""],
    ["申請者署名", "", "印", ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 10 }, { wch: 10 }];

  // スタイル: タイトル行
  if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 16 } };
  if (ws["A6"]) ws["A6"].s = { font: { bold: true } };
  if (ws["A13"]) ws["A13"].s = { font: { bold: true } };
  if (ws["A22"]) ws["A22"].s = { font: { bold: true } };

  XLSX.utils.book_append_sheet(wb, ws, "申請書");

  // 費目内訳シート
  const budgetSheetData = [
    ["費目内訳書", "", ""],
    ["", "", ""],
    ["補助金名", subsidyName, ""],
    ["申請者", companyName, ""],
    ["", "", ""],
    ["費目", "内容", "金額（円）"],
    ["システム開発費", "クラウドシステム構築・カスタマイズ", Math.round(Number(data.budget_amount) * 0.6)],
    ["外注費", "システム設計・コンサルティング", Math.round(Number(data.budget_amount) * 0.25)],
    ["設備購入費", "サーバー・PC等のハードウェア", Math.round(Number(data.budget_amount) * 0.15)],
    ["", "", ""],
    ["合計", "", Number(data.budget_amount)],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(budgetSheetData);
  ws2["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, "費目内訳");

  const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  updateProgress(40);
  await sleep(600);

  // ② 事業計画書.txt を生成
  const jigyoKeikakusho = `事業計画書
=====================================

【補助金名】${subsidyName}
【作成日】${today}
【申請者】${companyName}

1. 事業の概要
─────────────────────────────────────
${data.project_title}

${data.project_description}

2. 申請者の概要
─────────────────────────────────────
・事業形態　: ${businessType}
・会社名　　: ${companyName}
・業種　　　: ${industry}
・所在地　　: ${address}
・従業員数　: ${employeeCount}名

3. 補助事業の内容
─────────────────────────────────────
本補助金を活用し、以下の取り組みを実施します。

${data.project_description}

4. 期待される効果・成果
─────────────────────────────────────
${data.expected_effect}

5. 補助金の使途（費用明細）
─────────────────────────────────────
申請総額: ${Number(data.budget_amount).toLocaleString()}円

・システム開発費  : ${Math.round(Number(data.budget_amount) * 0.6).toLocaleString()}円（60%）
・外注費          : ${Math.round(Number(data.budget_amount) * 0.25).toLocaleString()}円（25%）
・設備購入費      : ${Math.round(Number(data.budget_amount) * 0.15).toLocaleString()}円（15%）

6. 補助事業のスケジュール
─────────────────────────────────────
第1フェーズ（1〜2ヶ月目）: 要件定義・設計
第2フェーズ（3〜5ヶ月目）: 開発・構築
第3フェーズ（6ヶ月目）    : テスト・運用開始

以上

=====================================
${companyName}
代表者氏名: _____________________ 印
`;

  updateProgress(65);
  await sleep(500);

  // ③ 申請手順ガイド.txt を生成
  const guide = `===========================================
  申請手順ガイド
  ${subsidyName}
===========================================

このファイルには申請書類一式と申請手順が含まれています。

【同梱ファイル】
1. 申請書.xlsx      - 申請書と費目内訳書（自動入力済み）
2. 事業計画書.txt   - 事業計画書の内容
3. 申請手順ガイド.txt - このファイル

─────────────────────────────────────
【STEP 1】書類の最終確認
─────────────────────────────────────
□ 申請書.xlsx を開き、内容に誤りがないか確認
□ 会社名・住所・代表者名が正確か確認
□ 申請金額が正しいか確認
□ 押印欄に社印・代表者印を押印

─────────────────────────────────────
【STEP 2】追加書類の準備
─────────────────────────────────────
□ 登記簿謄本（法人の場合）- 3ヶ月以内のもの
□ 確定申告書の写し（直近1〜2期分）
□ 会社概要・パンフレット（任意）
□ 見積書（導入予定のシステム・設備のもの）

─────────────────────────────────────
【STEP 3】電子申請 or 郵送
─────────────────────────────────────
電子申請の場合:
  → jGrants（https://jgrants.go.jp）から申請
  → GビズIDプライムが必要です

郵送の場合:
  → 各補助金の公式ページで提出先を確認
  → 書留郵便での提出を推奨

─────────────────────────────────────
【STEP 4】採否通知を待つ
─────────────────────────────────────
□ 申請後、約1〜2ヶ月で採否通知が届きます
□ 採択された場合は「交付申請」の手続きが必要です
□ 補助事業完了後は「実績報告書」の提出が必要です

─────────────────────────────────────
【お問い合わせ】
補助金ごとに問い合わせ窓口が異なります。
公式サイトのお問い合わせページをご確認ください。
─────────────────────────────────────

※ 本書類はHojyoo（ホジョー）により自動生成されました。
   提出前に必ず内容をご確認ください。
   作成日: ${today}
`;

  updateProgress(80);
  await sleep(400);

  // ZIP作成
  const zip = new JSZip();
  const folderName = `hojyoo_申請書類_${companyName}_${subsidyName.slice(0, 10)}`;
  const folder = zip.folder(folderName)!;

  folder.file("申請書.xlsx", xlsxBuffer);
  folder.file("事業計画書.txt", jigyoKeikakusho, { binary: false });
  folder.file("申請手順ガイド.txt", guide, { binary: false });

  updateProgress(90);

  const zipBase64 = await zip.generateAsync({ type: "base64", compression: "DEFLATE" });

  updateProgress(100);

  const s = sessions.get(sessionId);
  if (s) {
    s.progress_pct = 100;
    s.completed_at = new Date().toISOString();
    s.zip_base64 = zipBase64;
    sessions.set(sessionId, s);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
