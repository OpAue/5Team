import { Link } from 'react-router-dom'

export interface Gig {
  id: number | string
  category: string
  title: string
  hostName: string
  meetTimeText: string
  locationName: string
  progress: number
  participantNames: string[]
  foot: string
  best?: boolean
  expired?: boolean
}

const AVATAR_COLORS = ['#5D90D8', '#4CAF93', '#E8A23D', '#C46FC2', '#5CADC0', '#E0685F']

function ParticipantAvatars({ names }: { names: string[] }) {
  const shown = names.slice(0, 4)
  const extra = names.length - shown.length

  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <div
          key={i}
          className="flex size-[21px] shrink-0 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
          style={{
            marginLeft: i > 0 ? -7 : 0,
            zIndex: shown.length - i,
            backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          }}
        >
          {name.charAt(0)}
        </div>
      ))}
      {extra > 0 && (
        <div
          className="flex size-[21px] shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#303441] text-[9px] font-bold text-white"
          style={{ marginLeft: -7 }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}

export default function GigCard({ gig, to }: { gig: Gig; to: string }) {
  return (
    <Link
      to={to}
      className={`relative flex w-full gap-[13px] rounded-[4px] border border-[var(--border-card)] bg-white p-[13px] shadow-[0px_4px_6px_rgba(0,0,0,0.08)] ${
        gig.expired ? 'opacity-50 grayscale' : ''
      }`}
    >
      {gig.expired && (
        <span className="absolute -top-[9px] right-[8px] rounded-full bg-[#303441] px-[11px] py-[4px] text-[12px] font-bold text-white shadow-[0px_4px_13px_rgba(0,0,0,0.08)]">
          마감
        </span>
      )}
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
        <div className="flex min-w-0 items-center gap-[5px] text-[13px] text-[var(--label)]">
          <span className="max-w-[64px] shrink-0 truncate">{gig.hostName}</span>
          <span className="shrink-0 text-[var(--border)]">·</span>
          <span className="shrink-0">{gig.meetTimeText}</span>
          <span className="shrink-0 text-[var(--border)]">·</span>
          <span className="min-w-0 truncate">{gig.locationName}</span>
        </div>
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
          <div
            className="h-full rounded-full bg-[var(--primary-deep)]"
            style={{ width: `${gig.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <ParticipantAvatars names={gig.participantNames} />
          <span className="text-[13px] font-bold text-[var(--label)]">{gig.foot}</span>
        </div>
      </div>
    </Link>
  )
}
