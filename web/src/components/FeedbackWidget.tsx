import { useState, useEffect } from 'react'
import { X, MessageSquare, ThumbsUp, BarChart2, ChevronRight, CheckCircle } from 'lucide-react'
import type { TabId } from '../types'

// ── 기능 투표 후보 ─────────────────────────────────────────────
const FEATURE_VOTES = [
  { id: 'gps',      label: '📍 GPS 실시간 병원 검색',         desc: '내 위치 기반 병원 찾기' },
  { id: 'gpt',      label: '🤖 GPT 챗봇 연동',               desc: '더 자연스러운 AI 상담' },
  { id: 'weight',   label: '⚖️ 체중 그래프 기록',             desc: '날짜별 체중 변화 차트' },
  { id: 'kakao',    label: '🔐 카카오 로그인',                desc: '소셜 로그인 + 내 프로필' },
  { id: 'push',     label: '🔔 예방접종 알림',                desc: '맞춤 접종 일정 푸시 알림' },
  { id: 'compare',  label: '💰 사료 가격 비교',               desc: '국내/해외 실시간 비교' },
  { id: 'sitter',   label: '🏠 캣시터 매칭',                  desc: '동네 캣시터 연결 서비스' },
  { id: 'camera',   label: '📷 고양이 사진 일기',             desc: '날짜별 사진 앨범 기록' },
]

// ── 탭별 이모지 반응 ───────────────────────────────────────────
const EMOJI_REACTIONS = [
  { key: '😍', label: '최고예요' },
  { key: '😊', label: '좋아요' },
  { key: '😐', label: '보통이에요' },
  { key: '😕', label: '아쉬워요' },
  { key: '😤', label: '불편해요' },
]

const TAB_LABELS: Record<TabId, string> = {
  chat:      'AI 상담',
  commerce:  '쇼핑',
  community: '커뮤니티',
  education: '캡 스쿨',
  hospital:  '병원 찾기',
}

// localStorage 키
const STORAGE_KEY = 'ilovesupercap_feedback'

interface FeedbackData {
  reactions: Record<string, Record<string, number>>  // tab → emoji → count
  votes: Record<string, number>                       // featureId → count
  nps: number | null
  texts: string[]
}

function loadData(): FeedbackData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { reactions: {}, votes: {}, nps: null, texts: [] }
  } catch {
    return { reactions: {}, votes: {}, nps: null, texts: [] }
  }
}

function saveData(data: FeedbackData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

type Step = 'reaction' | 'vote' | 'nps' | 'text' | 'done'

interface Props {
  activeTab: TabId
}

export default function FeedbackWidget({ activeTab }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('reaction')
  const [data, setData] = useState<FeedbackData>(loadData)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [selectedVotes, setSelectedVotes] = useState<Set<string>>(new Set())
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep('reaction')
      setSelectedEmoji(null)
      setSelectedVotes(new Set())
      setNpsScore(null)
      setText('')
      setShowResults(false)
    }
  }, [open])

  function submitReaction(emoji: string) {
    setSelectedEmoji(emoji)
    const next = { ...data }
    if (!next.reactions[activeTab]) next.reactions[activeTab] = {}
    next.reactions[activeTab][emoji] = (next.reactions[activeTab][emoji] ?? 0) + 1
    setData(next)
    saveData(next)
    setTimeout(() => setStep('vote'), 400)
  }

  function toggleVote(id: string) {
    const next = new Set(selectedVotes)
    if (next.has(id)) next.delete(id)
    else if (next.size < 3) next.add(id)
    setSelectedVotes(next)
  }

  function submitVotes() {
    const next = { ...data }
    selectedVotes.forEach((id) => {
      next.votes[id] = (next.votes[id] ?? 0) + 1
    })
    setData(next)
    saveData(next)
    setStep('nps')
  }

  function submitNps(score: number) {
    setNpsScore(score)
    const next = { ...data, nps: score }
    setData(next)
    saveData(next)
    setStep('text')
  }

  function submitText() {
    if (text.trim()) {
      const next = { ...data, texts: [...data.texts, text.trim()].slice(-50) }
      setData(next)
      saveData(next)
    }
    setStep('done')
  }

  // 상위 기능 투표 집계
  const topVotes = Object.entries(data.votes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // 현재 탭 이모지 반응 집계
  const tabReactions = data.reactions[activeTab] ?? {}
  const totalReactions = Object.values(tabReactions).reduce((a, b) => a + b, 0)

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-brand-pink text-white rounded-full shadow-lg flex items-center gap-1.5 px-3 py-2 text-xs font-semibold hover:bg-pink-500 active:scale-95 transition-all"
        aria-label="피드백 보내기"
      >
        <MessageSquare size={14} />
        의견
      </button>

      {/* 모달 오버레이 */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div
            className="bg-white w-full max-w-[430px] rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-brand-dark">집사님의 소중한 의견 💌</p>
                <p className="text-[11px] text-gray-400 mt-0.5">서비스 개선에 직접 반영됩니다</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* 단계 진행바 */}
            {step !== 'done' && (
              <div className="flex gap-1 mb-5">
                {(['reaction', 'vote', 'nps', 'text'] as Step[]).map((s, i) => (
                  <div
                    key={s}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      ['reaction', 'vote', 'nps', 'text'].indexOf(step) >= i
                        ? 'bg-brand-pink' : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* ── STEP 1: 이모지 반응 ── */}
            {step === 'reaction' && (
              <div>
                <p className="text-sm font-semibold text-brand-dark mb-1">
                  <span className="text-brand-pink">"{TAB_LABELS[activeTab]}"</span> 탭은 어떠셨나요?
                </p>
                <p className="text-xs text-gray-400 mb-4">솔직하게 선택해 주세요!</p>
                <div className="flex justify-between gap-1">
                  {EMOJI_REACTIONS.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => submitReaction(r.key)}
                      className={`flex-1 flex flex-col items-center py-3 rounded-2xl border-2 transition-all active:scale-90 ${
                        selectedEmoji === r.key
                          ? 'border-brand-pink bg-brand-pink/10 scale-110'
                          : 'border-gray-100 hover:border-brand-pink/40'
                      }`}
                    >
                      <span className="text-2xl">{r.key}</span>
                      <span className="text-[9px] text-gray-400 mt-1 leading-tight text-center">{r.label}</span>
                    </button>
                  ))}
                </div>

                {/* 현재 탭 반응 집계 보기 */}
                {totalReactions > 0 && (
                  <button
                    onClick={() => setShowResults(!showResults)}
                    className="mt-3 w-full text-xs text-gray-400 flex items-center justify-center gap-1 hover:text-brand-pink transition-colors"
                  >
                    <BarChart2 size={12} />
                    다른 집사님들 반응 보기 ({totalReactions}명)
                  </button>
                )}
                {showResults && totalReactions > 0 && (
                  <div className="mt-2 space-y-1.5 bg-gray-50 rounded-2xl p-3">
                    {EMOJI_REACTIONS.map((r) => {
                      const cnt = tabReactions[r.key] ?? 0
                      const pct = totalReactions > 0 ? Math.round((cnt / totalReactions) * 100) : 0
                      return (
                        <div key={r.key} className="flex items-center gap-2">
                          <span className="text-base w-6 text-center">{r.key}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-brand-pink h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500 w-8 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: 기능 투표 ── */}
            {step === 'vote' && (
              <div>
                <p className="text-sm font-semibold text-brand-dark mb-1">다음에 어떤 기능이 생기면 좋을까요?</p>
                <p className="text-xs text-gray-400 mb-3">최대 3개까지 선택 가능 · {selectedVotes.size}/3</p>
                <div className="space-y-2 mb-4">
                  {FEATURE_VOTES.map((f) => {
                    const selected = selectedVotes.has(f.id)
                    const voteCount = data.votes[f.id] ?? 0
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleVote(f.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          selected
                            ? 'border-brand-pink bg-brand-pink/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          selected ? 'border-brand-pink bg-brand-pink' : 'border-gray-300'
                        }`}>
                          {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-brand-dark">{f.label}</p>
                          <p className="text-[10px] text-gray-400">{f.desc}</p>
                        </div>
                        {voteCount > 0 && (
                          <span className="text-[10px] text-brand-pink font-semibold flex-shrink-0">
                            <ThumbsUp size={9} className="inline mr-0.5" />{voteCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={submitVotes}
                  className="w-full bg-brand-pink text-white rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-pink-500 transition-colors"
                >
                  다음 <ChevronRight size={16} />
                </button>
                <button onClick={() => setStep('nps')} className="w-full text-xs text-gray-400 mt-2 py-1">건너뛰기</button>
              </div>
            )}

            {/* ── STEP 3: NPS ── */}
            {step === 'nps' && (
              <div>
                <p className="text-sm font-semibold text-brand-dark mb-1">
                  알러뷰 수퍼캡을 주변 집사님께 추천하실 건가요?
                </p>
                <p className="text-xs text-gray-400 mb-4">0(전혀 안 할 것) ~ 10(반드시 추천)</p>
                <div className="grid grid-cols-11 gap-1 mb-3">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => submitNps(i)}
                      className={`aspect-square rounded-xl text-xs font-bold transition-all active:scale-90 ${
                        npsScore === i
                          ? 'bg-brand-pink text-white scale-110 shadow-md'
                          : i >= 9 ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : i >= 7 ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-4">
                  <span>😞 전혀 안 할 것</span>
                  <span>😍 반드시 추천</span>
                </div>
                <button onClick={() => setStep('text')} className="w-full text-xs text-gray-400 py-1">건너뛰기</button>
              </div>
            )}

            {/* ── STEP 4: 텍스트 의견 ── */}
            {step === 'text' && (
              <div>
                <p className="text-sm font-semibold text-brand-dark mb-1">한 줄 의견을 남겨주세요 ✍️</p>
                <p className="text-xs text-gray-400 mb-3">불편한 점, 바라는 점 모두 환영해요!</p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="예) 사료 가격 비교 기능이 있으면 정말 좋겠어요!"
                  maxLength={200}
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-pink resize-none"
                />
                <p className="text-[10px] text-gray-400 text-right mb-3">{text.length}/200</p>
                <button
                  onClick={submitText}
                  className="w-full bg-brand-pink text-white rounded-2xl py-3 font-semibold text-sm hover:bg-pink-500 transition-colors"
                >
                  제출하기
                </button>
                <button onClick={submitText} className="w-full text-xs text-gray-400 mt-2 py-1">건너뛰기</button>
              </div>
            )}

            {/* ── STEP 5: 완료 ── */}
            {step === 'done' && (
              <div className="text-center py-4">
                <CheckCircle size={52} className="text-brand-mint mx-auto mb-3" />
                <p className="text-lg font-bold text-brand-dark">감사해요, 집사님! 🐾</p>
                <p className="text-sm text-gray-500 mt-1">소중한 의견이 서비스 개선에 반영됩니다</p>

                {/* 집계 결과 미리보기 */}
                {topVotes.length > 0 && (
                  <div className="mt-5 bg-brand-pink/5 rounded-2xl p-4 text-left">
                    <p className="text-xs font-bold text-brand-dark mb-2">
                      📊 집사님들이 가장 원하는 기능 TOP 3
                    </p>
                    {topVotes.map(([id, cnt], i) => {
                      const feat = FEATURE_VOTES.find((f) => f.id === id)
                      return feat ? (
                        <div key={id} className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-brand-pink w-4">{i + 1}</span>
                          <span className="text-xs text-brand-dark flex-1">{feat.label}</span>
                          <span className="text-[10px] text-gray-400">{cnt}표</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                <button
                  onClick={() => setOpen(false)}
                  className="mt-5 w-full bg-brand-pink text-white rounded-2xl py-3 font-semibold text-sm"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
