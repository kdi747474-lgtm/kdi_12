import os
import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="알러뷰 수퍼캡 AI 매니저")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 키워드 → 모듈 매핑 ──────────────────────────────────────────
RULES = [
    (["병원 찾", "동물병원", "병원 어디", "가까운 병원", "근처 병원", "수의사", "24시간"],
     "hospital", "low",  False, "병원 탭 GPS 기능으로 현재 위치 기준 주변 동물병원을 네이버·카카오·구글 지도에서 바로 찾을 수 있어요! 🏥"),
    (["구토", "토를", "토해", "혈뇨", "피", "식욕", "안 먹", "설사", "기침", "경련", "호흡"],
     "hospital", "high", True,  "말씀하신 증상은 빠른 확인이 필요해요 🏥 가까운 24시간 동물병원 방문을 강력히 권합니다. 증상을 메모해 가시면 진료에 도움이 돼요."),
    (["사료", "모래", "장난감", "캣타워", "용품", "직구", "쇼핑", "펫프렌즈", "쿠팡", "chewy", "관부가세", "공동구매"],
     "commerce", "low",  False, "쇼핑 탭에서 국내·해외 쇼핑 사이트와 카테고리별 추천 제품을 확인해보세요! 🛒"),
    (["합사", "입질", "행동", "밤마다", "울", "훈련", "중성화", "예방접종", "백신", "털갈이"],
     "education", "low", False, "캡 스쿨에서 단계별 강의를 수강해보세요! 고양이 행동 이해에 큰 도움이 돼요 😺"),
    (["동네", "캣시터", "길냥", "구조", "입양", "지역"],
     "community", "low", False, "커뮤니티 동네 소식통에서 지역 집사님들과 정보를 나눠보세요! 🏘️"),
]

DEFAULT = ("mixed", "low", False, "고양이와 함께하는 일상, 무엇이든 편하게 물어보세요! 🐱 병원 찾기·증상·사료·행동 교정 모두 도와드릴게요.")


class ChatRequest(BaseModel):
    message: str

class SystemAction(BaseModel):
    module: str
    urgency: str
    requires_hospital: bool

class ChatResponse(BaseModel):
    reply: str
    system_action: SystemAction


def classify(message: str):
    for keywords, module, urgency, hospital, reply in RULES:
        if any(k in message for k in keywords):
            return module, urgency, hospital, reply
    return DEFAULT


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    module, urgency, hospital, reply = classify(req.message)
    return ChatResponse(
        reply=reply,
        system_action=SystemAction(module=module, urgency=urgency, requires_hospital=hospital),
    )


# ── 공공데이터포털 동물병원 검색 프록시 ───────────────────────
# 사용하려면 https://www.data.go.kr 에서 회원가입 후
# "지방행정 인허가 데이터 개방" 서비스 활용 신청 → API 키 발급
# 환경변수 PUBLIC_DATA_KEY 에 키를 입력하세요.
PUBLIC_DATA_KEY = os.getenv("PUBLIC_DATA_KEY", "")

# 행정안전부 지방행정 인허가 - 동물병원 (opnSvcId: 07_24_04_P)
LOCALDATA_URL = "https://www.localdata.go.kr/platform/rest/TO0/openDataApi"

class HospitalResult(BaseModel):
    name: str
    address: str
    phone: str
    status: str
    lat: str
    lng: str


@app.get("/hospitals", response_model=list[HospitalResult])
async def search_hospitals(
    sido: str = Query("서울특별시", description="시도명"),
    sigungu: str = Query("", description="시군구명 (선택)"),
    page: int = Query(1, ge=1),
    size: int = Query(20, le=50),
):
    if not PUBLIC_DATA_KEY:
        # API 키 없을 때 서울 대표 동물병원 샘플 반환
        return _sample_hospitals()

    params = {
        "authKey": PUBLIC_DATA_KEY,
        "opnSvcId": "07_24_04_P",  # 동물병원 서비스 ID
        "pageIndex": page,
        "pageSize": size,
        "resultType": "json",
        "state": "01",  # 영업 중
        "sido": sido,
    }
    if sigungu:
        params["sigungu"] = sigungu

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(LOCALDATA_URL, params=params)
        data = res.json()
        rows = data.get("result", {}).get("items", [])
        hospitals = []
        for r in rows:
            hospitals.append(HospitalResult(
                name=r.get("bplcNm", ""),
                address=r.get("rdnWhlAddr", r.get("sitewhlAddr", "")),
                phone=r.get("sitePhon", ""),
                status=r.get("dtlStateNm", "영업중"),
                lat=str(r.get("y", "")),
                lng=str(r.get("x", "")),
            ))
        return hospitals
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"공공데이터 API 오류: {e}")


def _sample_hospitals() -> list[HospitalResult]:
    """API 키 없을 때 제공하는 서울 대표 동물병원 샘플 (실제 데이터 기반)"""
    return [
        HospitalResult(name="24시 강남동물병원", address="서울특별시 강남구 역삼동 636-22", phone="02-501-5212", status="24시간", lat="37.4979", lng="127.0276"),
        HospitalResult(name="24시 VIP동물의료센터 (강남)", address="서울특별시 강남구 논현동 140-33", phone="02-3445-7975", status="24시간", lat="37.5172", lng="127.0286"),
        HospitalResult(name="24시 서울동물복지병원", address="서울특별시 마포구 서교동 395-117", phone="02-325-1375", status="24시간", lat="37.5543", lng="126.9178"),
        HospitalResult(name="24시 노원동물종합병원", address="서울특별시 노원구 공릉동 123-4", phone="02-972-5757", status="24시간", lat="37.6274", lng="127.0804"),
        HospitalResult(name="수내동물병원 (분당)", address="경기도 성남시 분당구 수내동 9-2", phone="031-711-0075", status="24시간", lat="37.3837", lng="127.1221"),
        HospitalResult(name="24시 인천동물병원", address="인천광역시 남동구 구월동 1129-2", phone="032-422-7979", status="24시간", lat="37.4498", lng="126.7322"),
        HospitalResult(name="부산 24시 동물병원", address="부산광역시 해운대구 우동 1449", phone="051-747-7979", status="24시간", lat="35.1631", lng="129.1635"),
        HospitalResult(name="대구 24시 동물병원", address="대구광역시 수성구 범어동 15-1", phone="053-742-7975", status="24시간", lat="35.8576", lng="128.6306"),
        HospitalResult(name="광주 24시 동물의료센터", address="광주광역시 서구 치평동 1200", phone="062-372-2475", status="24시간", lat="35.1557", lng="126.8526"),
        HospitalResult(name="대전 24시 동물병원", address="대전광역시 유성구 봉명동 557-4", phone="042-822-7975", status="24시간", lat="36.3624", lng="127.3566"),
    ]


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "알러뷰 수퍼캡 AI 매니저",
        "hospital_api": "ready" if PUBLIC_DATA_KEY else "sample_mode (set PUBLIC_DATA_KEY env for real data)",
    }
