import { useState } from 'react'
import { MessageCircle, ShoppingBag, Users, BookOpen, Hospital, Zap } from 'lucide-react'
import type { TabId, ChatMessage } from './types'
import ChatTab from './components/ChatTab'
import CommerceTab from './components/CommerceTab'
import CommunityTab from './components/CommunityTab'
import EducationTab from './components/EducationTab'
import HospitalTab from './components/HospitalTab'

const TABS: { id: TabId; label: string; Icon: React.ElementType; activeColor: string; dotColor: string }[] = [
  { id: 'chat',      label: 'AI 상담', Icon: MessageCircle, activeColor: 'text-brand-pink',   dotColor: 'bg-brand-pink' },
  { id: 'commerce',  label: '쇼핑',    Icon: ShoppingBag,   activeColor: 'text-brand-pink',   dotColor: 'bg-brand-pink' },
  { id: 'community', label: '커뮤니티', Icon: Users,          activeColor: 'text-brand-mint',   dotColor: 'bg-brand-mint' },
  { id: 'education', label: '캡 스쿨', Icon: BookOpen,       activeColor: 'text-brand-mint',   dotColor: 'bg-brand-mint' },
  { id: 'hospital',  label: '병원',    Icon: Hospital,      activeColor: 'text-brand-danger', dotColor: 'bg-brand-danger' },
]

const HEADER: Record<TabId, { emoji: string; title: string }> = {
  chat:      { emoji: '🐾', title: 'AI 매니저' },
  commerce:  { emoji: '🛒', title: '알러뷰 캡' },
  community: { emoji: '🏘️', title: '커뮤니티' },
  education: { emoji: '📚', title: '캡 스쿨' },
  hospital:  { emoji: '🏥', title: '병원 찾기' },
}

const hasGPT = !!import.meta.env.VITE_OPENAI_API_KEY

// 초기 메시지 (탭 이동 시에도 유지)
const INIT_MESSAGES: ChatMessage[] = [
  {
    id: '0',
    role: 'bot',
    text: '안녕하세요, 집사님! 🐱 고양이 관련 궁금한 점을 편하게 물어보세요. 건강, 용품, 교육, 지역 정보 모두 도와드릴 수 있어요!',
    timestamp: new Date(),
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('chat')
  // 메시지 상태를 App에서 관리 → 탭 이동해도 대화 유지
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INIT_MESSAGES)
  const { emoji, title } = HEADER[activeTab]

  return (
    <div className="min-h-screen bg-brand-bg flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col h-screen bg-brand-bg">

        {/* 헤더 */}
        <header className="flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur border-b border-gray-100 flex-shrink-0">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-[10px] text-gray-400 font-medium leading-none">I Love Super Cap</p>
            <p className="text-sm font-bold text-brand-dark">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {activeTab === 'chat' && (
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                hasGPT ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <Zap size={9} />
                {hasGPT ? 'GPT' : '키워드'}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-gray-400">온라인</span>
            </span>
          </div>
        </header>

        {/* 탭 콘텐츠 */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* ChatTab은 항상 렌더링하되 숨김처리 → 대화 유지 */}
          <div className={activeTab === 'chat' ? 'flex flex-col h-full' : 'hidden'}>
            <ChatTab
              messages={chatMessages}
              setMessages={setChatMessages}
              onNavigate={setActiveTab}
            />
          </div>
          {activeTab === 'commerce'  && <CommerceTab />}
          {activeTab === 'community' && <CommunityTab />}
          {activeTab === 'education' && <EducationTab />}
          {activeTab === 'hospital'  && <HospitalTab />}
        </main>

        {/* 하단 탭 바 */}
        <nav className="flex-shrink-0 bg-white border-t border-gray-100 flex">
          {TABS.map(({ id, label, Icon, activeColor, dotColor }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`tab-btn flex-1 ${active ? activeColor : 'text-gray-400'}`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px]">{label}</span>
                {active && <span className={`w-1 h-1 rounded-full ${dotColor}`} />}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
