"""
FastAPI AI Service for CS Work Simulator
RAG, LLM 호출, 시뮬레이션 관련 기능 제공
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import chromadb
from sentence_transformers import SentenceTransformer
import PyPDF2
import pdfplumber
import pandas as pd
import tempfile
import os
import uuid
import asyncio

# LLM 라이브러리
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    import ollama
except ImportError:
    ollama = None

try:
    import anthropic
except ImportError:
    anthropic = None

app = FastAPI(
    title="CS Work Simulator AI API",
    description="AI 기반 CS 업무 시뮬레이터 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 객체
chroma_client = chromadb.PersistentClient(path="./work_simulator_db")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# 프로젝트별 컬렉션 관리
project_collections: Dict[str, Any] = {}

# Ollama 동시 호출 제한을 위한 세마포어 (동시에 1개만 처리)
ollama_semaphore = asyncio.Semaphore(1)


# ========================
# Pydantic 모델 정의
# ========================

class ChatRequest(BaseModel):
    message: str
    project_id: str
    conversation_id: str
    role: str  # 'customer' | 'employee'
    model_id: str = "gpt-4o"
    api_keys: Optional[Dict[str, str]] = None
    guidelines: Optional[str] = None  # 프로젝트 지침
    conversation_history: Optional[List[Dict[str, str]]] = None  # 대화 히스토리
    user_id: Optional[str] = None  # 회원 ID (로그인 시)


class ChatResponse(BaseModel):
    response: str
    evaluation: Optional[Dict[str, Any]] = None


class ScenarioRequest(BaseModel):
    project_id: str
    model_id: str = "gpt-4o"
    api_keys: Optional[Dict[str, str]] = None
    guidelines: Optional[str] = None  # 프로젝트 지침
    user_id: Optional[str] = None  # 회원 ID (로그인 시)


class ScenarioResponse(BaseModel):
    situation: str
    customer_type: str
    first_message: str


class FileUploadResponse(BaseModel):
    success: bool
    file_id: str
    chunks_count: int
    message: str


class EmbeddingSettings(BaseModel):
    project_id: str
    embed_percentage: int = 100  # 20-100


class SearchRequest(BaseModel):
    query: str
    project_id: str
    top_k: int = 3
    user_id: Optional[str] = None  # 회원 ID (로그인 시)


class LLMConfigRequest(BaseModel):
    provider: str  # ollama, openai, gemini, claude, perplexity
    model: str
    api_key: Optional[str] = None


# ========================
# 유틸리티 함수
# ========================

def extract_text_from_pdf(file_path: str) -> str:
    """PDF에서 텍스트 추출 (pdfplumber + OCR 결합)"""
    pdfplumber_text = ""
    ocr_text = ""
    
    # 1단계: pdfplumber로 텍스트 추출
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # 텍스트 추출
                page_text = page.extract_text() or ""
                pdfplumber_text += page_text + "\n"
                
                # 다양한 설정으로 표 추출 시도
                for strategy in ["lines", "text"]:
                    try:
                        tables = page.extract_tables(table_settings={
                            "vertical_strategy": strategy,
                            "horizontal_strategy": strategy
                        })
                        for table in tables:
                            for row in table:
                                if row and any(cell for cell in row if cell and str(cell).strip()):
                                    row_text = " | ".join([str(cell).strip() if cell else "" for cell in row])
                                    if row_text.strip() and row_text.strip() != "|":
                                        pdfplumber_text += row_text + "\n"
                        break
                    except:
                        continue
    except Exception as e:
        pass
    
    # 2단계: OCR로 이미지 텍스트 추출 (항상 시도)
    try:
        from pdf2image import convert_from_path
        import pytesseract
        
        images = convert_from_path(file_path)
        for img in images:
            ocr_text += pytesseract.image_to_string(img, lang='kor+eng') + "\n"
    except Exception as ocr_error:
        pass
    
    # 3단계: pdfplumber와 OCR 결과 결합 (더 긴 텍스트 우선, 둘 다 있으면 합침)
    if len(ocr_text.strip()) > len(pdfplumber_text.strip()) * 2:
        # OCR이 훨씬 더 많은 내용을 추출한 경우
        text = pdfplumber_text + "\n\n" + ocr_text
    elif pdfplumber_text.strip() and ocr_text.strip():
        # 둘 다 있으면 합침
        text = pdfplumber_text + "\n\n" + ocr_text
    elif ocr_text.strip():
        text = ocr_text
    else:
        text = pdfplumber_text
    
    # 최후 폴백: PyPDF2
    if not text.strip():
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += (page.extract_text() or "") + "\n"
        except:
            pass
    
    return text


def extract_text_from_txt(file_path: str) -> str:
    """TXT 파일에서 텍스트 추출"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"TXT 읽기 오류: {str(e)}")


def extract_text_from_excel(file_path: str) -> str:
    """Excel 파일에서 텍스트 추출"""
    try:
        df = pd.read_excel(file_path)
        return df.to_string(index=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Excel 읽기 오류: {str(e)}")


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 150) -> List[str]:
    """텍스트를 청크로 분할 (작은 청크 + 큰 오버랩으로 정밀한 RAG)"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip() and len(chunk.strip()) > 20:  # 너무 짧은 청크 제외
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks


def get_or_create_collection(project_id: str, user_id: Optional[str] = None):
    """사용자 및 프로젝트별 ChromaDB 컬렉션 가져오기 또는 생성"""
    # user_id가 있으면 사용자별 컬렉션, 없으면 기존 방식
    if user_id:
        collection_name = f"user_{user_id.replace('-', '_')}_project_{project_id.replace('-', '_')}"
    else:
        collection_name = f"project_{project_id.replace('-', '_')}"
    
    # 컬렉션 이름 길이 제한 (ChromaDB는 63자 제한)
    if len(collection_name) > 63:
        import hashlib
        hash_suffix = hashlib.md5(collection_name.encode()).hexdigest()[:8]
        collection_name = collection_name[:54] + "_" + hash_suffix
    
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except:
        collection = chroma_client.create_collection(name=collection_name)
    return collection


async def call_llm(prompt: str, config: LLMConfigRequest) -> str:
    """LLM 호출 통합 함수 (비동기)"""
    provider = config.provider.lower()
    model = config.model
    api_key = config.api_key

    # Ollama (로컬) - 세마포어로 동시 호출 제한
    if provider == "ollama":
        if ollama is None:
            raise HTTPException(status_code=400, detail="ollama 패키지가 설치되지 않았습니다")
        try:
            async with ollama_semaphore:
                # 동기 함수를 별도 스레드에서 실행
                import concurrent.futures
                loop = asyncio.get_event_loop()
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    resp = await loop.run_in_executor(
                        executor,
                        lambda: ollama.chat(
                            model=model,
                            messages=[{"role": "user", "content": prompt}]
                        )
                    )
                return resp["message"]["content"].strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama 호출 오류: {str(e)}")

    # OpenAI GPT
    elif provider == "openai" or provider == "gpt":
        if OpenAI is None:
            raise HTTPException(status_code=400, detail="openai 패키지가 설치되지 않았습니다")
        if not api_key:
            raise HTTPException(status_code=400, detail="OpenAI API 키가 필요합니다")
        try:
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI 호출 오류: {str(e)}")

    # Google Gemini
    elif provider == "gemini":
        if genai is None:
            raise HTTPException(status_code=400, detail="google-generativeai 패키지가 설치되지 않았습니다")
        if not api_key:
            raise HTTPException(status_code=400, detail="Gemini API 키가 필요합니다")
        try:
            # 매 요청마다 새 클라이언트 생성 (동시 호출 안전)
            import google.generativeai as genai_client
            genai_client.configure(api_key=api_key)
            gemini_model = genai_client.GenerativeModel(model)
            response = gemini_model.generate_content(prompt)
            return getattr(response, "text", "").strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini 호출 오류: {str(e)}")

    # Anthropic Claude
    elif provider == "claude" or provider == "anthropic":
        if anthropic is None:
            raise HTTPException(status_code=400, detail="anthropic 패키지가 설치되지 않았습니다")
        if not api_key:
            raise HTTPException(status_code=400, detail="Claude API 키가 필요합니다")
        try:
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model=model,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Claude 호출 오류: {str(e)}")

    # Perplexity
    elif provider == "perplexity":
        if OpenAI is None:
            raise HTTPException(status_code=400, detail="openai 패키지가 설치되지 않았습니다")
        if not api_key:
            raise HTTPException(status_code=400, detail="Perplexity API 키가 필요합니다")
        try:
            client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Perplexity 호출 오류: {str(e)}")

    else:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 LLM 공급자: {provider}")


def get_llm_config_from_model_id(model_id: str, api_keys: Optional[Dict[str, str]]) -> LLMConfigRequest:
    """모델 ID에서 LLM 설정 추출"""
    model_lower = model_id.lower()
    
    if model_lower.startswith("gpt") or model_lower.startswith("o1") or model_lower.startswith("o3") or model_lower.startswith("o4"):
        return LLMConfigRequest(
            provider="openai",
            model=model_id,
            api_key=api_keys.get("gpt") if api_keys else None
        )
    elif model_lower.startswith("gemini"):
        return LLMConfigRequest(
            provider="gemini",
            model=model_id,
            api_key=api_keys.get("gemini") if api_keys else None
        )
    elif model_lower.startswith("claude"):
        return LLMConfigRequest(
            provider="claude",
            model=model_id,
            api_key=api_keys.get("claude") if api_keys else None
        )
    elif model_lower.startswith("perplexity") or model_lower.startswith("sonar"):
        return LLMConfigRequest(
            provider="perplexity",
            model=model_id,
            api_key=api_keys.get("perplexity") if api_keys else None
        )
    elif model_lower.startswith("ollama"):
        # ollama-llama3.3 -> llama3.3
        actual_model = model_id.replace("ollama-", "")
        return LLMConfigRequest(
            provider="ollama",
            model=actual_model,
            api_key=None
        )
    else:
        # 기본값: OpenAI
        return LLMConfigRequest(
            provider="openai",
            model=model_id,
            api_key=api_keys.get("gpt") if api_keys else None
        )


# ========================
# RAG 관련 엔드포인트
# ========================

@app.post("/api/ai/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    embed_percentage: int = Form(100),
    user_id: Optional[str] = Form(None)
):
    """파일 업로드 및 임베딩"""
    print(f"[UPLOAD] user_id: {user_id}, project_id: {project_id}, file: {file.filename}, embed_percentage: {embed_percentage}")
    
    # 임시 파일 저장
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # 텍스트 추출
    text = ""
    try:
        if suffix.lower() == ".pdf":
            text = extract_text_from_pdf(tmp_path)
        elif suffix.lower() == ".txt":
            text = extract_text_from_txt(tmp_path)
        elif suffix.lower() in [".xlsx", ".xls"]:
            text = extract_text_from_excel(tmp_path)
        else:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 파일 형식: {suffix}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"텍스트 추출 오류: {str(e)}")
    finally:
        # 임시 파일 삭제
        try:
            os.unlink(tmp_path)
        except:
            pass

    if not text.strip():
        raise HTTPException(status_code=400, detail="파일에서 텍스트를 추출할 수 없습니다")

    # 청킹
    chunks = chunk_text(text)
    
    # 임베딩 비율 적용
    ratio = embed_percentage / 100.0
    use_n = max(1, int(len(chunks) * ratio))
    chunks_to_use = chunks[:use_n]

    # 컥렉션에 저장
    collection = get_or_create_collection(project_id, user_id)
    file_id = str(uuid.uuid4())

    for i, chunk in enumerate(chunks_to_use):
        embedding = embedding_model.encode(chunk).tolist()
        collection.add(
            embeddings=[embedding],
            documents=[chunk],
            ids=[f"{file_id}_chunk_{i}"],
            metadatas=[{"file_name": file.filename, "file_id": file_id}]
        )

    return FileUploadResponse(
        success=True,
        file_id=file_id,
        chunks_count=len(chunks_to_use),
        message=f"{file.filename} 처리 완료: {len(chunks_to_use)}개 청크 임베딩"
    )


@app.post("/api/ai/search")
async def search_knowledge(request: SearchRequest):
    """RAG 검색"""
    try:
        collection = get_or_create_collection(request.project_id, request.user_id)
        query_embedding = embedding_model.encode(request.query).tolist()
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=request.top_k
        )
        
        documents = results.get('documents', [[]])[0]
        return {"results": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 오류: {str(e)}")


@app.delete("/api/ai/project/{project_id}/files")
async def delete_project_files(project_id: str):
    """프로젝트의 모든 파일(임베딩) 삭제"""
    try:
        collection_name = f"project_{project_id.replace('-', '_')}"
        chroma_client.delete_collection(name=collection_name)
        return {"success": True, "message": "프로젝트 파일 삭제 완료"}
    except Exception as e:
        return {"success": False, "message": str(e)}


# ========================
# 시뮬레이션 관련 엔드포인트
# ========================

@app.post("/api/ai/scenario", response_model=ScenarioResponse)
async def generate_scenario(request: ScenarioRequest):
    """고객 시나리오 생성"""
    # 프로젝트의 매뉴얼 컨텍스트 가져오기
    try:
        collection = get_or_create_collection(request.project_id, request.user_id)
        # 임의의 컨텍스트 가져오기
        results = collection.get(limit=5)
        context = " ".join(results.get('documents', [])[:3]) if results.get('documents') else ""
    except:
        context = ""

    # 지침 추가
    guidelines = request.guidelines or ""
    guidelines_text = f"\n\n[프로젝트 지침]\n{guidelines}" if guidelines else ""

    if not context and not guidelines:
        return ScenarioResponse(
            situation="일반적인 서비스 문의 상황",
            customer_type="일반 고객",
            first_message="안녕하세요, 서비스 이용 관련해서 문의드립니다."
        )

    prompt = f"""
당신은 아래 매뉴얼에 나오는 서비스/업무의 고객 또는 사용자입니다.

[업무/서비스 매뉴얼 발췌]
{context[:1500]}{guidelines_text}

위 매뉴얼의 주제와 용어를 벗어나지 말고,
실제 현장에서 자주 나올 법한 고객 문의 상황 1개만 만드세요.

반드시 매뉴얼의 내용과 직접 관련된 문의여야 하며,
매뉴얼에 없는 새로운 종류의 상품/서비스는 만들지 마세요.

[출력 형식 - 이 형식 그대로]
상황: (고객이 처한 상황을 한 줄로)
고객 유형: (예: 일반 고객 / 초보 학습자 / 컴퓨터에 익숙하지 않은 고객 등)
고객 첫 말: (직원에게 처음 건네는 한 문장)
""".strip()

    llm_config = get_llm_config_from_model_id(request.model_id, request.api_keys)
    content = await call_llm(prompt, llm_config)

    scenario = {
        'situation': '',
        'customer_type': '',
        'first_message': ''
    }

    for line in content.splitlines():
        line = line.strip()
        if line.startswith("상황:"):
            scenario['situation'] = line.split("상황:", 1)[1].strip()
        elif line.startswith("고객 유형:"):
            scenario['customer_type'] = line.split("고객 유형:", 1)[1].strip()
        elif "고객 첫 말:" in line or "첫 말:" in line:
            scenario['first_message'] = line.split(":", 1)[1].strip().strip('"""')

    return ScenarioResponse(
        situation=scenario['situation'] or "매뉴얼 관련 문의 상황",
        customer_type=scenario['customer_type'] or "일반 고객",
        first_message=scenario['first_message'] or "안녕하세요, 문의사항이 있습니다."
    )


@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """채팅 - 역할에 따른 AI 응답 생성"""
    print(f"[CHAT] user_id: {request.user_id}, project_id: {request.project_id}, message: {request.message[:50]}...")
    
    # RAG 컨텍스트 검색 (모든 관련 문서 가져오기)
    unique_docs = []
    try:
        collection = get_or_create_collection(request.project_id, request.user_id)
        query_embedding = embedding_model.encode(request.message).tolist()
        
        # 컬렉션의 모든 문서 가져오기 (최대 20개)
        doc_count = collection.count()
        print(f"[CHAT] Collection doc_count: {doc_count}")
        
        if doc_count > 0:
            n_results = min(20, doc_count)
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results
            )
            seen = set()
            for doc in results.get('documents', [[]])[0]:
                doc_hash = hash(doc[:100])
                if doc_hash not in seen:
                    seen.add(doc_hash)
                    unique_docs.append(doc)
        
        # Fallback: 문서가 없으면 user_id 없이 검색 (비회원 시절 데이터)
        if not unique_docs and request.user_id:
            print(f"[CHAT] No docs found, trying fallback without user_id")
            try:
                fallback_collection = get_or_create_collection(request.project_id, None)
                fallback_count = fallback_collection.count()
                print(f"[CHAT] Fallback collection doc_count: {fallback_count}")
                if fallback_count > 0:
                    n_results = min(20, fallback_count)
                    results = fallback_collection.query(
                        query_embeddings=[query_embedding],
                        n_results=n_results
                    )
                    seen = set()
                    for doc in results.get('documents', [[]])[0]:
                        doc_hash = hash(doc[:100])
                        if doc_hash not in seen:
                            seen.add(doc_hash)
                            unique_docs.append(doc)
            except Exception as fallback_error:
                print(f"[CHAT] Fallback error: {fallback_error}")
        
        # Fallback 2: project_undefined 컬렉션도 검색 (이전 데이터 호환)
        if not unique_docs and request.project_id != "undefined":
            print(f"[CHAT] No docs found, trying fallback to project_undefined")
            try:
                fallback_collection = get_or_create_collection("undefined", None)
                fallback_count = fallback_collection.count()
                print(f"[CHAT] Fallback undefined collection doc_count: {fallback_count}")
                if fallback_count > 0:
                    n_results = min(20, fallback_count)
                    results = fallback_collection.query(
                        query_embeddings=[query_embedding],
                        n_results=n_results
                    )
                    seen = set()
                    for doc in results.get('documents', [[]])[0]:
                        doc_hash = hash(doc[:100])
                        if doc_hash not in seen:
                            seen.add(doc_hash)
                            unique_docs.append(doc)
            except Exception as fallback_error:
                print(f"[CHAT] Fallback error: {fallback_error}")
        
        context = "\n\n".join(unique_docs)
        print(f"[CHAT] Context length: {len(context)}, unique_docs: {len(unique_docs)}")
        if unique_docs:
            print(f"[CHAT] First doc preview: {unique_docs[0][:200]}...")
    except Exception as e:
        print(f"[CHAT] RAG Error: {e}")
        context = ""

    # 지침 추가
    guidelines = request.guidelines or ""
    guidelines_text = f"\n\n[프로젝트 지침]\n{guidelines}" if guidelines else ""

    # 대화 히스토리 포맷팅
    history_text = ""
    if request.conversation_history:
        history_lines = []
        for msg in request.conversation_history[-10:]:  # 최근 10개 메시지만
            role_label = "고객" if msg.get("role") == "user" else "직원"
            history_lines.append(f"{role_label}: {msg.get('content', '')}")
        if history_lines:
            history_text = f"\n\n[이전 대화 내용]\n" + "\n".join(history_lines)

    llm_config = get_llm_config_from_model_id(request.model_id, request.api_keys)

    # 역할에 따른 응답 생성
    if request.role == "customer":
        # 사용자가 고객 역할 -> AI가 직원 역할
        prompt = f"""당신은 아래 문서/매뉴얼을 기반으로 친절하게 답변하는 전문 상담원입니다.

[참고 문서/매뉴얼]
{context}
{guidelines_text}
{history_text}

답변 가이드라인:
1. 참고 문서에 직접적인 답이 있으면 해당 내용을 정확히 안내하세요.
2. 직접적인 답이 없더라도, 문서의 맥락을 바탕으로 관련된 정보를 제공하거나 일반적인 안내를 해주세요.
3. 전혀 관련 없는 질문이면 "죄송합니다. 해당 내용은 제가 도와드리기 어려운 부분입니다. 다른 문의사항이 있으시면 말씀해 주세요."라고 완곡히 답변하세요.
4. 질문에 관련된 추가 도움이 될 만한 정보가 있다면 함께 안내해 주세요.
5. 답변은 자연스럽고 친근한 말투로 작성하세요.

고객 질문: {request.message}

친절한 답변:"""

        response = await call_llm(prompt, llm_config)
        return ChatResponse(response=response)

    else:
        # 사용자가 직원 역할 -> AI가 고객 역할 + 평가
        # 1. 평가
        eval_prompt = f"""다음 업무 매뉴얼과 지침을 기준으로 직원의 고객 응답을 평가해주세요:

업무 매뉴얼:
{context[:1000]}{guidelines_text}{history_text}

직원 응답: {request.message}

다음 기준으로 평가해주세요:
1. 정확성 (1-5점)
2. 친절성 (1-5점)  
3. 적절성 (1-5점)
총점: /15점

형식:
정확성: X/5 - 간단한 코멘트
친절성: X/5 - 간단한 코멘트  
적절성: X/5 - 간단한 코멘트
총점: X/15
개선점: 구체적인 개선 제안"""

        eval_content = await call_llm(eval_prompt, llm_config)
        
        # 점수 추출
        total_score = 12
        try:
            if '총점:' in eval_content:
                score_line = [line for line in eval_content.split('\n') if '총점:' in line][0]
                total_score = int(score_line.split('/')[0].split(':')[-1].strip())
        except:
            pass

        evaluation = {
            'score': total_score,
            'max_score': 15,
            'feedback': eval_content
        }

        # 2. 다음 고객 응답 생성
        customer_prompt = f"""당신은 서비스를 이용하는 고객입니다.

[업무/서비스 매뉴얼 발췌]
{context[:800]}{guidelines_text}{history_text}

위 매뉴얼의 주제와 용어를 벗어나지 말고,
이전 대화 맥락을 고려하여 직원의 답변을 들은 뒤 이어질 다음 고객 질문/반응을 한 문장으로만 작성하세요.

직원 응답: {request.message}

고객 답변 (50자 이내, 한 문장):"""

        customer_response = await call_llm(customer_prompt, llm_config)
        
        return ChatResponse(response=customer_response, evaluation=evaluation)


# ========================
# 헬스체크
# ========================

@app.get("/api/ai/health")
async def health_check():
    """서버 상태 확인"""
    ollama_status = False
    if ollama:
        try:
            ollama.list()
            ollama_status = True
        except:
            pass

    return {
        "status": "healthy",
        "ollama_available": ollama_status,
        "openai_available": OpenAI is not None,
        "gemini_available": genai is not None,
        "claude_available": anthropic is not None
    }


@app.get("/api/ai/models/ollama")
async def get_ollama_models():
    """사용 가능한 Ollama 모델 목록"""
    if ollama is None:
        return {"models": [], "error": "ollama 패키지가 설치되지 않았습니다"}
    
    try:
        models_response = ollama.list()
        models = [m['name'] for m in models_response.get('models', [])]
        return {"models": models}
    except Exception as e:
        return {"models": [], "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
