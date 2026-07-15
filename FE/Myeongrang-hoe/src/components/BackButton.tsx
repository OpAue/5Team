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
      <span className="relative text-[21px] font-bold text-[var(--heading)]">‹</span>
    </button>
  )
}
