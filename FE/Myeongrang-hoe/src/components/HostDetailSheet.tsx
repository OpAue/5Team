import BackButton from './BackButton'
import hostAvatar from '../assets/hostdetail/host-avatar.svg'
import sunlightIcon from '../assets/hostdetail/sunlight-icon.svg'
import reviewerAvatar from '../assets/hostdetail/reviewer-avatar.svg'
import { useDB } from '../store/db'
import { getCurrentUser, getFunding, getUser, reviewsReceivedBy } from '../store/actions'
import { sunlightTier } from '../lib/sunlight'
import { isBlocked } from '../store/moderation'

export default function HostDetailSheet({
  hostEmail,
  onClose,
  onReport,
  onBlock,
}: {
  hostEmail: string
  onClose: () => void
  onReport?: () => void
  onBlock?: () => void
}) {
  useDB()
  const host = getUser(hostEmail)
  const me = getCurrentUser()
  const reviews = reviewsReceivedBy(hostEmail)
  const blocked = isBlocked(hostEmail)
  const isSelf = !!me && me.email.toLowerCase() === hostEmail.toLowerCase()

  if (!host) return null

  const stats = [
    { value: host.participationCount, label: '참여한 펀딩' },
    { value: reviews.length, label: '받은 리뷰' },
    { value: host.noShowCount, label: '노쇼 횟수' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
      <div className="flex max-h-[85vh] w-full max-w-[402px] flex-col overflow-y-auto rounded-t-[24px] bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="flex h-[20px] w-full shrink-0 items-center justify-center">
          <div className="h-[4px] w-[36px] rounded-full bg-[var(--border)]" />
        </div>

        <div className="flex shrink-0 items-center gap-[12px] px-[16px] pt-[8px] pb-[12px]">
          <BackButton onClick={onClose} />
          <p className="text-[18px] font-bold text-[var(--heading)]">개최자 세부내역</p>
        </div>

        <div className="flex shrink-0 items-center gap-[12px] px-[16px] pt-[8px] pb-[12px]">
          <img src={hostAvatar} alt="" className="size-[64px]" />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-[6px]">
            <p className="text-[18px] font-bold text-[var(--heading)]">{host.name}</p>
            <span className="rounded-[11px] bg-[var(--primary-tint)] px-[10px] py-[4px] text-[10px] font-bold text-[var(--primary-deep)]">
              {host.campus} · {host.age}살
            </span>
          </div>
        </div>

        {!isSelf && (onReport || onBlock) && (
          <div className="flex shrink-0 gap-[8px] px-[16px] pb-[12px]">
            {onReport && (
              <button
                type="button"
                onClick={onReport}
                className="flex h-[36px] flex-1 items-center justify-center rounded-[4px] border border-[var(--border-card)] text-[13px] font-medium text-[var(--heading)]"
              >
                신고
              </button>
            )}
            {onBlock && (
              <button
                type="button"
                onClick={onBlock}
                disabled={blocked}
                className="flex h-[36px] flex-1 items-center justify-center rounded-[4px] border border-[var(--red)] text-[13px] font-medium text-[var(--red)] disabled:opacity-40"
              >
                {blocked ? '차단됨' : '차단'}
              </button>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-[14px] px-[16px]">
          <img src={sunlightIcon} alt="" className="size-[48px] shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className="flex items-center gap-[8px]">
              <p className="text-[14px] font-bold text-[var(--heading)]">햇살지수</p>
              <span className="rounded-[11px] bg-[var(--primary-tint)] px-[8px] py-[2px] text-[11px] font-bold text-[var(--primary-deep)]">
                {sunlightTier(host.sunlightScore)}
              </span>
            </div>
            <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
              <div
                className="h-full rounded-full bg-[var(--primary-deep)]"
                style={{ width: `${host.sunlightScore}%` }}
              />
            </div>
            <p className="text-[12px] text-[var(--label)]">
              {host.sunlightScore} / 100 · 노쇼 {host.noShowCount}회
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center px-[16px] pt-[16px] pb-[8px]">
          {stats.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center">
              {i > 0 && <div className="h-[32px] w-px shrink-0 bg-[var(--hairline)]" />}
              <div className="flex flex-1 flex-col items-center gap-[2px]">
                <p className="text-[18px] font-bold text-[var(--heading)]">{s.value}</p>
                <p className="text-[12px] text-[var(--label)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px w-full shrink-0 bg-[var(--hairline)]" />

        <div className="shrink-0 px-[16px] pt-[16px] pb-[8px]">
          <p className="text-[18px] font-bold text-[var(--heading)]">받은 리뷰</p>
        </div>

        {reviews.length === 0 && (
          <p className="px-[16px] py-[14px] text-[13px] text-[var(--border)]">아직 받은 리뷰가 없어요</p>
        )}

        {reviews.map((r) => {
          const writer = getUser(r.writerEmail)
          const funding = getFunding(r.fundingId)
          return (
            <div
              key={r.id}
              className="flex shrink-0 flex-col gap-[8px] border-b border-[var(--hairline)] px-[16px] py-[14px]"
            >
              <div className="flex items-center gap-[10px]">
                <img src={reviewerAvatar} alt="" className="size-[28px]" />
                <div className="flex items-center gap-[6px]">
                  <p className="text-[13px] font-bold text-[var(--heading)]">{writer?.name ?? '알 수 없음'}</p>
                  <span className="rounded-[11px] bg-[var(--blue-tint)] px-[8px] py-[2px] text-[10px] font-bold text-[var(--blue-deep)]">
                    {writer?.campus} · {writer?.age}살
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {r.checklist.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-[11px] bg-[var(--primary-tint)] px-[10px] py-[4px] text-[11px] font-bold text-[var(--primary-deep)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <p className="text-[13px] text-[var(--ink)]">{r.content}</p>
              <p className="text-[11px] text-[var(--border)]">{funding.title} 참여</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
