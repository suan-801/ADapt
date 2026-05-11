"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, Loader2, Copy, FileText, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function Stage1Upload() {
  const { 
    apiKey,
    sourceImage, setSourceImage, 
    sourceImageBase64, setSourceImageBase64,
    extractedText, setExtractedText,
    extractedPrompt, setExtractedPrompt 
  } = useAppStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} 복사되었습니다!`);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!apiKey) {
      toast.error("우측 상단 설정(⚙️)에서 API 키를 먼저 입력해주세요.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSourceImage(imageUrl);
    setExtractedText(null);
    setExtractedPrompt(null);
    setIsProcessing(true);

    try {
      const base64Image = await fileToBase64(file);
      setSourceImageBase64(base64Image);
      
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        let errMessage = "API 연동 오류";
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch (e) {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      setExtractedText(data.extractedText);
      setExtractedPrompt(data.imagePrompt);
      toast.success("이미지 분석이 완료되었습니다!");
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "이미지 분석에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, setSourceImage, setExtractedText, setExtractedPrompt]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Step 1. 원본 소재 분석</h2>
        <p className="text-muted-foreground">
          위너 소재를 올려주세요. Vision AI가 원본의 <strong className="text-foreground">카피</strong>와 <strong className="text-foreground">시각적 요소</strong>를 분리해냅니다.
        </p>
      </div>

      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">클릭하거나 이미지를 드래그 앤 드롭 하세요</p>
            <p className="text-xs text-muted-foreground">광고 성과가 좋았던 레퍼런스 이미지를 업로드하세요</p>
          </div>
        </div>
      </Card>

      {(sourceImage || isProcessing) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* 좌측: 원본 이미지 */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              원본 소재
            </div>
            <div className="relative rounded-md overflow-hidden bg-muted border">
              {sourceImage && (
                <img src={sourceImage} alt="Source" className="object-contain w-full h-[400px]" />
              )}
            </div>
          </Card>

          {/* 우측: 분석 결과 */}
          <Card className="p-6 flex flex-col justify-center min-h-[400px]">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">Vision AI가 이미지를 꼼꼼히 분석하고 있습니다...</p>
              </div>
            ) : extractedText && extractedPrompt ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 텍스트 추출 결과 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <FileText className="h-4 w-4" />
                      추출된 카피 (텍스트)
                    </div>
                    <Button variant="ghost" size="xs" onClick={() => copyToClipboard(extractedText, "텍스트가")} className="h-7 text-xs">
                      <Copy className="h-3 w-3 mr-1" /> 복사
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {extractedText}
                  </div>
                </div>

                {/* 프롬프트 추출 결과 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Sparkles className="h-4 w-4" />
                      이미지 생성 프롬프트
                    </div>
                    <Button variant="ghost" size="xs" onClick={() => copyToClipboard(extractedPrompt, "프롬프트가")} className="h-7 text-xs">
                      <Copy className="h-3 w-3 mr-1" /> 복사
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border text-sm leading-relaxed text-muted-foreground italic">
                    {extractedPrompt}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 위 프롬프트를 복사하여 ChatGPT나 Midjourney에서 고화질 배경/오브젝트 이미지를 새롭게 생성해보세요!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm">
                분석 결과가 여기에 표시됩니다.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
