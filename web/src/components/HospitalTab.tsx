import { useState, useCallback } from 'react'
import { Phone, Clock, MapPin, AlertTriangle, Navigation, Syringe, Plus, Trash2, Bell, Loader2, LocateFixed, ExternalLink, Search, RefreshCw } from 'lucide-react'

// ── 공공데이터 병원 API ────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

interface ApiHospital {
  name: string
  address: string
  phone: string
  status: string
  lat: string
  lng: string
}

const SIDO_LIST = [
  '서울특별시', '경기도', '인천광역시', '부산광역시', '대구광역시',
  '대전광역시', '광주광역시', '울산광역시', '세종특별자치시',
  '강원특별자치도', '충청북도', '충청남도', '전북특별자치도',
  '전라남도', '경상북도', '경상남도', '제주특별자치도',
]

// ── 예방접종 일정 관리 ─────────────────────────────────────────
const VAC_KEY = 'supercap_vaccinations'

interface VacRecord {
  id: string
  name: string
  date: string   // YYYY-MM-DD
  nextDate: string
  memo: string
}

const VAC_TYPES = [
  { label: '종합백신 (FVRCP)', interval: 365 },
  { label: '광견병 (Rabies)', interval: 365 },
  { label: '고양이 백혈병 (FeLV)', interval: 365 },
  { label: '헤르페스 (FHV)', interval: 365 },
  { label: '칼리시 (FCV)', interval: 365 },
  { label: '심장사상충 예방', interval: 30 },
  { label: '벼룩·진드기 예방', interval: 30 },
  { label: '구충제', interval: 90 },
]

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function loadVaccinations(): VacRecord[] {
  try { return JSON.parse(localStorage.getItem(VAC_KEY) ?? '[]') } catch { return [] }
}

function VaccinationManager() {
  const [records, setRecords] = useState<VacRecord[]>(loadVaccinations)
  const [adding, setAdding] = useState(false)
  const [vacName, setVacName] = useState(VAC_TYPES[0].label)
  const [vacDate, setVacDate] = useState(new Date().toISOString().slice(0, 10))
  const [vacMemo, setVacMemo] = useState('')
  const [customInterval, setCustomInterval] = useState(365)

  function save(list: VacRecord[]) {
    setRecords(list)
    localStorage.setItem(VAC_KEY, JSON.stringify(list))
  }

  function addRecord() {
    const interval = VAC_TYPES.find((v) => v.label === vacName)?.interval ?? customInterval
    const rec: VacRecord = {
      id: Date.now().toString(),
      name: vacName,
      date: vacDate,
      nextDate: addDays(vacDate, interval),
      memo: vacMemo.trim(),
    }
    save([...records, rec].sort((a, b) => a.nextDate.localeCompare(b.nextDate)))
    setAdding(false)
    setVacMemo('')
  }

  function removeRecord(id: string) {
    save(records.filter((r) => r.id !== id))
  }

  const sorted = [...records].sort((a, b) => a.nextDate.localeCompare(b.nextDate))

  return (
    <div className="space-y-3">
      {/* 레코드 목록 */}
      {sorted.length === 0 && !adding && (
        <p className="text-xs text-gray-400 text-center py-3">
          아직 기록이 없어요.<br/>첫 접종 기록을 추가해보세요!
        </p>
      )}
      {sorted.map((r) => {
        const days = daysUntil(r.nextDate)
        const urgent = days <= 7
        const soon   = days <= 30
        const overdue = days < 0
        return (
          <div
            key={r.id}
            className={`rounded-xl p-3 border ${overdue ? 'bg-red-50 border-red-200' : urgent ? 'bg-orange-50 border-orange-200' : soon ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Syringe size={11} className={overdue ? 'text-red-500' : urgent ? 'text-orange-500' : 'text-gray-400'} />
                  <p className="text-xs font-bold text-brand-dark truncate">{r.name}</p>
                </div>
                <p className="text-[10px] text-gray-400">
                  접종일: {r.date} &nbsp;→&nbsp; 다음: {r.nextDate}
                </p>
                {r.memo && <p className="text-[10px] text-gray-400 mt-0.5">{r.memo}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  overdue ? 'bg-red-100 text-red-600' :
                  urgent  ? 'bg-orange-100 text-orange-600' :
                  soon    ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                }`}>
                  <Bell size={9} />
                  {overdue ? `${Math.abs(days)}일 초과` : days === 0 ? '오늘!' : `D-${days}`}
                </span>
                <button onClick={() => removeRecord(r.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* 추가 폼 */}
      {adding ? (
        <div className="bg-white border border-brand-mint/30 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-brand-dark mb-1">접종 기록 추가</p>
          <select
            value={vacName}
            onChange={(e) => {
              setVacName(e.target.value)
              setCustomInterval(VAC_TYPES.find((v) => v.label === e.target.value)?.interval ?? 365)
            }}
            className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white"
          >
            {VAC_TYPES.map((v) => <option key={v.label} value={v.label}>{v.label}</option>)}
          </select>
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 mb-0.5">접종일</p>
              <input type="date" value={vacDate} onChange={(e) => setVacDate(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none focus:border-brand-mint" />
            </div>
            <div className="w-20">
              <p className="text-[10px] text-gray-400 mb-0.5">재접종 주기(일)</p>
              <input type="number" value={customInterval} onChange={(e) => setCustomInterval(Number(e.target.value))}
                className="w-full text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none focus:border-brand-mint" />
            </div>
          </div>
          <input type="text" value={vacMemo} onChange={(e) => setVacMemo(e.target.value)}
            placeholder="메모 (선택)"
            className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-mint" />
          <div className="flex gap-2">
            <button onClick={addRecord}
              className="flex-1 bg-brand-mint text-white rounded-xl py-2 text-xs font-semibold hover:bg-teal-500 transition-colors">
              저장
            </button>
            <button onClick={() => setAdding(false)}
              className="flex-1 border border-gray-200 rounded-xl py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-mint border border-brand-mint/40 rounded-xl py-2.5 hover:bg-brand-mint/5 transition-colors active:scale-95"
        >
          <Plus size={13} /> 접종 기록 추가
        </button>
      )}
    </div>
  )
}

// ── GPS 기반 지도 URL ──────────────────────────────────────────
type GpsState = 'idle' | 'loading' | 'success' | 'denied' | 'error'

interface Coords { lat: number; lng: number; accuracy: number }

function naverGpsUrl(lat: number, lng: number) {
  // 내 위치 기준 동물병원 검색
  return `https://map.naver.com/v5/search/%EB%8F%99%EB%AC%BC%EB%B3%91%EC%9B%90?c=${lng},${lat},15,0,0,0,dh`
}

function kakaoGpsUrl(lat: number, lng: number) {
  return `https://map.kakao.com/?q=%EB%8F%99%EB%AC%BC%EB%B3%91%EC%9B%90&center=${lng},${lat}&from=roughmap`
}

function googleGpsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/%EB%8F%99%EB%AC%BC%EB%B3%91%EC%9B%90/@${lat},${lng},15z`
}

function naverEmergencyUrl(lat: number, lng: number) {
  return `https://map.naver.com/v5/search/24%EC%8B%9C%EA%B0%84%20%EB%8F%99%EB%AC%BC%EB%B3%91%EC%9B%90?c=${lng},${lat},15,0,0,0,dh`
}

// ── 참고용 병원 목록 (GPS 전 기본 표시) ──────────────────────
const HOSPITALS = [
  {
    id: 1, name: '24시 강남 고양이 동물병원', dist: '0.4km', open: true,
    addr: '서울 강남구 테헤란로 123', phone: '02-1234-5678',
    tags: ['고양이 전문', '응급', '24시간'],
  },
  {
    id: 2, name: '펫메디컬센터 서초점', dist: '1.2km', open: true,
    addr: '서울 서초구 반포대로 45', phone: '02-2345-6789',
    tags: ['야간진료', '초음파', '내시경'],
  },
  {
    id: 3, name: '하이펫 동물의료센터', dist: '2.1km', open: false,
    addr: '서울 송파구 올림픽로 78', phone: '02-3456-7890',
    tags: ['MRI', '전문의', '암 치료'],
  },
  {
    id: 4, name: '캐츠빌 고양이 전문 클리닉', dist: '3.0km', open: true,
    addr: '서울 마포구 와우산로 22', phone: '02-4567-8901',
    tags: ['고양이 전문', '치과', '피부'],
  },
]

const SYMPTOMS = ['구토·설사', '식욕부진', '혈뇨·배변 문제', '기침·호흡 곤란', '다리 절음', '눈·코 분비물']

// 네이버 지도 URL 생성
function naverMapUrl(name: string, addr: string) {
  const query = encodeURIComponent(`${name} ${addr}`)
  return `https://map.naver.com/v5/search/${query}`
}

// 네이버 지도 길찾기 URL (도착지 기준)
function naverDirectionUrl(name: string, addr: string) {
  const dest = encodeURIComponent(`${name}`)
  const destAddr = encodeURIComponent(addr)
  return `https://map.naver.com/v5/directions/-/-/${dest},${destAddr},,/car`
}

// ── 공공 병원 검색 패널 ────────────────────────────────────────
function PublicHospitalSearch() {
  const [sido, setSido] = useState('서울특별시')
  const [hospitals, setHospitals] = useState<ApiHospital[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function fetchHospitals() {
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await fetch(`${API_BASE}/hospitals?sido=${encodeURIComponent(sido)}&size=20`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`서버 오류 ${res.status}`)
      const data: ApiHospital[] = await res.json()
      setHospitals(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류'
      setError(msg.includes('timeout') || msg.includes('Failed to fetch')
        ? '백엔드 서버가 실행 중이지 않아요. (uvicorn main:app 실행 필요)'
        : msg)
    } finally {
      setLoading(false)
    }
  }

  // 전화번호 정리
  function formatPhone(p: string) {
    if (!p) return ''
    return p.replace(/[^0-9]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3')
  }

  function kakaoSearch(h: ApiHospital) {
    const q = encodeURIComponent(h.name + ' ' + h.address)
    if (h.lat && h.lng) {
      return `https://map.kakao.com/?q=${encodeURIComponent(h.name)}`
    }
    return `https://map.kakao.com/?q=${q}`
  }

  function naverSearch(h: ApiHospital) {
    const q = encodeURIComponent(h.name + ' ' + h.address)
    return `https://map.naver.com/v5/search/${q}`
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Search size={16} className="text-teal-600" />
          <p className="text-sm font-bold text-brand-dark">전국 동물병원 검색</p>
          <span className="text-[10px] bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">공공데이터</span>
        </div>
        <div className="flex gap-2">
          <select
            value={sido}
            onChange={(e) => setSido(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-teal-400"
          >
            {SIDO_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={fetchHospitals}
            disabled={loading}
            className="flex items-center gap-1.5 bg-teal-500 text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-teal-600 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            {loading ? '검색 중' : '검색'}
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        {!searched && (
          <p className="text-xs text-gray-400 text-center py-4">
            지역을 선택하고 검색을 누르면<br />공공데이터 기반 동물병원 목록이 나와요 🏥
          </p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
            ⚠️ {error}
          </div>
        )}

        {!loading && searched && !error && hospitals.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">검색 결과가 없어요.</p>
        )}

        <div className="space-y-2.5 max-h-80 overflow-y-auto">
          {hospitals.map((h, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      h.status.includes('24') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-brand-dark leading-snug">{h.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-start gap-1">
                    <MapPin size={9} className="text-gray-300 mt-0.5 flex-shrink-0" />
                    {h.address || '주소 미등록'}
                  </p>
                </div>
                {h.phone && (
                  <a href={`tel:${h.phone}`}
                    className="flex items-center gap-1 text-xs bg-brand-pink text-white rounded-full px-2.5 py-1.5 hover:bg-pink-500 transition-colors shrink-0">
                    <Phone size={10} /> 전화
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <a href={naverSearch(h)} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-[#03C75A] border border-[#03C75A]/30 bg-[#03C75A]/5 rounded-xl py-1.5 hover:bg-[#03C75A]/10 transition-colors">
                  <ExternalLink size={9} /> 네이버
                </a>
                <a href={kakaoSearch(h)} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-yellow-700 border border-yellow-200 bg-yellow-50 rounded-xl py-1.5 hover:bg-yellow-100 transition-colors">
                  <ExternalLink size={9} /> 카카오
                </a>
              </div>
            </div>
          ))}
        </div>

        {hospitals.length > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-gray-400">
              행정안전부 공공데이터 기반 · {hospitals.length}건
            </p>
            <button onClick={fetchHospitals}
              className="flex items-center gap-1 text-[10px] text-teal-500 font-semibold hover:underline">
              <RefreshCw size={9} /> 새로고침
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HospitalTab() {
  const [showVac, setShowVac] = useState(false)
  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [coords, setCoords]     = useState<Coords | null>(null)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) { setGpsState('error'); return }
    setGpsState('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) })
        setGpsState('success')
      },
      (err) => {
        setGpsState(err.code === 1 ? 'denied' : 'error')
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    )
  }, [])

  return (
    <div className="px-4 py-4 space-y-4">

      {/* ── 내 위치 기반 병원 찾기 ── */}
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <LocateFixed size={18} className="text-blue-500" />
          <p className="text-sm font-bold text-brand-dark">내 위치로 병원 찾기</p>
        </div>
        <p className="text-xs text-gray-500 mb-3">GPS로 현재 위치를 파악해 지도 앱에서 주변 동물병원을 바로 검색합니다.</p>

        {gpsState === 'idle' && (
          <button
            onClick={getLocation}
            className="w-full bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all"
          >
            <LocateFixed size={15} /> 내 위치 GPS 켜기
          </button>
        )}

        {gpsState === 'loading' && (
          <div className="flex items-center justify-center gap-2 py-3 text-blue-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-semibold">위치 확인 중...</span>
          </div>
        )}

        {gpsState === 'denied' && (
          <div className="space-y-2">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
              ⚠️ 위치 권한이 거부되었어요.<br />
              브라우저 설정 → 사이트 권한 → 위치 → 허용 후 다시 시도해 주세요.
            </div>
            <button onClick={getLocation} className="w-full border border-blue-300 text-blue-600 rounded-xl py-2 text-xs font-semibold hover:bg-blue-50">
              다시 시도
            </button>
          </div>
        )}

        {gpsState === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
            ⚠️ 위치를 가져오지 못했어요. 아래 지도 앱으로 직접 검색해 주세요.
          </div>
        )}

        {gpsState === 'success' && coords && (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <MapPin size={13} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-700">위치 확인 완료!</p>
                <p className="text-[10px] text-gray-400">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} · 정확도 ±{coords.accuracy}m
                </p>
              </div>
              <button onClick={getLocation} className="ml-auto text-[10px] text-gray-400 hover:text-blue-500">새로고침</button>
            </div>

            {/* 지도 앱 버튼 3개 */}
            <div className="grid grid-cols-3 gap-2">
              <a href={naverGpsUrl(coords.lat, coords.lng)} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-[#03C75A]/10 border border-[#03C75A]/30 rounded-xl py-2.5 hover:bg-[#03C75A]/20 transition-colors active:scale-95">
                <span className="text-lg">🗺️</span>
                <span className="text-[10px] font-bold text-[#03C75A]">네이버 지도</span>
              </a>
              <a href={kakaoGpsUrl(coords.lat, coords.lng)} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-yellow-50 border border-yellow-300 rounded-xl py-2.5 hover:bg-yellow-100 transition-colors active:scale-95">
                <span className="text-lg">🔍</span>
                <span className="text-[10px] font-bold text-yellow-700">카카오맵</span>
              </a>
              <a href={googleGpsUrl(coords.lat, coords.lng)} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-blue-50 border border-blue-200 rounded-xl py-2.5 hover:bg-blue-100 transition-colors active:scale-95">
                <span className="text-lg">📍</span>
                <span className="text-[10px] font-bold text-blue-600">구글맵</span>
              </a>
            </div>

            {/* 24시간 응급 병원 별도 버튼 */}
            <a href={naverEmergencyUrl(coords.lat, coords.lng)} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-brand-danger text-white rounded-xl py-2.5 text-xs font-bold hover:bg-red-600 active:scale-95 transition-all">
              <AlertTriangle size={13} /> 24시간 응급 동물병원 찾기
            </a>
          </div>
        )}
      </div>

      {/* 응급 배너 */}
      <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="text-brand-danger flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-bold text-brand-danger">응급 증상이 있나요?</p>
          <p className="text-xs text-gray-600 mt-0.5">경련·의식 저하·호흡 곤란은 즉시 병원으로!</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <a href="tel:02-1234-5678"
              className="text-xs font-semibold text-white bg-brand-danger rounded-full px-3 py-1">
              📞 즉시 전화연결
            </a>
            <a href={coords ? naverEmergencyUrl(coords.lat, coords.lng) : naverMapUrl('24시간 동물병원', '서울')}
              target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-danger border border-brand-danger/40 rounded-full px-3 py-1">
              {coords ? '📍 내 위치 기준 검색' : '🗺️ 지도에서 찾기'}
            </a>
          </div>
        </div>
      </div>

      {/* 예방접종 일정 관리 */}
      <div className="bg-white border border-brand-mint/30 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowVac(!showVac)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-mint/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Syringe size={16} className="text-brand-mint" />
            <div className="text-left">
              <p className="text-sm font-bold text-brand-dark">예방접종 일정 관리</p>
              <p className="text-[10px] text-gray-400">접종 기록·다음 일정 D-day 알림</p>
            </div>
          </div>
          <span className="text-xs text-brand-mint font-semibold">{showVac ? '접기 ▲' : '펼치기 ▼'}</span>
        </button>
        {showVac && (
          <div className="px-4 pb-4 border-t border-gray-50">
            <div className="pt-3">
              <VaccinationManager />
            </div>
          </div>
        )}
      </div>

      {/* 공공데이터 병원 검색 */}
      <PublicHospitalSearch />

      {/* 증상 빠른 안내 */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">증상으로 빠른 안내</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <button
              key={s}
              className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-brand-danger hover:text-brand-danger transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 병원 목록 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">
            {coords ? '📍 내 위치 기준 참고 목록' : '참고 병원 목록 (GPS 연동 권장)'}
          </p>
          {!coords && (
            <button onClick={getLocation} className="flex items-center gap-0.5 text-[10px] text-blue-500 font-semibold">
              <LocateFixed size={10} /> 위치 켜기
            </button>
          )}
          {coords && (
            <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-semibold">
              <MapPin size={10} /> GPS 연결됨
            </span>
          )}
        </div>

        <div className="space-y-3">
          {HOSPITALS.map((h) => (
            <div key={h.id} className="card space-y-3">
              {/* 병원 기본 정보 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[10px] ${
                      h.open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Clock size={9} className="inline mr-0.5" />
                      {h.open ? '진료 중' : '진료 종료'}
                    </span>
                    <span className="text-[10px] text-gray-400">{h.dist}</span>
                  </div>
                  <p className="text-sm font-semibold text-brand-dark">{h.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={9} className="text-gray-300" />
                    {h.addr}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {h.tags.map((t) => (
                      <span key={t} className="badge bg-brand-mint/15 text-teal-700 text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>
                <a
                  href={`tel:${h.phone}`}
                  className="flex items-center gap-1 text-xs bg-brand-pink text-white rounded-full px-2.5 py-1.5 hover:bg-pink-500 transition-colors shrink-0"
                >
                  <Phone size={10} /> 전화
                </a>
              </div>

              {/* 지도 버튼 */}
              <div className="flex gap-2 pt-1 border-t border-gray-50">
                <a
                  href={naverMapUrl(h.name, h.addr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#03C75A] border border-[#03C75A]/30 bg-[#03C75A]/5 rounded-xl py-2 hover:bg-[#03C75A]/10 transition-colors"
                >
                  <ExternalLink size={11} />
                  네이버 지도
                </a>
                <a
                  href={coords
                    ? `https://map.kakao.com/?q=${encodeURIComponent(h.name)}&from=roughmap&srcid=&confirmid=&service=`
                    : naverDirectionUrl(h.name, h.addr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-xl py-2 hover:bg-blue-100 transition-colors"
                >
                  <Navigation size={12} />
                  {coords ? '카카오 길찾기' : '길찾기'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
