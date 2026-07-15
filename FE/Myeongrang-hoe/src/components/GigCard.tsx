import { Link } from 'react-router-dom'

export interface Gig {
  id: number | string
  category: string
  title: string
  meta: string
  progress: number
  avatars: string
  foot: string
  best?: boolean
}

export default function GigCard({ gig, to }: { gig: Gig; to: string }) {
  return (
    <Link
      to={to}
      className="relative flex w-full gap-[13px] rounded-[4px] border border-[var(--border-card)] bg-white p-[13px] shadow-[0px_4px_6px_rgba(0,0,0,0.08)]"
    >
      {gig.best && (
        <span className="absolute -top-[9px] left-[8px] rounded-full bg-white px-[11px] py-[4px] text-[12px] font-bold text-[var(--red)] shadow-[0px_4px_13px_rgba(0,0,0,0.08)]">
          인기
        </span>
      )}
      <div
        className="size-[81px] shrink-0 rounded-[4px]"
        style={{ backgroundImage: 'linear-gradient(135deg, #2777e7 0%, #5d90d8 71.4%)' }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <span className="w-fit rounded-[12px] bg-[var(--hairline)] px-[9px] py-[3px] text-[12px] font-bold text-[var(--label)]">
          {gig.category}
        </span>
        <p className="truncate text-[17px] font-bold text-[var(--heading)]">{gig.title}</p>
        <p className="truncate text-[14px] text-[var(--label)]">{gig.meta}</p>
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
          <div
            className="h-full rounded-full bg-[var(--primary-deep)]"
            style={{ width: `${gig.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <img src={gig.avatars} alt="참여자" className="h-[21px] w-[51px]" />
          <span className="text-[13px] font-bold text-[var(--label)]">{gig.foot}</span>
        </div>
      </div>
    </Link>
  )
}
