import { useState, useEffect } from 'react'
import { ShoppingCart, Clock, Flame, ExternalLink, X, Users, CheckCircle } from 'lucide-react'

// ── 공동구매 인원 현황 (localStorage) ─────────────────────────
const GROUP_KEY = 'supercap_group_counts'
const JOIN_KEY  = 'supercap_group_joined'   // 내가 신청한 상품 기록
const BASE_COUNTS: Record<number, number> = { 1: 47, 2: 23, 3: 61, 4: 15, 5: 38, 6: 82 }
const TARGET_COUNTS: Record<number, number> = { 1: 100, 2: 50, 3: 100, 4: 30, 5: 80, 6: 100 }

function loadCounts(): Record<number, number> {
  try { return JSON.parse(localStorage.getItem(GROUP_KEY) ?? '{}') } catch { return {} }
}

function loadJoined(): Record<number, { qty: number; ts: string }> {
  try { return JSON.parse(localStorage.getItem(JOIN_KEY) ?? '{}') } catch { return {} }
}

function saveJoin(productId: number, qty: number) {
  const prev = loadJoined()
  prev[productId] = { qty, ts: new Date().toISOString() }
  localStorage.setItem(JOIN_KEY, JSON.stringify(prev))
  // 인원수도 +1 저장
  const counts = loadCounts()
  counts[productId] = (counts[productId] ?? 0) + 1
  localStorage.setItem(GROUP_KEY, JSON.stringify(counts))
}

type Product = typeof PRODUCTS[number]

function CartModal({ product, onClose, participantCount }: { product: Product; onClose: () => void; participantCount: number }) {
  const [qty, setQty] = useState(1)
  const [done, setDone] = useState(false)
  const joined = loadJoined()
  const alreadyJoined = !!joined[product.id]
  const unitPrice = parseInt(product.price.replace(',', ''), 10)
  const total = (unitPrice * qty).toLocaleString()

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <CheckCircle size={48} className="text-brand-mint mx-auto mb-3" />
          <p className="text-lg font-bold text-brand-dark">공구 신청 완료!</p>
          <p className="text-sm text-gray-500 mt-1">{product.name}</p>
          <p className="text-xs text-gray-400 mt-1">{qty}개 · {total}원</p>
          <p className="text-xs text-brand-pink mt-3">마감 후 일괄 주문 · 배송 안내 드려요 🐾</p>
          <button onClick={onClose} className="mt-5 w-full bg-brand-pink text-white rounded-2xl py-3 font-semibold text-sm">확인</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-brand-dark">공동구매 신청</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 mb-4">
          <span className="text-4xl">{product.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-brand-dark">{product.name}</p>
            <p className="text-xs text-gray-400">{product.origin}</p>
            <p className="text-sm font-bold text-brand-pink mt-0.5">{product.price}원 / 개</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-brand-dark">수량</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
            >−</button>
            <span className="text-sm font-bold w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(10, qty + 1))}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
            >+</button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-brand-pink/5 rounded-xl px-3 py-2 mb-4">
          <Users size={14} className="text-brand-pink flex-shrink-0" />
          <p className="text-xs text-gray-500">현재 <span className="font-bold text-brand-pink">{participantCount}명</span> 함께 신청 중</p>
        </div>

        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-gray-500">총 결제 예정금액</p>
          <p className="text-lg font-bold text-brand-dark">{total}원</p>
        </div>

        {alreadyJoined ? (
          <div className="w-full bg-gray-100 text-gray-500 rounded-2xl py-3 text-sm text-center font-semibold">
            ✅ 이미 신청하셨어요 ({joined[product.id].qty}개)
          </div>
        ) : (
          <button
            onClick={() => { saveJoin(product.id, qty); setDone(true) }}
            className="w-full bg-brand-pink text-white rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-pink-500 transition-colors"
          >
            <ShoppingCart size={16} />
            공구 신청하기
          </button>
        )}
        <p className="text-[10px] text-gray-400 text-center mt-2">결제는 공구 마감 후 진행됩니다</p>
      </div>
    </div>
  )
}

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

// ── 실제 고양이 용품 추천 리스트 ──────────────────────────────
const REC_CATEGORIES = [
  {
    id: 'food',
    label: '🍽️ 사료',
    items: [
      { brand: '로얄캐닌 (Royal Canin)', name: '인도어 퓨어 페린 400g', price: '18,900', tag: '국내 1위', link: 'https://www.petfriends.co.kr/search?keyword=%EB%A1%9C%EC%96%84%EC%BA%90%EB%8B%8C', site: '펫프렌즈', note: '실내묘 맞춤 · 헤어볼 관리' },
      { brand: '오리젠 (Orijen)', name: '캣 & 키튼 340g', price: '28,500', tag: '★ 베스트', link: 'https://www.coupang.com/np/search?q=%EC%98%A4%EB%A6%AC%EC%A0%A0+%EA%B3%A0%EC%96%91%EC%9D%B4', site: '쿠팡', note: '그레인프리 · 80% 동물성' },
      { brand: '힐스 (Hill\'s)', name: '사이언스다이어트 어덜트 1.6kg', price: '32,000', tag: '수의사 추천', link: 'https://www.petfriends.co.kr/search?keyword=%ED%9E%90%EC%8A%A4', site: '펫프렌즈', note: '균형 영양 · 체중 관리' },
      { brand: '네츄럴발란스 (NB)', name: '리미티드 인그리디언트 연어 2.2kg', price: '54,000', tag: '피부·알러지', link: 'https://www.iherb.com/search?kw=natural+balance+cat', site: 'iHerb', note: '단일 단백질 · 알러지 고양이' },
      { brand: '웰니스코어 (Wellness CORE)', name: '그레인프리 치킨 1.75kg', price: '47,000', tag: '직구 추천', link: 'https://www.chewy.com/s?query=wellness+core+cat', site: 'Chewy', note: '고단백 · 저탄수화물' },
    ],
  },
  {
    id: 'snack',
    label: '🍬 간식',
    items: [
      { brand: '이나바 CIAO', name: '츄루 닭가슴살 14g×20개', price: '12,900', tag: '국민 간식', link: 'https://www.coupang.com/np/search?q=%EC%B8%84%EB%A3%A8', site: '쿠팡', note: '수분 보충 · 기호성 최상' },
      { brand: '스키니 미니 (Skinnymini)', name: '동결건조 치킨 50g', price: '8,900', tag: '노성분 첨가', link: 'https://www.petfriends.co.kr/search?keyword=%EB%8F%99%EA%B2%B0%EA%B1%B4%EC%A1%B0', site: '펫프렌즈', note: '단일 재료 · 다이어트' },
      { brand: '퓨리나 (Purina)', name: '덴탈라이프 어덜트 65g', price: '6,500', tag: '치석 관리', link: 'https://www.petfriends.co.kr/search?keyword=%EB%8D%B4%ED%83%88%EB%9D%BC%EC%9D%B4%ED%94%84', site: '펫프렌즈', note: '치석 제거 · 구취 예방' },
    ],
  },
  {
    id: 'litter',
    label: '🪨 모래',
    items: [
      { brand: '그린데이', name: '두부모래 오리지널 7L', price: '14,900', tag: '두부 모래 1위', link: 'https://www.coupang.com/np/search?q=%EA%B7%B8%EB%A6%B0%EB%8D%B0%EC%9D%B4+%EB%91%90%EB%B6%80', site: '쿠팡', note: '저먼지 · 빠른 굳힘 · 친환경' },
      { brand: '크리피 (Creamy)', name: '벤토나이트 솔리드 10kg', price: '18,900', tag: '강력 탈취', link: 'https://www.petfriends.co.kr/search?keyword=%ED%81%AC%EB%A6%AC%ED%94%BC', site: '펫프렌즈', note: '굳힘력 최강 · 장기간 사용' },
      { brand: '월드베스트 (World\'s Best)', name: '콘 기반 모래 3.18kg', price: '22,000', tag: '직구 인기', link: 'https://www.chewy.com/s?query=world%27s+best+cat+litter', site: 'Chewy', note: '옥수수 원료 · 수세식 가능' },
    ],
  },
  {
    id: 'health',
    label: '💊 영양제',
    items: [
      { brand: '닥터포 (Doctorpaw)', name: '오메가3 관절 영양제 60캡슐', price: '29,000', tag: '관절 케어', link: 'https://www.petfriends.co.kr/search?keyword=%EC%98%A4%EB%A9%94%EA%B0%803+%EA%B3%A0%EC%96%91%EC%9D%B4', site: '펫프렌즈', note: '관절·피모·면역 동시 케어' },
      { brand: '뉴트리-베트 (Nutri-Vet)', name: '헤어볼 연질 캡슐 60정', price: '12,500', tag: '헤어볼', link: 'https://www.iherb.com/search?kw=nutri-vet+cat+hairball', site: 'iHerb', note: '헤어볼 예방 · 소화 촉진' },
      { brand: '베트리 (Vetri)', name: '프로바이오틱스 60캡슐', price: '18,000', tag: '장 건강', link: 'https://www.iherb.com/search?kw=vetri-science+cat+probiotic', site: 'iHerb', note: '장내 유익균 · 소화 개선' },
    ],
  },
  {
    id: 'toy',
    label: '🎮 장난감·용품',
    items: [
      { brand: '페드리오 (Petstages)', name: '오빅스 볼 인터랙티브 장난감', price: '16,900', tag: '인기', link: 'https://www.coupang.com/np/search?q=%EA%B3%A0%EC%96%91%EC%9D%B4+%EC%9E%90%EB%8F%99+%EC%9E%A5%EB%82%9C%EA%B0%90', site: '쿠팡', note: '자동 회전 · 혼자도 OK' },
      { brand: '펑키캣 (FunKitty)', name: '에그서사이저 슬로우 피더', price: '12,000', tag: '다이어트', link: 'https://www.petfriends.co.kr/search?keyword=%EC%8A%AC%EB%A1%9C%EC%9A%B0+%ED%94%BC%EB%8D%94', site: '펫프렌즈', note: '폭식 방지 · 지능 자극' },
      { brand: 'SureCat', name: '자동 분리급식기 (2구)', price: '89,000', tag: '스마트', link: 'https://www.coupang.com/np/search?q=%EC%9E%90%EB%8F%99%EA%B8%89%EC%8B%9D%EA%B8%B0+%EA%B3%A0%EC%96%91%EC%9D%B4', site: '쿠팡', note: '타이머 설정 · 1~2냥 추천' },
      { brand: '룸바 (Litter-Robot)', name: 'Litter-Robot 4 자동 청소 화장실', price: '1,580,000', tag: '프리미엄', link: 'https://www.litter-robot.com', site: '공식몰', note: '완전 자동 청소 · 다냥가구 필수' },
    ],
  },
]

type RecTab = typeof REC_CATEGORIES[number]['id']

function ProductRecSection() {
  const [activeRec, setActiveRec] = useState<RecTab>('food')
  const cat = REC_CATEGORIES.find((c) => c.id === activeRec)!

  return (
    <div>
      <p className="text-sm font-bold text-brand-dark mb-2">🏆 카테고리별 용품 추천</p>

      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
        {REC_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveRec(c.id as RecTab)}
            className={`whitespace-nowrap text-xs rounded-full px-3 py-1.5 font-medium flex-shrink-0 transition-all ${
              activeRec === c.id ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 제품 리스트 */}
      <div className="space-y-2">
        {cat.items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:border-brand-pink/40 hover:shadow-sm active:scale-95 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center text-sm font-bold text-brand-pink flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <p className="text-[10px] font-semibold text-gray-400">{item.brand}</p>
                <span className="text-[9px] bg-brand-mint/20 text-teal-700 rounded-full px-1.5 py-0.5">{item.tag}</span>
              </div>
              <p className="text-xs font-bold text-brand-dark truncate">{item.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.note} · {item.site}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-brand-pink">{item.price}원</p>
              <ExternalLink size={10} className="text-gray-300 ml-auto mt-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function CommerceTab() {
  const [cartProduct, setCartProduct] = useState<Product | null>(null)
  const [extraCounts, setExtraCounts] = useState<Record<number, number>>(loadCounts)

  useEffect(() => {
    // 페이지 로드 시 각 상품에 랜덤 소폭 증가 (생동감)
    const timer = setInterval(() => {
      setExtraCounts((prev) => {
        const id = [1, 2, 3, 4, 5, 6][Math.floor(Math.random() * 6)]
        const next = { ...prev, [id]: (prev[id] ?? 0) + 1 }
        localStorage.setItem(GROUP_KEY, JSON.stringify(next))
        return next
      })
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  function getCount(id: number) {
    return (BASE_COUNTS[id] ?? 0) + (extraCounts[id] ?? 0)
  }

  function getTarget(id: number) { return TARGET_COUNTS[id] ?? 100 }

  return (
    <div className="px-4 py-4 space-y-5">
      {cartProduct && <CartModal product={cartProduct} onClose={() => setCartProduct(null)} participantCount={getCount(cartProduct.id)} />}
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-pink to-pink-400 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 mb-1">🌏 해외 트렌드 직구 공동구매</p>
        <p className="text-lg font-bold leading-tight">집사님을 위한<br />이번 주 공구 모음</p>
        <p className="text-xs opacity-80 mt-2">최대 40% 할인 · 무료 배송</p>
      </div>

      {/* 카테고리별 용품 추천 */}
      <ProductRecSection />

      {/* 구분선 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-100" />
        <p className="text-[11px] text-gray-400 font-medium">쇼핑몰 바로가기</p>
        <div className="flex-1 h-px bg-gray-100" />
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
              {/* 모집 인원 진행바 */}
              {p.badge.startsWith('공구') && (() => {
                const cur = getCount(p.id)
                const tgt = getTarget(p.id)
                const pct = Math.min(100, Math.round((cur / tgt) * 100))
                return (
                  <div className="mt-1.5">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span className="flex items-center gap-0.5"><Users size={9} />{cur}명 참여</span>
                      <span>목표 {tgt}명 ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${pct >= 80 ? 'bg-brand-danger' : 'bg-brand-pink'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })()}
            </div>
            <div className="text-right flex-shrink-0 self-start">
              <p className="text-sm font-bold text-brand-pink">{p.price}원</p>
              <button
                onClick={() => setCartProduct(p)}
                className="mt-1 flex items-center gap-1 text-xs bg-brand-pink text-white rounded-full px-3 py-1 hover:bg-pink-500 active:scale-95 transition-all"
              >
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
