import { ShoppingCart, Clock, Flame, ExternalLink } from 'lucide-react'

const PRODUCTS = [
  { id: 1, emoji: '🪨', name: '두부 & 활성탄 저먼지 모래', origin: '🇯🇵 일본 직구', price: '28,900', badge: '공구 D-3', hot: true },
  { id: 2, emoji: '🐟', name: '그레인프리 연어 사료 1.5kg', origin: '🇩🇪 독일 직구', price: '42,000', badge: '신상', hot: false },
  { id: 3, emoji: '🪶', name: '깃털 자동 사냥 장난감', origin: '🇺🇸 미국 직구', price: '19,500', badge: '공구 D-7', hot: true },
  { id: 4, emoji: '🛖', name: '스크래처 소파 겸용 캣타워', origin: '🇸🇪 스웨덴 직구', price: '89,000', badge: '인기', hot: false },
  { id: 5, emoji: '💊', name: '관절·면역 종합 영양제', origin: '🇦🇺 호주 직구', price: '34,000', badge: '재입고', hot: false },
  { id: 6, emoji: '🚿', name: '무향 저자극 고양이 샴푸', origin: '🇫🇷 프랑스 직구', price: '16,800', badge: '공구 D-1', hot: true },
]

const DOMESTIC_SITES = [
  {
    id: 'd1',
    emoji: '🐾',
    name: '펫프렌즈',
    url: 'https://www.petfriends.co.kr',
    desc: '반려동물 전문몰 · 새벽배송',
    tag: '국내 1위',
    color: 'bg-orange-50 border-orange-200',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'd2',
    emoji: '🚀',
    name: '쿠팡',
    url: 'https://www.coupang.com/np/categories/393760',
    desc: '로켓배송 · 최저가 사료·모래',
    tag: '로켓배송',
    color: 'bg-yellow-50 border-yellow-200',
    tagColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 'd3',
    emoji: '🛍️',
    name: '네이버 쇼핑',
    url: 'https://shopping.naver.com/category/50000803',
    desc: '가격 비교 · 포인트 적립',
    tag: '비교쇼핑',
    color: 'bg-green-50 border-green-200',
    tagColor: 'bg-green-100 text-green-700',
  },
]

const FOREIGN_SITES = [
  {
    id: 'f1',
    emoji: '🐱',
    name: 'Chewy',
    url: 'https://www.chewy.com/b/cats-332',
    desc: '미국 최대 펫몰 · 정기배송 할인',
    tag: '🇺🇸 미국',
    color: 'bg-blue-50 border-blue-200',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'f2',
    emoji: '💊',
    name: 'iHerb',
    url: 'https://www.iherb.com/c/pet',
    desc: '영양제 특화 · 한국어 지원 직구',
    tag: '🇺🇸 직구',
    color: 'bg-teal-50 border-teal-200',
    tagColor: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'f3',
    emoji: '🌿',
    name: 'Zooplus',
    url: 'https://www.zooplus.com/shop/cats',
    desc: '유럽 최대 펫몰 · 프리미엄 브랜드',
    tag: '🇩🇪 유럽',
    color: 'bg-purple-50 border-purple-200',
    tagColor: 'bg-purple-100 text-purple-700',
  },
]

export default function CommerceTab() {
  return (
    <div className="px-4 py-4 space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-pink to-pink-400 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 mb-1">🌏 해외 트렌드 직구 공동구매</p>
        <p className="text-lg font-bold leading-tight">집사님을 위한<br />이번 주 공구 모음</p>
        <p className="text-xs opacity-80 mt-2">최대 40% 할인 · 무료 배송</p>
      </div>

      {/* Domestic Sites */}
      <div>
        <p className="text-sm font-bold text-brand-dark mb-2">🇰🇷 국내 쇼핑 TOP 3</p>
        <div className="space-y-2">
          {DOMESTIC_SITES.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 border rounded-xl p-3 ${s.color} active:scale-95 transition-transform`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-brand-dark">{s.name}</p>
                  <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${s.tagColor}`}>{s.tag}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{s.desc}</p>
              </div>
              <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Foreign Sites */}
      <div>
        <p className="text-sm font-bold text-brand-dark mb-2">🌍 해외 직구 TOP 3</p>
        <div className="space-y-2">
          {FOREIGN_SITES.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 border rounded-xl p-3 ${s.color} active:scale-95 transition-transform`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-brand-dark">{s.name}</p>
                  <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${s.tagColor}`}>{s.tag}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{s.desc}</p>
              </div>
              <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
            </a>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">💡 관부가세 면세 한도 USD 150 이하 · 직구 시 참고하세요</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-100" />
        <p className="text-[11px] text-gray-400 font-medium">이번 주 공동구매</p>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Products */}
      <div className="space-y-3">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="card flex items-center gap-3">
            <span className="text-3xl">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`badge text-[10px] ${
                    p.hot ? 'bg-brand-danger text-white' : 'bg-brand-mint/20 text-teal-700'
                  }`}
                >
                  {p.hot && <Flame size={9} className="inline mr-0.5" />}
                  {p.badge}
                </span>
                {p.badge.startsWith('공구') && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <Clock size={9} />
                    마감 임박
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-brand-dark truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.origin}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-brand-pink">{p.price}원</p>
              <button className="mt-1 flex items-center gap-1 text-xs bg-brand-pink text-white rounded-full px-3 py-1 hover:bg-pink-500 transition-colors">
                <ShoppingCart size={11} />
                담기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
