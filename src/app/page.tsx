"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stage1Upload } from "@/components/stages/Stage1Upload";
import { Stage2Adapt } from "@/components/stages/Stage2Adapt";
import { Stage3Extend } from "@/components/stages/Stage3Extend";
import { useAppStore } from "@/store/useAppStore";
import { Layers, MonitorSmartphone, Sparkles } from "lucide-react";

export default function Home() {
  const { extractedText, extractedPrompt } = useAppStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="stage1" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8">
          <TabsTrigger value="stage1" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">소스 분석</span>
          </TabsTrigger>
          <TabsTrigger value="stage2" disabled={!extractedText} className="gap-2">
            <MonitorSmartphone className="h-4 w-4" />
            <span className="hidden sm:inline">매체 최적화 (Adapt)</span>
          </TabsTrigger>
          <TabsTrigger value="stage3" disabled={!extractedPrompt} className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">프롬프트 제안 (Extend)</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stage1" className="focus-visible:outline-none focus-visible:ring-0">
          <Stage1Upload />
        </TabsContent>
        <TabsContent value="stage2" className="focus-visible:outline-none focus-visible:ring-0">
          <Stage2Adapt />
        </TabsContent>
        <TabsContent value="stage3" className="focus-visible:outline-none focus-visible:ring-0">
          <Stage3Extend />
        </TabsContent>
      </Tabs>
    </div>
  );
}
