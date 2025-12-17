# CS 업무 시뮬레이터

AI 기반 고객 서비스 업무 시뮬레이터입니다. 신입 직원을 위한 고객 응대 연습 도구로, 실제 업무 매뉴얼을 학습한 AI와 다양한 상황을 시뮬레이션할 수 있습니다.

시연영상 : https://www.youtube.com/watch?v=9wFu5BvlJm8&feature=youtu.be

## 📋 목차

- [아키텍처](#아키텍처)
- [기능](#주요-기능)
- [요구사항](#요구사항)
- [설치 가이드](#설치-가이드)
- [배포 가이드](#배포-가이드)
- [환경 변수](#환경-변수-설정)
- [API 문서](#api-문서)

## 🏗️ 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│   AI Service    │
│    (React)      │     │    (NestJS)     │     │   (FastAPI)     │
│   :5173/:80     │     │    :3001        │     │    :8000        │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │     MySQL       │     │   ChromaDB      │
                        │   (TypeORM)     │     │  (Vector DB)    │
                        └─────────────────┘     └─────────────────┘
```

### 프로젝트 구조

```
PWS_V3/
├── frontend/          # React 프론트엔드 (Vite + TypeScript)
│   ├── src/
│   │   ├── components/   # UI 컴포넌트
│   │   ├── services/     # API 서비스
│   │   └── types/        # TypeScript 타입
│   └── package.json
│
├── backend/           # NestJS 백엔드
│   ├── src/
│   │   ├── auth/         # 인증 모듈 (JWT)
│   │   ├── projects/     # 프로젝트 모듈
│   │   ├── conversations/# 대화 모듈
│   │   ├── messages/     # 메시지 모듈
│   │   ├── files/        # 파일 모듈
│   │   └── ai/           # AI 프록시 모듈
│   └── package.json
│
└── ai/                # FastAPI AI 서비스
    ├── main.py           # FastAPI 메인
    └── requirements.txt
```

## ✨ 주요 기능

### 📚 프로젝트 관리
- 프로젝트별 매뉴얼 업로드 및 관리
- 업무 지침 설정
- 파일 임베딩 (PDF, TXT, Excel, Word)

### 🎭 역할 기반 시뮬레이션
- **고객 역할**: AI 직원과 대화하며 서비스 체험
- **직원 역할**: AI 고객의 문의에 응대 연습
- 실시간 평가 및 피드백

### 🤖 AI 통합
- 다양한 LLM 지원 (OpenAI, Gemini, Claude, Ollama, Perplexity)
- RAG 기반 컨텍스트 검색
- 매뉴얼 기반 시나리오 자동 생성

### 👤 사용자 관리
- JWT 기반 인증 (회원/비회원 모드)
- 사용자별 설정 저장 (API 키, 모델 선택)
- 프로젝트/대화 사용자 격리

## 📦 요구사항

### 필수 요구사항

| 구성요소 | 버전 | 비고 |
|---------|------|------|
| Node.js | 18.x 이상 | LTS 권장 |
| Python | 3.10 이상 | 3.11 권장 |
| npm | 9.x 이상 | Node.js와 함께 설치됨 |

### 선택적 요구사항

| 구성요소 | 용도 |
|---------|------|
| Ollama | 로컬 LLM 사용 시 필요 |
| CUDA | GPU 가속 임베딩 시 필요 |

## 🚀 설치 가이드

### 1. 저장소 클론

```bash
git clone <repository-url>
cd PWS_V3
```

### 2. AI 서비스 설정 (FastAPI)

```bash
cd ai

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. 백엔드 설정 (NestJS)

```bash
cd backend

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 JWT_SECRET 등 수정

# 의존성 설치
npm install

# 개발 모드 실행
npm run start:dev

# 또는 프로덕션 빌드
npm run build
npm run start:prod
```

### 4. 프론트엔드 설정 (React)

```bash
cd frontend

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 VITE_BACKEND_URL 수정 (필요시)

# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 또는 프로덕션 빌드
npm run build
```

### 5. 접속

브라우저에서 `http://localhost:5173` 접속

## 🖥️ 배포 가이드

### 온프레미스 배포

#### systemd 서비스 설정 (Linux)

**AI 서비스** (`/etc/systemd/system/cs-ai.service`):
```ini
[Unit]
Description=CS Simulator AI Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/PWS_V3/ai
Environment="PATH=/path/to/PWS_V3/ai/venv/bin"
ExecStart=/path/to/PWS_V3/ai/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**백엔드** (`/etc/systemd/system/cs-backend.service`):
```ini
[Unit]
Description=CS Simulator Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/PWS_V3/backend
ExecStart=/usr/bin/node /path/to/PWS_V3/backend/dist/main.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

#### Nginx 리버스 프록시 설정

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (정적 파일)
    location / {
        root /path/to/PWS_V3/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # AI Service (내부용, 필요시)
    location /ai/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker 배포 (선택사항)

`docker-compose.yml` 예시는 별도 문서 참조

## ⚙️ 환경 변수 설정

### Backend (.env)

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `AI_SERVICE_URL` | AI 서비스 URL | `http://localhost:8000` |
| `JWT_SECRET` | JWT 서명 키 (필수 변경) | - |
| `JWT_REFRESH_SECRET` | 리프레시 토큰 키 (필수 변경) | - |

### Frontend (.env)

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3001` |

## 📡 API 문서

### Backend API (NestJS)

- 기본 URL: `http://localhost:3001`
- Swagger: `http://localhost:3001/api` (개발 모드)

### AI Service API (FastAPI)

- 기본 URL: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔧 트러블슈팅

### AI 서비스 시작 실패
- Python 버전 확인 (3.10 이상)
- CUDA 관련 오류 시 CPU 모드로 실행
- 메모리 부족 시 임베딩 모델 변경 고려

### 백엔드 연결 오류
- AI_SERVICE_URL 환경 변수 확인
- AI 서비스가 실행 중인지 확인
- 방화벽 포트 설정 확인

### 프론트엔드 API 연결 실패
- VITE_BACKEND_URL 설정 확인
- CORS 설정 확인 (백엔드)
- 네트워크 탭에서 요청/응답 확인

## 📄 라이선스

이 프로젝트는 사내 교육용으로 제작되었습니다.
