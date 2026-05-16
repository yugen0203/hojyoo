"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RegisterModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
}

export function RegisterModal({ open, email, onClose }: RegisterModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>会員登録が完了しました</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{email}</span>
              <br />
              に確認メールを送信しました。
            </p>
            <p className="text-sm text-muted-foreground">
              引き続き補助金の検索結果をご確認ください。
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onClose}
            >
              検索結果を見る
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                ダッシュボードへ
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
