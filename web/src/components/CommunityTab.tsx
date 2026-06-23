import { Heart, MessageCircle, MapPin } from 'lucide-react'

const POSTS = [
  {
    id: 1, board: '동네 소식통', region: '서울 강남', emoji: '📢',
    title: '강남역 근처 캣시터 구합니다 (7/1~7/5)',
    body: '5살 중성화 수컷 코숏 맡아주실 분 계신가요? 사료·약 드리는 방법 미리 알려드려요!',
    likes: 12, comments: 8,
  },
  {
    id: 2, board: '일상 수다', region: '전국', emoji: '😭',
    title: '갑자기 심하게 울어서 놀랐잖아요ㅠ',
    body: '자다가 발차기하면서 이상한 소리 냈는데 꿈을 꾼 건지... 혹시 다른 집사님들도 이런 경험?',
    likes: 45, comments: 22,
  },
  {
    id: 3, board: '길냥이 구조', region: '경기 성남', emoji: '🐾',
    title: '판교 근처 삼색이 TNR 완료 후 임보처 찾아요',
    body: '건강하고 순한 아이예요. 임보 경험 있으신 집사님 연락 주세요!',
    likes: 38, comments: 15,
  },
  {
    id: 4, board: '자랑 게시판', region: '전국', emoji: '📸',
    title: '우리 냥이 첫 생일 케이크 도전 성공!',
    body: '참치캔 + 고구마로 만들었어요. 다들 보세요 진짜 너무 귀여워요 😍',
    likes: 93, comments: 41,
  },
]

const BOARDS = ['전체', '동네 소식통', '일상 수다', '길냥이 구조', '자랑 게시판']

export default function CommunityTab() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Board filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {BOARDS.map((b, i) => (
          <button
            key={b}
            className={`whitespace-nowrap text-xs rounded-full px-3 py-1.5 border font-medium transition-colors ${
              i === 0
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-white text-gray-500 border-gray-200 hover:border-brand-pink hover:text-brand-pink'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {POSTS.map((p) => (
          <div key={p.id} className="card space-y-2 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <span className="text-base">{p.emoji}</span>
              <span className="badge bg-brand-mint/20 text-teal-700 text-[10px]">{p.board}</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400 ml-auto">
                <MapPin size={9} />{p.region}
              </span>
            </div>
            <p className="text-sm font-semibold text-brand-dark">{p.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{p.body}</p>
            <div className="flex gap-4 text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1"><Heart size={11} className="text-brand-pink" />{p.likes}</span>
              <span className="flex items-center gap-1"><MessageCircle size={11} />{p.comments}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Write button */}
      <button className="w-full bg-brand-pink text-white rounded-2xl py-3 text-sm font-semibold hover:bg-pink-500 transition-colors">
        ✏️ 글쓰기
      </button>
    </div>
  )
}
