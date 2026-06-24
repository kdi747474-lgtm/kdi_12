# 알러뷰 수퍼캡 (I Love Super Cap)
> 반려묘 통합 라이프스타일 플랫폼 — 수업 테스트 버전

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 플랫폼 | 반려묘 보호자(집사) 대상 통합 서비스 |
| 톤 | 맘카페 스타일, 다정하고 공감 중심 |
| 배포 URL | https://web-pink-psi-18.vercel.app |
| 배포 플랫폼 | Vercel |
| 설치 방법 | PWA — 폰 브라우저에서 홈 화면에 추가 |
| 최종 업데이트 | 2026-06-23 |

---

## 진행 현황 요약

| 모듈 | 구현 상태 | 완성도 |
|------|-----------|--------|
| AI 상담 챗봇 (ChatTab) | ✅ 완료 | 90% |
| 쇼핑 — 국내/해외 사이트 + 공동구매 (CommerceTab) | ✅ 완료 | 95% |
| 커뮤니티 (CommunityTab) | ✅ 완료 | 80% |
| 교육 — 캡 스쿨 (EducationTab) | ✅ 완료 | 80% |
| 병원 찾기 (HospitalTab) | ✅ 완료 | 95% |
| 생활 도구 미니툴 (MiniTools) — 툴 4종 | ✅ 완료 | 95% |
| 피드백 위젯 (FeedbackWidget) — 이모지·NPS·투표 | ✅ 완료 | 100% |
| 고양이 성향 테스트 (CatQuiz) — 5문항 맞춤 추천 | ✅ 완료 | 100% |
| 체중 그래프 (MiniTools 5번째) — localStorage + SVG | ✅ 완료 | 100% |
| 공동구매 모집 인원 현황 — 실시간 진행바 | ✅ 완료 | 100% |
| 예방접종 일정 관리 — D-day 알림 + localStorage | ✅ 완료 | 100% |
| 냥이 프로필 (CatProfile) — 헤더 칩 + 상세 등록 | ✅ 완료 | 100% |
| 커뮤니티 글쓰기 — 실제 작성·좋아요·필터 | ✅ 완료 | 100% |
| 교육탭 강의 진행률 — 강의별 클릭·저장·수료증 | ✅ 완료 | 100% |
| GPT 실제 연동 | 🔧 미완 | 10% |
| 실제 결제 연동 | 📋 예정 | 0% |
| GPS 실제 위치 병원 검색 — 네이버·카카오·구글 연동 | ✅ 완료 | 90% |
| 카카오 로그인 | 📋 예정 | 0% |

> ✅ 완료 &nbsp;|&nbsp; 🔧 진행중 &nbsp;|&nbsp; 📋 예정

---

## 폴더 구조

```
kdi_12/
├── main.py              ← FastAPI 백엔드 (키워드 분류 API)
├── requirements.txt     ← fastapi, uvicorn
├── kdi.md               ← 현재 파일 (프로젝트 정리)
│
└── web/                 ← React 프론트엔드 (Vite + Tailwind)
    ├── index.html
    ├── package.json     ← React 19, Vite 8, TypeScript 6
    ├── vite.config.ts   ← PWA 플러그인 포함
    ├── tailwind.config.js
    ├── vercel.json
    ├── public/
    │   ├── pwa-192.png
    │   ├── pwa-512.png
    │   └── apple-touch-icon.png
    └── src/
        ├── App.tsx              ← 5탭 네비게이션 (하단 탭 바)
        ├── main.tsx             ← 진입점
        ├── types.ts             ← TabId, SystemAction, ChatMessage
        ├── index.css            ← Tailwind + Noto Sans KR
        ├── lib/
        │   └── chatbot.ts       ← 키워드 분류 → SystemAction JSON
        └── components/
            ├── ChatTab.tsx      ← AI 상담 챗봇
            ├── CommerceTab.tsx  ← 국내/해외 쇼핑 + 공동구매
            ├── CommunityTab.tsx ← 게시판 / 동네 소식통
            ├── EducationTab.tsx ← 캡 스쿨 강의
            ├── HospitalTab.tsx    ← 주변 동물병원
            ├── MiniTools.tsx      ← 생활 도구 4종 (나이·사료량·위험음식·관부가세)
            ├── FeedbackWidget.tsx ← 플로팅 피드백 위젯 (이모지반응·기능투표·NPS)
            └── CatQuiz.tsx        ← 고양이 성향 테스트 (5문항 맞춤 추천)
```

---

## 구현 모듈 상세

### 1. AI 상담 챗봇 (ChatTab) ✅
- 사용자 메시지를 키워드로 분류
- `System_Action` JSON 인라인 표시
- 해당 탭으로 즉시 이동 버튼 제공
- 빠른 답변 버튼 4개 제공
- VITE_OPENAI_API_KEY 환경변수 감지 → GPT/키워드 모드 자동 전환 배지 표시

### 2. 쇼핑 — 알러뷰 캡 (CommerceTab) ✅
- **국내 TOP 3** 쇼핑 사이트 카드 (펫프렌즈 / 쿠팡 / 네이버 쇼핑)
- **해외 TOP 3** 직구 사이트 카드 (Chewy / iHerb / Zooplus)
- 외부 링크 `target="_blank" rel="noopener noreferrer"` 보안 처리
- 해외 직구 기반 공동구매 상품 6종 목록
- 마감 임박 배지(🔥), 카테고리별 표시

### 3. 커뮤니티 (CommunityTab) ✅
- 게시판 필터 (동네 소식통, 일상 수다, 길냥이 구조 등)
- 좋아요 / 댓글 수 표시
- 글쓰기 버튼

### 4. 교육 — 캡 스쿨 (EducationTab) ✅
- 강의 목록 + 진행률 바
- 수료증 배지
- 이어서 보기 / 시작하기

### 5. O2O — 병원 찾기 (HospitalTab) ✅
- 응급 증상 배너 (즉시 병원 연결)
- 증상별 빠른 안내 버튼
- 주변 동물병원 목록 (진료 중 / 종료 표시)
- 전화 연결 버튼

### 6. 생활 도구 미니툴 (MiniTools) ✅
| 툴 | 기능 | 설명 |
|----|------|------|
| 🎂 나이 계산기 | 출생연도 입력 | 고양이 나이 → 사람 나이 환산 + 건강 조언 |
| 🍽️ 사료량 계산기 | 몸무게 + 사료 종류 | 하루 권장 급여량 (g) + 중성화 보정 |
| ⚠️ 위험 음식 체크 | 음식 이름 입력 | 위험/주의/안전 여부 즉시 판별 |

---

## AI 분류 로직 (chatbot.ts / main.py 공통)

| 키워드 | 연결 모듈 | 긴급도 |
|--------|-----------|--------|
| 구토, 토를, 혈뇨, 설사, 기침 | hospital | high |
| 사료, 모래, 장난감, 공구, 직구, 쇼핑 | commerce | low |
| 합사, 입질, 행동, 밤마다 울 | education | low |
| 동네, 캣시터, 길냥이, 구조 | community | low |
| 폐기, 친환경, 구독 | environment | low |

### System_Action JSON 예시
```json
{
  "intent": "hospital",
  "recommended_module": "hospital",
  "urgency_level": "high",
  "requires_hospital": true,
  "location_required": true
}
```

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프론트엔드 | React | 19.2.6 |
| 빌드 도구 | Vite | 8.0.12 |
| 언어 | TypeScript | 6.0.2 |
| 스타일 | Tailwind CSS | 3.4.19 |
| 폰트 | Noto Sans KR | Google Fonts |
| 아이콘 | lucide-react | 1.21.0 |
| PWA | vite-plugin-pwa | 1.3.0 |
| 백엔드 | Python FastAPI | 로컬 테스트용 |
| 배포 | Vercel | - |

---

## 실행 방법

### 프론트엔드 개발 서버
```bash
cd web
npm install
npm run dev
# → http://localhost:5173
```

### 백엔드 API 서버
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# → http://localhost:8001/docs
```

### Vercel 재배포
```bash
cd web
npx vercel --prod --scope kdi747474-1706s-projects
```

---

## 일상 반려묘 용품 구매 사이트

### 🇰🇷 국내 TOP 3

| 순위 | 사이트 | URL | 특징 |
|------|--------|-----|------|
| 1 | **펫프렌즈** | [petfriends.co.kr](https://www.petfriends.co.kr) | 반려동물 전문몰, 새벽배송, 수의사 상담 서비스 |
| 2 | **쿠팡** | [coupang.com](https://www.coupang.com) | 로켓배송, 최저가 비교, 사료·모래 정기배송 |
| 3 | **네이버 쇼핑** | [shopping.naver.com](https://shopping.naver.com) | 가격 비교, 스마트스토어 다양, 포인트 적립 |

> 추천 구매 품목: 사료, 화장실 모래, 간식, 스크래처, 장난감, 캐리어

### 🌍 해외 TOP 3

| 순위 | 사이트 | URL | 특징 |
|------|--------|-----|------|
| 1 | **Chewy** | [chewy.com](https://www.chewy.com) | 미국 최대 반려동물 전문몰, 정기배송 할인, 수의사 처방식 |
| 2 | **iHerb** | [iherb.com](https://www.iherb.com) | 영양제·보조식품 특화, 직구 배송 빠름, 한국어 지원 |
| 3 | **Zooplus** | [zooplus.com](https://www.zooplus.com) | 유럽 최대 펫몰, 프리미엄 EU 브랜드, 대용량 할인 |

> 직구 팁: 관부가세 면세 한도 USD 150 이하 / iHerb는 한국 통관 경험 풍부

---

## 테스트 항목

### 일반 테스트 케이스

| # | 탭 | 테스트 항목 | 기대 결과 | 상태 |
|---|----|------------|-----------|------|
| 1 | 쇼핑 | 상품 목록 렌더링 | 상품 카드 6개 이상 표시 | ✅ |
| 2 | 쇼핑 | 마감 임박 배지 | 🔥 마감임박 배지 표시 | ✅ |
| 3 | 쇼핑 | 국내 사이트 링크 | 펫프렌즈·쿠팡·네이버쇼핑 새 탭 이동 | ✅ |
| 4 | 쇼핑 | 해외 사이트 링크 | Chewy·iHerb·Zooplus 새 탭 이동 | ✅ |
| 5 | 쇼핑 | 공동구매 담기 버튼 | 수량 선택 모달 → 신청 완료 화면 | ✅ |
| 6 | 쇼핑 | 가격 포맷 | 원화 표기 (₩1,000) | ✅ |
| 7 | 챗봇 | 키워드 분류 — 사료 | commerce 탭 이동 버튼 | ✅ |
| 8 | 챗봇 | 키워드 분류 — 직구 | commerce 탭 이동 버튼 | ✅ |
| 9 | 챗봇 | 키워드 분류 — 구토 | hospital 탭 / 긴급 high | ✅ |
| 10 | 챗봇 | GPT 모드 배지 | 환경변수 없으면 "키워드" 표시 | ✅ |
| 11 | 미니툴 | 나이 계산기 | 출생연도 입력 → 사람 나이 표시 | ✅ |
| 12 | 미니툴 | 사료량 계산기 | 몸무게 입력 → 권장량(g) 계산 | ✅ |
| 13 | 미니툴 | 위험 음식 체크 | "양파" → 🚨 위험 메시지 | ✅ |
| 14 | 미니툴 | 관부가세 계산기 | USD 입력 → 세금·총액 계산 | ✅ |
| 15 | 미니툴 | 관부가세 면세 | USD 150 이하 → 면세 표시 | ✅ |
| 16 | 병원 | 응급 배너 | 증상 버튼 클릭 → 병원 연결 | ✅ |
| 17 | 전체 | PWA 설치 | 홈 화면 추가 → 앱 실행 | ✅ |
| 18 | 전체 | 모바일 반응형 | max-w-[430px] 중앙 정렬 | ✅ |
| 19 | 전체 | 탭 전환 시 채팅 유지 | 다른 탭 갔다 와도 대화 내용 보존 | ✅ |

### 챗봇 → 탭 이동 연동 테스트

| # | 챗봇 입력 | 기대 System_Action | 이동 탭 | 상태 |
|---|-----------|-------------------|---------|------|
| 1 | "사료 추천해줘" | `commerce` / low | 쇼핑탭 | ✅ |
| 2 | "고양이 모래 어디서 사요?" | `commerce` / low | 쇼핑탭 | ✅ |
| 3 | "구토를 해요" | `hospital` / high | 병원탭 | ✅ |
| 4 | "합사 방법 알려줘" | `education` / low | 교육탭 | ✅ |
| 5 | "길냥이 구조" | `community` / low | 커뮤니티탭 | ✅ |
| 6 | "해외직구 추천" | `commerce` / low | 쇼핑탭 | ✅ |

---

## 다음 단계 아이디어

- [x] 공동구매 담기 모달 (수량 선택 + 신청 완료)
- [x] 관부가세 자동 계산기 (USD → KRW, 면세 판별)
- [x] 직구/쇼핑 챗봇 키워드 확장
- [x] 플로팅 피드백 위젯 (이모지 반응·기능 투표·NPS·한줄 의견 → localStorage 저장)
- [x] 고양이 성향 테스트 (5문항 → 맞춤 집사 타입 분류 + 추천 탭 이동)
- [x] 체중 변화 그래프 (날짜별 기록·SVG 선 차트·추세 표시)
- [x] 공동구매 모집 인원 현황 (실시간 진행바·8초 간격 자동 갱신)
- [x] 예방접종 일정 관리 (종합백신·심장사상충 등 8종·D-day 배지·초과 경고)
- [x] 냥이 프로필 등록 (이름·품종·나이·중성화·체중·털색 → localStorage, 헤더 칩)
- [x] 커뮤니티 글쓰기 (게시판 선택·지역·좋아요·글 펼치기·더미 데이터 localStorage)
- [x] 교육탭 강의 진행률 저장 (강의 클릭 → 순차 해제·진행바·수료증·전체 진행률)
- [x] GPS 실제 위치 기반 병원 검색 (네이버·카카오·구글 지도 3종 + 24시간 응급 전용)
- [x] 고양이 용품 실제 제품 추천 (사료·간식·모래·영양제·장난감 5카테고리 18종)
- [x] AI 챗봇 FAQ 완전 재작성 (병원찾기·응급·구토·설사·중성화 등 12종 상세 답변)
- [x] 행정안전부 공공데이터 동물병원 API 연동 (FastAPI 프록시 + 전국 17개 시도 검색)
- [x] 챗봇 병원 찾기 직접 안내 (GPS 기능·지도 앱·응급 전화 안내로 "모른다" 대신 실답변)
- [ ] OpenAI API 연결 (VITE_OPENAI_API_KEY → GPT 챗봇 실제 답변)
- [ ] 텔레그램 봇 연동 (FastAPI → python-telegram-bot)
- [ ] 공공데이터포털 API 키 발급 → 전국 실시간 병원 목록 연동
- [ ] 카카오 로그인 / 회원 기능
- [ ] 실제 공동구매 결제 연동
- [ ] 국내/해외 쇼핑몰 실시간 가격 비교 API 연동
- [ ] 펫프렌즈 / 쿠팡 제휴 링크(어필리에이트) 적용
