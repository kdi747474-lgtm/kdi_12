from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="알러뷰 수퍼캡 AI 매니저 (테스트)")

# ── 키워드 → 모듈 매핑 ──────────────────────────────────────────
RULES = [
    (["구토", "토를", "토해", "혈뇨", "피", "식욕", "안 먹", "설사", "기침"],
     "hospital",   "high",  True,  "가까운 24시간 동물병원 방문을 강력히 권합니다. 증상을 메모해 가시면 진료에 도움이 돼요."),
    (["사료", "모래", "장난감", "캣타워", "공구"],
     "cap_shop",   "low",   False, "알러뷰 캡에서 관련 상품과 진행 중인 공동구매를 확인해 보세요!"),
    (["합사", "입질", "행동", "밤마다", "울", "훈련"],
     "cap_school", "low",   False, "캡 스쿨에서 단계별 행동 교정 강의를 들어보세요. 집사님도 금방 고수가 되실 거예요 😊"),
    (["동네", "캣시터", "길냥", "구조"],
     "community",  "low",   False, "커뮤니티 '동네 소식통' 게시판에서 지역 집사님들과 정보를 나눠보세요!"),
    (["폐기", "버리", "친환경", "구독"],
     "environment","low",   False, "환경 제휴 서비스에서 수거·폐기와 친환경 모래 구독을 한 번에 연결해 드려요."),
]

DEFAULT = ("mixed", "low", False, "더 구체적으로 말씀해 주시면 바로 도와드릴게요!")


# ── 요청 / 응답 스키마 ──────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str

class SystemAction(BaseModel):
    module: str
    urgency: str
    requires_hospital: bool

class ChatResponse(BaseModel):
    reply: str
    system_action: SystemAction


# ── 분류 로직 ──────────────────────────────────────────────────
def classify(message: str):
    for keywords, module, urgency, hospital, reply in RULES:
        if any(k in message for k in keywords):
            return module, urgency, hospital, reply
    module, urgency, hospital, reply = DEFAULT
    return module, urgency, hospital, reply


# ── 엔드포인트 ─────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    module, urgency, hospital, reply = classify(req.message)
    return ChatResponse(
        reply=reply,
        system_action=SystemAction(
            module=module,
            urgency=urgency,
            requires_hospital=hospital,
        ),
    )

@app.get("/")
def root():
    return {"status": "ok", "service": "알러뷰 수퍼캡 AI 매니저"}
