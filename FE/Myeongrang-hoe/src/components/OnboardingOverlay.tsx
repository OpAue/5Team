import { useEffect, useState } from 'react'
import { getCurrentUser } from '../store/actions'
import { useDB } from '../store/db'
import sproutLogo from '../assets/shared/sprout-logo.svg'

const STORAGE_KEY = 'mh_onboarding_done'

const STEPS = [
  {
    title: '주변 동행 펀딩을 찾아보세요',
    body: '홈 지도에서 내 위치 근처 모임을 확인하고, 목표 인원이 모이면 함께 출발해요.',
    emoji: '🗺️',
  },
  {
    title: '관심 펀딩은 찜해 두세요',
    body: '성사가 임박하면 알림으로 알려드려요. 놓치지 말고 참여해보세요.',
    emoji: '💛',
  },
  {
    title: '채팅으로 약속을 확정해요',
    body: '참여 후 채팅방에서 시간과 장소를 맞추고, 모임 뒤에는 후기로 햇살지수를 쌓아요.',
    emoji: '💬',
  },
]

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

export function markOnboardingDone() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // ignore
  }
}

export default function OnboardingOverlay() {
  useDB()
  const me = getCurrentUser()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (me && !isOnboardingDone()) {
      setOpen(true)
      setStep(0)
    }
  }, [me?.email])

  if (!open || !me) return null

  const current = STEPS[step]
  const isLast = step >= STEPS.length - 1

  function finish() {
    markOnboardingDone()
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[180] flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-[402px] rounded-t-[16px] bg-white px-[24px] pb-[28px] pt-[20px] shadow-xl sm:rounded-[16px]">
        <div className="mb-[12px] flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <img src={sproutLogo} alt="" className="size-[28px]" />
            <p className="text-[13px] font-bold text-[var(--heading)]">명랑회 시작하기</p>
          </div>
          <button type="button" onClick={finish} className="text-[12px] text-[var(--label)]">
            건너뛰기
          </button>
        </div>

        <div className="flex flex-col items-center py-[20px] text-center">
          <span className="text-[48px]">{current.emoji}</span>
          <p className="mt-[12px] text-[20px] font-bold text-[var(--heading)]">{current.title}</p>
          <p className="mt-[10px] text-[14px] leading-[22px] text-[var(--label)]">{current.body}</p>
        </div>

        <div className="mb-[16px] flex justify-center gap-[6px]">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-[6px] w-[6px] rounded-full ${
                i === step ? 'bg-[var(--primary-deep)]' : 'bg-[var(--hairline)]'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (isLast) finish()
            else setStep((s) => s + 1)
          }}
          className="flex h-[48px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)]"
        >
          <span className="text-[15px] font-medium text-[var(--on-primary)]">
            {isLast ? '시작하기' : '다음'}
          </span>
        </button>
      </div>
    </div>
  )
}
