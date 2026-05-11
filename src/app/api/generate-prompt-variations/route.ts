import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, Part } from '@google/generative-ai'

type PromptVariation = {
  type: string
  prompt: string
}

function parseAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization')
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null
}

function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

async function generateVariations(
  basePrompt: string,
  keepCharacter: boolean,
  apiKey: string,
  image?: string // 레퍼런스 이미지 추가
): Promise<PromptVariation[]> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

  const characterConstraint = keepCharacter
    ? `5. 인물/캐릭터 유지: 첨부된 이미지와 기본 프롬프트에 등장하는 인물 또는 캐릭터의 외모(얼굴형, 헤어스타일, 피부톤, 의상 스타일, 체형 등)를 모든 변형에서 동일하게 유지할 것. 배경·조명·분위기만 변주하고 인물 자체는 변경 금지.`
    : `5. 인물/모델: 각 변형에서 타겟에 맞는 새로운 인물·모델로 자유롭게 변주 가능.`

  const prompt = `당신은 Midjourney와 Stable Diffusion에 최적화된 이미지 생성 프롬프트 전문가입니다.
아래 기본 프롬프트와 첨부된 이미지를 바탕으로, 타겟 오디언스와 분위기가 서로 다른 3가지 변형 프롬프트를 만들어주세요.

[필수 제약조건]
1. 프롬프트 본문은 무조건 영문으로 작성
2. 구도: 반드시 핵심 피사체를 중앙에 배치(centered composition)하고, 상하좌우에 충분한 여백(wide negative space, breathing room)을 두어 나중에 다양한 비율로 크롭(Crop)하기 용이하게 작성할 것
3. 1500x1500 (1:1 비율) 설정 키워드 포함
4. 특정 기업 로고나 정당, 실존 브랜드 명칭 절대 배제
5. 이미지 내에 어떠한 텍스트나 글자도 포함되지 않도록(no text, textless) 명시할 것
${characterConstraint}

기본 프롬프트: ${basePrompt}

마크다운 코드블록이나 다른 텍스트 없이 아래 JSON만 출력해:
{
  "prompts": [
    { "type": "타겟/스타일명 (반드시 한국어 2~6자)", "prompt": "영문 프롬프트 (중앙 배치 및 여백 강조 키워드 포함)" },
    { "type": "...", "prompt": "..." },
    { "type": "..." , "prompt": "..." }
  ]
}`

  // 이미지 데이터 처리 (있는 경우에만 전달)
  const content: Part[] = [{ text: prompt }];
  if (image) {
    const isDataUrl = image.startsWith('data:');
    const data = isDataUrl ? image.split(',')[1] : image;
    const mimeType = isDataUrl ? (image.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg') : 'image/jpeg';
    content.push({ inlineData: { data, mimeType } });
  }

  const result = await model.generateContent(content)
  const parsed = parseJSON<{ prompts: PromptVariation[] }>(result.response.text())
  return parsed.prompts
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
    const { basePrompt, keepCharacter = false, image } = body as {
      basePrompt: string
      keepCharacter?: boolean
      image?: string
    }

    if (!basePrompt) {
      return NextResponse.json(
        { error: 'basePrompt 값이 필요합니다.' },
        { status: 400 }
      )
    }

    const prompts = await generateVariations(basePrompt, keepCharacter, apiKey, image)

    return NextResponse.json({
      prompts,
      generatedAt: new Date().toISOString(),
      engine: 'gemini-flash-latest',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `프롬프트 변형 생성 중 오류가 발생했습니다: ${message}` },
      { status: 500 }
    )
  }
}
