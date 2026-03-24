# Hola Talk — AWS 아키텍처 설계

> **CUBARO M&C** · 대표: 이기세
> 목표 비용: 월 $100 ~ $300 (스타트업 최소 구성)
> 리전: **us-east-1 (버지니아)** — 라틴아메리카 레이턴시 최적
> 도메인: holatok.com · api.holatok.com · media.holatok.com

---

## 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [전체 구성도](#2-전체-구성도)
3. [서비스별 구성](#3-서비스별-구성)
4. [네트워크 (VPC)](#4-네트워크-vpc)
5. [데이터베이스 (RDS)](#5-데이터베이스-rds)
6. [캐시 (Upstash Redis)](#6-캐시-upstash-redis)
7. [스토리지 + CDN](#7-스토리지--cdn)
8. [CI/CD 파이프라인](#8-cicd-파이프라인)
9. [도메인 + 인증서](#9-도메인--인증서)
10. [환경 변수 관리](#10-환경-변수-관리)
11. [모니터링 + 알람](#11-모니터링--알람)
12. [월 비용 상세](#12-월-비용-상세)
13. [배포 순서 (Phase 5)](#13-배포-순서-phase-5)
14. [향후 확장 계획](#14-향후-확장-계획)

---

## 1. 아키텍처 개요

### 설계 원칙

- **최소 비용 우선** — 초기 월 $100~$300 이내, 트래픽 증가 시 단계적 확장
- **서버리스/관리형 서비스** — 운영 부담 최소화 (Amplify, App Runner → ECS Fargate)
- **라틴아메리카 레이턴시** — us-east-1은 브라질/멕시코와 거리상 가장 가까운 AWS 리전
- **단순한 배포** — GitHub Actions 한 번에 전체 서비스 배포

### 서비스 매핑

| 앱 | AWS 서비스 | 포트 | 도메인 |
|----|-----------|------|--------|
| Next.js 프론트 | AWS Amplify | 443 | holatok.com |
| NestJS API | ECS Fargate + ALB | 4000 | api.holatok.com |
| FastAPI AI | ECS Fargate + ALB | 8000 | api.holatok.com/ai |
| 미디어 | S3 + CloudFront | 443 | media.holatok.com |
| DB | RDS PostgreSQL 16 | 5432 | (내부 전용) |
| 캐시 | Upstash Redis | 6379 | (외부 서비스) |

---

## 2. 전체 구성도

```
                        인터넷 (브라질·멕시코·콜롬비아 등)
                                    │
                     ┌──────────────┴──────────────┐
                     │          Route 53            │
                     │  holatok.com                │
                     │  api.holatok.com            │
                     │  media.holatok.com          │
                     └──────┬──────────┬───────────┘
                            │          │
               ┌────────────▼──┐   ┌───▼──────────────┐
               │  AWS Amplify  │   │   CloudFront     │
               │  (Next.js 16) │   │  media.holatok   │
               │  holatok.com  │   │    .com          │
               └───────┬───────┘   └───────┬──────────┘
                       │                   │
                       │            ┌──────▼──────┐
                       │            │     S3      │
                       │            │ holatok-    │
                       │            │ media-prod  │
                       │            └─────────────┘
                       │
         ┌─────────────▼──────────────────────────────┐
         │          VPC (us-east-1)                   │
         │                                            │
         │   ┌──────────────────────────────────┐    │
         │   │    Public Subnet                 │    │
         │   │  ┌─────────────────────────────┐ │    │
         │   │  │  Application Load Balancer  │ │    │
         │   │  │  api.holatok.com            │ │    │
         │   │  │  /api/*  → NestJS :4000     │ │    │
         │   │  │  /ai/*   → FastAPI :8000    │ │    │
         │   │  └─────────────────────────────┘ │    │
         │   └──────────────────────────────────┘    │
         │                                            │
         │   ┌──────────────────────────────────┐    │
         │   │    Private Subnet                │    │
         │   │                                  │    │
         │   │  ┌────────────┐ ┌─────────────┐  │    │
         │   │  │ ECS Fargate│ │ ECS Fargate │  │    │
         │   │  │  NestJS    │ │  FastAPI    │  │    │
         │   │  │  :4000     │ │  :8000      │  │    │
         │   │  └─────┬──────┘ └──────┬──────┘  │    │
         │   │        │               │          │    │
         │   │  ┌─────▼───────────────▼──────┐  │    │
         │   │  │     RDS PostgreSQL 16      │  │    │
         │   │  │     t4g.micro              │  │    │
         │   │  └────────────────────────────┘  │    │
         │   └──────────────────────────────────┘    │
         └────────────────────────────────────────────┘
                       │
         ┌─────────────▼──────────────┐
         │  외부 서비스 (SaaS)        │
         │  Upstash Redis             │
         │  Pinecone (벡터 DB)        │
         │  OpenAI / Anthropic        │
         │  Stripe / MercadoPago      │
         └────────────────────────────┘
```

---

## 3. 서비스별 구성

### 3-1. AWS Amplify (Next.js 프론트엔드)

Amplify는 Next.js SSR을 지원하며, GitHub 연동으로 자동 배포됩니다. Vercel 없이 AWS 내에서 모든 것을 해결할 수 있어 비용 효율적입니다.

```yaml
# amplify.yml (프로젝트 루트)
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - nvm use 20
            - npm ci
            - npm run db:generate
        build:
          commands:
            - npm run build --filter=web
      artifacts:
        baseDirectory: apps/web/.next
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
          - apps/web/.next/cache/**/*
    appRoot: .
```

**Amplify 환경 변수:**
- Amplify 콘솔 → App Settings → Environment Variables에서 설정
- `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL` 등

**브랜치 전략:**
```
main    → 프로덕션 자동 배포 (holatok.com)
develop → 스테이징 자동 배포 (dev.holatok.com)
```

---

### 3-2. ECS Fargate — NestJS API (api.holatok.com)

```hcl
# 태스크 정의 (Terraform 또는 AWS 콘솔)
resource "aws_ecs_task_definition" "api" {
  family                   = "holatok-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"   # 0.25 vCPU (초기, 저비용)
  memory                   = "512"   # 0.5 GB

  container_definitions = jsonencode([{
    name  = "holatok-api"
    image = "${ECR_URI}/holatok-api:latest"
    portMappings = [{ containerPort = 4000 }]
    environment = [
      { name = "PORT", value = "4000" },
      { name = "NODE_ENV", value = "production" }
    ]
    secrets = [
      { name = "DATABASE_URL", valueFrom = "arn:aws:secretsmanager:..." },
      { name = "REDIS_URL",    valueFrom = "arn:aws:secretsmanager:..." }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"  = "/ecs/holatok-api"
        "awslogs-region" = "us-east-1"
      }
    }
  }])
}
```

**오토스케일링:**
```
최소: 1 태스크
최대: 3 태스크 (초기)
스케일 업: CPU > 70% (5분)
스케일 다운: CPU < 30% (10분)
```

**Dockerfile (apps/api):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

---

### 3-3. ECS Fargate — FastAPI AI (:8000)

AI 서비스는 API 서비스와 동일한 ALB에서 경로 기반으로 라우팅됩니다.

```
ALB 리스너 규칙:
  /ai/*     → FastAPI Target Group (포트 8000)
  /api/*    → NestJS Target Group (포트 4000)
  기본       → NestJS Target Group
```

```yaml
# ECS Task Definition — AI
cpu:    512   # 0.5 vCPU (AI 추론에 최소 보장)
memory: 1024  # 1 GB

환경변수:
  OPENAI_API_KEY    (Secrets Manager)
  ANTHROPIC_API_KEY (Secrets Manager)
  PINECONE_API_KEY  (Secrets Manager)
```

**Dockerfile (apps/ai):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 3-4. Application Load Balancer

```
ALB: holatok-alb
  DNS: alb-xxxx.us-east-1.elb.amazonaws.com
  → Route 53 ALIAS: api.holatok.com

리스너:
  HTTP  :80  → HTTPS :443 리디렉션
  HTTPS :443 → 경로 기반 라우팅

타겟 그룹:
  tg-holatok-api  :4000  (NestJS)  헬스체크: /api/health
  tg-holatok-ai   :8000  (FastAPI) 헬스체크: /ai/health

보안 그룹:
  sg-alb: 인바운드 80, 443 (0.0.0.0/0)
```

---

## 4. 네트워크 (VPC)

```
VPC: holatok-vpc  10.0.0.0/16  (us-east-1)

가용영역 A (us-east-1a)          가용영역 B (us-east-1b)
┌─────────────────────┐          ┌─────────────────────┐
│ Public Subnet       │          │ Public Subnet       │
│ 10.0.1.0/24        │          │ 10.0.2.0/24        │
│  ALB                │          │  ALB                │
│  NAT Gateway        │          │                     │
├─────────────────────┤          ├─────────────────────┤
│ Private Subnet (앱) │          │ Private Subnet (앱) │
│ 10.0.11.0/24       │          │ 10.0.12.0/24       │
│  ECS (NestJS)       │          │  ECS (NestJS)       │
│  ECS (FastAPI)      │          │  ECS (FastAPI)      │
├─────────────────────┤          ├─────────────────────┤
│ Private Subnet (DB) │          │ Private Subnet (DB) │
│ 10.0.21.0/24       │          │ 10.0.22.0/24       │
│  RDS Primary        │          │  RDS Standby        │
└─────────────────────┘          └─────────────────────┘
```

### 보안 그룹

| 보안 그룹 | 인바운드 허용 | 용도 |
|-----------|-------------|------|
| `sg-alb` | 80, 443 (0.0.0.0/0) | 외부 트래픽 수신 |
| `sg-ecs-api` | 4000 (sg-alb만) | NestJS 컨테이너 |
| `sg-ecs-ai` | 8000 (sg-alb만) | FastAPI 컨테이너 |
| `sg-rds` | 5432 (sg-ecs-api, sg-ecs-ai만) | DB 접근 제한 |

---

## 5. 데이터베이스 (RDS)

### RDS PostgreSQL 16

```yaml
식별자:    holatok-db
엔진:      PostgreSQL 16.x
인스턴스:  db.t4g.micro    # 2 vCPU, 1GB RAM (초기 최저비용)
스토리지:  20GB gp3 (자동 확장)
멀티 AZ:  비활성 (초기 비용 절감) → 트래픽 증가 시 활성화
백업:      7일 보관
암호화:    활성화 (KMS)
삭제 보호: 활성화

파라미터 그룹:
  max_connections: 100
  shared_buffers: 128MB

연결 문자열:
  holatok-db.xxx.us-east-1.rds.amazonaws.com:5432/holatok
```

> **주의:** t4g.micro는 월 ~$13 수준의 최저 비용 인스턴스입니다.
> 동시 연결이 많아지면 **RDS Proxy** 또는 **db.t4g.small** 업그레이드를 검토하세요.

### Prisma 마이그레이션 (배포 시)

```bash
# GitHub Actions deploy.yml에서 배포 전 자동 실행
DATABASE_URL=${{ secrets.DATABASE_URL_PROD }} \
  npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma
```

### 초기 시드 데이터

```bash
# 여행 패키지, 상품 카테고리 등 기본 데이터
DATABASE_URL=$PROD_URL npx prisma db seed
```

---

## 6. 캐시 (Upstash Redis)

RDS와 달리 ElastiCache는 최소 ~$15/월 비용이 발생합니다. **Upstash Redis**는 사용량 기반 과금으로 초기에는 거의 무료입니다.

### Upstash 선택 이유

| 항목 | ElastiCache Serverless | Upstash Redis |
|------|----------------------|---------------|
| 최소 비용 | ~$15/월 | $0 (무료티어) |
| 과금 방식 | 저장 용량 기반 | 요청 수 기반 |
| 멀티리전 | 불가 (단일 리전) | 글로벌 복제 가능 |
| 설정 복잡도 | VPC 내 설치 필요 | URL만으로 연결 |
| MAU 1만 이하 | 불필요하게 비쌈 | 적합 |

### 설정

```typescript
// apps/api/src/redis/redis.module.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
```

### 사용처

```
세션 캐싱     NextAuth 세션 (TTL: 30일)
API 캐싱      콘텐츠 피드 (TTL: 5분)
Rate Limit    IP당 API 요청 제한
실시간 카운터  조회수, 좋아요 수 임시 저장
챗 히스토리   최근 20개 메시지 캐싱
```

---

## 7. 스토리지 + CDN

### S3 버킷

```
holatok-media-prod (us-east-1)
  용도: 사용자 프로필 이미지, 상품 이미지, 여행 패키지 이미지
  ACL:  Private + CloudFront OAC
  디렉토리 구조:
    /profiles/{userId}/avatar.webp
    /products/{productId}/{imageIndex}.webp
    /packages/{packageId}/thumbnail.webp
    /posts/{postId}/{imageIndex}.webp

holatok-static-prod (us-east-1)
  용도: Next.js 정적 에셋 (Amplify가 자동 관리)
  ACL:  Amplify 관리
```

### CloudFront (media.holatok.com)

```yaml
Origins:
  - holatok-media-prod (S3, OAC)

CacheBehaviors:
  /profiles/*:  TTL 1일    (프로필은 자주 바뀔 수 있음)
  /products/*:  TTL 7일    (상품 이미지는 안정적)
  /packages/*:  TTL 7일
  /posts/*:     TTL 1일

Compress: true
ViewerProtocol: redirect-to-https
PriceClass: PriceClass_100  # 미국 + 유럽 (라틴아메리카 포함)
```

### Presigned URL 업로드 플로우

```
1. 클라이언트 → POST /api/upload/presign
   { contentType, folder, fileName }

2. NestJS → S3 Presigned URL 생성 (유효 시간: 5분)

3. 클라이언트 → S3 직접 PUT 업로드
   (NestJS 서버 경유 없음 → 대역폭 절감)

4. 클라이언트 → POST /api/upload/confirm
   { s3Key } → DB에 URL 저장
   → media.holatok.com/{s3Key} 형태로 저장
```

```typescript
// apps/api/src/upload/upload.service.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });

async getPresignedUrl(key: string, contentType: string) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_MEDIA,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 }
  );
}
```

---

## 8. CI/CD 파이프라인

### 전체 플로우

```
GitHub push (main)
    │
    ├─ Job 1: CI (병렬)
    │   ├─ npm run lint
    │   ├─ npm run check-types
    │   └─ npm run build
    │
    ├─ Job 2: Docker 빌드 + ECR Push (CI 통과 후)
    │   ├─ holatok-api  → ECR :latest + :{SHA}
    │   └─ holatok-ai   → ECR :latest + :{SHA}
    │
    ├─ Job 3: DB 마이그레이션
    │   └─ prisma migrate deploy
    │
    └─ Job 4: ECS 배포 (롤링)
        ├─ aws ecs update-service --cluster holatok --service holatok-api
        └─ aws ecs update-service --cluster holatok --service holatok-ai

    ★ Amplify는 GitHub push 감지 후 자동 빌드·배포
```

### .github/workflows/deploy.yml (Phase 5에서 추가)

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build & Push holatok-api
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/holatok-api:$IMAGE_TAG \
                       -t $ECR_REGISTRY/holatok-api:latest \
                       -f apps/api/Dockerfile .
          docker push $ECR_REGISTRY/holatok-api --all-tags

      - name: Build & Push holatok-ai
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/holatok-ai:$IMAGE_TAG \
                       -t $ECR_REGISTRY/holatok-ai:latest \
                       -f apps/ai/Dockerfile .
          docker push $ECR_REGISTRY/holatok-ai --all-tags

      - name: Run DB migration
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}
        run: |
          npm ci
          npm run db:generate
          DATABASE_URL=$DATABASE_URL npx prisma migrate deploy \
            --schema=packages/db/prisma/schema.prisma

      - name: Update ECS services
        run: |
          aws ecs update-service \
            --cluster holatok --service holatok-api --force-new-deployment
          aws ecs update-service \
            --cluster holatok --service holatok-ai --force-new-deployment
          aws ecs wait services-stable \
            --cluster holatok --services holatok-api holatok-ai
```

### ECR 리포지토리 생성

```bash
aws ecr create-repository --repository-name holatok-api --region us-east-1
aws ecr create-repository --repository-name holatok-ai  --region us-east-1
```

---

## 9. 도메인 + 인증서

### Route 53 설정

```
holatok.com
  A (ALIAS) → Amplify 도메인 (자동 생성)

api.holatok.com
  A (ALIAS) → holatok-alb.us-east-1.elb.amazonaws.com

media.holatok.com
  A (ALIAS) → CloudFront 배포 도메인 (xxx.cloudfront.net)
```

### ACM 인증서

```bash
# us-east-1 리전에서 발급 (Amplify/CloudFront에 필요)
aws acm request-certificate \
  --domain-name "holatok.com" \
  --subject-alternative-names "*.holatok.com" \
  --validation-method DNS \
  --region us-east-1

# Route 53 자동 검증 레코드 생성
aws acm describe-certificate --certificate-arn $CERT_ARN \
  | jq '.Certificate.DomainValidationOptions'
```

---

## 10. 환경 변수 관리

### AWS Secrets Manager 구성

```
holatok/prod/database
  DATABASE_URL

holatok/prod/redis
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN

holatok/prod/auth
  NEXTAUTH_SECRET
  AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
  AUTH_APPLE_ID / AUTH_APPLE_SECRET
  AUTH_FACEBOOK_ID / AUTH_FACEBOOK_SECRET

holatok/prod/ai
  OPENAI_API_KEY
  ANTHROPIC_API_KEY
  PINECONE_API_KEY
  PINECONE_INDEX

holatok/prod/payment
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  MERCADOPAGO_ACCESS_TOKEN
  MERCADOPAGO_WEBHOOK_SECRET

holatok/prod/storage
  AWS_ACCESS_KEY_ID  (S3 전용 IAM)
  AWS_SECRET_ACCESS_KEY
  S3_BUCKET_MEDIA
  CLOUDFRONT_DOMAIN

holatok/prod/content
  YOUTUBE_API_KEY
  YOUTUBE_CHANNEL_IDS
```

### ECS 태스크 역할 (IAM)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "s3:PutObject",
        "s3:GetObject",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:*:secret:holatok/prod/*",
        "arn:aws:s3:::holatok-media-prod/*",
        "arn:aws:logs:us-east-1:*:log-group:/ecs/holatok*"
      ]
    }
  ]
}
```

---

## 11. 모니터링 + 알람

### CloudWatch 로그 그룹

```
/ecs/holatok-api       NestJS 애플리케이션 로그
/ecs/holatok-ai        FastAPI 로그
/amplify/holatok-web   Next.js SSR 로그
/rds/holatok-db        DB 슬로우 쿼리 로그 (5초 이상)
```

### CloudWatch 알람 설정

```bash
# ECS CPU 높음 → Slack 알림
aws cloudwatch put-metric-alarm \
  --alarm-name "holatok-api-cpu-high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --dimensions Name=ServiceName,Value=holatok-api \
  --threshold 80 --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 --period 60 \
  --alarm-actions $SNS_TOPIC_ARN

# RDS CPU 높음
# API 5xx 에러율
# 월 예산 초과 ($200)
```

### AWS Budgets (비용 초과 방지)

```bash
# 월 $200 초과 시 이메일 알림
aws budgets create-budget \
  --account-id $AWS_ACCOUNT_ID \
  --budget '{
    "BudgetName": "holatok-monthly",
    "BudgetLimit": { "Amount": "200", "Unit": "USD" },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \
  --notifications-with-subscribers '[{
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80
    },
    "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "lee@cubaro.kr"}]
  }]'
```

### 구조화된 로그 포맷

```json
{
  "timestamp": "2026-03-24T10:00:00Z",
  "level": "info",
  "service": "holatok-api",
  "requestId": "uuid",
  "userId": "cuid",
  "country": "BR",
  "locale": "pt-BR",
  "method": "POST",
  "path": "/api/orders",
  "statusCode": 201,
  "duration": 145,
  "paymentProvider": "stripe_pix"
}
```

---

## 12. 월 비용 상세

### 스타트업 초기 구성 (MAU < 1,000)

| 서비스 | 사양 | 월 비용 (USD) | 비고 |
|--------|------|--------------|------|
| AWS Amplify | Next.js SSR, 1GB 빌드 | ~$10 | 빌드 분당 $0.01 |
| ECS Fargate (NestJS) | 0.25 vCPU · 0.5GB × 1 | ~$12 | Spot 인스턴스 적용 시 ~$4 |
| ECS Fargate (FastAPI) | 0.5 vCPU · 1GB × 1 | ~$20 | |
| ALB | 1개 | ~$18 | 고정 비용 가장 큼 |
| RDS PostgreSQL 16 | db.t4g.micro | ~$13 | 단일 AZ |
| Upstash Redis | 무료 티어 (10K req/일) | $0 | |
| S3 + CloudFront | 100GB 스토리지, 1TB 전송 | ~$25 | |
| Route 53 | 호스팅존 1개 + 쿼리 | ~$1 | |
| ACM 인증서 | | $0 | 무료 |
| Secrets Manager | 10개 시크릿 | ~$4 | |
| CloudWatch | 기본 로그 | ~$3 | |
| ECR | 이미지 저장 | ~$1 | |
| **합계** | | **~$107/월** | |

### 성장 단계 (MAU 5,000 ~ 10,000)

| 서비스 | 업그레이드 | 월 비용 증가 |
|--------|-----------|------------|
| ECS Fargate (API) | 0.5 vCPU × 2 인스턴스 | +$25 |
| ECS Fargate (AI) | 1 vCPU × 2 인스턴스 | +$60 |
| RDS | db.t4g.small + Multi-AZ | +$40 |
| Upstash Redis | Pro 플랜 | +$10 |
| CloudFront | 10TB 전송 | +$80 |
| **합계** | | **~$320/월** |

> **비용 절감 팁:**
> - ECS Fargate Spot 사용: 최대 70% 절감 (중단 허용 가능한 배치 작업)
> - ALB 대신 API Gateway: 낮은 트래픽에서 더 저렴할 수 있음
> - RDS Reserved Instance (1년): 약 40% 절감
> - Savings Plans (Compute): 약 20% 절감

---

## 13. 배포 순서 (Phase 5)

### Step 1 — AWS 계정 준비

```bash
# 1. AWS 계정 생성 + MFA 활성화
# 2. IAM 사용자 생성 (AdministratorAccess → 추후 최소 권한으로 축소)
# 3. AWS CLI 설정
aws configure
# AWS Access Key ID: ...
# AWS Secret Access Key: ...
# Default region: us-east-1
# Default output: json
```

### Step 2 — 네트워크 구성

```bash
# VPC + 서브넷 + 보안 그룹 생성 (Terraform 또는 콘솔)
# Route 53 호스팅존 생성
aws route53 create-hosted-zone \
  --name holatok.com \
  --caller-reference $(date +%s)
```

### Step 3 — RDS 생성

```bash
aws rds create-db-instance \
  --db-instance-identifier holatok-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username holatok \
  --master-user-password <strong-password> \
  --db-name holatok \
  --storage-type gp3 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-rds \
  --db-subnet-group-name holatok-db-subnet \
  --backup-retention-period 7 \
  --storage-encrypted \
  --no-publicly-accessible
```

### Step 4 — ECR + ECS 클러스터

```bash
# ECR 리포지토리
aws ecr create-repository --repository-name holatok-api
aws ecr create-repository --repository-name holatok-ai

# ECS 클러스터
aws ecs create-cluster --cluster-name holatok --capacity-providers FARGATE FARGATE_SPOT
```

### Step 5 — Secrets Manager

```bash
aws secretsmanager create-secret \
  --name "holatok/prod/database" \
  --secret-string '{"DATABASE_URL":"postgresql://..."}'

# 나머지 시크릿도 동일하게 생성
```

### Step 6 — ALB + S3 + CloudFront

```bash
# ALB 생성 (콘솔 또는 CLI)
# S3 버킷 생성 + 버킷 정책
# CloudFront 배포 생성 (OAC 설정)
```

### Step 7 — Amplify 연결

```bash
# Amplify 콘솔 → New App → Host web app → GitHub 연결
# 브랜치: main → holatok.com
# 브랜치: develop → dev.holatok.com
# 커스텀 도메인: holatok.com 추가
```

### Step 8 — GitHub Secrets 등록

```
Settings → Secrets and variables → Actions:

AWS_ACCESS_KEY_ID          (배포 전용 IAM)
AWS_SECRET_ACCESS_KEY
ECR_REGISTRY               (123456789.dkr.ecr.us-east-1.amazonaws.com)
DATABASE_URL_PROD          (마이그레이션용)
TURBO_TOKEN                (Remote Cache, 선택)
TURBO_TEAM                 (선택)
```

### Step 9 — 초기 배포 + DB 마이그레이션

```bash
# main 브랜치에 push → GitHub Actions 자동 실행
git push origin main

# 또는 수동 마이그레이션
DATABASE_URL=<prod-url> npx prisma migrate deploy
DATABASE_URL=<prod-url> npx prisma db seed
```

### Step 10 — 도메인 DNS 전파 확인

```bash
dig holatok.com
dig api.holatok.com
dig media.holatok.com
curl https://holatok.com/ko
curl https://api.holatok.com/api/health
```

---

## 14. 향후 확장 계획

### MAU 10,000 이후 — 라틴아메리카 엣지 최적화

```
현재: us-east-1 단일 리전
향후: CloudFront 엣지 캐싱 강화 → 라틴아메리카 PoP 활용
     (상파울루 PoP: GRU, 보고타: BOG, 부에노스아이레스: EZE)
```

### MAU 50,000 이후 — 멀티 리전

```
us-east-1 (Primary)    ← 멕시코·콜롬비아·아르헨티나·칠레·페루
sa-east-1 (상파울루)    ← 브라질 (MAU의 ~60% 예상)

Aurora Global Database → us-east-1 쓰기, sa-east-1 읽기
```

### 기능 확장 인프라

```
실시간 채팅      API Gateway WebSocket + DynamoDB
번역 자동화     AWS Translate → 커뮤니티 게시글 실시간 번역
푸시 알림       SNS Mobile Push (FCM/APNS)
검색 고도화     OpenSearch (한국어 nori + 스페인어 + 포르투갈어)
배치 처리       SQS + Lambda (콘텐츠 수집 크론, 이메일 발송)
```

---

## 빠른 참고

```bash
# ECS 서비스 상태 확인
aws ecs describe-services --cluster holatok \
  --services holatok-api holatok-ai

# ECS 컨테이너 로그 (최근 100줄)
aws logs tail /ecs/holatok-api --since 1h --follow

# RDS 연결 테스트 (Bastion 또는 SSM Session Manager)
psql $DATABASE_URL_PROD -c "SELECT version();"

# ECR 이미지 목록
aws ecr describe-images --repository-name holatok-api \
  --query 'imageDetails[*].[imageTags,imagePushedAt]' \
  --output table

# Amplify 배포 상태
aws amplify list-jobs --app-id $AMPLIFY_APP_ID --branch-name main
```
