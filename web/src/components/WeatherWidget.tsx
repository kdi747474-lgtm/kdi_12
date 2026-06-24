import { useState, useCallback } from 'react'
import { LocateFixed, Loader2, RefreshCw, Thermometer, Droplets, Wind, CloudRain, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react'

// ── Open-Meteo WMO 날씨 코드 ────────────────────────────────────
const WMO: Record<number, { label: string; icon: string; rain: boolean; snow: boolean; severe: boolean }> = {
  0:  { label: '맑음',         icon: '☀️',  rain: false, snow: false, severe: false },
  1:  { label: '대체로 맑음',  icon: '🌤️', rain: false, snow: false, severe: false },
  2:  { label: '구름 조금',    icon: '⛅',  rain: false, snow: false, severe: false },
  3:  { label: '흐림',         icon: '☁️',  rain: false, snow: false, severe: false },
  45: { label: '안개',         icon: '🌫️', rain: false, snow: false, severe: false },
  48: { label: '안개(결빙)',   icon: '🌫️', rain: false, snow: false, severe: true  },
  51: { label: '이슬비',       icon: '🌦️', rain: true,  snow: false, severe: false },
  53: { label: '이슬비',       icon: '🌦️', rain: true,  snow: false, severe: false },
  55: { label: '강한 이슬비',  icon: '🌧️', rain: true,  snow: false, severe: false },
  61: { label: '비',           icon: '🌧️', rain: true,  snow: false, severe: false },
  63: { label: '비',           icon: '🌧️', rain: true,  snow: false, severe: false },
  65: { label: '강한 비',      icon: '🌧️', rain: true,  snow: false, severe: true  },
  71: { label: '눈',           icon: '🌨️', rain: false, snow: true,  severe: false },
  73: { label: '눈',           icon: '❄️',  rain: false, snow: true,  severe: false },
  75: { label: '강한 눈',      icon: '🌨️', rain: false, snow: true,  severe: true  },
  80: { label: '소나기',       icon: '🌦️', rain: true,  snow: false, severe: false },
  81: { label: '소나기',       icon: '🌧️', rain: true,  snow: false, severe: false },
  82: { label: '강한 소나기',  icon: '⛈️', rain: true,  snow: false, severe: true  },
  95: { label: '천둥번개',     icon: '⛈️', rain: true,  snow: false, severe: true  },
  96: { label: '우박',         icon: '⛈️', rain: true,  snow: false, severe: true  },
  99: { label: '우박(강)',     icon: '⛈️', rain: true,  snow: false, severe: true  },
}

function getWmo(code: number) {
  return WMO[code] ?? { label: '알 수 없음', icon: '🌀', rain: false, snow: false, severe: false }
}

// ── 고양이 날씨별 옷차림 추천 ─────────────────────────────────
function getCatOutfit(temp: number, rain: boolean, snow: boolean): { emoji: string; title: string; desc: string; color: string } {
  if (temp < 0) return {
    emoji: '🧥', title: '두꺼운 방한복 필수!',
    desc: '영하 날씨예요. 두꺼운 고양이 방한복 착용, 이동장 안에 두꺼운 담요 깔아주세요. 핫팩은 직접 접촉 금지 (화상 위험)!',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
  }
  if (temp < 8) return {
    emoji: '🧣', title: '가벼운 겨울 옷 추천',
    desc: '꽤 쌀쌀해요. 고양이 가디건이나 스웨터 착용, 이동장에 담요 필수. 빠르게 이동해 추위 노출을 줄여주세요.',
    color: 'bg-sky-100 border-sky-300 text-sky-800',
  }
  if (temp < 15) return {
    emoji: '🐱', title: '얇은 옷 or 그냥 OK',
    desc: '조금 쌀쌀해요. 단모종이거나 병원 외출이라면 얇은 겉옷 추천. 이동 중 바람 막아주세요.',
    color: 'bg-teal-100 border-teal-300 text-teal-800',
  }
  if (temp < 25) return {
    emoji: '😸', title: '최적 온도! 옷 없어도 OK',
    desc: '고양이에게 가장 쾌적한 온도예요. 특별한 옷차림 없이 평소대로 외출해도 됩니다.',
    color: 'bg-green-100 border-green-300 text-green-800',
  }
  if (temp < 32) return {
    emoji: '🌡️', title: '더위 주의 — 통풍 중요!',
    desc: '고양이는 더위를 잘 못 견뎌요. 통풍 좋은 이동장 사용, 쿨링 매트 깔기, 물 충분히 챙기기. 뜨거운 차 안 방치 절대 금지!',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
  }
  return {
    emoji: '🚨', title: '폭염 경고! 외출 최소화',
    desc: '열사병 위험 온도예요. 꼭 필요한 외출만! 이동장은 통풍형, 냉기팩(천으로 감싸기), 물 자주 제공. 이동 시간 10분 이내로.',
    color: 'bg-red-100 border-red-300 text-red-800',
  }
}

// ── 외출 준비물 체크리스트 ─────────────────────────────────────
interface CheckItem { id: string; text: string; extra?: string; cond?: boolean }

function getChecklist(temp: number, rain: boolean, snow: boolean, severe: boolean, purpose: string): CheckItem[] {
  const base: CheckItem[] = [
    { id: 'carrier',  text: '이동장 (안전벨트·잠금 확인)' },
    { id: 'pad',      text: '이동장 패드 (흡수·미끄럼 방지)' },
    { id: 'snack',    text: '좋아하는 간식 (진정 용도)' },
    { id: 'record',   text: '의료 기록 수첩 (기존 질병·약 정보)' },
    { id: 'water',    text: '물 (소형 급수기 또는 물통)' },
    { id: 'poop',     text: '배변 패드 여분 (이동장 안)' },
  ]

  const byTemp: CheckItem[] = temp < 8
    ? [
        { id: 'blanket', text: '두꺼운 담요 (이동장 내 보온)', extra: '❄️ 추워요!' },
        { id: 'outfit',  text: '고양이 방한복 or 스웨터', extra: '❄️ 추워요!' },
      ]
    : temp >= 28
    ? [
        { id: 'cooling', text: '쿨링 매트 or 냉기팩 (천 감싸기)', extra: '🌡️ 더워요!' },
        { id: 'ventile', text: '통풍 이동장 확인 (메쉬형 권장)', extra: '🌡️ 더워요!' },
      ]
    : []

  const byRain: CheckItem[] = rain
    ? [
        { id: 'raincover', text: '이동장 방수 커버 or 우산', extra: '🌧️ 비 예보' },
        { id: 'towel',     text: '여분 수건 2장', extra: '🌧️ 비 예보' },
        { id: 'dryer',     text: '귀가 후 드라이어 준비 (저온)', extra: '🌧️ 비 예보' },
      ]
    : []

  const bySnow: CheckItem[] = snow
    ? [
        { id: 'snowtaxi', text: '택시/차 이용 (대중교통 최소화)', extra: '❄️ 눈!' },
        { id: 'quickmove', text: '이동 시간 최대한 단축', extra: '❄️ 눈!' },
      ]
    : []

  const byPurpose: CheckItem[] = purpose === 'vet'
    ? [
        { id: 'vacbook', text: '예방접종 기록지' },
        { id: 'sample',  text: '소변/변 샘플 (필요시, 냉장 보관)' },
        { id: 'meds',    text: '복용 중인 약 챙기기' },
      ]
    : purpose === 'school'
    ? [
        { id: 'fav',    text: '좋아하는 장난감 1개 (긴장 완화)' },
        { id: 'blanket2', text: '집 냄새 나는 담요 or 옷' },
        { id: 'photo',  text: '백신 접종 증명서 (입학 필수)' },
      ]
    : []

  return [...base, ...byTemp, ...byRain, ...bySnow, ...byPurpose]
}

// ── 날씨 데이터 타입 ──────────────────────────────────────────
interface DayWeather {
  date: string
  label: string
  code: number
  tempMax: number
  tempMin: number
  precipProb: number
}

interface WeatherData {
  cityName: string
  current: { temp: number; windspeed: number; code: number }
  days: DayWeather[]
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function WeatherWidget() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [purpose, setPurpose] = useState<'vet' | 'school' | 'walk'>('vet')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [showChecklist, setShowChecklist] = useState(false)
  const [activeDayIdx, setActiveDayIdx] = useState(0)

  const fetchWeather = useCallback(async () => {
    if (!navigator.geolocation) {
      setErrorMsg('GPS를 지원하지 않는 브라우저예요.')
      setState('error')
      return
    }
    setState('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          // Open-Meteo 날씨 API (무료, API키 불필요)
          const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
            `&current_weather=true` +
            `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
            `&timezone=Asia%2FSeoul&forecast_days=3`

          const [weatherRes, geoRes] = await Promise.allSettled([
            fetch(weatherUrl),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`, {
              headers: { 'User-Agent': 'supercap-cat-app/1.0' },
            }),
          ])

          if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) throw new Error('날씨 데이터를 불러오지 못했어요')
          const wData = await weatherRes.value.json()

          let cityName = `${lat.toFixed(2)}, ${lng.toFixed(2)}`
          if (geoRes.status === 'fulfilled' && geoRes.value.ok) {
            const gData = await geoRes.value.json()
            const addr = gData.address
            cityName = addr.city || addr.town || addr.county || addr.state || cityName
          }

          const daily = wData.daily
          const days: DayWeather[] = daily.time.map((dateStr: string, i: number) => {
            const dayNames = ['오늘', '내일', '모레']
            return {
              date: dateStr,
              label: dayNames[i] ?? dateStr,
              code: daily.weathercode[i],
              tempMax: Math.round(daily.temperature_2m_max[i]),
              tempMin: Math.round(daily.temperature_2m_min[i]),
              precipProb: daily.precipitation_probability_max[i] ?? 0,
            }
          })

          setWeather({
            cityName,
            current: {
              temp: Math.round(wData.current_weather.temperature),
              windspeed: Math.round(wData.current_weather.windspeed),
              code: wData.current_weather.weathercode,
            },
            days,
          })
          setChecked({})
          setState('done')
        } catch (e: unknown) {
          setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류')
          setState('error')
        }
      },
      (err) => {
        setErrorMsg(err.code === 1 ? 'GPS 권한이 거부되었어요. 브라우저 설정에서 위치 허용 후 다시 시도해 주세요.' : 'GPS 오류가 발생했어요.')
        setState('error')
      },
      { timeout: 10000, enableHighAccuracy: false },
    )
  }, [])

  function toggleCheck(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // ── 렌더 ─────────────────────────────────────────────────────
  return (
    <div className="mx-4 mb-3">
      <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border border-blue-200 rounded-2xl overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌤️</span>
            <div>
              <p className="text-sm font-bold text-brand-dark">날씨 & 외출 준비</p>
              <p className="text-[10px] text-gray-400">현재 날씨 기반 냥이 옷차림 + 체크리스트</p>
            </div>
          </div>
          {state === 'done' && (
            <button onClick={fetchWeather} className="text-blue-400 hover:text-blue-600 transition-colors">
              <RefreshCw size={14} />
            </button>
          )}
        </div>

        <div className="px-4 py-3 space-y-3">

          {/* IDLE */}
          {state === 'idle' && (
            <button
              onClick={fetchWeather}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-600 active:scale-95 transition-all"
            >
              <LocateFixed size={15} /> GPS로 날씨 불러오기
            </button>
          )}

          {/* LOADING */}
          {state === 'loading' && (
            <div className="flex items-center justify-center gap-2 py-4 text-blue-500">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-semibold">위치 확인 중...</span>
            </div>
          )}

          {/* ERROR */}
          {state === 'error' && (
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">⚠️ {errorMsg}</div>
              <button onClick={fetchWeather} className="w-full border border-blue-300 text-blue-600 rounded-xl py-2 text-xs font-semibold hover:bg-blue-50">
                다시 시도
              </button>
            </div>
          )}

          {/* DONE */}
          {state === 'done' && weather && (() => {
            const activeDay = weather.days[activeDayIdx]
            const wmo = getWmo(activeDay.code)
            const outfit = getCatOutfit(activeDay.tempMax, wmo.rain, wmo.snow)
            const checklist = getChecklist(activeDay.tempMax, wmo.rain, wmo.snow, wmo.severe, purpose)
            const doneCount = checklist.filter((c) => checked[c.id]).length

            return (
              <>
                {/* 지역 + 현재 날씨 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <LocateFixed size={11} />
                    <span className="font-semibold">{weather.cityName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Thermometer size={10} />
                    <span>{weather.current.temp}°C</span>
                    <Wind size={10} className="ml-1" />
                    <span>{weather.current.windspeed}km/h</span>
                  </div>
                </div>

                {/* 3일 탭 */}
                <div className="grid grid-cols-3 gap-1.5">
                  {weather.days.map((day, i) => {
                    const d = getWmo(day.code)
                    const active = i === activeDayIdx
                    return (
                      <button
                        key={day.date}
                        onClick={() => setActiveDayIdx(i)}
                        className={`rounded-xl p-2.5 transition-all border ${
                          active
                            ? 'bg-white border-blue-300 shadow-sm'
                            : 'bg-white/50 border-transparent hover:border-blue-200'
                        }`}
                      >
                        <p className={`text-[10px] font-bold mb-1 ${active ? 'text-blue-600' : 'text-gray-400'}`}>{day.label}</p>
                        <p className="text-xl mb-1">{d.icon}</p>
                        <p className="text-[10px] text-gray-600 leading-tight">{d.label}</p>
                        <p className="text-[11px] font-bold text-brand-dark mt-1">{day.tempMax}° / {day.tempMin}°</p>
                        {day.precipProb > 20 && (
                          <p className="text-[10px] text-blue-500 flex items-center gap-0.5 mt-0.5">
                            <Droplets size={8} />{day.precipProb}%
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* 비/눈/폭염 경고 */}
                {(wmo.severe || wmo.rain || wmo.snow) && (
                  <div className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                    wmo.severe ? 'bg-red-50 border border-red-200 text-red-700' :
                    wmo.snow   ? 'bg-sky-50 border border-sky-200 text-sky-700' :
                                 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}>
                    <CloudRain size={13} />
                    {wmo.severe ? '⚠️ 악천후 예보 — 외출을 자제해 주세요' :
                     wmo.snow   ? '❄️ 눈 예보 — 택시나 차 이용을 권장해요' :
                                  '🌧️ 비 예보 — 방수 커버·수건 챙기세요'}
                  </div>
                )}

                {/* 고양이 옷차림 추천 */}
                <div className={`rounded-xl px-3 py-3 border ${outfit.color}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{outfit.emoji}</span>
                    <p className="text-sm font-bold">{outfit.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{outfit.desc}</p>
                </div>

                {/* 외출 목적 선택 */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">외출 목적 선택</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'vet',    label: '🏥 병원', },
                      { key: 'school', label: '🐱 고양이학교', },
                      { key: 'walk',   label: '🌿 산책·외출', },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => { setPurpose(key as typeof purpose); setChecked({}); setShowChecklist(true) }}
                        className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                          purpose === key
                            ? 'bg-brand-dark text-white border-brand-dark'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-dark'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 준비물 체크리스트 */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowChecklist(!showChecklist)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📋</span>
                      <p className="text-xs font-bold text-brand-dark">
                        {activeDay.label} 외출 준비물
                        <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          doneCount === checklist.length ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {doneCount}/{checklist.length}
                        </span>
                      </p>
                    </div>
                    {showChecklist ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </button>

                  {showChecklist && (
                    <div className="border-t border-gray-50 px-3 py-2 space-y-1.5">
                      {checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          className="w-full flex items-start gap-2.5 py-1 hover:bg-gray-50 rounded-lg px-1 transition-colors text-left"
                        >
                          <span className={`mt-0.5 flex-shrink-0 ${checked[item.id] ? 'text-green-500' : 'text-gray-300'}`}>
                            {checked[item.id] ? <CheckSquare size={14} /> : <Square size={14} />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs ${checked[item.id] ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                              {item.text}
                            </span>
                            {item.extra && (
                              <span className="ml-1.5 text-[10px] text-orange-500 font-semibold">{item.extra}</span>
                            )}
                          </div>
                        </button>
                      ))}

                      {doneCount === checklist.length && checklist.length > 0 && (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs font-bold text-green-700 text-center">
                          ✅ 준비 완료! 냥이와 즐거운 외출 다녀오세요 🐾
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
