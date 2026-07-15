import iconBtn from '../assets/shared/icon-btn.svg'

export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 shrink-0 bg-white">
      <div className="h-[26px]" />
      <div className="flex h-[60px] items-center justify-between border-b border-[var(--hairline)] px-[17px]">
        <p className="text-[21px] font-bold text-[var(--heading)]">{title}</p>
        <img src={iconBtn} alt="프로필" className="size-[39px]" />
      </div>
    </header>
  )
}
