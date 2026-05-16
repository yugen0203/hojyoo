import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/app/api/documents/generate/route";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "セッションIDが必要です" },
        { status: 400 }
      );
    }

    const session = sessions.get(sessionId);

    if (!session) {
      // Return a not-found session state
      return NextResponse.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session_id: sessionId,
      progress_pct: session.progress_pct,
      estimated_minutes: session.estimated_minutes,
      completed_at: session.completed_at ?? null,
      error_message: session.error_message ?? null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "ステータス確認中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
