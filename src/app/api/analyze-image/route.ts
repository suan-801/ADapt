import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type AnalysisResult = {
  extractedText: string
  imagePrompt: string
}

function parseAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization')
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null
}

// Gemini가 마크다운 코드블록으로 감싸서 반환할 경우를 대비한 파서
function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

// data URL(data:image/jpeg;base64,...)과 순수 base64 문자열 모두 처리
function extractBase64(image: string): { data: string; mimeType: string } {
  if (image.startsWith('data:')) {
    const [header, data] = image.split(',')
    const mimeType = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
    return { data, mimeType }
  }
  return { data: image, mimeType: 'image/jpeg' }
}

async function analyzeImage(image: string, apiKey: string): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

  const { data, mimeType } = extractBase64(image)

  const prompt = `이 광고 이미지를 분석해서 아래 JSON 형식으로만 응답해줘.
마크다운 코드블록이나 다른 텍스트 없이 JSON만 출력해:
{
  "extractedText": "이미지에서 읽히는 광고 문구 전체 (한국어 원문 그대로, 없으면 빈 문자열)",
  "imagePrompt": "이미지의 핵심 오브젝트·구도·분위기·조명을 구체적으로 묘사한 Midjourney/Stable Diffusion용 고품질 영문 프롬프트 (photorealistic, 4k 등 품질 키워드 포함). [필수 제약조건]: 1. 1500x1500 (1:1 비율) 설정. 2. 특정 기업 로고나 정당, 실존 브랜드 명칭 절대 배제. 3. 이미지 내에 어떠한 텍스트나 글자도 포함되지 않도록(no text, textless) 명시할 것."
}`

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { data, mimeType } },
  ])

  const candidate = result.response.candidates?.[0]
  if (!candidate || candidate.finishReason === 'SAFETY') {
    throw new Error('Gemini가 이미지 분석을 거부했습니다 (Safety filter). 다른 이미지를 시도해주세요.')
  }

  const raw = result.response.text()
  console.log('[analyze-image] Gemini raw response:', raw)
  return parseJSON<AnalysisResult>(raw)
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = parseAuthHeader(request)
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다. Authorization: Bearer <KEY>' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { image } = body as { image: string }

    if (!image) {
      return NextResponse.json(
        { error: 'image 값이 필요합니다. (Base64 인코딩된 이미지 문자열)' },
        { status: 400 }
      )
    }

    const result = await analyzeImage(image, apiKey)

    return NextResponse.json({
      ...result,
      analyzedAt: new Date().toISOString(),
      engine: 'gemini-flash-latest',
    })
  } catch (error: unknown) {
    console.error('[analyze-image] Error:', error)
    
    let availableModels = "";
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes('404 Not Found') || errorMsg.includes('is not found')) {
      try {
        const apiKey = parseAuthHeader(request);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json() as { models?: Array<{ name: string; supportedGenerationMethods: string[] }> };
        
        if (data && data.models) {
          const modelNames = data.models
            .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => m.name.replace('models/', ''))
            .join(', ');
          availableModels = `\n[사용 가능한 모델 리스트]: ${modelNames}`;
        }
      } catch (e) {
        console.error('Failed to list models', e);
      }
    }

    return NextResponse.json(
      { error: `API 오류: ${errorMsg} ${availableModels}` },
      { status: 500 }
    )
  }
}
