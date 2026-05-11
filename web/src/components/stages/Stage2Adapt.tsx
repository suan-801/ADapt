"use client";

import { useState } from "react";
import { useAppStore, AdCopy } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";

export function Stage2Adapt() {
  const { apiKey, extractedText, targetMedia, setTargetMedia, generatedTexts, setGeneratedTexts } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customGuide, setCustomGuide] = useState("");

  const medias = [
    { id: "daangn", name: "당근 (Daangn)", desc: "친근한 이웃 말투, 지역 밀착형 키워드" },
    { id: "kakao", name: "카카오 비즈보드", desc: "짧고 강렬한 후킹, 고가시성 레이아웃" },
    { id: "gfa", name: "네이버 GFA", desc: "신뢰감 있는 정보성 카피, 혜택 강조" },
    { id: "toss", name: "TOSS (1:1 이미지형)", desc: "직관적 혜택 중심, 간결한 금융 톤앤매너" },
  ] as const;

  const handleGenerate = async (mediaId: "daangn" | "kakao" | "gfa" | "toss") => {
    if (!apiKey) {
      toast.error("우측 상단 설정(⚙️)에서 API 키를 먼저 입력해주세요.");
      return;
    }

    setTargetMedia(mediaId);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ 
          platform: mediaId, 
          sourceText: extractedText,
          customGuide: customGuide // 추가된 커스텀 가이드
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
      
      let variations: AdCopy[] = [];
      if (Array.isArray(data.copies)) {
        variations = data.copies;
      } else if (Array.isArray(data.variations)) {
        // 이전 API 하위호환
        variations = data.variations.map((v: string | AdCopy) => 
          typeof v === 'string' ? { headline: '', body: v, cta: '' } : v
        );
      } else {
        variations = [{ headline: '', body: data.variations || data.message || "결과가 없습니다.", cta: '' }];
      }
      
      setGeneratedTexts(variations);
      toast.success("매체 최적화 카피가 생성되었습니다!");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "카피 생성에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("카피가 복사되었습니다!");
  };

  if (!extractedText) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Step 1에서 원본 소재 분석을 먼저 진행해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Step 2. 매체별 카피 적응 (Adapt)</h2>
        <p className="text-muted-foreground">
          추출된 핵심 카피를 타겟 매체의 문법과 유저 심리에 맞춰 최적화합니다.
        </p>
      </div>

      {/* 2번 요청사항: 원본 소재 주요 텍스트 상단 고정 노출 */}
      <Card className="p-5 max-w-2xl mx-auto bg-primary/5 border-primary/20">
        <h3 className="text-sm font-bold text-primary mb-2 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          원본 소재 주요 텍스트
        </h3>
        <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
      </Card>

      <div className="max-w-2xl mx-auto">
        <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
          <label htmlFor="customGuide" className="block text-sm font-semibold mb-2">
            ✨ 추가 가이드라인 (선택)
          </label>
          <textarea
            id="customGuide"
            rows={2}
            className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="예: '무료 배송'이라는 단어를 꼭 강조해주세요. 또는 20대 타겟으로 작성해주세요."
            value={customGuide}
            onChange={(e) => setCustomGuide(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {medias.map((media) => (
          <Card 
            key={media.id} 
            className={`p-6 cursor-pointer transition-all duration-200 border-2 ${targetMedia === media.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
            onClick={() => handleGenerate(media.id)}
          >
            <h3 className="text-lg font-bold mb-2">{media.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{media.desc}</p>
            <Button 
              variant={targetMedia === media.id ? "default" : "outline"} 
              className="w-full"
              disabled={isGenerating && targetMedia === media.id}
            >
              {isGenerating && targetMedia === media.id ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 변주 중...</>
              ) : (
                "이 매체로 변주하기"
              )}
            </Button>
          </Card>
        ))}
      </div>

      {generatedTexts.length > 0 && !isGenerating && (
        <Card className="p-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">생성된 최적화 카피</h3>
            </div>
            {/* 3번 요청사항: 매체별 문안 가이드 노출 */}
            <div className="text-sm text-muted-foreground bg-background px-3 py-1.5 rounded-md border">
              💡 <b>매체 가이드:</b>{" "}
              {targetMedia === "kakao" ? "헤드라인 최대 15자 이내" : 
               targetMedia === "gfa" ? "헤드라인 20자, 본문 40자 이내" : 
               targetMedia === "toss" ? "주요문구 28자, 보조문구 18자 이내" :
               "제한 없음 (짧고 자연스럽게)"}
            </div>
          </div>
          
          <div className="grid gap-6">
            {generatedTexts.map((item, idx) => {
              const headline = item.headline || "";
              const body = item.body || "";
              const cta = item.cta || "";
              const textContent = `[헤드라인] ${headline}\n[본문] ${body}\n[버튼] ${cta}`;
              
              if (!headline) {
                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-background border rounded-lg shadow-sm">
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{body}</p>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(body)} className="shrink-0 ml-4">
                      <Copy className="h-4 w-4 mr-2" /> 복사
                    </Button>
                  </div>
                );
              }

              const hLen = headline.length;
              const bLen = body.length;

              return (
                <div key={idx} className="relative p-5 bg-background border rounded-xl shadow-sm space-y-4">
                  <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(textContent)}>
                      <Copy className="h-4 w-4 mr-2" /> 전체 복사
                    </Button>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">헤드라인</span>
                      <span className="text-xs text-muted-foreground">({hLen}자)</span>
                    </div>
                    <p className="text-sm font-medium">{headline}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded">본문</span>
                      <span className="text-xs text-muted-foreground">({bLen}자)</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{body}</p>
                  </div>

                  {cta && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded">버튼(CTA)</span>
                      </div>
                      <p className="text-sm font-medium text-primary">{cta}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
