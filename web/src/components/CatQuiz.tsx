import { useState } from 'react'
import { X, RefreshCw, ShoppingBag, BookOpen } from 'lucide-react'
import type { TabId } from '../types'

// ── 설문 문항 ──────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'q1',
    text: '우리 냥이의 성격은요?',
    emoji: '😸',
    options: [
      { label: '활발하고 호기심 많음', value: 'active' },
      { label: '조용하고 내성적', value: 'calm' },
      { label: '사람을 좋아해요', value: 'social' },
      { label: '독립적인 스타일', value: 'independent' },
    ],
  },
  {
    id: 'q2',
    text: '집사님의 가장 큰 고민은요?',
    emoji: '🤔',
    options: [
      { label: '사료/간식 선택이 어려워요', value: 'food' },
      { label: '건강·질병이 걱정돼요', value: 'health' },
      { label: '행동 문제 (입질, 울음 등)', value: 'behavior' },
      { label: '용품 뭘 사야 할지 모르겠어요', value: 'product' },
    ],
  },
  {
    id: 'q3',
    text: '반려묘와 함께한 기간은요?',
    emoji: '📅',
    options: [
      { label: '6개월 미만 (초보 집사)', value: 'newbie' },
      { label: '1~3년 (중급 집사)', value: 'mid' },
      { label: '3년 이상 (베테랑 집사)', value: 'expert' },
      { label: '예비 집사예요!', value: 'future' },
    ],
  },
  {
    id: 'q4',
    text: '가장 자주 쓸 것 같은 기능은요?',
    emoji: '✨',
    options: [
      { label: '🤖 AI 챗봇 상담', value: 'chat' },
      { label: '🛒 쇼핑/공동구매', value: 'commerce' },
      { label: '🏥 병원 찾기', value: 'hospital' },
      { label: '📚 고양이 교육 강의', value: 'education' },
    ],
  },
  {
    id: 'q5',
    text: '한 달 반려묘 용품 지출은요?',
    emoji: '💰',
    options: [
      { label: '5만원 미만', value: 'low' },
      { label: '5~15만원', value: 'mid' },
      { label: '15~30만원', value: 'high' },
      { label: '30만원 이상', value: 'vhigh' },
    ],
  },
]

// ── 결과 타입 정의 ─────────────────────────────────────────────
interface ResultType {
  emoji: string
  title: string
  desc: string
  tips: string[]
  recommendTab: TabId
  products: string[]
}

function calcResult(answers: Record<string, string>): ResultType {
  const { q2, q3, q4 } = answers

  if (q2 === 'health' || q4 === 'hospital') {
    return {
      emoji: '🏥',
      title: '건강 수호 집사님',
      desc: '냥이 건강이 최우선! 정기검진과 빠른 병원 연결이 가장 중요해요.',
      tips: ['예방접종 일정 미리 체크하세요', '6개월마다 혈액 검사 추천', '응급증상 배너를 즐겨찾기해두세요'],
      recommendTab: 'hospital',
      products: ['관절 영양제', '면역 보조제', '스트레스 완화 페로몬'],
    }
  }
  if (q2 === 'behavior' || q3 === 'newbie' || q3 === 'future') {
    return {
      emoji: '📚',
      title: '배움이 필요한 초보 집사님',
      desc: '고양이 언어를 이해하면 함께하는 시간이 훨씬 풍요로워져요!',
      tips: ['캡 스쿨 "초보 집사 행동 교정" 강의 추천', '합사 전 반드시 격리 기간 필요', '입질은 어릴 때 잡아야 해요'],
      recommendTab: 'education',
      products: ['클리커 훈련 도구', '깃털 낚싯대', '페로몬 디퓨저'],
    }
  }
  if (q2 === 'food' || q2 === 'product') {
    return {
      emoji: '🛒',
      title: '쇼핑 고수 집사님',
      desc: '좋은 사료와 용품을 찾는 안목이 있는 집사님이에요!',
      tips: ['국내 펫프렌즈 vs 해외 Chewy 비교 추천', 'iHerb 영양제 직구 면세 한도 USD 150', '공동구매로 최대 40% 절감 가능'],
      recommendTab: 'commerce',
      products: ['그레인프리 습식 사료', '저먼지 두부 모래', '자동 급수기'],
    }
  }
  return {
    emoji: '🐾',
    title: '올라운드 집사님',
    desc: '모든 분야에 관심 많은 완벽한 집사님이에요!',
    tips: ['AI 챗봇으로 궁금증 즉시 해결', '커뮤니티에서 동네 집사님과 교류해요', '미니툴로 건강 체크 루틴 만들기'],
    recommendTab: 'chat',
    products: ['스마트 자동급식기', '체온계', '고양이 전용 칫솔'],
  }
}

interface Props {
  onNavigate: (tab: TabId) => void
}

export default function CatQuiz({ onNavigate }: Props) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ResultType | null>(null)

  function reset() {
    setCurrent(0)
    setAnswers({})
    setResult(null)
  }

  function answer(value: string) {
    const q = QUESTIONS[current]
    const next = { ...answers, [q.id]: value }
    setAnswers(next)
    if (current + 1 < QUESTIONS.length) {
      setCurrent(current + 1)
    } else {
      setResult(calcResult(next))
    }
  }

  const progress = ((current) / QUESTIONS.length) * 100

  return (
    <>
      {/* 트리거 카드 */}
      <button
        onClick={() => { setOpen(true); reset() }}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-brand-mint/20 to-brand-pink/10 border border-brand-mint/30 rounded-2xl p-3 text-left active:scale-95 transition-transform"
      >
        <span className="text-3xl">🐱</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-brand-dark">고양이 성향 테스트</p>
          <p className="text-xs text-gray-500">우리 냥이 맞춤 추천 받기 · 5문항</p>
        </div>
        <span className="text-xs bg-brand-pink text-white rounded-full px-2 py-0.5 font-semibold">START</span>
      </button>

      {/* 퀴즈 모달 */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div
            className="bg-white w-full max-w-[430px] rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-brand-dark">🐱 고양이 성향 테스트</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {!result ? (
              <>
                {/* 진행바 */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                  <div
                    className="bg-brand-pink h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mb-4">{current + 1} / {QUESTIONS.length}</p>

                {/* 문항 */}
                <div className="text-center mb-6">
                  <span className="text-5xl block mb-3">{QUESTIONS[current].emoji}</span>
                  <p className="text-base font-bold text-brand-dark">{QUESTIONS[current].text}</p>
                </div>

                {/* 선택지 */}
                <div className="space-y-2">
                  {QUESTIONS[current].options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => answer(opt.value)}
                      className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-100 text-sm font-medium text-brand-dark hover:border-brand-pink hover:bg-brand-pink/5 active:scale-95 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* 결과 화면 */
              <div>
                <div className="text-center py-4">
                  <span className="text-6xl block mb-3">{result.emoji}</span>
                  <p className="text-xl font-bold text-brand-dark">{result.title}</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{result.desc}</p>
                </div>

                {/* 맞춤 팁 */}
                <div className="bg-brand-mint/10 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-brand-dark mb-2">✅ 집사님 맞춤 꿀팁</p>
                  <ul className="space-y-1.5">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-brand-mint font-bold">·</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 추천 용품 */}
                <div className="bg-brand-pink/5 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-brand-dark mb-2">🛒 추천 용품</p>
                  <div className="flex flex-wrap gap-2">
                    {result.products.map((p, i) => (
                      <span key={i} className="text-xs bg-white border border-brand-pink/20 text-brand-dark rounded-full px-3 py-1">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 탭 이동 */}
                <button
                  onClick={() => { onNavigate(result.recommendTab); setOpen(false) }}
                  className="w-full bg-brand-pink text-white rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2 mb-2"
                >
                  {result.recommendTab === 'commerce' && <ShoppingBag size={16} />}
                  {result.recommendTab === 'education' && <BookOpen size={16} />}
                  추천 탭으로 이동하기
                </button>
                <button
                  onClick={reset}
                  className="w-full text-xs text-gray-400 py-2 flex items-center justify-center gap-1 hover:text-brand-pink transition-colors"
                >
                  <RefreshCw size={12} />
                  다시 테스트하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
