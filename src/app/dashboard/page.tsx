import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/common/Header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Application, Favorite } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch favorites
  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch applications
  const { data: applicationsData } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favorites: Favorite[] = favoritesData ?? [];
  const applications: Application[] = applicationsData ?? [];

  function getStatusLabel(status: Application["status"]): string {
    switch (status) {
      case "generating":
        return "生成中";
      case "completed":
        return "完了";
      case "cancelled":
        return "キャンセル";
      case "failed":
        return "失敗";
      default:
        return status;
    }
  }

  function getStatusVariant(
    status: Application["status"]
  ): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
      case "completed":
        return "default";
      case "generating":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>

          {/* Favorites */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              お気に入りの補助金
            </h2>
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  お気に入りに追加した補助金がありません。
                  <br />
                  <a href="/form" className="text-blue-600 hover:underline">
                    補助金を探す
                  </a>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  <Card key={fav.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {fav.subsidy_data?.name ?? "不明"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {fav.subsidy_data?.authority ?? ""}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        {fav.subsidy_data?.max_amount !== null &&
                          fav.subsidy_data?.max_amount !== undefined && (
                            <span className="text-blue-700 font-medium">
                              上限{" "}
                              {fav.subsidy_data.max_amount >= 10000
                                ? `${(fav.subsidy_data.max_amount / 10000).toFixed(0)}万円`
                                : `${fav.subsidy_data.max_amount.toLocaleString()}円`}
                            </span>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Applications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              作成済み書類
            </h2>
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  作成した書類がありません。
                  <br />
                  <a href="/form" className="text-blue-600 hover:underline">
                    補助金を探して申請書類を作成する
                  </a>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{app.subsidy_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString("ja-JP")
                            : ""}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
