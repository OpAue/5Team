import BackButton from './BackButton'
import UserAvatar from './UserAvatar'
import sunlightIcon from '../assets/hostdetail/sunlight-icon.svg'
import reviewerAvatar from '../assets/hostdetail/reviewer-avatar.svg'
import { useDB } from '../store/db'
import { getFunding, getUser, reviewsReceivedBy } from '../store/actions'
import { sunlightTier } from '../lib/sunlight'

export default function UserProfileSheet({
  email,
  onClose,
}: {
  email: string
  onClose: () => void
}) {
  useDB()
  const user = getUser(email)
  const reviews = reviewsReceivedBy(email)

  if (!user) {
    return (
      <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/40 sm:items-center">
        <div className="w-full max-w-[402px] rounded-t-[16px] bg-white p-[20px] sm:rounded-[16px]">
          <p className="text-[15px] text-[var(--label)]">프로필을 불러올 수 없어요</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-[16px] h-[44px] w-full rounded-[4px] bg-[var(--primary)] text-[14px] font-medium text-[var(--on-primary)]"
          >
            닫기
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    { value: user.participationCount, label: '참여한 펀딩' },
    { value: reviews.length, label: '받은 리뷰' },
    { value: user.noShowCount, label: '노쇼 횟수' },
  ]

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/40">
      <div className="flex max-h-[85vh] w-full max-w-[402px] flex-col overflow-y-auto rounded-t-[24px] bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="flex h-[20px] w-full shrink-0 items-center justify-center">
          <div className="h-[4px] w-[36px] rounded-full bg-[var(--border)]" />
        </div>

        <div className="flex shrink-0 items-center gap-[12px] px-[16px] pt-[8px] pb-[12px]">
          <BackButton onClick={onClose} />
          <p className="text-[18px] font-bold text-[var(--heading)]">참여자 프로필</p>
        </div>

        <div className="flex shrink-0 items-center gap-[12px] px-[16px] pb-[16px]">
          <UserAvatar user={user} size={64} />
          <div className="flex flex-col items-start gap-[6px]">
            <p className="text-[18px] font-bold text-[var(--heading)]">{user.name}</p>
            <span className="rounded-[11px] bg-[var(--primary-tint)] px-[10px] py-[4px] text-[10px] font-bold text-[var(--primary-deep)]">
              {user.campus} · {user.age}살
              {user.major ? ` · ${user.major}` : ''}
            </span>
          </div>
        </div>

        {user.bio && (
          <p className="px-[16px] pb-[12px] text-[13px] leading-[20px] text-[var(--ink)]">{user.bio}</p>
        )}

        {user.interests?.length > 0 && (
          <div className="flex flex-wrap gap-[6px] px-[16px] pb-[12px]">
            {user.interests.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--hairline)] px-[10px] py-[4px] text-[11px] font-medium text-[var(--label)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-[14px] px-[16px]">
          <img src={sunlightIcon} alt="" className="size-[48px] shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className="flex items-center gap-[8px]">
              <p className="text-[14px] font-bold text-[var(--heading)]">햇살지수</p>
              <span className="rounded-[11px] bg-[var(--primary-tint)] px-[8px] py-[2px] text-[11px] font-bold text-[var(--primary-deep)]">
                {sunlightTier(user.sunlightScore)}
              </span>
            </div>
            <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
              <div
                className="h-full rounded-full bg-[var(--primary-deep)]"
                style={{ width: `${user.sunlightScore}%` }}
              />
            </div>
            <p className="text-[12px] text-[var(--label)]">
              {user.sunlightScore} / 100 · 노쇼 {user.noShowCount}회
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
          <p className="text-[16px] font-bold text-[var(--heading)]">받은 리뷰</p>
        </div>

        {reviews.length === 0 && (
          <p className="px-[16px] py-[14px] text-[13px] text-[var(--border)]">아직 받은 리뷰가 없어요</p>
        )}

        {reviews.slice(0, 5).map((r) => {
          const writer = getUser(r.writerEmail)
          const funding = getFunding(r.fundingId)
          return (
            <div
              key={r.id}
              className="flex shrink-0 flex-col gap-[8px] border-b border-[var(--hairline)] px-[16px] py-[14px]"
            >
              <div className="flex items-center gap-[10px]">
                <img src={reviewerAvatar} alt="" className="size-[28px]" />
                <p className="text-[13px] font-bold text-[var(--heading)]">
                  {writer?.name ?? '알 수 없음'}
                </p>
              </div>
              <p className="text-[13px] text-[var(--ink)]">{r.content || '후기 없음'}</p>
              <p className="text-[11px] text-[var(--border)]">{funding?.title ?? ''} 참여</p>
            </div>
          )
        })}

        <div className="h-[24px]" />
      </div>
    </div>
  )
}
