import { Link } from 'react-router-dom'
import { getUser } from '../store/actions'
import FundingCover from './FundingCover'
import UserAvatar from './UserAvatar'

export interface Gig {
  id: number | string
  category: string
  title: string
  hostName: string
  meetTimeText: string
  locationName: string
  progress: number
  participantNames: string[]
  /** 참여자 이메일 (프로필 사진 표시용, 선택) */
  participantEmails?: string[]
  foot: string
  best?: boolean
  expired?: boolean
  coverImage?: string
  lat?: number
  lng?: number
}

function ParticipantAvatars({
  names,
  emails,
}: {
  names: string[]
  emails?: string[]
}) {
  const shown = names.slice(0, 4)
  const extra = names.length - shown.length

  return (
    <div className="flex items-center">
      {shown.map((name, i) => {
        const email = emails?.[i]
        const user = email ? getUser(email) : null
        return (
          <div
            key={email ?? `${name}-${i}`}
            className="relative shrink-0 rounded-full border-2 border-white"
            style={{
              marginLeft: i > 0 ? -7 : 0,
              zIndex: shown.length - i,
            }}
          >
            <UserAvatar user={user} name={name} size={21} />
          </div>
        )
      })}
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
  const hasCoords = typeof gig.lat === 'number' && typeof gig.lng === 'number'

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
      {hasCoords || gig.coverImage ? (
        <FundingCover
          source={{
            coverImage: gig.coverImage,
            lat: gig.lat ?? 37.5805,
            lng: gig.lng ?? 126.9227,
          }}
          size="thumb"
          className="size-[81px] shrink-0 rounded-[4px]"
          imgClassName="h-full w-full object-cover"
          alt={gig.locationName}
        />
      ) : (
        <div
          className="size-[81px] shrink-0 rounded-[4px]"
          style={{ backgroundImage: 'linear-gradient(135deg, #2777e7 0%, #5d90d8 71.4%)' }}
        />
      )}
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
          <ParticipantAvatars names={gig.participantNames} emails={gig.participantEmails} />
          <span className="text-[13px] font-bold text-[var(--label)]">{gig.foot}</span>
        </div>
      </div>
    </Link>
  )
}
