"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Header } from "@/components/common/Header";
import { RegisterModal } from "@/components/form/RegisterModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanyProfile } from "@/types";

const step1Schema = z.object({
  business_type: z.enum(["individual", "corporation"]),
  company_name: z.string().min(1, "会社名・屋号を入力してください"),
  industry: z.string().min(1, "業種を選択してください"),
  business_description: z.string().min(10, "事業内容を10文字以上で入力してください"),
  employee_count: z.string().min(1, "従業員数を入力してください"),
});

const step2Schema = z.object({
  capital: z.string().optional(),
  established_at: z.string().optional(),
  annual_revenue_range: z.string().optional(),
  business_area: z.string().optional(),
  challenges: z.string().optional(),
  target_items: z.string().optional(),
});

const step3Schema = z.object({
  want_register: z.boolean(),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  password: z.string().min(8, "パスワードは8文字以上です").optional().or(z.literal("")),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const INDUSTRIES = [
  "製造業",
  "IT・情報通信",
  "小売業",
  "飲食業",
  "建設業",
  "医療・福祉",
  "教育",
  "運輸・物流",
  "農業・林業・漁業",
  "観光・宿泊",
  "サービス業（その他）",
  "卸売業",
  "不動産業",
  "金融・保険",
  "その他",
];

const REVENUE_RANGES = [
  "500万円未満",
  "500万〜1,000万円",
  "1,000万〜3,000万円",
  "3,000万〜1億円",
  "1億〜5億円",
  "5億〜10億円",
  "10億円以上",
];

export default function FormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      business_type: "corporation",
      company_name: "",
      industry: "",
      business_description: "",
      employee_count: "1",
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      want_register: false,
      email: "",
      password: "",
    },
  });

  const wantRegister = form3.watch("want_register");

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleStep3Submit = async (data: Step3Data) => {
    if (!step1Data) return;
    setIsSubmitting(true);

    try {
      const profile: CompanyProfile = {
        ...step1Data,
        employee_count: parseInt(step1Data.employee_count, 10),
        ...step2Data,
        capital: step2Data?.capital ? parseInt(step2Data.capital, 10) : undefined,
      };

      // Save to sessionStorage
      sessionStorage.setItem("company_profile", JSON.stringify(profile));

      // Register if requested
      if (data.want_register && data.email && data.password) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        const result = await res.json();
        if (!res.ok) {
          toast.error(result.error ?? "登録に失敗しました");
          setIsSubmitting(false);
          return;
        }
        setRegisteredEmail(data.email);
        setShowRegisterModal(true);
      }

      // Navigate to search
      router.push("/search");
    } catch {
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step indicator */}
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className={currentStep === 1 ? "text-blue-600" : "text-gray-500"}>
                Step 1: 基本情報
              </span>
              <span className={currentStep === 2 ? "text-blue-600" : "text-gray-500"}>
                Step 2: 詳細情報
              </span>
              <span className={currentStep === 3 ? "text-blue-600" : "text-gray-500"}>
                Step 3: 会員登録（任意）
              </span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Step 1 */}
            {currentStep === 1 && (
              <form onSubmit={form1.handleSubmit(handleStep1Submit)} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">基本情報を入力</h2>

                <div className="space-y-2">
                  <Label>事業形態 *</Label>
                  <div className="flex gap-4">
                    {[
                      { value: "corporation", label: "法人" },
                      { value: "individual", label: "個人事業主" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={opt.value}
                          {...form1.register("business_type")}
                          className="accent-blue-600"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {form1.formState.errors.business_type && (
                    <p className="text-destructive text-sm">{form1.formState.errors.business_type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">会社名・屋号 *</Label>
                  <Input
                    id="company_name"
                    placeholder="例：株式会社サンプル"
                    {...form1.register("company_name")}
                  />
                  {form1.formState.errors.company_name && (
                    <p className="text-destructive text-sm">{form1.formState.errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>業種 *</Label>
                  <Select
                    onValueChange={(val) => form1.setValue("industry", val ?? "")}
                    defaultValue={form1.getValues("industry")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="業種を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form1.formState.errors.industry && (
                    <p className="text-destructive text-sm">{form1.formState.errors.industry.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description">事業内容 *</Label>
                  <Textarea
                    id="business_description"
                    placeholder="例：中小企業向けに業務効率化システムの開発・販売を行っています。主にクラウドサービスの提供が中心です。"
                    rows={4}
                    {...form1.register("business_description")}
                  />
                  {form1.formState.errors.business_description && (
                    <p className="text-destructive text-sm">{form1.formState.errors.business_description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_count">従業員数 *</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    min={1}
                    placeholder="例：10"
                    {...form1.register("employee_count")}
                  />
                  {form1.formState.errors.employee_count && (
                    <p className="text-destructive text-sm">{form1.formState.errors.employee_count.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  次へ →
                </Button>
              </form>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <form onSubmit={form2.handleSubmit(handleStep2Submit)} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">詳細情報（任意）</h2>
                <p className="text-sm text-muted-foreground">
                  より精度の高いマッチングのために、詳細情報を入力してください。スキップも可能です。
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capital">資本金（円）</Label>
                    <Input
                      id="capital"
                      type="number"
                      placeholder="例：1000000"
                      {...form2.register("capital")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="established_at">設立日</Label>
                    <Input
                      id="established_at"
                      type="date"
                      {...form2.register("established_at")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>年商レンジ</Label>
                  <Select onValueChange={(val) => form2.setValue("annual_revenue_range", String(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder="年商を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_area">事業エリア</Label>
                  <Input
                    id="business_area"
                    placeholder="例：東京都・神奈川県、または全国"
                    {...form2.register("business_area")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenges">現在の課題・悩み</Label>
                  <Textarea
                    id="challenges"
                    placeholder="例：人材不足、DX推進、設備の老朽化など"
                    rows={3}
                    {...form2.register("challenges")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_items">補助金で調達したいもの</Label>
                  <Textarea
                    id="target_items"
                    placeholder="例：ITシステム導入、設備購入、人材育成など"
                    rows={3}
                    {...form2.register("target_items")}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep(1)}
                  >
                    ← 戻る
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    次へ →
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <form onSubmit={form3.handleSubmit(handleStep3Submit)} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">会員登録（任意）</h2>
                <p className="text-sm text-muted-foreground">
                  会員登録するとお気に入りの補助金を保存したり、作成した書類を管理できます。
                </p>

                <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-gray-50">
                  <Checkbox
                    id="want_register"
                    checked={wantRegister}
                    onCheckedChange={(checked) =>
                      form3.setValue("want_register", checked === true)
                    }
                  />
                  <Label htmlFor="want_register" className="cursor-pointer font-medium">
                    無料会員登録する（書類保存・お気に入り機能が使えます）
                  </Label>
                </div>

                {wantRegister && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        {...form3.register("email")}
                      />
                      {form3.formState.errors.email && (
                        <p className="text-destructive text-sm">{form3.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">パスワード *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="8文字以上"
                        {...form3.register("password")}
                      />
                      {form3.formState.errors.password && (
                        <p className="text-destructive text-sm">{form3.formState.errors.password.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep(2)}
                  >
                    ← 戻る
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "処理中..." : "補助金を検索する →"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <RegisterModal
        open={showRegisterModal}
        email={registeredEmail}
        onClose={() => {
          setShowRegisterModal(false);
          router.push("/search");
        }}
      />
    </div>
  );
}
