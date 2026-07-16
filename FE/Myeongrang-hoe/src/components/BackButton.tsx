import backBtn from '../assets/shared/back-btn.svg'

export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로가기"
      className="relative flex size-[39px] shrink-0 items-center justify-center"
    >
      <img src={backBtn} alt="" className="absolute inset-0 size-full" />
      <svg viewBox="0 0 24 24" fill="none" className="relative size-[18px]">
        <path
          d="M15 5l-7 7 7 7"
          stroke="var(--heading)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
