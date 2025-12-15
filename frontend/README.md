# CS 업무 시뮬레이터 - Frontend (React)

React + TypeScript + Vite 기반 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 언어
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트

## 설치 및 실행

### 1. 환경 변수 설정

```bash
# 환경 변수 파일 복사
cp .env.example .env

# .env 파일 수정 (필요시)
```

**.env 파일:**

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3001` |

### 2. 의존성 설치

```bash
cd frontend
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:5173`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드 결과물이 `build/` 폴더에 생성됩니다.

## 프로젝트 구조

```
src/
├── components/        # UI 컴포넌트
│   ├── ui/           # shadcn/ui 기본 컴포넌트
│   ├── Sidebar.tsx   # 사이드바
│   ├── ChatArea.tsx  # 채팅 영역
│   └── ...           # 기타 컴포넌트
├── services/          # API 서비스
│   └── api.ts        # API 클라이언트
├── types/             # TypeScript 타입
├── styles/            # 글로벌 스타일
└── App.tsx            # 메인 앱 컴포넌트
```

## 배포

### 정적 파일 서빙 (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API 프록시
    location /api/ {
        proxy_pass http://localhost:3001/;
    }
}
```

### 빌드 시 환경 변수

프로덕션 배포 시 환경에 맞게 `.env` 파일을 수정한 후 빌드하세요:

```bash
# .env 파일
VITE_BACKEND_URL=https://api.your-domain.com

# 빌드
npm run build
```
  