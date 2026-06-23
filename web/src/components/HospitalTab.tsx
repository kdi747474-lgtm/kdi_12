import { Phone, Clock, MapPin, AlertTriangle, Navigation } from 'lucide-react'

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
