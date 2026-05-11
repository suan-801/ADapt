import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  
  sourceImage: string | null;
  setSourceImage: (url: string | null) => void;
  
  sourceImageBase64: string | null;
  setSourceImageBase64: (base64: string | null) => void;
  
  extractedText: string | null;
  setExtractedText: (text: string | null) => void;
  
  extractedPrompt: string | null;
  setExtractedPrompt: (prompt: string | null) => void;
  
  targetMedia: 'daangn' | 'kakao' | 'gfa' | 'toss' | null;
  setTargetMedia: (media: 'daangn' | 'kakao' | 'gfa' | 'toss' | null) => void;
  
  generatedTexts: any[];
  setGeneratedTexts: (texts: any[]) => void;
  
  extendedPrompts: { type: string; prompt: string }[];
  setExtendedPrompts: (prompts: { type: string; prompt: string }[]) => void;
  
  keepCharacter: boolean;
  setKeepCharacter: (keep: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      
      sourceImage: null,
      setSourceImage: (url) => set({ sourceImage: url }),
      
      sourceImageBase64: null,
      setSourceImageBase64: (base64) => set({ sourceImageBase64: base64 }),
      
      extractedText: null,
      setExtractedText: (text) => set({ extractedText: text }),
      
      extractedPrompt: null,
      setExtractedPrompt: (prompt) => set({ extractedPrompt: prompt }),
      
      targetMedia: null,
      setTargetMedia: (media) => set({ targetMedia: media }),
      
      generatedTexts: [],
      setGeneratedTexts: (texts) => set({ generatedTexts: texts }),
      
      extendedPrompts: [],
      setExtendedPrompts: (prompts) => set({ extendedPrompts: prompts }),

      keepCharacter: true,
      setKeepCharacter: (keep) => set({ keepCharacter: keep }),
    }),
    {
      name: 'adapt-storage', // API 키 등을 로컬 스토리지에 저장
      partialize: (state) => ({ apiKey: state.apiKey }), // apiKey만 영구 저장
    }
  )
);
