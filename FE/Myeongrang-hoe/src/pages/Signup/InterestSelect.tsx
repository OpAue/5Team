import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { patchDraft } from '../../store/signupDraft'
import { FUNDING_CATEGORIES } from '../../store/schema'

const interests = FUNDING_CATEGORIES

export default function InterestSelect() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])

  function toggle(tag: string) {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="flex min-h-screen flex-col bg-white px-[24px] pt-[100px]">
      <p className="text-[24px] font-bold text-[var(--heading)]">관심 있는 활동을 골라주세요</p>
      <p className="text-[16px] text-[var(--label)]">선택한 관심사에 맞는 펀딩과 알림을 보여드려요</p>

      <div className="h-[40px]" />

      <div className="flex flex-wrap gap-[10px]">
        {interests.map((tag) => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`rounded-full border px-[18px] py-[11px] text-[14px] ${
                active
                  ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                  : 'border-[var(--border-card)] bg-white font-medium text-[var(--label)]'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <p className="pb-[16px] text-center text-[12px] text-[var(--border)]">
        {selected.length}개 선택됨 · 최소 1개 이상 선택해주세요
      </p>

      <button
        type="button"
        disabled={selected.length === 0}
        onClick={() => {
          patchDraft({ interests: selected })
          navigate('/signup/location')
        }}
        className="mb-[40px] flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
      >
        <span className="text-[16px] font-medium text-[var(--on-primary)]">다음</span>
      </button>
    </div>
  )
}
