import { PlayCircle, CheckCircle, Lock } from 'lucide-react'

const COURSES = [
  {
    id: 1, emoji: '🐣', title: '초보 집사 생존 패키지',
    desc: '아기 고양이 맞이 준비부터 첫 달 루틴까지',
    lessons: 8, done: 5, open: true,
  },
  {
    id: 2, emoji: '😾', title: '입질·스크래칭 행동 교정',
    desc: '왜 무는지 이해하고 긍정 강화로 해결하는 법',
    lessons: 6, done: 6, open: true, certified: true,
  },
  {
    id: 3, emoji: '🏠', title: '2냥 이상 합사 마스터 클래스',
    desc: '영역 관리·첫 대면 프로토콜·스트레스 신호 읽기',
    lessons: 10, done: 2, open: true,
  },
  {
    id: 4, emoji: '🩺', title: '중성화 전후 건강 관리',
    desc: '수술 전 체크리스트, 회복 케어, 식이 변화 대응',
    lessons: 5, done: 0, open: true,
  },
  {
    id: 5, emoji: '🧓', title: '노령묘 완전 케어 가이드',
    desc: '7살 이후 영양·관절·인지 저하 예방 루틴',
    lessons: 7, done: 0, open: false,
  },
]

export default function EducationTab() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-mint to-teal-400 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 mb-1">📚 캡 스쿨</p>
        <p className="text-lg font-bold leading-tight">집사도 공부해야<br />고양이가 행복해요</p>
        <p className="text-xs opacity-80 mt-2">수료증 발급 · 퀴즈 기반 학습</p>
      </div>

      {/* Course list */}
      <div className="space-y-3">
        {COURSES.map((c) => {
          const pct = Math.round((c.done / c.lessons) * 100)
          return (
            <div key={c.id} className={`card space-y-2 ${!c.open ? 'opacity-60' : 'cursor-pointer hover:shadow-md transition-shadow'}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{c.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-brand-dark">{c.title}</p>
                    {c.certified && (
                      <span className="badge bg-brand-amber/20 text-yellow-700 text-[10px]">
                        <CheckCircle size={9} className="inline mr-0.5" />수료
                      </span>
                    )}
                    {!c.open && <Lock size={12} className="text-gray-400 ml-auto" />}
                  </div>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>{c.done}/{c.lessons} 강의</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-mint rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {c.open && (
                <button className="flex items-center gap-1.5 text-xs text-brand-mint font-semibold hover:underline">
                  <PlayCircle size={14} />
                  {c.done > 0 && c.done < c.lessons ? '이어서 보기' : c.done === c.lessons ? '다시 보기' : '시작하기'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
