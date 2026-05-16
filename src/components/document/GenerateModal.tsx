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
  onClose: () => void;
  onComplete: () => void;
}

export function GenerateModal({
  open,
  sessionId,
  onClose,
  onComplete,
}: GenerateModalProps) {
  const [progress, setProgress] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(3);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !sessionId) return;

    setProgress(0);
    setIsCompleted(false);
    setError(null);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/status/${sessionId}`);
        if (!res.ok) {
          throw new Error("ステータス取得に失敗しました");
        }
        const data = await res.json();

        setProgress(data.progress_pct ?? 0);
        if (data.estimated_minutes !== undefined) {
          setEstimatedMinutes(data.estimated_minutes);
        }

        if (data.progress_pct >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          setTimeout(() => onComplete(), 1000);
        }

        if (data.error_message) {
          clearInterval(interval);
          setError(data.error_message);
        }
      } catch (err) {
        clearInterval(interval);
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, sessionId, onComplete]);

  const remainingSeconds = Math.max(
    0,
    Math.round(((100 - progress) / 100) * estimatedMinutes * 60)
  );
  const remainingText =
    remainingSeconds > 60
      ? `約${Math.ceil(remainingSeconds / 60)}分`
      : `約${remainingSeconds}秒`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCompleted
              ? "書類生成完了"
              : error
                ? "エラーが発生しました"
                : "書類を生成中..."}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="text-center space-y-3">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" onClick={onClose}>
                閉じる
              </Button>
            </div>
          ) : isCompleted ? (
            <div className="text-center space-y-3">
              <div className="text-5xl">✓</div>
              <p className="text-sm text-muted-foreground">
                書類の生成が完了しました。ダウンロードを開始します。
              </p>
            </div>
          ) : (
            <>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.round(progress)}% 完了</span>
                <span>残り{remainingText}</span>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                AIが申請書類を作成しています。しばらくお待ちください。
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  キャンセル
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
