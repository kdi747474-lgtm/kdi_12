import { useState, useRef } from 'react'
import { X, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'

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
// 순서 중요: 위험(danger) → 주의(caution) → 안전(safe) 순으로 배치
// 부분 문자열 오탐 방지를 위해 구체적인 키워드를 먼저 배치

const DANGER_FOODS: { keywords: string[]; level: 'danger' | 'caution' | 'safe'; msg: string }[] = [
  // ── 절대 금지 (danger) ──
  { keywords: ['양파', '대파', '쪽파', '파', '마늘', '부추'], level: 'danger',
    msg: '🚨 절대 금지! 파/마늘류는 적혈구를 파괴해 빈혈을 유발합니다.' },
  { keywords: ['초콜릿', '코코아', '카카오'], level: 'danger',
    msg: '🚨 절대 금지! 테오브로민이 심장·신경계에 치명적입니다.' },
  { keywords: ['포도', '건포도', '청포도', '적포도'], level: 'danger',
    msg: '🚨 절대 금지! 소량도 신부전을 유발할 수 있어요.' },
  { keywords: ['자일리톨'], level: 'danger',
    msg: '🚨 절대 금지! 저혈당·간 손상을 유발합니다.' },
  { keywords: ['알코올', '맥주', '소주', '술'], level: 'danger',
    msg: '🚨 절대 금지! 극소량도 치명적입니다.' },
  { keywords: ['아보카도'], level: 'danger',
    msg: '🚨 절대 금지! 퍼신(persin) 성분이 구토·호흡곤란을 유발합니다.' },
  { keywords: ['날달걀', '날계란', '생달걀', '생계란'], level: 'caution',
    msg: '⚠️ 주의! 살모넬라 위험. 완전히 익혀서 소량만 가능해요.' },
  // ── 주의 (caution) ──
  { keywords: ['우유', '유제품'], level: 'caution',
    msg: '⚠️ 주의! 유당불내증으로 설사할 수 있어요. 고양이 전용 우유는 OK.' },
  { keywords: ['날생선', '생선회', '날연어', '생연어'], level: 'caution',
    msg: '⚠️ 주의! 날생선은 기생충·비타민B1 분해 효소 위험. 익힌 생선은 소량 OK.' },
  { keywords: ['참치캔'], level: 'caution',
    msg: '⚠️ 주의! 참치캔(사람용)은 염분·수은 과다. 고양이 전용 참치 간식 사용 권장.' },
  { keywords: ['카페인', '커피', '녹차', '홍차'], level: 'caution',
    msg: '⚠️ 주의! 심장·신경계에 부담을 줄 수 있어요.' },
  { keywords: ['치즈'], level: 'caution',
    msg: '⚠️ 주의! 유당 함량 높음. 소량만, 민감한 고양이는 피하세요.' },
  // ── 안전 (safe) — 구체적 키워드로 오탐 방지 ──
  { keywords: ['닭가슴살', '익힌 닭', '삶은 닭', '닭고기'], level: 'safe',
    msg: '✅ 안전해요! 익힌 닭가슴살은 훌륭한 단백질 간식이에요. (양념 없이)' },
  { keywords: ['연어', '고등어', '익힌 생선'], level: 'safe',
    msg: '✅ 안전해요! 익힌 생선은 소량 급여 가능해요. (양념·소금 없이)' },
  { keywords: ['소고기', '돼지고기'], level: 'safe',
    msg: '✅ 안전해요! 완전히 익힌 살코기는 소량 OK. 기름기 많은 부위는 피하세요.' },
  { keywords: ['호박', '단호박'], level: 'safe',
    msg: '✅ 안전해요! 익힌 호박은 소화에 좋고 변비 개선에 도움이 돼요.' },
  { keywords: ['당근'], level: 'safe',
    msg: '✅ 안전해요! 익힌 당근 소량은 괜찮아요.' },
  { keywords: ['블루베리'], level: 'safe',
    msg: '✅ 안전해요! 항산화 간식으로 소량 가능해요.' },
]

function FoodCheck() {
  const [query, setQuery] = useState('')

  // 정확한 키워드 우선 매칭 (긴 키워드 먼저)
  const result = query.trim()
    ? DANGER_FOODS.find((f) =>
        f.keywords.some((k) => query.toLowerCase().includes(k.toLowerCase()))
      )
    : null

  const isSafe = result?.level === 'safe'
  const isDanger = result?.level === 'danger'
  const isCaution = result?.level === 'caution'

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="음식 이름 입력 (예: 양파, 초콜릿, 닭)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-amber"
      />
      {result && isSafe && (
        <div className="rounded-xl p-3 text-sm bg-green-50 border border-green-200 text-green-700">
          {result.msg}
        </div>
      )}
      {result && isCaution && (
        <div className="rounded-xl p-3 text-sm bg-yellow-50 border border-yellow-200 text-yellow-700">
          {result.msg}
        </div>
      )}
      {result && isDanger && (
        <div className="rounded-xl p-3 text-sm bg-red-50 border border-red-200 text-red-700">
          {result.msg}
        </div>
      )}
      {query.trim() && !result && (
        <div className="rounded-xl p-3 text-sm bg-gray-50 border border-gray-200 text-gray-500">
          ℹ️ 데이터가 없어요. 확실하지 않은 음식은 수의사에게 먼저 확인해 주세요.
        </div>
      )}
    </div>
  )
}

// ── 관부가세 계산기 ────────────────────────────────────────────
const EXCHANGE_RATE = 1380 // 고정 환율 (USD → KRW 참고용)
const DUTY_RATES: { label: string; dutyRate: number; vatBase: number }[] = [
  { label: '사료 / 간식',     dutyRate: 0.08, vatBase: 0.10 },
  { label: '영양제 / 보조제', dutyRate: 0.06, vatBase: 0.10 },
  { label: '장난감 / 용품',   dutyRate: 0.08, vatBase: 0.10 },
  { label: '의류 / 캐리어',   dutyRate: 0.13, vatBase: 0.10 },
]

function DutyCalc() {
  const [usd, setUsd] = useState('')
  const [catIdx, setCatIdx] = useState(0)
  const [shipping, setShipping] = useState('15')

  const price = parseFloat(usd) || 0
  const ship  = parseFloat(shipping) || 0
  const cat   = DUTY_RATES[catIdx]
  const totalUsd = price + ship
  const totalKrw = Math.round(totalUsd * EXCHANGE_RATE)
  const exempt   = totalUsd <= 150

  const dutyBase = Math.round(price * EXCHANGE_RATE)
  const duty     = exempt ? 0 : Math.round(dutyBase * cat.dutyRate)
  const vatBase  = dutyBase + duty
  const vat      = exempt ? 0 : Math.round(vatBase * cat.vatBase)
  const grandTotal = totalKrw + duty + vat

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="상품가 (USD)"
          value={usd}
          onChange={(e) => setUsd(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-300"
        />
        <input
          type="number"
          placeholder="배송비"
          value={shipping}
          onChange={(e) => setShipping(e.target.value)}
          className="w-20 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-300"
        />
      </div>
      <select
        value={catIdx}
        onChange={(e) => setCatIdx(Number(e.target.value))}
        className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white"
      >
        {DUTY_RATES.map((d, i) => (
          <option key={i} value={i}>{d.label} (관세 {d.dutyRate * 100}%)</option>
        ))}
      </select>
      {price > 0 && (
        <div className={`rounded-xl p-3 text-xs space-y-1.5 ${exempt ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`font-bold text-sm text-center mb-2 ${exempt ? 'text-green-700' : 'text-blue-700'}`}>
            {exempt ? '✅ 면세 대상 (USD 150 이하)' : '💰 관부가세 발생'}
          </p>
          <div className="flex justify-between text-gray-600">
            <span>상품가</span><span>USD {price.toFixed(2)} ≈ {(price * EXCHANGE_RATE).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>배송비</span><span>USD {ship.toFixed(2)} ≈ {(ship * EXCHANGE_RATE).toLocaleString()}원</span>
          </div>
          {!exempt && (
            <>
              <div className="border-t border-gray-200 pt-1.5 flex justify-between text-gray-600">
                <span>관세 ({cat.dutyRate * 100}%)</span><span>+{duty.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>부가세 (10%)</span><span>+{vat.toLocaleString()}원</span>
              </div>
            </>
          )}
          <div className="border-t border-gray-300 pt-1.5 flex justify-between font-bold text-brand-dark">
            <span>총 예상 금액</span><span>{grandTotal.toLocaleString()}원</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center pt-0.5">환율 {EXCHANGE_RATE}원/USD 기준 · 실제와 다를 수 있음</p>
        </div>
      )}
    </div>
  )
}

// ── 체중 변화 그래프 ───────────────────────────────────────────
const WEIGHT_KEY = 'supercap_weight_log'

interface WeightEntry { date: string; weight: number }

function loadWeights(): WeightEntry[] {
  try { return JSON.parse(localStorage.getItem(WEIGHT_KEY) ?? '[]') } catch { return [] }
}

function WeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>(loadWeights)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addEntry() {
    const w = parseFloat(input)
    if (!w || w < 0.5 || w > 20) return
    const today = new Date().toISOString().slice(0, 10)
    const next = [...entries.filter((e) => e.date !== today), { date: today, weight: w }]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
    setEntries(next)
    localStorage.setItem(WEIGHT_KEY, JSON.stringify(next))
    setInput('')
    inputRef.current?.focus()
  }

  function removeEntry(date: string) {
    const next = entries.filter((e) => e.date !== date)
    setEntries(next)
    localStorage.setItem(WEIGHT_KEY, JSON.stringify(next))
  }

  // SVG 미니 라인 차트
  function renderChart() {
    if (entries.length < 2) return null
    const W = 280, H = 80, PAD = 8
    const weights = entries.map((e) => e.weight)
    const minW = Math.min(...weights) - 0.1
    const maxW = Math.max(...weights) + 0.1
    const points = entries.map((e, i) => {
      const x = PAD + (i / (entries.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((e.weight - minW) / (maxW - minW)) * (H - PAD * 2)
      return `${x},${y}`
    })
    const lastTwo = entries.slice(-2)
    const trend = lastTwo[1].weight - lastTwo[0].weight

    return (
      <div className="mt-2 bg-white rounded-xl p-2 border border-gray-100">
        <div className="flex items-center justify-between mb-1 px-1">
          <p className="text-[10px] font-semibold text-gray-500">최근 {entries.length}회 기록</p>
          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${
            trend < -0.05 ? 'text-blue-500' : trend > 0.05 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend < -0.05 ? <TrendingDown size={11} /> : trend > 0.05 ? <TrendingUp size={11} /> : <Minus size={11} />}
            {trend > 0 ? '+' : ''}{trend.toFixed(2)}kg
          </span>
        </div>
        <svg width={W} height={H} className="w-full">
          {/* 그리드 라인 */}
          {[0.25, 0.5, 0.75].map((r) => (
            <line key={r} x1={PAD} y1={PAD + r * (H - PAD * 2)} x2={W - PAD} y2={PAD + r * (H - PAD * 2)}
              stroke="#f3f4f6" strokeWidth={1} />
          ))}
          {/* 면적 */}
          <polygon
            points={`${PAD},${H - PAD} ${points.join(' ')} ${W - PAD},${H - PAD}`}
            fill="rgba(236,72,153,0.08)"
          />
          {/* 선 */}
          <polyline points={points.join(' ')} fill="none" stroke="#ec4899" strokeWidth={2} strokeLinejoin="round" />
          {/* 점 */}
          {points.map((pt, i) => {
            const [cx, cy] = pt.split(',').map(Number)
            return <circle key={i} cx={cx} cy={cy} r={3} fill="#ec4899" />
          })}
        </svg>
        <div className="flex justify-between px-1 mt-0.5">
          <span className="text-[9px] text-gray-400">{entries[0].date.slice(5)}</span>
          <span className="text-[9px] text-gray-400">{entries[entries.length - 1].date.slice(5)}</span>
        </div>
      </div>
    )
  }

  const latest = entries[entries.length - 1]

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="number"
          step="0.1"
          placeholder="오늘 체중 (kg, 예: 4.3)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addEntry()}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-300"
        />
        <button
          onClick={addEntry}
          className="bg-purple-500 text-white text-xs rounded-xl px-3 font-semibold hover:bg-purple-600 active:scale-95 transition-all"
        >
          기록
        </button>
      </div>

      {latest && (
        <div className="flex items-center justify-between bg-purple-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-500">최근 체중</p>
          <p className="text-lg font-bold text-purple-600">{latest.weight} kg</p>
          <p className="text-[10px] text-gray-400">{latest.date.slice(5)}</p>
        </div>
      )}

      {renderChart()}

      {entries.length > 0 && (
        <div className="space-y-1 max-h-28 overflow-y-auto">
          {[...entries].reverse().slice(0, 7).map((e) => (
            <div key={e.date} className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-400">{e.date}</span>
              <span className="font-semibold text-brand-dark">{e.weight} kg</span>
              <button onClick={() => removeEntry(e.date)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">아직 기록이 없어요. 오늘 첫 기록을 남겨보세요!</p>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
const TOOLS = [
  { id: 'age',  emoji: '🎂', label: '나이 계산기',   sub: '사람 나이 환산',  color: 'border-brand-mint/40 bg-brand-mint/5',   Component: CatAgeCalc },
  { id: 'food', emoji: '🍽️', label: '사료량 계산기', sub: '몸무게별 권장량', color: 'border-brand-pink/40 bg-brand-pink/5',   Component: FoodCalc },
  { id: 'safe', emoji: '⚠️', label: '위험 음식 체크', sub: '먹여도 될까요?', color: 'border-brand-amber/40 bg-brand-amber/5', Component: FoodCheck },
  { id: 'duty',   emoji: '✈️', label: '관부가세 계산기', sub: '직구 세금 확인',   color: 'border-blue-200/60 bg-blue-50/50',      Component: DutyCalc },
  { id: 'weight', emoji: '⚖️', label: '체중 그래프',    sub: '날짜별 체중 기록', color: 'border-purple-200/60 bg-purple-50/50',  Component: WeightTracker },
]

export default function MiniTools() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="px-4 pt-3 pb-1">
      <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">생활 도구</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
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
