# Hola Talk 개발 가이드

> **CUBARO M&C** · 대표: 이기세
> 라틴아메리카 대상 K-Culture 플랫폼 — 브라질 · 멕시코 · 콜롬비아 · 아르헨티나 · 칠레 · 페루
> Turborepo 모노레포 · Next.js 16 · NestJS · FastAPI · Prisma 6 · next-intl v4

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [모노레포 구조](#2-모노레포-구조)
3. [개발 환경 요구사항](#3-개발-환경-요구사항)
4. [최초 설정](#4-최초-설정)
5. [로컬 인프라 (Docker)](#5-로컬-인프라-docker)
6. [개발 서버 실행](#6-개발-서버-실행)
7. [주요 명령어](#7-주요-명령어)
8. [Prisma 22개 모델 가이드](#8-prisma-22개-모델-가이드)
9. [i18n 가이드 (ko / es / pt-BR)](#9-i18n-가이드)
10. [결제 시스템 (Stripe + 라틴 결제)](#10-결제-시스템)
11. [AI 챗봇 · 페르소나 가이드](#11-ai-챗봇--페르소나-가이드)
12. [디자인 시스템](#12-디자인-시스템)
13. [환경 변수 목록](#13-환경-변수-목록)
14. [12주 MVP 로드맵](#14-12주-mvp-로드맵)
15. [CI/CD 플로우](#15-cicd-플로우)
16. [코드 컨벤션](#16-코드-컨벤션)
17. [트러블슈팅](#17-트러블슈팅)

---

## 1. 프로젝트 개요

### 서비스 소개

**Hola Talk (올라톡)** 은 라틴아메리카의 K-Culture 팬들이 한국 문화를 더 깊이 즐기고, 한국 여행을 준비하며, 한국 상품을 구매할 수 있는 올인원 플랫폼입니다.

| 구분 | 내용 |
|------|------|
| 서비스명 | Hola Talk (올라톡) |
| 회사 | CUBARO M&C |
| 도메인 | holatok.com |
| 타깃 국가 | 브라질 🇧🇷 · 멕시코 🇲🇽 · 콜롬비아 🇨🇴 · 아르헨티나 🇦🇷 · 칠레 🇨🇱 · 페루 🇵🇪 |
| 지원 언어 | 한국어(ko) · 스페인어(es) · 브라질 포르투갈어(pt-BR) |

### 핵심 기능 (MVP)

```
1. 콘텐츠 추천  — YouTube/TikTok K-Culture 영상 + Pinecone RAG 기반 개인화
2. AI 챗봇      — 5개 K-Culture 페르소나 (GPT-4o / Claude)
3. 한국 여행    — 패키지 상품 + 버킷리스트
4. 구매대행     — 한국 상품 + Stripe/PIX/OXXO/MercadoPago 결제
5. 커뮤니티     — 게시글 · 리뷰 (3개 언어)
```

---

## 2. 모노레포 구조

```
holatok/                              # Turborepo 루트
│
├── apps/
│   ├── web/                          # Next.js 16 프론트엔드 (:3000)
│   │   ├── app/[locale]/             # next-intl 언어 라우팅
│   │   ├── components/ui/            # shadcn/ui 컴포넌트
│   │   ├── i18n/                     # 라우팅·요청 설정
│   │   ├── lib/                      # utils, api client
│   │   └── proxy.ts                  # Next.js 16 인터셉터
│   │
│   ├── api/                          # NestJS REST API (:4000)
│   │   ├── src/
│   │   │   ├── auth/                 # NextAuth 연동, JWT
│   │   │   ├── content/              # YouTube/TikTok 수집
│   │   │   ├── chat/                 # AI 챗봇 세션·메시지
│   │   │   ├── travel/               # 여행 패키지·예약
│   │   │   ├── commerce/             # 상품·주문·결제
│   │   │   └── community/            # 게시글·리뷰
│   │   └── Dockerfile
│   │
│   └── ai/                           # FastAPI AI 서비스 (:8000)
│       ├── main.py
│       ├── routers/
│       │   ├── recommend.py          # Pinecone RAG 추천
│       │   ├── chat.py               # GPT-4o / Claude 챗봇
│       │   └── translate.py          # 번역 보조
│       └── Dockerfile
│
├── packages/
│   ├── db/                           # Prisma 6 (22개 모델)
│   ├── i18n/                         # next-intl 설정 + 메시지
│   ├── ui/                           # 공유 컴포넌트 + 디자인 토큰
│   ├── eslint-config/
│   └── typescript-config/
│
├── docker-compose.yml                # 로컬 개발 인프라
├── .env.example
└── turbo.json
```

### 서비스 포트 정리

| 서비스 | 포트 | URL |
|--------|------|-----|
| Next.js (web) | 3000 | http://localhost:3000 |
| NestJS (api) | 4000 | http://localhost:4000 |
| FastAPI (ai) | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Elasticsearch | 9200 | http://localhost:9200 |

---

## 3. 개발 환경 요구사항

| 도구 | 최소 버전 | 설치 |
|------|-----------|------|
| Node.js | 20 LTS | `nvm install 20 && nvm use 20` |
| Python | 3.11+ | `brew install python@3.11` |
| Docker Desktop | 최신 | https://docker.com |
| Git | 2.40+ | `brew install git` |
| GitHub CLI | 최신 | `brew install gh` |

> **주의:** nvm 기본값이 v16일 경우 `nvm default 20` 으로 변경하세요.

---

## 4. 최초 설정

```bash
# 1. 레포 클론
git clone https://github.com/bvcorea/holatok.git
cd holatok

# 2. Node 20 활성화
nvm use 20

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필수 값 입력 (섹션 13 참고)

# 4. 의존성 설치
npm install

# 5. Prisma 클라이언트 생성
npm run db:generate

# 6. 로컬 인프라 기동 (Docker 실행 중이어야 함)
npm run infra:up

# 7. DB 스키마 적용
npm run db:push

# 8. 개발 서버 전체 실행
npm run dev
```

---

## 5. 로컬 인프라 (Docker)

```bash
npm run infra:up      # PostgreSQL + Redis + Elasticsearch 기동
npm run infra:down    # 중지 (데이터 유지)
npm run infra:logs    # 로그 스트리밍

# 데이터 초기화 (주의: 전체 삭제)
docker compose down -v
```

### 연결 정보

| 서비스 | 포트 | 기본 자격증명 |
|--------|------|--------------|
| PostgreSQL 16 | 5432 | holatok / holatok_dev / holatok |
| Redis 7 | 6379 | 인증 없음 (로컬) |
| Elasticsearch 8 | 9200 | 보안 비활성화 (로컬) |

---

## 6. 개발 서버 실행

```bash
# 전체 동시 실행 (권장)
npm run dev

# 개별 실행
npm run dev --filter=web     # Next.js만
npm run dev --filter=api     # NestJS만
npm run dev --filter=ai      # FastAPI만 (Python 가상환경 필요)
```

### Python 가상환경 (FastAPI)

```bash
cd apps/ai
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 접속 URL

- 한국어: http://localhost:3000/ko
- 스페인어: http://localhost:3000/es
- 포르투갈어: http://localhost:3000/pt-BR
- API Swagger: http://localhost:4000/docs
- AI API Docs: http://localhost:8000/docs

---

## 7. 주요 명령어

### 빌드 · 검사

```bash
npm run build          # 전체 빌드
npm run lint           # 전체 lint
npm run check-types    # TypeScript 타입 검사
npm run format         # Prettier 포맷팅
```

### 데이터베이스

```bash
npm run db:generate    # Prisma 클라이언트 재생성 (스키마 변경 후 필수)
npm run db:push        # 스키마 → DB 반영 (개발용)
npm run db:migrate     # 마이그레이션 파일 생성 + 적용 (스테이징/프로덕션)
npm run db:studio      # Prisma Studio GUI (http://localhost:5555)
npm run db:seed        # 초기 데이터 시드
```

### 인프라

```bash
npm run infra:up
npm run infra:down
npm run infra:logs
```

### shadcn/ui 컴포넌트 추가

```bash
cd apps/web
npx shadcn@latest add button card input dialog sheet badge avatar tabs
```

---

## 8. Prisma 22개 모델 가이드

### 도메인별 모델 구조

```
packages/db/prisma/schema.prisma

도메인 1 — Auth (5개)
  User          사용자 (role, language, country, preferredLocale)
  Account       OAuth 계정 연동 (Google/Apple/Facebook)
  Session       로그인 세션 (NextAuth)
  Profile       프로필 (bio, avatar, socialLinks)
  UserInterest  관심 카테고리 (K-Pop, K-Drama, K-Beauty, K-Food, K-Travel)

도메인 2 — Content (4개)
  Content       YouTube/TikTok 콘텐츠 (sourceType, sourceId, locale)
  ContentLike   좋아요
  Bookmark      북마크
  BucketListItem 버킷리스트 ("한국 가서 꼭 해볼 것들")

도메인 3 — Chat (2개)
  ChatSession   AI 챗 세션 (persona: OPPA/UNNI/SAEM/GUIDE/CHEF)
  ChatMessage   챗 메시지 (role: USER/ASSISTANT, tokens)

도메인 4 — Travel (4개)
  Place         장소 (category, lat/lng, googlePlaceId)
  TravelPackage 여행 패키지 (priceKRW, priceUSD, country, days)
  TravelPackageDay 일정 (dayNumber, places[])
  Booking       예약 (status, paymentId, participants)

도메인 5 — Commerce (5개)
  Product       상품 (priceKRW, priceUSD, category, stock)
  Order         주문 (localCurrency, exchangeRate, country)
  OrderItem     주문 항목
  Payment       결제 (provider: STRIPE/PIX/OXXO/MERCADOPAGO, status)
  (Review는 Community 도메인)

도메인 6 — Community (2개)
  Post          게시글 (locale, category, images[])
  Review        리뷰 (targetType: PRODUCT/PACKAGE/PLACE, rating)
```

### 사용 예시

```typescript
import { prisma } from "@repo/db";

// 사용자 + 관심사 조회
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    interests: true,
  },
});

// 국가별 결제 수단 조회
const payments = await prisma.payment.findMany({
  where: { order: { country: "BR" } },
  orderBy: { createdAt: "desc" },
});

// 언어별 콘텐츠 추천 (최신 10개)
const contents = await prisma.content.findMany({
  where: { locale: "pt-BR", published: true },
  orderBy: { viewCount: "desc" },
  take: 10,
});
```

### 스키마 변경 워크플로우

```bash
# 1. packages/db/prisma/schema.prisma 수정
# 2. 개발 환경 반영
npm run db:generate
npm run db:push

# 3. 스테이징/프로덕션 마이그레이션
npm run db:migrate
# 입력: "add_xxx_to_users" 형태로 이름 지정
```

---

## 9. i18n 가이드

### 메시지 파일 구조

```
packages/i18n/messages/
├── ko.json       한국어 (기준 언어, 모든 키 포함)
├── es.json       스페인어 (멕시코·콜롬비아·아르헨티나·칠레·페루)
└── pt-BR.json    브라질 포르투갈어
```

### 번역 키 네이밍 규칙

```json
{
  "common": { ... },
  "nav": { ... },
  "auth": { ... },
  "content": {
    "kpop": "K-Pop",
    "kdrama": "K-Drama",
    "kbeauty": "K-Beauty",
    "kfood": "K-Food",
    "ktravel": "K-Travel"
  },
  "chat": {
    "persona": {
      "oppa": "오빠",
      "unni": "언니",
      "saem": "선생님",
      "guide": "여행 가이드",
      "chef": "쉐프"
    }
  },
  "commerce": {
    "priceKRW": "₩{{price}}",
    "priceBRL": "R$ {{price}}",
    "priceMXN": "${{price}} MXN"
  }
}
```

### 국가별 통화 포맷

```typescript
// apps/web/lib/currency.ts
export const currencyByCountry: Record<string, { code: string; symbol: string }> = {
  BR: { code: "BRL", symbol: "R$" },
  MX: { code: "MXN", symbol: "$" },
  CO: { code: "COP", symbol: "$" },
  AR: { code: "ARS", symbol: "$" },
  CL: { code: "CLP", symbol: "$" },
  PE: { code: "PEN", symbol: "S/" },
};
```

### 서버 컴포넌트

```typescript
import { getTranslations } from "next-intl/server";

export default async function ContentPage() {
  const t = await getTranslations("content");
  return <h2>{t("kpop")}</h2>;
}
```

### 클라이언트 컴포넌트

```typescript
"use client";
import { useTranslations, useLocale } from "next-intl";

export function PriceDisplay({ priceKRW }: { priceKRW: number }) {
  const t = useTranslations("commerce");
  const locale = useLocale();
  // locale → 통화 변환 로직
  return <span>{t("priceKRW", { price: priceKRW.toLocaleString() })}</span>;
}
```

---

## 10. 결제 시스템

### 국가별 결제 수단

| 국가 | 결제 수단 | Provider | 비고 |
|------|-----------|----------|------|
| 브라질 🇧🇷 | PIX | Stripe (BR) | 즉시 이체, 24시간 |
| 멕시코 🇲🇽 | OXXO | Stripe | 편의점 현금 결제 |
| 콜롬비아 🇨🇴 | PSE, 카드 | MercadoPago | 은행 이체 |
| 아르헨티나 🇦🇷 | MercadoPago | MercadoPago | 할부 옵션 |
| 칠레 🇨🇱 | 카드, WebPay | Stripe / MP | |
| 전체 | 국제 카드 | Stripe | Visa/Mastercard |

### 결제 플로우

```
클라이언트 (Next.js)
    │
    ├─ POST /api/orders               → NestJS API
    │   (주문 생성, country 기반 통화 결정)
    │
    ├─ POST /api/payments/intent      → NestJS API
    │   (Stripe PaymentIntent 또는 MercadoPago Preference 생성)
    │
    ├─ 결제 처리                       → Stripe/MercadoPago
    │
    └─ POST /api/webhooks/stripe      → NestJS API
        POST /api/webhooks/mercadopago
        (결제 완료 → Order/Payment 상태 업데이트)
```

### Stripe 설정 (apps/api)

```typescript
// apps/api/src/commerce/payment.service.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PIX (브라질)
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(priceBRL * 100),
  currency: "brl",
  payment_method_types: ["pix"],
  payment_method_data: { type: "pix" },
});

// OXXO (멕시코)
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(priceMXN * 100),
  currency: "mxn",
  payment_method_types: ["oxxo"],
});
```

### 환율 처리

```typescript
// Order 생성 시 환율 스냅샷 저장 (변동 방지)
const order = await prisma.order.create({
  data: {
    totalKRW: product.priceKRW * quantity,
    localCurrency: "BRL",
    localAmount: convertedAmount,
    exchangeRate: currentRate,  // 주문 시점 환율 고정
    country: "BR",
  },
});
```

---

## 11. AI 챗봇 · 페르소나 가이드

### 5개 페르소나

| 페르소나 | 설명 | 전문 분야 | 말투 |
|----------|------|-----------|------|
| OPPA (오빠) | 친근한 한국 오빠 | K-Pop, 트렌드 | 캐주얼, 이모지 많음 |
| UNNI (언니) | 세련된 한국 언니 | K-Beauty, K-Drama | 따뜻함, 공감 |
| SAEM (선생님) | K-Culture 선생님 | 한국어, 문화 | 교육적, 명확함 |
| GUIDE (가이드) | 한국 여행 전문가 | 여행, 맛집, 장소 | 친절, 정보 중심 |
| CHEF (쉐프) | K-Food 요리사 | 한국 음식, 레시피 | 열정적, 식재료 설명 |

### FastAPI 엔드포인트

```python
# apps/ai/routers/chat.py
from fastapi import APIRouter
from openai import AsyncOpenAI
import anthropic

router = APIRouter(prefix="/chat")

PERSONA_PROMPTS = {
    "OPPA": "You are a friendly Korean oppa...",
    "UNNI": "You are a stylish Korean unni...",
    "SAEM": "You are a K-Culture teacher...",
    "GUIDE": "You are a Korean travel expert...",
    "CHEF": "You are a passionate Korean chef...",
}

@router.post("/message")
async def chat_message(session_id: str, message: str, persona: str, locale: str):
    system_prompt = PERSONA_PROMPTS[persona]
    # GPT-4o 또는 Claude 선택 (비용/품질 trade-off)
    ...
```

### Pinecone RAG (콘텐츠 추천)

```python
# apps/ai/routers/recommend.py
import pinecone
from openai import AsyncOpenAI

@router.post("/recommend")
async def recommend_content(user_id: str, locale: str, interests: list[str]):
    # 1. 사용자 임베딩 생성
    embedding = await openai.embeddings.create(
        model="text-embedding-3-small",
        input=f"K-Culture fan interested in: {', '.join(interests)}"
    )

    # 2. Pinecone 유사도 검색
    results = index.query(
        vector=embedding.data[0].embedding,
        filter={"locale": locale, "published": True},
        top_k=20
    )

    # 3. Content ID 반환 → NestJS API에서 DB 조회
    return {"content_ids": [r.id for r in results.matches]}
```

---

## 12. 디자인 시스템

### 브랜드 컬러

| 이름 | HEX | Tailwind 클래스 | 사용처 |
|------|-----|-----------------|--------|
| Hola Coral | `#FF6B6B` | `text-coral` `bg-coral` | 주요 CTA, 강조 |
| Seoul Blue | `#4A90D9` | `text-seoul-blue` | 링크, 정보 |
| Navy | `#1A1A2E` | `text-navy` `bg-navy` | 헤더, 배경 |

### K-Culture 카테고리 컬러

| 카테고리 | HEX | Tailwind 클래스 | 비고 |
|----------|-----|-----------------|------|
| K-Pop | `#FF69B4` | `text-kpop` `bg-kpop` | 핑크 (팬덤 에너지) |
| K-Drama | `#4DB6AC` | `text-kdrama` `bg-kdrama` | 틸 (감성, 스토리) |
| K-Beauty | `#B39DDB` | `text-kbeauty` `bg-kbeauty` | 라벤더 (우아함) |
| K-Food | `#FFB74D` | `text-kfood` `bg-kfood` | 주황 (식욕, 따뜻함) |

### globals.css 토큰 추가 방법

```css
/* apps/web/app/globals.css */
:root {
  /* Brand */
  --coral: #ff6b6b;
  --seoul-blue: #4a90d9;
  --navy: #1a1a2e;
  /* K-Culture Categories */
  --kpop: #ff69b4;
  --kdrama: #4db6ac;
  --kbeauty: #b39ddb;
  --kfood: #ffb74d;
}

@theme inline {
  --color-coral: var(--coral);
  --color-seoul-blue: var(--seoul-blue);
  --color-navy: var(--navy);
  --color-kpop: var(--kpop);
  --color-kdrama: var(--kdrama);
  --color-kbeauty: var(--kbeauty);
  --color-kfood: var(--kfood);
}
```

### 카테고리 배지 컴포넌트

```tsx
// apps/web/components/CategoryBadge.tsx
const categoryColors = {
  kpop:    "bg-kpop/20 text-kpop border-kpop/30",
  kdrama:  "bg-kdrama/20 text-kdrama border-kdrama/30",
  kbeauty: "bg-kbeauty/20 text-kbeauty border-kbeauty/30",
  kfood:   "bg-kfood/20 text-kfood border-kfood/30",
} as const;

export function CategoryBadge({ category }: { category: keyof typeof categoryColors }) {
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs border", categoryColors[category])}>
      {category.replace("k", "K-").toUpperCase()}
    </span>
  );
}
```

---

## 13. 환경 변수 목록

`.env.example`을 복사해 `.env`로 사용합니다.

```bash
# ─────────────────────────────────
# 데이터베이스
# ─────────────────────────────────
DATABASE_URL="postgresql://holatok:holatok_dev@localhost:5432/holatok"

# ─────────────────────────────────
# Redis (로컬: Redis 7 Docker)
# (프로덕션: Upstash REDIS_URL 사용)
# ─────────────────────────────────
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# ─────────────────────────────────
# 인증 (NextAuth v5)
# ─────────────────────────────────
NEXTAUTH_SECRET="openssl rand -base64 32 로 생성"
NEXTAUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_APPLE_ID=""
AUTH_APPLE_SECRET=""
AUTH_FACEBOOK_ID=""
AUTH_FACEBOOK_SECRET=""

# ─────────────────────────────────
# AI
# ─────────────────────────────────
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
PINECONE_API_KEY=""
PINECONE_INDEX=""

# ─────────────────────────────────
# 결제
# ─────────────────────────────────
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_WEBHOOK_SECRET=""

# ─────────────────────────────────
# 콘텐츠 수집
# ─────────────────────────────────
YOUTUBE_API_KEY=""
YOUTUBE_CHANNEL_IDS=""  # 쉼표 구분 채널 ID

# ─────────────────────────────────
# 스토리지
# ─────────────────────────────────
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
S3_BUCKET_MEDIA="holatok-media-prod"
CLOUDFRONT_DOMAIN="media.holatok.com"

# ─────────────────────────────────
# API 서비스 URL
# ─────────────────────────────────
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_AI_URL="http://localhost:8000"
```

---

## 14. 12주 MVP 로드맵

### Phase 0 — 프로젝트 셋업 ✅ 완료

- [x] Turborepo 모노레포 초기화
- [x] Next.js 16 + Tailwind v4 + Shadcn/ui
- [x] Prisma 6 스키마 (22개 모델)
- [x] next-intl v4 (ko/es/pt-BR)
- [x] Docker Compose (PostgreSQL + Redis + Elasticsearch)
- [x] GitHub 레포 + CI 파이프라인

### Phase 1 — 인증 (Week 1-2)

- [ ] NextAuth v5 설치 및 설정
- [ ] Google OAuth 연동
- [ ] Apple OAuth 연동
- [ ] Facebook OAuth 연동
- [ ] User 프로필 설정 화면 (언어, 국가, 관심사)
- [ ] 로그인/회원가입 UI (3개 언어)
- [ ] JWT 세션 + Redis 저장

```bash
# NextAuth v5 설치
cd apps/web
npm install next-auth@beta
```

### Phase 2 — 콘텐츠 추천 (Week 3-4)

- [ ] YouTube Data API v3 연동 (K-Culture 채널 수집)
- [ ] TikTok Embed 연동
- [ ] Pinecone 벡터 DB 설정 + 임베딩 파이프라인
- [ ] FastAPI 추천 엔드포인트 구현
- [ ] 홈 피드 UI (카테고리 필터, 카드 레이아웃)
- [ ] 좋아요 / 북마크 / 버킷리스트 기능

### Phase 3 — AI 챗봇 + 여행 (Week 5-7)

- [ ] FastAPI GPT-4o / Claude 챗봇 구현
- [ ] 5개 페르소나 프롬프트 작성 (3개 언어)
- [ ] 챗 UI (스트리밍 응답)
- [ ] ChatSession / ChatMessage DB 연동
- [ ] 여행 패키지 CRUD (Admin)
- [ ] 여행 패키지 UI (국가 필터, 일정 보기)
- [ ] 버킷리스트 → 패키지 연결

### Phase 4 — 커머스 + 결제 (Week 8-10)

- [ ] 상품 등록/관리 (Admin, priceKRW + priceUSD)
- [ ] 국가별 환율 API 연동
- [ ] Stripe 결제 연동 (카드, PIX, OXXO)
- [ ] MercadoPago 연동 (아르헨티나, 콜롬비아)
- [ ] 주문/결제 UI
- [ ] 웹훅 처리 (결제 완료 → 상태 업데이트)
- [ ] 구매 내역 / 배송 상태 UI
- [ ] 커뮤니티 (게시글 / 리뷰) CRUD

### Phase 5 — QA + 배포 + 런칭 (Week 11-12)

- [ ] E2E 테스트 (Playwright)
- [ ] 성능 테스트 (Lighthouse ≥ 90)
- [ ] AWS 인프라 구성 (섹션 참고: AWS_ARCHITECTURE.md)
- [ ] 환경 변수 AWS Secrets Manager 이관
- [ ] GitHub Actions → ECR → ECS 배포 파이프라인
- [ ] holatok.com 도메인 연결
- [ ] 모니터링 대시보드 설정
- [ ] 소프트 런칭 (브라질 베타)

---

## 15. CI/CD 플로우

### GitHub Actions 파이프라인

```
push to main
    │
    ├─ 1. lint + type-check + build (병렬)
    ├─ 2. Docker 이미지 빌드
    │       apps/web  → ECR holatok-web
    │       apps/api  → ECR holatok-api
    │       apps/ai   → ECR holatok-ai
    ├─ 3. ECR push
    ├─ 4. prisma migrate deploy
    └─ 5. ECS 서비스 업데이트 (롤링 배포)
```

### workflow 파일 위치

```
.github/workflows/
├── ci.yml        # PR: lint + type-check + build
└── deploy.yml    # main push: ECR 빌드 + ECS 배포 (Phase 5에서 추가)
```

### GitHub Secrets 설정

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
ECR_REGISTRY
DATABASE_URL_PROD
TURBO_TOKEN
TURBO_TEAM
```

---

## 16. 코드 컨벤션

### 파일 네이밍

| 종류 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `ContentCard.tsx` |
| 훅 | camelCase + use | `useChat.ts` |
| 유틸리티 | camelCase | `formatCurrency.ts` |
| NestJS 모듈 | kebab-case | `travel.module.ts` |
| FastAPI 라우터 | snake_case | `recommend.py` |
| 번역 키 | camelCase | `"bucketListItem"` |
| DB 마이그레이션 | snake_case | `add_country_to_users` |

### Import 순서 (TypeScript)

```typescript
// 1. Node.js 내장
// 2. 외부 라이브러리 (next, react, prisma ...)
// 3. 모노레포 패키지 (@repo/db, @repo/i18n, @repo/ui)
// 4. 내부 모듈 절대경로 (@/lib, @/components)
// 5. 내부 모듈 상대경로 (./ComponentName)
```

### 커밋 메시지

```
feat(auth): Google OAuth 연동
feat(content): YouTube 수집 크론잡 추가
feat(chat): OPPA 페르소나 프롬프트 작성
fix(payment): PIX 웹훅 중복 처리 방지
chore(db): UserInterest 모델 인덱스 추가
docs: AWS_ARCHITECTURE 업데이트
```

---

## 17. 트러블슈팅

### Node.js 버전 오류

```bash
nvm use 20 && node --version  # v20.x.x 확인
```

### Prisma 클라이언트 오류 (P1001, P2021)

```bash
npm run infra:up     # DB가 실행 중인지 확인
npm run db:generate  # 클라이언트 재생성
npm run db:push      # 스키마 재적용
```

### Docker 포트 충돌

```bash
lsof -i :5432 | grep LISTEN   # PostgreSQL 점유 확인
lsof -i :6379 | grep LISTEN   # Redis 점유 확인
```

### next-intl 메시지 누락 (MISSING_MESSAGE)

```bash
# ko.json에 키가 있는지, es.json/pt-BR.json에도 동일하게 있는지 확인
# packages/i18n/src/messages.ts 재확인
npm run db:generate  # 타입 재생성
```

### Stripe Webhook 로컬 테스트

```bash
# Stripe CLI 필요
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

### MercadoPago Sandbox

```bash
# .env에 테스트 토큰 사용
MERCADOPAGO_ACCESS_TOKEN="TEST-xxxx"
# 테스트 카드: 5031 7557 3453 0604 / 11/25 / 123
```

### Turborepo 빌드 캐시 문제

```bash
npx turbo clean && npm run build
```
