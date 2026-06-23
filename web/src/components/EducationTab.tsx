import { useState } from 'react'
import { PlayCircle, CheckCircle, Lock, ChevronRight, Award } from 'lucide-react'

const EDU_KEY = 'supercap_edu_progress'

const COURSES = [
  { id: 1, emoji: '🐣', title: '초보 집사 생존 패키지',      desc: '아기 고양이 맞이 준비부터 첫 달 루틴까지', lessons: 8,  open: true  },
  { id: 2, emoji: '😾', title: '입질·스크래칭 행동 교정',    desc: '왜 무는지 이해하고 긍정 강화로 해결하는 법',  lessons: 6,  open: true  },
  { id: 3, emoji: '🏠', title: '2냥 이상 합사 마스터 클래스', desc: '영역 관리·첫 대면 프로토콜·스트레스 신호 읽기', lessons: 10, open: true  },
  { id: 4, emoji: '🩺', title: '중성화 전후 건강 관리',       desc: '수술 전 체크리스트, 회복 케어, 식이 변화 대응',  lessons: 5,  open: true  },
  { id: 5, emoji: '🧓', title: '노령묘 완전 케어 가이드',     desc: '7살 이후 영양·관절·인지 저하 예방 루틴',       lessons: 7,  open: false },
]

// 기본 진행률
const SEED_PROGRESS: Record<number, number> = { 1: 5, 2: 6 }

interface LessonModalProps {
  course: typeof COURSES[number]
  done: number
  onUpdate: (next: number) => void
  onClose: () => void
}

function LessonModal({ course, done, onUpdate, onClose }: LessonModalProps) {
  const lessons = Array.from({ length: course.lessons }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[430px] rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{course.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-brand-dark">{course.title}</p>
            <p className="text-xs text-gray-400">{done}/{course.lessons} 완료</p>
          </div>
        </div>

        {/* 진행바 */}
        <div className="h-2 bg-gray-100 rounded-full mb-4">
          <div
            className="h-2 bg-brand-mint rounded-full transition-all"
            style={{ width: `${Math.round((done / course.lessons) * 100)}%` }}
          />
        </div>

        {/* 강의 목록 */}
        <div className="space-y-2">
          {lessons.map((n) => {
            const completed = n <= done
            return (
              <button
                key={n}
                onClick={() => onUpdate(Math.max(done, n))}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                  completed
                    ? 'border-brand-mint/40 bg-brand-mint/5'
                    : n === done + 1
                    ? 'border-brand-pink/40 bg-brand-pink/5 hover:border-brand-pink'
                    : 'border-gray-100 opacity-50 cursor-not-allowed'
                }`}
                disabled={n > done + 1}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  completed ? 'bg-brand-mint text-white' : n === done + 1 ? 'bg-brand-pink text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {completed ? '✓' : n}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-brand-dark">
                    {n}강. {['기초 준비', '사료 선택', '화장실 세팅', '사회화 훈련', '건강 체크', '행동 이해', '영양 관리', '놀이 루틴', '스트레스 관리', '수료 정리'][n - 1] ?? `강의 ${n}`}
                  </p>
                  <p className="text-[10px] text-gray-400">약 15분</p>
                </div>
                {n === done + 1 && (
                  <span className="text-xs text-brand-pink font-semibold flex items-center gap-0.5">
                    <PlayCircle size={13} /> 시작
                  </span>
                )}
                {completed && <CheckCircle size={14} className="text-brand-mint flex-shrink-0" />}
              </button>
            )
          })}
        </div>

        {done === course.lessons && (
          <div className="mt-4 bg-brand-amber/10 border border-brand-amber/30 rounded-2xl p-4 text-center">
            <Award size={32} className="text-yellow-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-brand-dark">수료 완료!</p>
            <p className="text-xs text-gray-500 mt-0.5">{course.title} 과정을 모두 마쳤어요 🎉</p>
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full border border-gray-200 rounded-2xl py-3 text-sm text-gray-500">
          닫기
        </button>
      </div>
    </div>
  )
}

function loadProgress(): Record<number, number> {
  try { return { ...SEED_PROGRESS, ...JSON.parse(localStorage.getItem(EDU_KEY) ?? '{}') } } catch { return SEED_PROGRESS }
}

export default function EducationTab() {
  const [progress, setProgress] = useState<Record<number, number>>(loadProgress)
  const [activeCourse, setActiveCourse] = useState<typeof COURSES[number] | null>(null)

  function updateProgress(courseId: number, lessonNum: number) {
    const next = { ...progress, [courseId]: Math.max(progress[courseId] ?? 0, lessonNum) }
    setProgress(next)
    localStorage.setItem(EDU_KEY, JSON.stringify(next))
  }

  const totalLessons = COURSES.filter((c) => c.open).reduce((a, c) => a + c.lessons, 0)
  const totalDone    = COURSES.filter((c) => c.open).reduce((a, c) => a + (progress[c.id] ?? 0), 0)
  const overallPct   = Math.round((totalDone / totalLessons) * 100)

  return (
    <div className="px-4 py-4 space-y-4">
      {activeCourse && (
        <LessonModal
          course={activeCourse}
          done={progress[activeCourse.id] ?? 0}
          onUpdate={(n) => updateProgress(activeCourse.id, n)}
          onClose={() => setActiveCourse(null)}
        />
      )}

      {/* 헤더 */}
      <div className="bg-gradient-to-r from-brand-mint to-teal-400 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 mb-1">📚 캡 스쿨</p>
        <p className="text-lg font-bold leading-tight">집사도 공부해야<br />고양이가 행복해요</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs opacity-80 mb-1">
            <span>전체 진행률</span>
            <span>{totalDone}/{totalLessons} 강의 · {overallPct}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full">
            <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      <div className="space-y-3">
        {COURSES.map((c) => {
          const done = progress[c.id] ?? 0
          const pct  = Math.round((done / c.lessons) * 100)
          const certified = done === c.lessons

          return (
            <div
              key={c.id}
              className={`card space-y-2 ${!c.open ? 'opacity-60' : 'cursor-pointer hover:shadow-md transition-shadow'}`}
              onClick={() => c.open && setActiveCourse(c)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-brand-dark">{c.title}</p>
                    {certified && (
                      <span className="badge bg-brand-amber/20 text-yellow-700 text-[10px]">
                        <Award size={9} className="inline mr-0.5" />수료
                      </span>
                    )}
                    {!c.open && <Lock size={12} className="text-gray-400 ml-auto" />}
                  </div>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
                {c.open && <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />}
              </div>

              {/* 진행바 */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>{done}/{c.lessons} 강의</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${certified ? 'bg-brand-amber' : 'bg-brand-mint'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {c.open && (
                <p className="flex items-center gap-1.5 text-xs text-brand-mint font-semibold">
                  <PlayCircle size={14} />
                  {done > 0 && done < c.lessons ? `${done + 1}강 이어서 보기` : done === c.lessons ? '다시 보기' : '시작하기'}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
