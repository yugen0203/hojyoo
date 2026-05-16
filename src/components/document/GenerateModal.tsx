"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface GenerateModalProps {
  open: boolean;
  sessionId: string | null;
  subsidyName?: string;
  onClose: () => void;
  onComplete: () => void;
}

export function GenerateModal({
  open,
  sessionId,
  subsidyName,
  onClose,
  onComplete,
}: GenerateModalProps) {
  const [progress, setProgress] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!open || !sessionId) return;

    setProgress(0);
    setIsCompleted(false);
    setError(null);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/status/${sessionId}`);
        if (!res.ok) throw new Error("ステータス取得に失敗しました");
        const data = await res.json();

        setProgress(data.progress_pct ?? 0);
        if (data.estimated_minutes !== undefined) setEstimatedMinutes(data.estimated_minutes);

        if (data.error_message) {
          clearInterval(interval);
          setError(data.error_message);
        } else if (data.progress_pct >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
        }
      } catch (err) {
        clearInterval(interval);
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      }
    }, 800);

    return () => clearInterval(interval);
  }, [open, sessionId]);

  const handleDownload = async () => {
    if (!sessionId) return;
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/documents/download/${sessionId}`);
      if (!res.ok) throw new Error("ダウンロードに失敗しました");

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename\*=UTF-8''(.+)/);
      const filename = match
        ? decodeURIComponent(match[1])
        : `hojyoo_申請書類.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => onComplete(), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ダウンロードエラー");
    } finally {
      setIsDownloading(false);
    }
  };

  const remainingSeconds = Math.max(0, Math.round(((100 - progress) / 100) * estimatedMinutes * 60));
  const remainingText = remainingSeconds > 60
    ? `約${Math.ceil(remainingSeconds / 60)}分`
    : `約${remainingSeconds}秒`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" >
        <DialogHeader>
          <DialogTitle>
            {isCompleted ? "🎉 書類生成完了！" : error ? "エラーが発生しました" : "📄 書類を生成中..."}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="text-center space-y-3">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" onClick={onClose}>閉じる</Button>
            </div>
          ) : isCompleted ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 rounded-xl p-5 space-y-2">
                <p className="font-semibold text-gray-900">ZIPファイルの内容</p>
                <div className="text-sm text-gray-600 space-y-1 text-left">
                  <p>📊 申請書.xlsx（申請書・費目内訳 自動入力済み）</p>
                  <p>📝 事業計画書.txt（会社情報・事業内容 自動入力済み）</p>
                  <p>📋 申請手順ガイド.txt（提出先・手順の説明）</p>
                </div>
              </div>
              {subsidyName && (
                <p className="text-sm text-muted-foreground">対象: {subsidyName}</p>
              )}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? "ダウンロード中..." : "⬇️ ZIPファイルをダウンロード"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>後でダウンロードする</Button>
            </div>
          ) : (
            <>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.round(progress)}% 完了</span>
                <span>資料作成まで残り{remainingText}</span>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                AIが申請書類を作成しています。しばらくお待ちください。
              </p>
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={onClose}>キャンセル</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
