import type { SystemAction, TabId } from '../types'

interface Rule {
  keywords: string[]
  module: TabId
  urgency: SystemAction['urgency_level']
  requires_hospital: boolean
  action_extra?: Partial<SystemAction>
}

// ── FAQ 데이터베이스 (키워드 매핑 답변) ───────────────────────
const FAQ: { keywords: string[]; reply: string; module: TabId; urgency: SystemAction['urgency_level']; hospital: boolean }[] = [
  // ── 병원 찾기 ──
  {
    keywords: ['병원 찾', '동물병원 어디', '병원 어디', '병원 알려', '가까운 병원', '근처 병원', '주변 병원', '병원 추천', '수의사', '병원 찾아줘', '병원 찾아', '병원 위치'],
    module: 'hospital', urgency: 'low', hospital: false,
    reply: `병원 찾기는 제가 직접 도와드릴 수 있어요! 🏥\n\n**[병원 탭 → GPS 켜기]** 버튼을 누르면 현재 위치 기준으로 네이버·카카오·구글 지도에서 주변 동물병원을 바로 검색할 수 있어요.\n\n또는 아래 방법도 있어요:\n• 📍 **네이버 지도** → "동물병원" 검색\n• 🟡 **카카오맵** → "내 주변 동물병원"\n• 🌙 **야간·응급** → "24시간 동물병원" 검색\n\n지금 바로 병원 탭으로 이동할까요?`,
  },
  {
    keywords: ['응급', '24시', '야간', '급해', '지금 당장', '빨리', '응급실'],
    module: 'hospital', urgency: 'high', hospital: true,
    reply: `응급상황이군요! 🚨 지금 바로 행동하세요!\n\n1. **119 동물 긴급신고**: 119로 전화하면 가까운 24시간 동물병원을 안내해 줘요\n2. **네이버 지도** → "24시간 동물병원" 검색\n3. **카카오맵** → "야간 동물병원"\n\n📞 대형 24시 동물병원:\n• 서울: 24시 네이처 (02-596-1133)\n• 수도권: VIP동물의료센터 (031-385-0075)\n\n병원 탭 → GPS 켜기로 가장 가까운 병원을 찾아드릴게요!`,
  },

  // ── 구토·설사 ──
  {
    keywords: ['구토', '토를', '토해', '게워', '헛구역'],
    module: 'hospital', urgency: 'high', hospital: true,
    reply: `고양이가 구토를 하는군요 😿\n\n**즉시 병원이 필요한 경우:**\n• 하루 3회 이상 구토\n• 혈액·이물질이 섞인 구토\n• 구토 후 기력이 없음\n• 12시간 이상 밥을 안 먹음\n\n**집에서 확인할 수 있는 경우 (1~2회 헛구역):**\n• 헤어볼 여부 확인 (길쭉한 덩어리)\n• 밥을 너무 빨리 먹지 않았는지\n• 독성 식물·이물질 접촉 여부\n\n증상이 계속되면 병원 탭에서 가까운 동물병원을 찾아주세요.`,
  },
  {
    keywords: ['설사', '묽은 변', '혈변', '혈뇨', '소변 못'],
    module: 'hospital', urgency: 'high', hospital: true,
    reply: `설사·혈뇨 증상이 있군요! 🏥 빠른 확인이 필요해요.\n\n**즉시 병원:** 혈변·혈뇨, 24시간 이상 설사, 기력 저하\n**당일 내 병원:** 묽은 변 2회 이상, 식욕 저하 동반\n\n**임시 조치 (경미한 경우):**\n• 물 충분히 제공 (탈수 방지)\n• 12시간 금식 후 소화 좋은 닭가슴살 소량\n• 프로바이오틱스 급여 (수의사 권장 제품)\n\n병원 탭 → GPS로 가까운 병원을 바로 찾아드릴게요!`,
  },

  // ── 식욕부진 ──
  {
    keywords: ['밥 안', '사료 안', '먹질 않', '안 먹어', '식욕', '밥을 안'],
    module: 'hospital', urgency: 'medium', hospital: false,
    reply: `밥을 안 먹는 고양이, 걱정되시죠 😿\n\n**24시간 이내라면:**\n• 스트레스 요인 확인 (환경 변화·새로운 사람)\n• 사료 종류·온도 바꿔보기 (미지근하게)\n• 습식 사료로 일시 전환\n• 좋아하는 간식으로 식욕 자극\n\n**24시간 이상이라면:** 🏥 반드시 병원 방문!\n• 지방간 위험 (고양이는 48시간 이상 금식 위험)\n• 구강 질환, 내장 문제 가능성\n\n병원 탭에서 가까운 동물병원을 찾아보세요.`,
  },

  // ── 기침·호흡 ──
  {
    keywords: ['기침', '호흡', '숨을 헐떡', '쌕쌕', '코 막힘', '재채기'],
    module: 'hospital', urgency: 'high', hospital: true,
    reply: `기침·호흡 이상은 빠른 확인이 필요해요! 🏥\n\n**즉시 병원 (응급):**\n• 입 벌리고 헐떡임\n• 배 움직임이 심함\n• 잇몸·혀가 파란색\n• 가슴이 빠르게 오르내림\n\n**당일 병원:**\n• 연속 재채기 + 콧물\n• 눈곱 + 기침 (고양이 감기 의심)\n• 5분 이상 기침 지속\n\n고양이 호흡기 질환은 진행이 빨라요. 병원 탭에서 지금 바로 가까운 병원을 찾아주세요!`,
  },

  // ── 물 안 마심 ──
  {
    keywords: ['물 안', '물을 안', '물 못', '탈수'],
    module: 'education', urgency: 'low', hospital: false,
    reply: `고양이가 물을 잘 안 마시는군요! 사실 고양이는 원래 물을 적게 마셔요 🐱\n\n**물 섭취량 늘리는 팁:**\n• 🚿 분수형 급수기 사용 (흐르는 물 선호)\n• 🥣 사료 그릇과 멀리 떨어진 곳에 물 두기\n• 💧 습식 사료 비율 높이기 (수분 78% 함유)\n• 🧊 아주 차갑지 않은 신선한 물로 매일 교체\n• 🐟 참치 캔 국물 조금 타기 (무염)\n\n하루 체중(kg)×50ml가 최소 권장 섭취량이에요.`,
  },

  // ── 중성화 ──
  {
    keywords: ['중성화', '수술', '중성화 언제', '중성화 나이'],
    module: 'education', urgency: 'low', hospital: false,
    reply: `중성화 수술 시기가 궁금하시군요! 🏥\n\n**권장 시기:**\n• 수컷: 생후 6~8개월 (첫 발정 전)\n• 암컷: 생후 5~6개월 (첫 발정 전이 이상적)\n\n**중성화 장점:**\n• 유방암·자궁축농증 위험 90% 감소\n• 영역 표시 행동 감소\n• 평균 수명 연장 (2~3년)\n\n**수술 전 검사 필수:** 혈액검사·마취 전 검사\n**수술 후:** 7~10일 목카라 착용, 활동 제한\n\n구체적인 건강 상태에 따라 다를 수 있으니 수의사 상담을 권해요!`,
  },

  // ── 예방접종 ──
  {
    keywords: ['예방접종', '백신', '접종', '주사'],
    module: 'hospital', urgency: 'low', hospital: false,
    reply: `예방접종 일정을 알려드릴게요! 💉\n\n**기본 접종 스케줄:**\n| 나이 | 접종 내용 |\n|------|----------|\n| 6~8주 | 종합백신(FVRCP) 1차 |\n| 10~12주 | FVRCP 2차 |\n| 14~16주 | FVRCP 3차 + 광견병 |\n| 매년 | FVRCP 부스터 |\n| 선택 | FeLV (고양이 백혈병) |\n\n**심장사상충 예방:** 실내 고양이도 월 1회 필수!\n**구충제:** 실내 고양이 3개월, 실외는 1개월마다\n\n병원 탭의 **예방접종 일정 관리**로 D-day를 설정해두면 잊지 않아요 📅`,
  },

  // ── 털갈이 ──
  {
    keywords: ['털갈이', '털 빠짐', '털 많이', '헤어볼', '헤어볼'],
    module: 'education', urgency: 'low', hospital: false,
    reply: `털갈이 시즌이군요! 🐱 고양이 털 관리 팁이에요:\n\n**털갈이 관리:**\n• 하루 1~2회 빗질 (슬리커 브러시 추천)\n• 욕실에서 빗질 → 청소 편리\n• 공기청정기 필터 자주 교체\n\n**헤어볼 예방:**\n• 헤어볼 전용 사료 또는 페이스트 급여\n• 풀(캣그라스) 화분 제공\n• 오메가3 보충제 → 피모 건강 + 털 빠짐 감소\n\n**과도한 털 빠짐 주의:** 영양 부족·스트레스·피부 질환 의심 → 병원 확인 권장`,
  },

  // ── 입질 ──
  {
    keywords: ['입질', '물어', '할퀴', '공격'],
    module: 'education', urgency: 'low', hospital: false,
    reply: `입질 문제, 고민이 많으시겠어요! 😾\n\n**놀이 입질(정상):** 새끼 때 사회화 부족 → 장난감으로 대체\n**공격성 입질:** 통증·스트레스·영역 방어 → 원인 파악 필요\n\n**교정 방법:**\n• ❌ 손으로 놀아주기 금지 (손=장난감 학습)\n• ✅ 낚싯대 장난감으로 충분한 사냥 놀이 (20분/일)\n• ✅ "아야!" 하며 즉시 놀이 중단\n• ✅ 클리커 훈련 → 좋은 행동 강화\n• ✅ 페로몬 디퓨저 (Feliway) 사용\n\n캡 스쿨 "입질·스크래칭 행동 교정" 강의도 추천해요 📚`,
  },

  // ── 합사 ──
  {
    keywords: ['합사', '고양이 둘', '두 마리', '새 고양이'],
    module: 'education', urgency: 'low', hospital: false,
    reply: `합사는 천천히 진행하는 게 핵심이에요! 🏠\n\n**합사 단계 (총 2~4주):**\n\n1️⃣ **분리 (1주):** 새 고양이는 별도 방 격리, 냄새로만 인식\n2️⃣ **냄새 교환 (3~5일):** 담요·장난감 교환, 페로몬 디퓨저 사용\n3️⃣ **문틈 교환 (3~5일):** 문 살짝 열고 서로 보게 하기\n4️⃣ **대면 (서서히):** 간식 동시 급여로 긍정 연관\n\n**절대 금지:** 갑작스러운 대면, 억지로 붙여놓기\n**필수:** 밥그릇·물그릇·화장실은 각각 따로!\n\n캡 스쿨 "합사 마스터 클래스"도 참고해보세요 📚`,
  },

  // ── 밤에 우는 문제 ──
  {
    keywords: ['밤마다', '밤에 울', '새벽에 울', '자다가 울'],
    module: 'education', urgency: 'low', hospital: false,
    reply: `밤마다 우는 냥이 때문에 힘드시겠어요 😅\n\n**원인별 해결책:**\n\n🌙 **배가 고플 때:** 자기 전 습식 사료 소량 급여 (사냥 후 식사 본능)\n🎮 **에너지 넘칠 때:** 취침 1시간 전 집중 놀이 타임 20분\n❤️ **외로울 때:** 같이 잘 공간 만들기 (고양이 침대 옆에)\n🏥 **아플 때:** 갑자기 시작했다면 노령묘·통증 확인 필요\n🐱 **중성화 안 했다면:** 발정 울음 → 중성화 강력 권장\n\n자기 전 30분 놀이 + 소식 → 거의 해결돼요!`,
  },

  // ── 외출·이동 준비물 ──
  {
    keywords: ['준비물', '병원 갈 때', '고양이 학교', '이동 준비', '외출 준비', '이동장', '캐리어'],
    module: 'hospital', urgency: 'low', hospital: false,
    reply: `외출·이동 준비물을 알려드릴게요! 🐱\n\n**기본 준비물 (항상):**\n• 🏠 이동장 (사전에 냄새 익히기 권장)\n• 🧻 흡수 패드 (이동장 바닥)\n• 🍬 좋아하는 간식 (긴장 완화)\n• 📋 의료 기록·백신 수첩\n• 💧 소형 급수기 또는 물통\n\n**날씨별 추가 준비:**\n• 🌧️ 비: 방수 커버·수건 2장\n• ❄️ 추울 때: 담요·방한복\n• 🌡️ 더울 때: 쿨링 매트·냉기팩(천 감싸기)\n\n**고양이 학교 전용 추가:**\n• 집 냄새 나는 담요 (긴장 완화)\n• 백신 접종 증명서 (입학 필수)\n• 좋아하는 장난감 1개\n\n위 날씨 위젯에서 **실시간 체크리스트**도 확인할 수 있어요! 📋`,
  },
  {
    keywords: ['추울 때', '비 오는 날', '더울 때 외출', '날씨 외출', '겨울 외출', '여름 외출'],
    module: 'hospital', urgency: 'low', hospital: false,
    reply: `날씨별 고양이 외출 주의사항이에요! 🌤️\n\n❄️ **추운 날 (8°C 미만):**\n• 방한복 or 두꺼운 담요 필수\n• 핫팩 직접 접촉 금지 (화상!)\n• 이동 시간 최대한 단축\n\n🌧️ **비 오는 날:**\n• 이동장 방수 커버 필수\n• 수건 2장 이상 챙기기\n• 귀가 후 드라이어(저온)로 말리기\n\n🌡️ **더운 날 (28°C 이상):**\n• 통풍형 이동장 사용\n• 냉기팩 (천으로 감싸 직접 접촉 방지)\n• 차 안에 절대 방치 금지 (10분도 위험)\n• 오전 10시 이전, 오후 5시 이후 이동 권장\n\n날씨 위젯의 GPS 버튼을 눌러 **실시간 준비물 체크리스트**를 이용해보세요! ☀️`,
  },

  // ── 사료 추천 ──
  {
    keywords: ['사료 추천', '어떤 사료', '사료 뭐', '좋은 사료', '사료 고르'],
    module: 'commerce', urgency: 'low', hospital: false,
    reply: `사료 선택이 어려우시죠! 쇼핑 탭에 자세히 정리해뒀어요 🛒\n\n**나이별 추천:**\n• 🐣 키튼(~1세): 오리젠 캣&키튼, 로얄캐닌 키튼\n• 🐱 성묘(1~7세): 로얄캐닌 인도어, 힐스 어덜트\n• 🧓 시니어(7세~): 힐스 시니어, 로얄캐닌 에이징\n\n**건식 vs 습식:**\n• 건식: 치석 관리, 경제적\n• 습식: 수분 보충, 기호성 높음 (병행 추천)\n\n**성분 확인 포인트:** 곡물(Grain)보다 동물성 단백질이 첫 번째로 오는 제품!\n\n쇼핑 탭에서 5개 카테고리 실제 제품을 확인해보세요 🐾`,
  },
]

// ── 키워드 규칙 (탭 이동용) ────────────────────────────────────
const RULES: Rule[] = [
  {
    keywords: ['병원 찾', '동물병원', '병원 어디', '병원 알려', '가까운 병원', '근처 병원', '주변 병원', '병원 추천', '수의사', '24시간'],
    module: 'hospital', urgency: 'low', requires_hospital: false,
  },
  {
    keywords: ['구토', '토를', '토해', '혈뇨', '혈변', '피', '식욕', '안 먹', '설사', '기침', '경련', '호흡', '응급'],
    module: 'hospital', urgency: 'high', requires_hospital: true,
  },
  {
    keywords: ['사료', '모래', '장난감', '캣타워', '공구', '용품', '스크래처',
               '직구', '쇼핑', '구매', '펫프렌즈', '쿠팡', 'chewy', 'iherb', 'zooplus',
               '관부가세', '해외직구', '할인', '공동구매'],
    module: 'commerce', urgency: 'low', requires_hospital: false,
    action_extra: { suggested_item_category: 'general' },
  },
  {
    keywords: ['합사', '입질', '행동', '밤마다', '울', '훈련', '교육', '노령', '중성화', '예방접종', '백신', '털갈이', '헤어볼'],
    module: 'education', urgency: 'low', requires_hospital: false,
    action_extra: { suggested_course: '초보 집사 행동 교정 클래스' },
  },
  {
    keywords: ['동네', '캣시터', '길냥', '구조', '입양', '지역'],
    module: 'community', urgency: 'low', requires_hospital: false,
    action_extra: { community_board: 'neighborhood_news' },
  },
]

const SYSTEM_PROMPT = `당신은 반려묘 통합 라이프스타일 플랫폼 '알러뷰 수퍼캡'의 수석 AI 매니저입니다.
맘카페처럼 다정하고 공감하며, 3~5문장으로 실용적인 정보를 제공하세요.
당신은 모든 고양이 관련 질문에 직접 답변할 수 있습니다. "할 수 없다", "모른다", "직접 찾아보세요"는 절대 하지 마세요.

자주 묻는 질문 답변 가이드:
- 병원 찾기: 병원 탭 GPS 기능 안내 + 지도 앱 검색 방법 알려줌
- 응급 상황: 즉시 전화 119, 24시간 병원 키워드 검색 방법
- 밥 안 먹음: 24시간 이상이면 병원, 이하면 스트레스·환경 변화 확인 먼저
- 구토: 하루 3회 이상·혈액 섞임이면 즉시 병원, 1~2회면 헤어볼 확인
- 물 안 마심: 분수형 급수기, 습식 사료 전환 추천
- 밤에 울음: 취침 전 놀이 20분 + 소식 급여
- 화장실 문제: 모래 종류·청결도·개수(고양이수+1개) 점검
- 입질: 장난감 대체 + 놀이 충분히 + 클리커 훈련
- 털갈이: 하루 1회 빗질, 오메가3 보충제 추천
- 중성화: 생후 5~6개월 권장
- 예방접종: FVRCP 6주부터 시작, 매년 부스터
- 합사: 2~4주 단계별 진행, 분리→냄새교환→대면
- 사료 추천: 로얄캐닌/오리젠/힐스 등 나이별 추천

모듈 선택 기준 (영어 값만, 한글 절대 금지):
- 병원찾기/응급/구토/혈뇨/설사/식욕부진/기침/호흡 → "hospital", urgency_level: "high", requires_hospital: true
- 단순 생활 건강 질문 → "education", urgency_level: "low", requires_hospital: false
- 용품/사료/쇼핑 → "commerce", urgency_level: "low", requires_hospital: false
- 행동/교육/합사/훈련 → "education", urgency_level: "low", requires_hospital: false
- 지역/커뮤니티 → "community", urgency_level: "low", requires_hospital: false
- 일반 대화 → "chat", urgency_level: "low", requires_hospital: false

응답 마지막에 반드시 아래 형식 태그를 붙이세요 (한글 사용 금지):
[ACTION]{"intent":"hospital","recommended_module":"hospital","urgency_level":"low","requires_hospital":false}[/ACTION]`

function detectAction(message: string): SystemAction {
  for (const rule of RULES) {
    if (rule.keywords.some((k) => message.toLowerCase().includes(k.toLowerCase()))) {
      return {
        intent: rule.module,
        recommended_module: rule.module,
        urgency_level: rule.urgency,
        requires_hospital: rule.requires_hospital,
        ...rule.action_extra,
      }
    }
  }
  return { intent: 'mixed', recommended_module: 'chat', urgency_level: 'low', requires_hospital: false }
}

// FAQ에서 먼저 찾기 (API 키 없어도 상세 답변)
function faqLookup(message: string): { reply: string; action: SystemAction } | null {
  const msg = message.toLowerCase()
  for (const faq of FAQ) {
    if (faq.keywords.some((k) => msg.includes(k.toLowerCase()))) {
      return {
        reply: faq.reply,
        action: {
          intent: faq.module,
          recommended_module: faq.module,
          urgency_level: faq.urgency,
          requires_hospital: faq.hospital,
        },
      }
    }
  }
  return null
}

const VALID_MODULES: TabId[] = ['hospital', 'commerce', 'education', 'community', 'chat']
const VALID_URGENCY = ['low', 'medium', 'high', 'emergency']

const KOREAN_TO_MODULE: Record<string, TabId> = {
  '병원': 'hospital', '건강': 'hospital', '응급': 'hospital', 'health': 'hospital',
  '쇼핑': 'commerce', '커머스': 'commerce', '용품': 'commerce', '사료': 'commerce',
  '교육': 'education', '캡스쿨': 'education', '행동': 'education',
  '커뮤니티': 'community', '지역': 'community', '동네': 'community',
}

function normalizeModule(val: unknown): TabId {
  if (typeof val !== 'string') return 'chat'
  const v = val.toLowerCase().replace(/\s/g, '')
  if (VALID_MODULES.includes(v as TabId)) return v as TabId
  return KOREAN_TO_MODULE[v] ?? 'chat'
}

function normalizeUrgency(val: unknown): SystemAction['urgency_level'] {
  if (typeof val === 'string' && VALID_URGENCY.includes(val)) return val as SystemAction['urgency_level']
  return 'low'
}

function parseAction(raw: string): { text: string; action: SystemAction | null } {
  const match = raw.match(/\[ACTION\](.*?)\[\/ACTION\]/s)
  if (!match) return { text: raw.trim(), action: null }
  try {
    const parsed = JSON.parse(match[1])
    const module = normalizeModule(parsed.recommended_module ?? parsed.intent)
    const action: SystemAction = {
      intent: module,
      recommended_module: module,
      urgency_level: normalizeUrgency(parsed.urgency_level),
      requires_hospital: module === 'hospital' || parsed.requires_hospital === true,
    }
    const text = raw.replace(/\[ACTION\].*?\[\/ACTION\]/s, '').trim()
    return { text, action }
  } catch {
    return { text: raw.replace(/\[ACTION\].*?\[\/ACTION\]/s, '').trim(), action: null }
  }
}

export async function askAI(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<{ reply: string; action: SystemAction }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

  // API 키 없으면 FAQ → 키워드 폴백 순서로
  if (!apiKey) {
    const faq = faqLookup(message)
    if (faq) return faq
    return fallback(message)
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: message },
        ],
      }),
    })

    if (!res.ok) {
      const faq = faqLookup(message)
      return faq ?? fallback(message)
    }

    const data = await res.json()
    const raw: string = data.choices?.[0]?.message?.content ?? ''
    const { text, action } = parseAction(raw)

    return {
      reply: text || '죄송해요, 다시 한번 말씀해 주세요 😅',
      action: action ?? detectAction(message),
    }
  } catch {
    const faq = faqLookup(message)
    return faq ?? fallback(message)
  }
}

function fallback(message: string): { reply: string; action: SystemAction } {
  const action = detectAction(message)
  const replies: Record<string, string> = {
    hospital:  '병원 탭에서 GPS를 켜면 현재 위치 기준으로 네이버·카카오·구글 지도로 주변 동물병원을 바로 찾을 수 있어요! 🏥 병원 탭으로 이동해 볼까요?',
    commerce:  '쇼핑 탭에서 국내(펫프렌즈·쿠팡)·해외(Chewy·iHerb) 사이트와 카테고리별 추천 제품을 확인해보세요! 🛒',
    education: '고양이 행동은 이해하면 정말 재미있어요 😺 캡 스쿨에서 단계별 강의를 수강해보세요!',
    community: '동네 집사님들과 정보를 나눠보세요 🏘️ 커뮤니티 동네 소식통에서 직접 글을 올릴 수 있어요!',
  }
  return {
    reply: replies[action.recommended_module] ?? '고양이와 함께하는 일상, 무엇이든 편하게 물어보세요! 🐱 병원 찾기·증상·사료·행동 교정 모두 도와드릴게요.',
    action,
  }
}
