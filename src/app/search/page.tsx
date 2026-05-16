"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/common/Header";
import { SubsidyCard } from "@/components/subsidy/SubsidyCard";
import type { CompanyProfile, Subsidy } from "@/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubsidies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get company profile from sessionStorage or URL params
        let profile: CompanyProfile | null = null;

        const profileParam = searchParams.get("profile");
        if (profileParam) {
          profile = JSON.parse(decodeURIComponent(profileParam));
        } else {
          const stored = sessionStorage.getItem("company_profile");
          if (stored) {
            profile = JSON.parse(stored);
          }
        }

        if (!profile) {
          setError("会社情報が見つかりません。フォームから入力してください。");
          setIsLoading(false);
          return;
        }

        setCompanyProfile(profile);

        const res = await fetch("/api/subsidies/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "補助金の検索に失敗しました");
        }

        const data = await res.json();
        setSubsidies(data.subsidies ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "エラーが発生しました";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubsidies();
  }, [searchParams]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          補助金・助成金 検索結果
        </h1>
        {companyProfile && (
          <p className="text-muted-foreground">
            <span className="font-medium">{companyProfile.company_name}</span>
            （{companyProfile.industry}・{companyProfile.employee_count}名）向けの補助金
          </p>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-20 space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">
            AIが最適な補助金を検索中です...
            <br />
            <span className="text-sm">30秒〜1分程度かかる場合があります</span>
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-20 space-y-4">
          <p className="text-destructive">{error}</p>
          <a href="/form" className="text-blue-600 underline">
            フォームに戻る
          </a>
        </div>
      )}

      {!isLoading && !error && subsidies.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            マッチする補助金が見つかりませんでした。
            <br />
            条件を変えて再度お試しください。
          </p>
        </div>
      )}

      {!isLoading && !error && subsidies.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {subsidies.length}件の補助金が見つかりました
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subsidies.map((subsidy) => (
              <SubsidyCard
                key={subsidy.id}
                subsidy={subsidy}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 py-10 px-4">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>
    </div>
  );
}
