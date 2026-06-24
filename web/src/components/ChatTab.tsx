import { useRef, useEffect, useState } from 'react'
import { Send, AlertCircle, ArrowRight, Loader2, ExternalLink, MapPin } from 'lucide-react'
import type { ChatMessage, TabId } from '../types'
import { askAI } from '../lib/chatbot'
import MiniTools from './MiniTools'
import CatQuiz from './CatQuiz'
import WeatherWidget from './WeatherWidget'

// 카테고리별 실생활 질문
const QUICK_CATEGORIES = [
  {
    label: '🏥 건강',
    questions: ['밥을 안 먹어요', '토를 자주 해요', '물을 안 마셔요', '화장실을 못 가요', '기침을 해요', '눈곱이 많이 껴요'],
  },
  {
    label: '🐾 행동',
    questions: ['밤마다 울어요', '입질이 심해요', '합사 방법 알려줘', '화장실을 안 써요', '털을 많이 뽑아요', '스크래칭이 심해요'],
  },
  {
    label: '🛒 용품',
    questions: ['사료 추천해줘', '모래 추천해줘', '좋은 장난감 알려줘', '캣타워 고르는 법', '사료 전환 방법', '물그릇 추천'],
  },
  {
    label: '📋 정보',
    questions: ['중성화 언제 해야 해요', '예방접종 일정 알려줘', '털갈이 시즌 관리법', '스케일링 주기', '노령묘 관리법', '아기 고양이 주의사항'],
  },
  {
    label: '🌤️ 외출',
    questions: ['병원 갈 때 준비물', '고양이 학교 준비물', '추울 때 옷 입혀야 해요', '더울 때 외출 주의사항', '비 오는 날 외출', '이동장 고르는 법'],
  },
]

const MODULE_LABEL: Record<string, string> = {
  hospital:  '🏥 병원 탭으로 이동',
  commerce:  '🛒 쇼핑 탭으로 이동',
  education: '📚 캡 스쿨로 이동',
  community: '🏘️ 커뮤니티로 이동',
}

interface Props {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  onNavigate: (tab: TabId) => void
}

export default function ChatTab({ messages, setMessages, onNavigate }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeCat, setActiveCat] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }

    // history를 setMessages 콜백 밖에서 구성하되, 현재 메시지도 포함
    const history = [
      ...messages.slice(-7),
      userMsg,
    ].map((m) => ({ role: (m.role === 'bot' ? 'assistant' : 'user') as 'user' | 'assistant', content: m.text }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { reply, action } = await askAI(text, history)
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: reply,
        action,
        timestamp: new Date(),
      }])
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: '앗, 잠시 연결이 불안정해요 😅 다시 한번 말씀해 주세요!',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full">

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">

        {/* 날씨 & 외출 준비 */}
        <div className="pt-3">
          <WeatherWidget />
        </div>

        {/* 미니 도구 */}
        <MiniTools />

        {/* 고양이 성향 테스트 */}
        <div className="px-4 pb-2">
          <CatQuiz onNavigate={onNavigate} />
        </div>

        <div className="px-4 py-2 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[82%] space-y-1.5">
                {m.role === 'bot' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🐾</span>
                    <span className="text-xs font-semibold text-brand-pink">수퍼캡 AI</span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-brand-pink text-white rounded-tr-sm'
                    : 'bg-white text-brand-dark shadow-sm rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
                <div className={`text-[10px] text-gray-400 ${m.role === 'user' ? 'text-right' : ''}`}>
                  {formatTime(m.timestamp)}
                </div>

                {/* 액션 카드 */}
                {m.action && (m.action.recommended_module !== 'chat' || m.action.map_links || m.action.ask_location) && (
                  <div className={`rounded-xl p-3 text-xs border ${
                    m.action.requires_hospital
                      ? 'bg-red-50 border-red-200'
                      : m.action.map_links
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-brand-mint/10 border-brand-mint/30'
                  }`}>
                    {m.action.requires_hospital && (
                      <div className="flex items-center gap-1 font-bold text-red-600 mb-2">
                        <AlertCircle size={13} /> 빠른 병원 방문을 권해요
                      </div>
                    )}

                    {/* 지도 링크 버튼 */}
                    {m.action.map_links && m.action.map_links.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 text-blue-700 font-bold mb-1.5">
                          <MapPin size={11} /> 지도에서 바로 찾기
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {m.action.map_links.map((link, i) => {
                            const colorMap: Record<string, string> = {
                              naver:   'bg-[#03C75A] hover:bg-[#02a84a] text-white',
                              kakao:   'bg-yellow-400 hover:bg-yellow-500 text-yellow-900',
                              google:  'bg-blue-500 hover:bg-blue-600 text-white',
                              red:     'bg-red-500 hover:bg-red-600 text-white',
                              default: 'bg-gray-600 hover:bg-gray-700 text-white',
                            }
                            return (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-between rounded-xl px-3 py-2 font-semibold transition-colors active:scale-95 ${colorMap[link.color ?? 'default']}`}
                              >
                                <span>{link.label}</span>
                                <ExternalLink size={11} className="flex-shrink-0 opacity-80" />
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* 지역 물어보기 안내 */}
                    {m.action.ask_location && !m.action.map_links && (
                      <div className="flex items-center gap-1.5 text-blue-600 font-semibold mb-2">
                        <MapPin size={11} /> 지역을 알려주시면 지도 링크를 드릴게요!
                      </div>
                    )}

                    {/* 탭 이동 버튼 */}
                    {MODULE_LABEL[m.action.recommended_module] && (
                      <button
                        onClick={() => onNavigate(m.action!.recommended_module)}
                        className="flex items-center gap-1 font-semibold text-brand-pink hover:underline mt-1"
                      >
                        {MODULE_LABEL[m.action.recommended_module]}
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 로딩 */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[82%]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-base">🐾</span>
                  <span className="text-xs font-semibold text-brand-pink">수퍼캡 AI</span>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin text-brand-pink" />
                  생각 중이에요...
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="shrink-0 border-t border-gray-100 bg-white">
        <div className="flex gap-1 px-3 pt-2 overflow-x-auto">
          {QUICK_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCat(i)}
              className={`whitespace-nowrap text-[11px] font-semibold rounded-full px-3 py-1 transition-colors ${
                activeCat === i
                  ? 'bg-brand-dark text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 질문 버튼들 */}
        <div className="flex gap-2 px-3 py-2 overflow-x-auto">
          {QUICK_CATEGORIES[activeCat].questions.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="whitespace-nowrap text-xs bg-brand-bg border border-brand-pink/25 text-brand-dark rounded-full px-3 py-1.5 hover:bg-brand-pink hover:text-white hover:border-brand-pink transition-colors disabled:opacity-40 shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div className="px-4 pb-5 pt-1 flex gap-2 shrink-0 bg-white border-t border-gray-50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && send(input)}
          placeholder="고양이 고민을 입력하세요..."
          disabled={loading}
          className="flex-1 bg-brand-bg border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand-pink transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="bg-brand-pink text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 hover:bg-pink-500 transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
