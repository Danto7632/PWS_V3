# CS 업무 시뮬레이터 - Backend (NestJS)

프로젝트, 대화, 메시지 관리 및 인증을 위한 REST API 백엔드 서버입니다.

## 기술 스택

- **NestJS 10.x** - Node.js 프레임워크
- **TypeORM** - ORM
- **SQLite** - 데이터베이스
- **JWT** - 인증 (Access/Refresh Token)
- **TypeScript** - 언어

## 설치 및 실행

### 1. 환경 변수 설정

```bash
# 환경 변수 파일 복사
cp .env.example .env

# .env 파일을 열어서 아래 값들을 수정하세요
```

**.env 파일 설정:**

| 변수 | 설명 | 필수 |
|------|------|------|
| `AI_SERVICE_URL` | AI 서비스 URL | O |
| `JWT_SECRET` | JWT 서명 키 (반드시 변경!) | O |
| `JWT_REFRESH_SECRET` | 리프레시 토큰 키 (반드시 변경!) | O |

> ⚠️ **보안 주의**: JWT_SECRET과 JWT_REFRESH_SECRET은 복잡하고 고유한 값으로 설정하세요.

### 2. 의존성 설치

```bash
cd backend
npm install
```

### 3. 개발 서버 실행

```bash
npm run start:dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

### 4. 프로덕션 빌드 및 실행

```bash
# 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

## API 엔드포인트

### 인증 (Auth)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/auth/register` | 회원가입 | 불필요 |
| POST | `/auth/login` | 로그인 | 불필요 |
| POST | `/auth/refresh` | 토큰 갱신 | 불필요 |
| GET | `/auth/profile` | 프로필 조회 | 필요 |
| GET | `/auth/settings` | 사용자 설정 조회 | 필요 |
| PUT | `/auth/settings` | 사용자 설정 수정 | 필요 |

### Projects

- `GET /projects` - 모든 프로젝트 조회
- `GET /projects/:id` - 특정 프로젝트 조회
- `POST /projects` - 새 프로젝트 생성
- `PUT /projects/:id` - 프로젝트 수정
- `DELETE /projects/:id` - 프로젝트 삭제

### Conversations

- `GET /api/conversations` - 대화 목록 조회
- `GET /api/conversations/:id` - 특정 대화 조회
- `POST /api/conversations` - 새 대화 생성
- `PUT /api/conversations/:id` - 대화 수정
- `DELETE /api/conversations/:id` - 대화 삭제

### Messages

- `GET /api/messages/conversation/:conversationId` - 대화의 메시지 목록
- `POST /api/messages` - 새 메시지 생성
- `DELETE /api/messages/:id` - 메시지 삭제

### Files

- `GET /api/files/project/:projectId` - 프로젝트 파일 목록
- `POST /api/files` - 파일 메타데이터 저장
- `DELETE /api/files/:id` - 파일 삭제

### AI (FastAPI 프록시)

- `POST /ai/chat` - AI 채팅
- `POST /ai/scenario` - 고객 시나리오 생성
- `POST /ai/upload` - 파일 업로드 및 임베딩
- `POST /ai/search` - RAG 검색
- `GET /ai/health` - AI 서비스 상태 확인
- `GET /ai/models/ollama` - Ollama 모델 목록

## 데이터베이스

SQLite를 사용하며, 실행 시 자동으로 `cs_simulator.db` 파일이 생성됩니다.

### 주요 테이블

- **User**: 사용자 정보, 설정(API 키, 모델)
- **Project**: 프로젝트 정보, 가이드라인
- **Conversation**: 대화 정보, 역할
- **Message**: 메시지 내용, 피드백
- **File**: 업로드된 파일 메타데이터

## 배포

### systemd 서비스 (Linux)

```ini
[Unit]
Description=CS Simulator Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node /path/to/backend/dist/main.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### PM2 (대안)

```bash
npm install -g pm2
pm2 start dist/main.js --name cs-backend
pm2 save
pm2 startup
```
