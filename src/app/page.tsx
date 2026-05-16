import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              あなたの会社に最適な
              <br />
              <span className="text-blue-600">補助金・助成金</span>を
              <br />
              自動でマッチング
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              会社情報を入力するだけで、AIが最適な補助金を提案。
              申請書類も自動生成するので、面倒な手続きを大幅に削減できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/form">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg h-auto"
                >
                  無料で補助金を探す →
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              登録不要・無料でご利用いただけます
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Hojyooの特徴
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                  🔍
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  AIによる自動マッチング
                </h3>
                <p className="text-gray-600">
                  会社情報を入力するだけで、AIが数百の補助金データベースから
                  あなたの会社に最適な補助金を自動でピックアップします。
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                  📄
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  申請書類の自動生成
                </h3>
                <p className="text-gray-600">
                  マッチした補助金の申請書類をAIが自動作成。
                  面倒な書類作成の手間を大幅に削減できます。
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ⚡
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  最新情報を常に更新
                </h3>
                <p className="text-gray-600">
                  公募中・公募予定の最新情報をリアルタイムで反映。
                  申請チャンスを逃しません。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              使い方
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "会社情報を入力",
                  description:
                    "業種、事業内容、従業員数など基本情報を入力するだけ。3分で完了します。",
                },
                {
                  step: "02",
                  title: "補助金をマッチング",
                  description:
                    "AIがあなたの会社に最適な補助金を自動でピックアップ。マッチ度スコアで一覧表示。",
                },
                {
                  step: "03",
                  title: "申請書類を自動生成",
                  description:
                    "気に入った補助金を選んで申請ボタンをクリック。AIが申請書類を自動生成します。",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-blue-600">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">
              今すぐ無料で試してみましょう
            </h2>
            <p className="text-blue-100">
              登録不要。会社情報を入力するだけで、すぐに補助金候補が表示されます。
            </p>
            <Link href="/form">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg h-auto font-semibold"
              >
                無料で補助金を探す →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Hojyoo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
