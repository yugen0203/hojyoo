import { NextRequest, NextResponse } from "next/server";

// In-memory store for mock sessions (in production, use DB)
const sessions = new Map<
  string,
  {
    progress_pct: number;
    estimated_minutes: number;
    completed_at?: string;
    error_message?: string;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subsidy_name, company_profile, project_title } = body;

    if (!subsidy_name) {
      return NextResponse.json(
        { error: "補助金名が必要です" },
        { status: 400 }
      );
    }

    // Generate a unique session ID
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Initialize session
    sessions.set(sessionId, {
      progress_pct: 0,
      estimated_minutes: 3,
    });

    // Simulate document generation (mock implementation)
    // In production, this would call the document service
    simulateGeneration(sessionId);

    console.log(
      `Document generation started: ${sessionId} for ${subsidy_name}`,
      { company_name: company_profile?.company_name, project_title }
    );

    return NextResponse.json({
      session_id: sessionId,
      message: "書類生成を開始しました",
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "書類生成の開始に失敗しました" },
      { status: 500 }
    );
  }
}

function simulateGeneration(sessionId: string) {
  const totalDurationMs = 15000; // 15 seconds
  const intervalMs = 500;
  let elapsed = 0;

  const interval = setInterval(() => {
    elapsed += intervalMs;
    const session = sessions.get(sessionId);
    if (!session) {
      clearInterval(interval);
      return;
    }

    const progress = Math.min(
      Math.round((elapsed / totalDurationMs) * 100),
      99
    );
    session.progress_pct = progress;

    if (elapsed >= totalDurationMs) {
      session.progress_pct = 100;
      session.completed_at = new Date().toISOString();
      clearInterval(interval);
    }

    sessions.set(sessionId, session);
  }, intervalMs);
}

export { sessions };
