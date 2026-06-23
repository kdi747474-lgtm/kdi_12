import type { SystemAction, TabId } from '../types'

interface Rule {
  keywords: string[]
  module: TabId
  urgency: SystemAction['urgency_level']
  requires_hospital: boolean
  action_extra?: Partial<SystemAction>
}

const RULES: Rule[] = [
  {
    keywords: ['구토', '토를', '토해', '혈뇨', '피', '식욕', '안 먹', '설사', '기침', '경련', '호흡'],
    module: 'hospital',
    urgency: 'high',
    requires_hospital: true,
  },
  {
    keywords: ['사료', '모래', '장난감', '캣타워', '공구', '용품', '스크래처', '화장실'],
    module: 'commerce',
    urgency: 'low',
    requires_hospital: false,
    action_extra: { suggested_item_category: 'general' },
  },
  {
    keywords: ['합사', '입질', '행동', '밤마다', '울', '훈련', '교육', '노령', '노묘', '아기 고양이'],
    module: 'education',
    urgency: 'low',
    requires_hospital: false,
    action_extra: { suggested_course: '초보 집사 행동 교정 클래스' },
  },
  {
    keywords: ['동네', '캣시터', '길냥', '구조', '입양', '지역'],
    module: 'community',
    urgency: 'low',
    requires_hospital: false,
    action_extra: { community_board: 'neighborhood_news' },
  },
  {
    keywords: ['폐기', '버리', '친환경', '구독', '재활용'],
    module: 'hospital',
    urgency: 'low',
    requires_hospital: false,
  },
]

const SYSTEM_PROMPT = `당신은 반려묘 통합 라이프스타일 플랫폼 '알러뷰 수퍼캡'의 수석 AI 매니저입니다.
맘카페처럼 다정하고 공감하며, 3~5문장으로 실용적인 정보를 제공하세요.

자주 묻는 질문 답변 가이드:
- 밥 안 먹음: 24시간 이상이면 병원, 이하면 스트레스·환경 변화 확인 먼저
- 물 안 마심: 습식 사료 전환, 분수형 급수기 추천
- 밤에 울음: 사냥 놀이 충분히 + 자기 전 습식 사료 급여 루틴 제안
- 화장실 문제: 모래 종류·청결도·개수(고양이수+1개) 점검
- 입질: 놀이 입질(정상)과 공격성 입질 구분 후 긍정 강화 설명
- 털갈이: 하루 1회 빗질, 오메가3 보충제 추천
- 중성화: 생후 5~6개월 권장, 암컷은 첫 발정 전이 이상적
- 예방접종: 종합백신(FVRCP) 매년, 광견병 지역에 따라

모듈 선택 기준 (영어 값만, 한글 절대 금지):
- 건강 이상(구토, 혈뇨, 설사, 식욕부진, 기침, 호흡 곤란) → "hospital", urgency_level: "high", requires_hospital: true
- 단순 생활 건강 질문(물, 밥 조금, 털갈이) → "education", urgency_level: "low", requires_hospital: false
- 용품/사료/모래/장난감/공구 → "commerce", urgency_level: "low", requires_hospital: false
- 행동/교육/합사/훈련/중성화/예방접종 → "education", urgency_level: "low", requires_hospital: false
- 지역/커뮤니티/캣시터 → "community", urgency_level: "low", requires_hospital: false
- 일반 대화 → "chat", urgency_level: "low", requires_hospital: false

응답 마지막에 반드시 아래 형식 태그를 붙이세요 (한글 사용 금지):
[ACTION]{"intent":"education","recommended_module":"education","urgency_level":"low","requires_hospital":false}[/ACTION]`

function detectAction(message: string): SystemAction {
  for (const rule of RULES) {
    if (rule.keywords.some((k) => message.includes(k))) {
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

const VALID_MODULES: TabId[] = ['hospital', 'commerce', 'education', 'community', 'chat']
const VALID_URGENCY = ['low', 'medium', 'high', 'emergency']

// 한글 intent → TabId 매핑 (GPT 오답 교정)
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

// OpenAI API 호출
export async function askAI(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<{ reply: string; action: SystemAction }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

  // API 키 없으면 키워드 폴백
  if (!apiKey) return fallback(message)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
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

    if (!res.ok) return fallback(message)

    const data = await res.json()
    const raw: string = data.choices?.[0]?.message?.content ?? ''
    const { text, action } = parseAction(raw)

    return {
      reply: text || '죄송해요, 다시 한번 말씀해 주세요 😅',
      action: action ?? detectAction(message),
    }
  } catch {
    return fallback(message)
  }
}

function fallback(message: string): { reply: string; action: SystemAction } {
  const action = detectAction(message)
  const replies: Record<string, string> = {
    hospital:  '집사님, 말씀하신 증상은 꼭 확인이 필요해요 🏥 자가 진단보다는 빠르게 가까운 24시간 동물병원을 방문해 주세요.',
    commerce:  '좋은 선택 고민 중이시군요! 🛒 알러뷰 캡에서 해외 트렌드 상품과 공동구매를 확인해보세요!',
    education: '고양이 행동은 이해하면 정말 재미있어요 😺 캡 스쿨에서 단계별 강의를 수강해보세요!',
    community: '동네 정보는 동네 집사님들이 제일 잘 아시죠 🏘️ 커뮤니티 동네 소식통에서 나눠보세요!',
  }
  return {
    reply: replies[action.recommended_module] ?? '고양이와 함께하는 일상 고민이 있으시면 편하게 말씀해 주세요! 🐱',
    action,
  }
}
