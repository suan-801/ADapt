import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type AdCopy = {
  headline: string
  body?: string
  cta: string
}

const PLATFORM_LABELS: Record<string, string> = {
  daangn: '당근마켓',
  kakao: '카카오 비즈보드',
  gfa: '네이버 GFA',
  toss: 'TOSS (1:1 이미지형)',
}

const PLATFORM_GUIDES: Record<string, string> = {
  daangn: '지역 밀착형, 이웃 간 따뜻하고 친근한 말투, 가격·거리·동네 키워드 강조, 짧고 자연스럽게 (글자수 제한 없음)',
  kakao: '고가시성, 임팩트 있는 헤드라인(최대 15자 이내), 클릭 유도가 강한 CTA, 혜택과 수치를 직접 제시',
  gfa: '검색 의도 반영, 정보성 문구, 신뢰감 있는 어조, 구체적 수치와 혜택 명시 (헤드라인 20자 이내, 본문 40자 이내)',
  toss: '심플하고 직관적인 카피, 유저의 행동을 즉각적으로 유도하는 혜택 중심, 토스 특유의 간결한 톤앤매너 (주요문구 28자, 보조문구 18자 이내)',
}

// 매체별 실제 광고 소재 글자수 스펙 (body가 null이면 해당 매체는 서브 문구 없음)
const PLATFORM_SPECS: Record<string, { headline: string; body: string | null }> = {
  daangn: { headline: '30자 이내 광고제목', body: null },
  kakao:  { headline: '14자 이내 메인카피', body: '17자 이내 서브카피' },
  gfa:    { headline: '12자 이내 메인문구', body: '15자 이내 서브문구' },
  toss:   { headline: '28자 이내 주요 문구 (필요 시 줄바꿈 1회 포함)', body: '18자 이내 보조 문구' },
}

function parseAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization')
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null
}

function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

async function generateCopy(
  platform: string,
  sourceText: string,
  customGuide: string,
  apiKey: string
): Promise<AdCopy[]> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

  const platformLabel = PLATFORM_LABELS[platform] ?? platform
  const platformGuide = PLATFORM_GUIDES[platform] ?? '매체 특성에 맞게 작성'
  const spec = PLATFORM_SPECS[platform] ?? { headline: '15자 이내 핵심 헤드라인', body: '40자 이내 본문 문구' }

  const prompt = `당신은 퍼포먼스 마케팅 전문 카피라이터입니다.
아래 조건을 모두 반영하여 광고 문안 5개를 생성해주세요.

매체: ${platformLabel}
매체 특성: ${platformGuide}
원본 소재 텍스트: ${sourceText || '(미제공)'}
${customGuide ? `추가 가이드라인 (반드시 최우선 반영): ${customGuide}` : ''}

마크다운 코드블록이나 다른 텍스트 없이 아래 JSON만 출력해:
{
  "copies": [
    { "headline": "${spec.headline}", "body": "${spec.body}", "cta": "행동 유도 버튼 텍스트" },
    { "headline": "...", "body": "...", "cta": "..." },
    { "headline": "...", "body": "...", "cta": "..." },
    { "headline": "...", "body": "...", "cta": "..." },
    { "headline": "...", "body": "...", "cta": "..." }
  ]
}`

  const result = await model.generateContent(prompt)
  const parsed = parseJSON<{ copies: AdCopy[] }>(result.response.text())
  return parsed.copies
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
    const { platform, sourceText, customGuide } = body as {
      platform: string
      sourceText?: string
      customGuide?: string
    }

    if (!platform) {
      return NextResponse.json(
        { error: 'platform 값이 필요합니다. (daangn | kakao | gfa | toss)' },
        { status: 400 }
      )
    }

    const copies = await generateCopy(platform, sourceText ?? '', customGuide ?? '', apiKey)

    return NextResponse.json({
      platform,
      copies,
      generatedAt: new Date().toISOString(),
      engine: 'gemini-flash-latest',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json(
      { error: `문안 생성 중 오류가 발생했습니다: ${message}` },
      { status: 500 }
    )
  }
}
