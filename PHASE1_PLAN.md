# Phase 1 — 인증 & 인프라 구현 플랜

> 목표: NextAuth v5 + Google OAuth + Credentials 로그인 + Prisma 22모델 + 스페인어 UI
> 기간: Week 1-2 | 타깃: 라틴아메리카 (es 기본 로케일)

---

## Step 1 — PHASE1_PLAN.md 작성 ✅
이 파일.

## Step 2 — 의존성 설치
- next-auth@beta (NextAuth v5)
- @auth/prisma-adapter
- bcryptjs + @types/bcryptjs
- zod (폼 유효성 검사)
- react-hook-form + @hookform/resolvers
- @radix-ui/react-slot + @radix-ui/react-label

## Step 3 — i18n 기본 로케일 es로 변경
- packages/i18n/src/routing.ts: defaultLocale "ko" → "es"
- apps/web/app/page.tsx: redirect /ko → /es

## Step 4 — Prisma 스키마 22모델 전체 교체
### Auth (6): User, Account, Session, VerificationToken, Profile, UserInterest
### Content (4): Content, ContentLike, Bookmark, BucketListItem
### Chat (2): ChatSession, ChatMessage
### Travel (4): Place, TravelPackage, TravelPackageDay, Booking
### Commerce (4): Product, Order, OrderItem, Payment
### Community (2): Post, Review
### Enums: Role, Locale, Country, Language, KCategory, Persona,
###         MessageRole, ContentSource, PlaceCategory, BookingStatus,
###         ProductCategory, OrderStatus, PaymentProvider, PaymentStatus, ReviewTarget

## Step 5 — DB 재생성
- npm run db:generate
- npm run db:push

## Step 6 — i18n 메시지 전체 업데이트 (es/pt-BR/ko)
- auth, nav, home, content, chat, travel, commerce, community 네임스페이스
- 모든 UI 텍스트 스페인어 우선

## Step 7 — 디자인 토큰 + globals.css 업데이트
- Coral #FF6B6B, Seoul Blue #4A90D9, Navy #1A1A2E
- K-Culture: K-Pop #FF69B4, K-Drama #4DB6AC, K-Beauty #B39DDB, K-Food #FFB74D
- shadcn 변수 완전 통합

## Step 8 — auth.config.ts (Edge 호환 설정)
- 인증 필요 경로 정의
- 로그인 페이지 경로: /es/auth/login

## Step 9 — auth.ts (NextAuth v5 전체 설정)
- Google OAuth provider
- Credentials provider (bcryptjs 해시 검증)
- PrismaAdapter(@repo/db)
- JWT 세션 전략
- role, id 토큰 확장

## Step 10 — auth API route handler
- apps/web/app/api/auth/[...nextauth]/route.ts
- GET, POST export

## Step 11 — proxy.ts 업데이트
- next-intl middleware + NextAuth 합성

## Step 12 — AuthProvider (SessionProvider 래퍼)
- apps/web/providers/auth-provider.tsx
- [locale]/layout.tsx에 주입

## Step 13 — Server Actions (auth.ts)
- apps/web/actions/auth.ts
- registerUser(), loginWithCredentials()

## Step 14 — UI 컴포넌트
- apps/web/components/ui/button.tsx (shadcn)
- apps/web/components/ui/input.tsx
- apps/web/components/ui/label.tsx
- apps/web/components/ui/card.tsx
- apps/web/components/ui/badge.tsx
- apps/web/components/layout/Navbar.tsx

## Step 15 — 인증 페이지
- apps/web/app/[locale]/auth/login/page.tsx
- apps/web/app/[locale]/auth/register/page.tsx
- apps/web/components/auth/LoginForm.tsx
- apps/web/components/auth/RegisterForm.tsx
- apps/web/components/auth/GoogleButton.tsx

## Step 16 — 홈 페이지 + 최종 빌드 검증
- K-Culture 카테고리 카드 UI (스페인어)
- npm run build → 성공 확인
- 체크리스트 검증
