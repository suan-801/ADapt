🚀 PRD: AD-apt (성과 기반 매체 적응형 소재 변환 플랫폼)
1. 프로젝트 개요
이름: AD-apt (애드-앱트)

한 줄 설명: 메타(Meta)의 위너 소재를 분석하여 당근, 카카오, GFA 등 다양한 매체의 문법에 맞춰 소재를 '적응(Adapt)'시키고 최적화된 베리에이션을 생성하는 도구.

유형: AI 기반 매체 최적화 소재 제작 플랫폼

난이도: 중급 (Local AI Image Processing & LLM Prompting)

2. 사용자 시나리오
대상: 매체 확장을 고민하는 퍼포먼스 마케터, 소재 제작 효율을 높이고 싶은 콘텐츠 에디터.

상황: 메타 광고에서 CTR 3% 이상의 대박 소재가 터졌으나, 당근이나 카카오 등 타 매체로 확장할 때 매체 특성에 맞는 재기획이 막막한 상황.

가치: 기존 위너 소재의 소구점은 유지하되, 매체별 유저의 심리에 맞게 배경과 문안을 즉시 변주하여 제작 리소스를 80% 이상 절감.

3. 핵심 기능 목록 (AD-apt Core)
[필수 기능]
Winner Source Direct Upload: 성과가 검증된 원본 소재를 즉시 업로드.

AD-apt Object Extractor: 로컬 AI를 이용해 원본 이미지에서 텍스트와 배경을 제거하고 핵심 오브젝트(제품/모델)만 분리.

Cross-Channel Adaptation:

당근 모드: 지역 밀착형 키워드와 일상적인 배경 합성 제안.

카카오/GFA 모드: 고가시성 레이아웃과 매체별 규격 자동 적용.

Learning Guide System: 기본 제공 가이드를 바탕으로 하되, 사용자의 수정 사항을 로컬 벡터 DB에 저장하여 개인화된 AI 코칭 제공.

Nano Banana Prompt Engine: 분리된 오브젝트와 매체별 가이드를 결합하여 이미지 생성 AI용 고해상도 프롬프트 생성.

[선택 및 고도화 기능]
Smart Policy Checker: 매체별 광고 심의 가이드(텍스트 비중 등) 위반 여부 실시간 체크.

One-Click Batch Export: 리사이징 및 변주된 모든 소재를 ZIP 파일로 일괄 다운로드.

4. 기술 스택
Frontend: Next.js 15, Tailwind CSS, shadcn/ui

Image Engine: @imgly/background-removal (WASM 기반 로컬 처리), Fabric.js

AI Engine: GPT-4o mini (문안 변환), RxDB (사용자 스타일 로컬 학습용 벡터 저장소)

Deployment: Vercel

5. 화면 구성 (UX Design)
Stage 1. Source Input: 위너 소재 업로드 및 오브젝트 자동 분리 확인.

Stage 2. Adapt Option: 전환하고자 하는 타겟 매체 선택 (당근, 카카오 등).

Stage 3. Studio: 좌측(원본) / 중앙(AI 변주 프리뷰) / 우측(문안 및 프롬프트 편집기).

Stage 4. Export: 매체별 규격 검토 후 일괄 저장.

6. 제약 사항 및 가이드
Privacy First: 사용자의 성과 데이터와 이미지는 외부 서버가 아닌 브라우저 내부에만 저장.

Cost Efficiency: OpenAI API 캐싱을 통해 운영 비용 최소화.

[슬라이드 업데이트 내용]
Slide 1: Title

Project Name: AD-apt

Sub-title: Adaptive Ad Variation Platform

Concept: "Don't just copy, Adapt."

Slide 2: The Problem & Solution

Problem: 매체별로 다른 유저 문법, 반복되는 단순 리사이징 작업, 기획 리소스 부족.

Solution: AD-apt를 통한 위너 소재의 유전자(Core Hook) 유지 + 매체 최적화 자동 변주.

Slide 3: Core Workflow

Input (Meta Winner) → Process (AI Extraction & Analysis) → Output (Multi-Channel Variations).

Slide 4: Key Differentiator

Local-First: 보안 걱정 없는 로컬 이미지 처리.

Self-Learning: 사용자의 피드백을 기억하여 점점 더 똑똑해지는 매체별 가이드.