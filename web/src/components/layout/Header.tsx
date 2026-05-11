"use client";

import { useState } from "react";
import { Settings, Key } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function Header() {
  const [open, setOpen] = useState(false);
  const { apiKey, setApiKey } = useAppStore();
  const [tempKey, setTempKey] = useState(apiKey || "");

  const handleSave = () => {
    if (!tempKey.trim()) {
      toast.error("API 키를 입력해주세요.");
      return;
    }
    setApiKey(tempKey.trim());
    setOpen(false);
    toast.success("API 키가 저장되었습니다.");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            A
          </div>
          <span className="text-xl font-bold tracking-tight">AD-apt</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-[11px] font-medium text-muted-foreground animate-in fade-in duration-700">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active: <b>gemini-flash-latest</b></span>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" }) + " gap-2"}>
              <Settings className="h-4 w-4" />
              <span>설정</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>설정 (BYOK)</DialogTitle>
                <DialogDescription>
                  당신의 개인 Gemini API 키를 입력하세요. 이 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Gemini API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Google AI Studio에서 무료로 발급받을 수 있습니다.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSave}>저장</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
