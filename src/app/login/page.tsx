"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(
          error.message === "Invalid login credentials"
            ? "メールアドレスまたはパスワードが間違っています"
            : error.message
        );
        return;
      }

      toast.success("ログインしました");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Hojyooアカウントにログインします
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "ログイン中..." : "ログイン"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">アカウントをお持ちでない方は </span>
              <Link href="/form" className="text-blue-600 hover:underline font-medium">
                無料で登録
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
