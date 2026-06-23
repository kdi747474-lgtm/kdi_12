import { useState } from 'react'
import { X } from 'lucide-react'

// ── 고양이 나이 계산기 ──────────────────────────────────────────
function CatAgeCalc() {
  const [year, setYear] = useState('')
  const currentYear = new Date().getFullYear()

  function calcHumanAge(birthYear: number) {
    const catAge = currentYear - birthYear
    if (catAge <= 0) return null
    if (catAge === 1) return 15
    if (catAge === 2) return 24
    return 24 + (catAge - 2) * 4
  }

  const catAge = year ? currentYear - Number(year) : null
  const humanAge = year ? calcHumanAge(Number(year)) : null

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="출생 연도 (예: 2020)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-mint"
        />
        {year && (
          <button onClick={() => setYear('')} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>
      {catAge !== null && humanAge !== null && catAge > 0 && (
        <div className="bg-brand-mint/10 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">🐱 고양이 나이 <span className="font-bold text-brand-dark">{catAge}살</span></p>
          <p className="text-2xl font-bold text-brand-mint mt-1">{humanAge}세</p>
          <p className="text-[10px] text-gray-400 mt-0.5">사람 나이로 환산</p>
          <p className="text-xs text-gray-500 mt-1.5">
            {humanAge < 20 ? '🐣 아기 고양이 — 풍부한 놀이와 사회화가 중요해요!'
             : humanAge < 40 ? '💪 활발한 성묘 — 정기 건강검진 1년에 1번 추천!'
             : humanAge < 60 ? '🌿 중년 고양이 — 체중과 관절 관리를 시작해요!'
             : '🧓 시니어 묘 — 6개월마다 검진, 관절·신장 케어가 필요해요!'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── 하루 사료량 계산기 ─────────────────────────────────────────
const FOOD_TYPES = [
  { label: '건식 (일반)', kcalPerG: 3.5, ratio: 0.04 },
  { label: '습식 (파우치)', kcalPerG: 0.9, ratio: 0.06 },
  { label: '건식 (고단백)', kcalPerG: 4.0, ratio: 0.035 },
]

function FoodCalc() {
  const [weight, setWeight] = useState('')
  const [typeIdx, setTypeIdx] = useState(0)
  const [neutered, setNeutered] = useState(true)

  const type = FOOD_TYPES[typeIdx]
  const w = parseFloat(weight)
  const amount = w > 0 ? Math.round(w * 1000 * type.ratio * (neutered ? 0.85 : 1)) : null

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="몸무게 (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-pink"
        />
        <select
          value={typeIdx}
          onChange={(e) => setTypeIdx(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none bg-white"
        >
          {FOOD_TYPES.map((t, i) => (
            <option key={i} value={i}>{t.label}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
        <input
          type="checkbox"
          checked={neutered}
          onChange={(e) => setNeutered(e.target.checked)}
          className="rounded"
        />
        중성화 완료 (15% 감량)
      </label>
      {amount !== null && w > 0 && (
        <div className="bg-brand-pink/10 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">하루 권장 사료량</p>
          <p className="text-2xl font-bold text-brand-pink mt-1">{amount}g</p>
          <p className="text-[10px] text-gray-400 mt-0.5">2~3회로 나눠 급여 권장</p>
          <p className="text-xs text-gray-500 mt-1.5">
            아침 {Math.round(amount * 0.4)}g · 저녁 {Math.round(amount * 0.6)}g
          </p>
        </div>
      )}
    </div>
  )
}

// ── 위험 음식 체크 ─────────────────────────────────────────────
const DANGER_FOODS: { keywords: string[]; level: 'danger' | 'caution'; msg: string }[] = [
  { keywords: ['양파', '파', '마늘', '부추', '대파', '쪽파'], level: 'danger', msg: '🚨 절대 금지! 적혈구를 파괴해 빈혈을 유발합니다.' },
  { keywords: ['초콜릿', '코코아', '카카오'], level: 'danger', msg: '🚨 절대 금지! 테오브로민 성분이 심장·신경계에 치명적입니다.' },
  { keywords: ['포도', '건포도'], level: 'danger', msg: '🚨 절대 금지! 신부전을 유발할 수 있어요.' },
  { keywords: ['자일리톨', '껌', '사탕'], level: 'danger', msg: '🚨 절대 금지! 저혈당·간 손상을 유발합니다.' },
  { keywords: ['알코올', '술', '맥주', '소주'], level: 'danger', msg: '🚨 절대 금지! 극소량도 치명적입니다.' },
  { keywords: ['날달걀', '날계란'], level: 'caution', msg: '⚠️ 주의! 살모넬라 위험. 완전히 익혀서 소량만 가능해요.' },
  { keywords: ['우유', '치즈', '유제품'], level: 'caution', msg: '⚠️ 주의! 유당불내증으로 설사할 수 있어요. 고양이 전용 우유는 OK.' },
  { keywords: ['날생선', '참치', '날 연어'], level: 'caution', msg: '⚠️ 주의! 날것은 기생충 위험. 익힌 생선은 소량 OK.' },
  { keywords: ['카페인', '커피', '녹차', '홍차'], level: 'caution', msg: '⚠️ 주의! 심장·신경계에 부담을 줄 수 있어요.' },
  { keywords: ['닭', '참치캔', '연어', '고등어', '소고기'], level: 'danger', msg: '✅ 안전해요! 익힌 살코기는 훌륭한 단백질 간식이에요. (양념 없이)' },
]
DANGER_FOODS[DANGER_FOODS.length - 1].level = 'caution' as 'caution'

const SAFE_FOODS = ['닭', '참치캔', '연어', '고등어', '소고기', '호박', '당근', '브로콜리', '블루베리']

function FoodCheck() {
  const [query, setQuery] = useState('')

  const result = query.trim()
    ? DANGER_FOODS.find((f) => f.keywords.some((k) => query.includes(k)))
    : null

  const isSafe = query.trim() && !result && SAFE_FOODS.some((s) => query.includes(s))

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="음식 이름 입력 (예: 양파, 초콜릿, 닭)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-amber"
      />
      {result && (
        <div className={`rounded-xl p-3 text-sm ${
          result.level === 'danger' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`}>
          {result.msg}
        </div>
      )}
      {isSafe && (
        <div className="rounded-xl p-3 text-sm bg-green-50 border border-green-200 text-green-700">
          ✅ 안전해요! 익혀서 소량씩 주면 좋은 간식이에요.
        </div>
      )}
      {query.trim() && !result && !isSafe && (
        <div className="rounded-xl p-3 text-sm bg-gray-50 border border-gray-200 text-gray-500">
          ℹ️ 데이터가 없어요. 확실하지 않은 음식은 수의사에게 확인해 주세요.
        </div>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
const TOOLS = [
  { id: 'age',  emoji: '🎂', label: '나이 계산기',  sub: '사람 나이 환산',  color: 'border-brand-mint/40 bg-brand-mint/5',   Component: CatAgeCalc },
  { id: 'food', emoji: '🍽️', label: '사료량 계산기', sub: '몸무게별 권장량', color: 'border-brand-pink/40 bg-brand-pink/5',   Component: FoodCalc },
  { id: 'safe', emoji: '⚠️', label: '위험 음식 체크', sub: '먹여도 될까요?',  color: 'border-brand-amber/40 bg-brand-amber/5', Component: FoodCheck },
]

export default function MiniTools() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="px-4 pt-3 pb-1">
      <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">생활 도구</p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setOpen(open === t.id ? null : t.id)}
            className={`border rounded-2xl p-2.5 text-left transition-all ${t.color} ${open === t.id ? 'ring-1 ring-brand-pink/30' : ''}`}
          >
            <span className="text-xl block mb-1">{t.emoji}</span>
            <p className="text-[11px] font-semibold text-brand-dark leading-tight">{t.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t.sub}</p>
          </button>
        ))}
      </div>
      {open && (() => {
        const tool = TOOLS.find((t) => t.id === open)!
        return (
          <div className={`border rounded-2xl p-3 mb-2 ${tool.color}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-brand-dark">{tool.emoji} {tool.label}</p>
              <button onClick={() => setOpen(null)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
            <tool.Component />
          </div>
        )
      })()}
    </div>
  )
}
