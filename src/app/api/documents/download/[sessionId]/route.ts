import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/app/api/documents/generate/route";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
    }

    if (!session.zip_base64) {
      return NextResponse.json({ error: "書類がまだ生成中です" }, { status: 202 });
    }

    const zipBuffer = Buffer.from(session.zip_base64, "base64");
    const companyName = session.company_name ?? "会社";
    const subsidyName = (session.subsidy_name ?? "補助金").slice(0, 15);
    const filename = `hojyoo_申請書類_${companyName}_${subsidyName}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "ダウンロード中にエラーが発生しました" }, { status: 500 });
  }
}
