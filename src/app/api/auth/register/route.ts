import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードを入力してください" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Skip email confirmation for development
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message === "User already registered"
              ? "このメールアドレスは既に登録されています"
              : error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id: data.user?.id,
      message: "会員登録が完了しました",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
