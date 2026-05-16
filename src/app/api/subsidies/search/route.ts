import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { CompanyProfile } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const profile: CompanyProfile = await request.json();

    if (!profile.company_name || !profile.industry || !profile.business_description) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "PLACEHOLDER_ANTHROPIC_KEY") {
      // Return mock data when no API key is set
      return NextResponse.json({ subsidies: getMockSubsidies() });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `あなたは日本の補助金・助成金の専門家です。
以下の会社情報に基づいて、現在申請可能または近日公募予定の補助金・助成金を8〜12件ピックアップしてください。

会社情報:
${JSON.stringify(profile, null, 2)}

以下のJSON形式で返してください（マークダウンや説明文は不要。JSONのみ）：
{
  "subsidies": [
    {
      "id": "unique_id",
      "name": "補助金名",
      "authority": "管轄省庁・自治体",
      "max_amount": 数値（円）,
      "subsidy_rate": "2/3",
      "status": "recruiting_1st" | "recruiting_2nd" | "not_recruiting" | "year_round",
      "next_recruitment_date": "2025-07-01" | null,
      "recommended_expenses": ["システム開発費", "設備購入費"],
      "official_url": "https://...",
      "match_score": 1から5の整数,
      "match_reason": "マッチ理由の説明",
      "status_label": "一次公募中" | "二次公募予定（7月1日〜）" | "現在公募なし" | "通年受付"
    }
  ]
}`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("AIからの応答が取得できませんでした");
    }

    // Extract JSON from response
    const text = textContent.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSONの解析に失敗しました");
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Subsidy search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "補助金の検索中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}

function getMockSubsidies() {
  return [
    {
      id: "it-subsidy-2024",
      name: "IT導入補助金2024",
      authority: "経済産業省・中小企業庁",
      max_amount: 4500000,
      subsidy_rate: "1/2〜3/4",
      status: "recruiting_2nd",
      next_recruitment_date: "2024-07-01",
      recommended_expenses: ["ソフトウェア費", "クラウド利用費", "導入支援費"],
      official_url: "https://www.it-hojo.jp/",
      match_score: 5,
      match_reason: "ITシステム導入を検討する中小企業に最適な補助金です。クラウドサービスの導入費用も対象になります。",
      status_label: "二次公募予定（7月1日〜）",
    },
    {
      id: "monodukuri-2024",
      name: "ものづくり・商業・サービス生産性向上促進補助金",
      authority: "中小企業庁",
      max_amount: 12500000,
      subsidy_rate: "1/2〜2/3",
      status: "recruiting_1st",
      next_recruitment_date: null,
      recommended_expenses: ["機械装置費", "システム構築費", "外注費"],
      official_url: "https://portal.monodukuri-hojo.jp/",
      match_score: 4,
      match_reason: "生産性向上のための設備投資やシステム導入に活用できます。",
      status_label: "一次公募中",
    },
    {
      id: "jizokuka-2024",
      name: "小規模事業者持続化補助金",
      authority: "中小企業庁・日本商工会議所",
      max_amount: 2000000,
      subsidy_rate: "2/3",
      status: "year_round",
      next_recruitment_date: null,
      recommended_expenses: ["広報費", "ウェブサイト関連費", "展示会等出展費"],
      official_url: "https://r3.jizokukahojokin.info/",
      match_score: 4,
      match_reason: "販路開拓や業務効率化に取り組む小規模事業者向けです。",
      status_label: "通年受付",
    },
    {
      id: "jigyousaikouchiku-2024",
      name: "事業再構築補助金",
      authority: "経済産業省",
      max_amount: 150000000,
      subsidy_rate: "1/2〜2/3",
      status: "recruiting_2nd",
      next_recruitment_date: "2024-08-01",
      recommended_expenses: ["建物費", "機械設備費", "システム構築費", "人件費"],
      official_url: "https://jigyou-saikouchiku.go.jp/",
      match_score: 3,
      match_reason: "新分野展開や事業転換に取り組む場合に活用できます。",
      status_label: "二次公募予定（8月1日〜）",
    },
    {
      id: "workplace-dx-2024",
      name: "職場意識改善助成金（テレワークコース）",
      authority: "厚生労働省",
      max_amount: 1000000,
      subsidy_rate: "3/4",
      status: "year_round",
      next_recruitment_date: null,
      recommended_expenses: ["テレワーク機器費", "システム整備費"],
      official_url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/jikan/syokubaisiki/index.html",
      match_score: 4,
      match_reason: "テレワーク環境整備を行う企業向けの助成金です。",
      status_label: "通年受付",
    },
    {
      id: "human-resource-2024",
      name: "人材開発支援助成金",
      authority: "厚生労働省",
      max_amount: 5000000,
      subsidy_rate: "45〜75%",
      status: "year_round",
      next_recruitment_date: null,
      recommended_expenses: ["訓練費", "賃金（訓練中）"],
      official_url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyufukin/d01-1.html",
      match_score: 3,
      match_reason: "従業員のスキルアップ・資格取得をサポートする助成金です。",
      status_label: "通年受付",
    },
  ];
}
