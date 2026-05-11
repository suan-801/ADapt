"use client";

import { useAppStore, PromptVariation } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Copy, Sparkles, Wand2, UserCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Stage3Extend() {
  const { apiKey, sourceImageBase64, extractedPrompt, extendedPrompts, setExtendedPrompts, keepCharacter, setKeepCharacter } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateVariations = async () => {
    if (!apiKey) {
      toast.error("우측 상단 설정(⚙️)에서 API 키를 먼저 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-prompt-variations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ 
          basePrompt: extractedPrompt,
          keepCharacter: keepCharacter,
          image: sourceImageBase64 // Base64 데이터를 전달
        })
      });

      if (!response.ok) {
        let errMessage = "API 연동 오류";
        try {
          const errData = await response.json();
          if (errData && typeof errData === 'object' && 'error' in errData) {
            errMessage = String(errData.error);
          }
        } catch { }
        throw new Error(errMessage);
      }

      const data = await response.json();
      
      const prompts = Array.isArray(data.prompts) ? (data.prompts as PromptVariation[]) : [];
      setExtendedPrompts(prompts);
      toast.success("프롬프트 확장이 완료되었습니다!");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "프롬프트 생성에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("프롬프트가 복사되었습니다!");
  };

  if (!extractedPrompt) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Step 1에서 원본 소재 분석을 먼저 진행해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Step 3. 프롬프트 베리에이션 (Extend)</h2>
        <p className="text-muted-foreground">
          &quot;이렇게도 제작해보세요!&quot; 원본 프롬프트를 바탕으로 다양한 시각적 테마의 아이디어를 제안합니다.
        </p>
      </div>

      <Card className="p-6 bg-muted/20">
        <h3 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
          <Wand2 className="h-4 w-4" /> 기준 프롬프트
        </h3>
        <p className="text-sm italic">{extractedPrompt}</p>
        
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center space-x-2 bg-background/50 px-4 py-2 rounded-full border border-primary/20 shadow-sm">
              <UserCheck className={`h-4 w-4 ${keepCharacter ? 'text-primary' : 'text-muted-foreground'}`} />
              <Label htmlFor="keep-char" className="text-sm font-medium cursor-pointer">인물/캐릭터 특징 유지</Label>
              <Switch 
                id="keep-char" 
                checked={keepCharacter} 
                onCheckedChange={setKeepCharacter}
              />
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              * 생성 도구(Midjourney 등) 사용 시 원본 이미지를 <b>캐릭터 레퍼런스(--cref)</b>로 함께 입력하면 더욱 효과적입니다.
            </p>
          </div>

          <Button onClick={handleGenerateVariations} disabled={isGenerating} size="lg" className="gap-2 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {isGenerating ? "AI가 다양한 아이디어를 구상 중..." : "다양한 버전의 프롬프트 제안받기"}
          </Button>
        </div>
      </Card>

      {extendedPrompts.length > 0 && !isGenerating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {extendedPrompts.map((item, idx) => (
            <Card key={idx} className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  {item.type}
                </span>
                <Button variant="ghost" size="xs" onClick={() => copyToClipboard(item.prompt)} className="h-7 text-xs">
                  <Copy className="h-3 w-3 mr-1" /> 복사
                </Button>
              </div>
              <div className="text-sm text-muted-foreground italic leading-relaxed">
                &quot;{item.prompt}&quot;
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
