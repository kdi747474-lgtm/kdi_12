import { useState } from 'react'
import { Heart, MessageCircle, MapPin, X, Send, ChevronDown } from 'lucide-react'
import { loadProfile } from './CatProfile'

// ── 타입 & 스토리지 ────────────────────────────────────────────
const POST_KEY   = 'supercap_posts'
const LIKES_KEY  = 'supercap_liked'

interface Post {
  id: number
  board: string
  region: string
  emoji: string
  title: string
  body: string
  likes: number
  comments: number
  author: string
  createdAt: string
}

const SEED_POSTS: Post[] = [
  { id: 1, board: '동네 소식통', region: '서울 강남', emoji: '📢', author: '집사A', createdAt: '2026-06-20',
    title: '강남역 근처 캣시터 구합니다 (7/1~7/5)',
    body: '5살 중성화 수컷 코숏 맡아주실 분 계신가요? 사료·약 드리는 방법 미리 알려드려요!',
    likes: 12, comments: 8 },
  { id: 2, board: '일상 수다', region: '전국', emoji: '😭', author: '집사B', createdAt: '2026-06-21',
    title: '갑자기 심하게 울어서 놀랐잖아요ㅠ',
    body: '자다가 발차기하면서 이상한 소리 냈는데 꿈을 꾼 건지... 혹시 다른 집사님들도 이런 경험?',
    likes: 45, comments: 22 },
  { id: 3, board: '길냥이 구조', region: '경기 성남', emoji: '🐾', author: '구조대원', createdAt: '2026-06-21',
    title: '판교 근처 삼색이 TNR 완료 후 임보처 찾아요',
    body: '건강하고 순한 아이예요. 임보 경험 있으신 집사님 연락 주세요!',
    likes: 38, comments: 15 },
  { id: 4, board: '자랑 게시판', region: '전국', emoji: '📸', author: '냥집사', createdAt: '2026-06-22',
    title: '우리 냥이 첫 생일 케이크 도전 성공!',
    body: '참치캔 + 고구마로 만들었어요. 다들 보세요 진짜 너무 귀여워요 😍',
    likes: 93, comments: 41 },
]

const BOARDS = ['전체', '동네 소식통', '일상 수다', '길냥이 구조', '자랑 게시판']
const BOARD_EMOJIS: Record<string, string> = {
  '동네 소식통': '📢', '일상 수다': '💬', '길냥이 구조': '🐾', '자랑 게시판': '📸',
}

function loadPosts(): Post[] {
  try {
    const saved = JSON.parse(localStorage.getItem(POST_KEY) ?? '[]') as Post[]
    return saved.length ? saved : SEED_POSTS
  } catch { return SEED_POSTS }
}

function savePosts(posts: Post[]) {
  localStorage.setItem(POST_KEY, JSON.stringify(posts))
}

function loadLiked(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) ?? '[]')) } catch { return new Set() }
}

function saveLiked(set: Set<number>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...set]))
}

// ── 글쓰기 모달 ────────────────────────────────────────────────
interface WriteModalProps {
  onClose: () => void
  onSubmit: (post: Omit<Post, 'id' | 'likes' | 'comments'>) => void
}

function WriteModal({ onClose, onSubmit }: WriteModalProps) {
  const profile = loadProfile()
  const [board, setBoard]   = useState(BOARDS[1])
  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [region, setRegion] = useState('전국')

  function submit() {
    if (!title.trim() || !body.trim()) return
    onSubmit({
      board,
      region: region.trim() || '전국',
      emoji: BOARD_EMOJIS[board] ?? '✏️',
      title: title.trim(),
      body: body.trim(),
      author: profile.name || '익명 집사',
      createdAt: new Date().toISOString().slice(0, 10),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[430px] rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-brand-dark">✏️ 글쓰기</p>
          <button onClick={onClose} className="text-gray-400"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          {/* 게시판 선택 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">게시판</label>
            <div className="flex flex-wrap gap-1.5">
              {BOARDS.slice(1).map((b) => (
                <button
                  key={b}
                  onClick={() => setBoard(b)}
                  className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                    board === b ? 'border-brand-mint bg-brand-mint/10 text-teal-700' : 'border-gray-100 text-gray-500'
                  }`}
                >
                  {BOARD_EMOJIS[b]} {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">지역 (선택)</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="예: 서울 강남, 경기 성남 (기본: 전국)"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-mint"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">제목 *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="제목을 입력하세요"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-mint"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">내용 *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={300}
              rows={5}
              placeholder="집사님들과 나누고 싶은 이야기를 써주세요!"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-mint resize-none"
            />
            <p className="text-[10px] text-gray-400 text-right">{body.length}/300</p>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <span className="text-xs text-gray-400">작성자:</span>
            <span className="text-xs font-semibold text-brand-dark">{profile.name || '익명 집사'}</span>
            {!profile.name && <span className="text-[10px] text-gray-400">(냥이 프로필 등록 시 닉네임 표시)</span>}
          </div>

          <button
            onClick={submit}
            disabled={!title.trim() || !body.trim()}
            className="w-full bg-brand-pink text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={15} /> 게시하기
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
export default function CommunityTab() {
  const [posts, setPosts]     = useState<Post[]>(loadPosts)
  const [liked, setLiked]     = useState<Set<number>>(loadLiked)
  const [activeBoard, setActiveBoard] = useState('전체')
  const [writing, setWriting] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  function toggleLike(id: number) {
    const next = new Set(liked)
    const nextPosts = posts.map((p) => {
      if (p.id !== id) return p
      if (next.has(id)) { next.delete(id); return { ...p, likes: p.likes - 1 } }
      else              { next.add(id);    return { ...p, likes: p.likes + 1 } }
    })
    setLiked(next); saveLiked(next)
    setPosts(nextPosts); savePosts(nextPosts)
  }

  function addPost(data: Omit<Post, 'id' | 'likes' | 'comments'>) {
    const newPost: Post = { ...data, id: Date.now(), likes: 0, comments: 0 }
    const next = [newPost, ...posts]
    setPosts(next); savePosts(next)
  }

  const filtered = activeBoard === '전체' ? posts : posts.filter((p) => p.board === activeBoard)

  return (
    <div className="px-4 py-4 space-y-4">
      {writing && <WriteModal onClose={() => setWriting(false)} onSubmit={addPost} />}

      {/* 게시판 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {BOARDS.map((b) => (
          <button
            key={b}
            onClick={() => setActiveBoard(b)}
            className={`whitespace-nowrap text-xs rounded-full px-3 py-1.5 border font-medium transition-colors flex-shrink-0 ${
              activeBoard === b
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-white text-gray-500 border-gray-200 hover:border-brand-pink hover:text-brand-pink'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* 게시글 수 */}
      <p className="text-[11px] text-gray-400">
        {activeBoard === '전체' ? '전체' : activeBoard} 게시글 {filtered.length}개
      </p>

      {/* 게시글 목록 */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-2xl mb-2">🐾</p>
            <p className="text-sm">아직 게시글이 없어요.</p>
            <p className="text-xs mt-1">첫 번째 글을 작성해보세요!</p>
          </div>
        )}
        {filtered.map((p) => {
          const isLiked = liked.has(p.id)
          const isExpanded = expanded === p.id
          return (
            <div key={p.id} className="card space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{p.emoji}</span>
                <span className="badge bg-brand-mint/20 text-teal-700 text-[10px]">{p.board}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400 ml-auto">
                  <MapPin size={9} />{p.region}
                </span>
              </div>

              <button
                className="w-full text-left"
                onClick={() => setExpanded(isExpanded ? null : p.id)}
              >
                <p className="text-sm font-semibold text-brand-dark">{p.title}</p>
                <p className={`text-xs text-gray-500 leading-relaxed mt-0.5 ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {p.body}
                </p>
                {p.body.length > 80 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-brand-pink mt-1 font-semibold">
                    <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    {isExpanded ? '접기' : '더 보기'}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 border-t border-gray-50">
                <button
                  onClick={() => toggleLike(p.id)}
                  className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-brand-pink font-semibold' : 'hover:text-brand-pink'}`}
                >
                  <Heart size={12} className={isLiked ? 'fill-brand-pink' : ''} />
                  {p.likes}
                </button>
                <span className="flex items-center gap-1"><MessageCircle size={11} />{p.comments}</span>
                <span className="ml-auto text-[10px]">{p.author} · {p.createdAt.slice(5)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 글쓰기 버튼 */}
      <button
        onClick={() => setWriting(true)}
        className="w-full bg-brand-pink text-white rounded-2xl py-3 text-sm font-semibold hover:bg-pink-500 active:scale-95 transition-all"
      >
        ✏️ 글쓰기
      </button>
    </div>
  )
}
