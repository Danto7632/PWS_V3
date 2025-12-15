# CS 업무 시뮬레이터 - AI Service (FastAPI)

RAG, LLM 호출, 시뮬레이션 관련 기능을 제공하는 FastAPI 서버입니다.

## 기술 스택

- **FastAPI** - Python 웹 프레임워크
- **ChromaDB** - 벡터 데이터베이스
- **SentenceTransformers** - 임베딩 모델 (all-MiniLM-L6-v2)
- **LLM 지원**: OpenAI, Google Gemini, Anthropic Claude, Ollama, Perplexity

## 요구사항

- Python 3.10 이상 (3.11 권장)
- 메모리: 최소 4GB RAM (임베딩 모델 로딩)
- 디스크: 약 500MB (모델 캐시)

## 설치 및 실행

### 1. 가상환경 생성 (필수)

```bash
cd ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 의존성 설치

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> ⚠️ **주의**: 첫 실행 시 임베딩 모델(약 90MB)이 자동 다운로드됩니다.

### 3. 서버 실행

```bash
# 개발 모드 (자동 리로드)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 프로덕션 모드
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

서버가 `http://localhost:8000`에서 실행됩니다.

### 4. API 문서 확인

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API 엔드포인트

### 파일 업로드 및 임베딩

```http
POST /api/ai/upload
Content-Type: multipart/form-data

file: <파일>
project_id: <프로젝트 ID>
embed_percentage: <임베딩 비율 (20-100)>
```

### RAG 검색

```http
POST /api/ai/search
Content-Type: application/json

{
  "query": "검색어",
  "project_id": "프로젝트 ID",
  "top_k": 3
}
```

### AI 채팅

```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "메시지",
  "project_id": "프로젝트 ID",
  "conversation_id": "대화 ID",
  "role": "customer | employee",
  "model_id": "gpt-4o",
  "api_keys": {
    "gpt": "sk-...",
    "gemini": "...",
    "claude": "...",
    "perplexity": "..."
  }
}
```

### 시나리오 생성

```http
POST /api/ai/scenario
Content-Type: application/json

{
  "project_id": "프로젝트 ID",
  "model_id": "gpt-4o",
  "api_keys": {...}
}
```

### 헬스체크

```http
GET /api/ai/health
```

### Ollama 모델 목록

```http
GET /api/ai/models/ollama
```

## 지원 LLM

| Provider | 모델 예시 |
|----------|----------|
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo |
| Google | gemini-1.5-pro, gemini-2.0-flash |
| Anthropic | claude-3-opus, claude-3.5-sonnet |
| Ollama | llama3.3, mistral, codellama |
| Perplexity | sonar-pro, sonar-small |

## 데이터 저장

ChromaDB 데이터는 `work_simulator_db/` 폴더에 저장됩니다.
사용자/프로젝트별로 별도 컬렉션으로 분리됩니다.

```
work_simulator_db/
├── chroma.sqlite3         # 메타데이터
└── [collection-uuid]/     # 벡터 데이터
```

## 배포

### systemd 서비스 (Linux)

```ini
[Unit]
Description=CS Simulator AI Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/ai
Environment="PATH=/path/to/ai/venv/bin"
ExecStart=/path/to/ai/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### Gunicorn (대안)

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## 트러블슈팅

### 메모리 부족
임베딩 모델 로딩 시 메모리가 부족하면:
```bash
# 더 작은 모델 사용 (main.py 수정 필요)
model_name = "paraphrase-MiniLM-L3-v2"  # 더 작은 모델
```

### CUDA 오류
GPU 사용 시 CUDA 오류가 발생하면 CPU 모드로 전환:
```python
# main.py에서
model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
```
