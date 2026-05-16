"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Header } from "@/components/common/Header";
import { GenerateModal } from "@/components/document/GenerateModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { CompanyProfile } from "@/types";

const applySchema = z.object({
  project_title: z.string().min(1, "事業タイトルを入力してください"),
  project_description: z.string().min(20, "事業計画を20文字以上で入力してください"),
  expected_effect: z.string().min(10, "期待される効果を10文字以上で入力してください"),
  budget_amount: z.string().min(1, "申請額を入力してください"),
});

type ApplyFormData = z.infer<typeof applySchema>;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const subsidyId = decodeURIComponent(params.subsidyId as string);

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("company_profile");
    if (stored) {
      setCompanyProfile(JSON.parse(stored));
    }
  }, []);

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsidy_name: subsidyId,
          company_profile: companyProfile,
          ...data,
        }),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error ?? "書類生成の開始に失敗しました");
      }

      const result = await res.json();
      setSessionId(result.session_id);
      setShowGenerateModal(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateComplete = () => {
    setShowGenerateModal(false);
    toast.success("書類の生成が完了しました！");
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline text-sm"
            >
              ← 検索結果に戻る
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">申請書類の作成</h1>
              <p className="text-blue-600 font-medium mt-1">{subsidyId}</p>
            </div>

            {companyProfile && (
              <div className="p-4 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium text-gray-900">{companyProfile.company_name}</p>
                <p className="text-gray-600">
                  {companyProfile.industry} · {companyProfile.employee_count}名
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="project_title">事業タイトル *</Label>
                <Input
                  id="project_title"
                  placeholder="例：クラウドシステム導入による業務効率化"
                  {...register("project_title")}
                />
                {errors.project_title && (
                  <p className="text-destructive text-sm">{errors.project_title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_description">事業計画・概要 *</Label>
                <Textarea
                  id="project_description"
                  placeholder="この補助金で何を行うか、具体的に記述してください。"
                  rows={5}
                  {...register("project_description")}
                />
                {errors.project_description && (
                  <p className="text-destructive text-sm">{errors.project_description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_effect">期待される効果 *</Label>
                <Textarea
                  id="expected_effect"
                  placeholder="例：売上20%向上、コスト30%削減、新規雇用5名など"
                  rows={3}
                  {...register("expected_effect")}
                />
                {errors.expected_effect && (
                  <p className="text-destructive text-sm">{errors.expected_effect.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_amount">申請額（円） *</Label>
                <Input
                  id="budget_amount"
                  type="number"
                  placeholder="例：5000000"
                  {...register("budget_amount")}
                />
                {errors.budget_amount && (
                  <p className="text-destructive text-sm">{errors.budget_amount.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "処理中..." : "資料を作成する"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <GenerateModal
        open={showGenerateModal}
        sessionId={sessionId}
        subsidyName={subsidyId}
        onClose={() => setShowGenerateModal(false)}
        onComplete={handleGenerateComplete}
      />
    </div>
  );
}
