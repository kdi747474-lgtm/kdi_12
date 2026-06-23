import { useState } from 'react'
import { X, Edit3, Save, Cat } from 'lucide-react'

const PROFILE_KEY = 'supercap_cat_profile'

export interface CatProfileData {
  name: string
  breed: string
  birthYear: string
  gender: 'male' | 'female' | ''
  neutered: boolean
  weight: string
  color: string
}

const EMPTY: CatProfileData = {
  name: '', breed: '', birthYear: '', gender: '', neutered: false, weight: '', color: '',
}

const BREEDS = [
  '코리안 숏헤어(코숏)', '러시안 블루', '스코티시 폴드', '브리티시 숏헤어',
  '페르시안', '메인쿤', '샴', '뱅갈', '아비시니안', '노르웨이 숲', '기타',
]

const COLORS = ['🤍 흰색', '🖤 검정', '🧡 주황', '🩶 회색', '🤎 갈색', '🐾 삼색', '🌗 턱시도', '기타']

export function loadProfile(): CatProfileData {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') } } catch { return EMPTY }
}

function saveProfile(p: CatProfileData) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function CatProfile({ open, onClose }: Props) {
  const [profile, setProfile] = useState<CatProfileData>(loadProfile)
  const [editing, setEditing] = useState(!loadProfile().name)
  const [draft, setDraft]     = useState<CatProfileData>(loadProfile)

  if (!open) return null

  function startEdit() { setDraft({ ...profile }); setEditing(true) }
  function cancelEdit() { setEditing(false) }

  function saveEdit() {
    saveProfile(draft)
    setProfile(draft)
    setEditing(false)
  }

  const currentYear = new Date().getFullYear()
  const catAge = draft.birthYear ? currentYear - Number(draft.birthYear) : null

  // 사람 나이 환산
  function humanAge(age: number) {
    if (age <= 0) return null
    if (age === 1) return 15
    if (age === 2) return 24
    return 24 + (age - 2) * 4
  }

  const filled = profile.name

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[430px] rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-brand-dark">🐱 냥이 프로필</p>
          <div className="flex items-center gap-2">
            {filled && !editing && (
              <button onClick={startEdit} className="flex items-center gap-1 text-xs text-brand-pink font-semibold">
                <Edit3 size={13} /> 수정
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
        </div>

        {/* 프로필 표시 모드 */}
        {!editing && filled ? (
          <div className="space-y-4">
            {/* 아바타 카드 */}
            <div className="bg-gradient-to-br from-brand-pink/10 to-brand-mint/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-brand-pink/20 flex items-center justify-center text-4xl shadow-sm">
                🐱
              </div>
              <div>
                <p className="text-xl font-bold text-brand-dark">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.breed || '품종 미입력'} · {profile.color || ''}</p>
                {profile.birthYear && (
                  <p className="text-xs text-brand-pink font-semibold mt-0.5">
                    {catAge}살 (사람 나이 약 {humanAge(catAge!)}세)
                  </p>
                )}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '성별', value: profile.gender === 'male' ? '수컷 ♂' : profile.gender === 'female' ? '암컷 ♀' : '-' },
                { label: '중성화', value: profile.neutered ? '완료 ✅' : '미완 ❌' },
                { label: '현재 체중', value: profile.weight ? `${profile.weight} kg` : '-' },
                { label: '출생연도', value: profile.birthYear || '-' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-brand-dark">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 편집 모드 */
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">냥이 이름 *</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="예: 까망이, 순둥이"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">품종</label>
              <select
                value={draft.breed}
                onChange={(e) => setDraft({ ...draft, breed: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-white"
              >
                <option value="">선택하세요</option>
                {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">출생연도</label>
                <input
                  type="number"
                  value={draft.birthYear}
                  onChange={(e) => setDraft({ ...draft, birthYear: e.target.value })}
                  placeholder="2020"
                  min={2000} max={currentYear}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-pink"
                />
                {catAge !== null && catAge > 0 && (
                  <p className="text-[10px] text-brand-pink mt-0.5">{catAge}살 (사람 나이 약 {humanAge(catAge)}세)</p>
                )}
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">현재 체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={draft.weight}
                  onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                  placeholder="4.2"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-pink"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">성별</label>
              <div className="flex gap-2">
                {(['male', 'female', ''] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setDraft({ ...draft, gender: g })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                      draft.gender === g ? 'border-brand-pink bg-brand-pink/10 text-brand-pink' : 'border-gray-100 text-gray-500'
                    }`}
                  >
                    {g === 'male' ? '수컷 ♂' : g === 'female' ? '암컷 ♀' : '미확인'}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.neutered}
                onChange={(e) => setDraft({ ...draft, neutered: e.target.checked })}
                className="w-4 h-4 rounded accent-brand-pink"
              />
              <div>
                <p className="text-sm font-semibold text-brand-dark">중성화 완료</p>
                <p className="text-[10px] text-gray-400">사료량 계산 시 15% 자동 감량 적용</p>
              </div>
            </label>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">털 색상</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDraft({ ...draft, color: c })}
                    className={`text-xs px-2.5 py-1 rounded-full border-2 transition-all ${
                      draft.color === c ? 'border-brand-pink bg-brand-pink/10 text-brand-pink' : 'border-gray-100 text-gray-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={saveEdit}
                disabled={!draft.name.trim()}
                className="flex-1 bg-brand-pink text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={15} /> 저장하기
              </button>
              {filled && (
                <button
                  onClick={cancelEdit}
                  className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 헤더용 냥이 이름 칩
export function CatProfileChip({ onClick }: { onClick: () => void }) {
  const profile = loadProfile()
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/20 transition-colors active:scale-95"
    >
      <Cat size={12} />
      {profile.name || '냥이 등록'}
    </button>
  )
}
