from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.manager import analyze_message
from app.models import ChatRequest, ChatResponse, HealthResponse

app = FastAPI(
    title="I Love Super Cap AI Manager",
    description="알러뷰 수퍼캡 수석 AI 매니저 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse()


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    try:
        return await analyze_message(body.message, body.user_location)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI 매니저 처리 오류: {exc}") from exc


def format_for_n8n(response: ChatResponse) -> dict:
    """n8n 웹훅 연동용 페이로드."""
    return {
        "text": response.reply,
        "system_action": response.system_action.model_dump(),
        "system_action_block": f"[System_Action]\n{response.system_action.model_dump_json(indent=2)}",
    }


@app.post("/api/v1/chat/webhook")
async def chat_webhook(body: ChatRequest) -> dict:
    response = await chat(body)
    return format_for_n8n(response)
