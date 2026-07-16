import sproutLogo from '../assets/shared/sprout-logo.svg'

type Props = {
  message?: string
  /** true 이면 앱 전체 덮는 오버레이 (기본) */
  fullScreen?: boolean
}

/**
 * 서비스 공통 로딩 UI
 * - 흰 배경
 * - 우측 상단 새싹 로고
 * - 중앙 로딩 인디케이터 + 메시지
 */
export default function LoadingScreen({
  message = '잠시만 기다려 주세요',
  fullScreen = true,
}: Props) {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-[200]' : 'relative min-h-[240px] w-full'
      } flex flex-col bg-white`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* 우측 상단 새싹 로고 */}
      <div className="absolute right-[20px] top-[20px] flex items-center gap-[8px]">
        <img src={sproutLogo} alt="명랑회" className="size-[40px]" />
        <span className="text-[13px] font-bold text-[var(--heading)]">명랑회</span>
      </div>

      {/* 중앙 로딩 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-[18px] px-[24px]">
        <div className="relative size-[56px]">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[var(--hairline)] border-t-[var(--primary-deep)]" />
          <img
            src={sproutLogo}
            alt=""
            className="absolute left-1/2 top-1/2 size-[28px] -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <p className="text-center text-[14px] font-medium text-[var(--label)]">{message}</p>
      </div>
    </div>
  )
}
