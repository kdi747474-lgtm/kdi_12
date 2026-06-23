import { useState } from 'react'
import { Phone, Clock, MapPin, AlertTriangle, Navigation, Syringe, Plus, Trash2, Bell } from 'lucide-react'

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

export default function HospitalTab() {
  const [showVac, setShowVac] = useState(false)

  return (
    <div className="px-4 py-4 space-y-4">

      {/* 응급 배너 */}
      <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="text-brand-danger flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-bold text-brand-danger">응급 증상이 있나요?</p>
          <p className="text-xs text-gray-600 mt-0.5">경련·의식 저하·호흡 곤란은 즉시 병원으로! 자가 진단을 미루지 마세요.</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <a
              href="tel:02-1234-5678"
              className="text-xs font-semibold text-white bg-brand-danger rounded-full px-3 py-1"
            >
              📞 즉시 전화연결
            </a>
            <a
              href={naverMapUrl('24시간 동물병원', '서울')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-danger border border-brand-danger/40 rounded-full px-3 py-1 hover:bg-brand-danger hover:text-white transition-colors"
            >
              🗺️ 네이버 지도에서 찾기
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
          <p className="text-xs font-semibold text-gray-500">내 주변 동물병원</p>
          <span className="flex items-center gap-0.5 text-[10px] text-brand-mint font-semibold">
            <MapPin size={10} /> 위치 기반
          </span>
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

              {/* 네이버 지도 버튼 */}
              <div className="flex gap-2 pt-1 border-t border-gray-50">
                <a
                  href={naverMapUrl(h.name, h.addr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#03C75A] border border-[#03C75A]/30 bg-[#03C75A]/5 rounded-xl py-2 hover:bg-[#03C75A]/10 transition-colors"
                >
                  <img
                    src="https://ssl.pstatic.net/static/maps/mantle/map-pin/2x/m.png"
                    alt="naver"
                    className="w-3.5 h-3.5 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  네이버 지도 보기
                </a>
                <a
                  href={naverDirectionUrl(h.name, h.addr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-xl py-2 hover:bg-blue-100 transition-colors"
                >
                  <Navigation size={12} />
                  길찾기
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
