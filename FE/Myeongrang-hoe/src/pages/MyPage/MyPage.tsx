import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import GigCard from '../../components/GigCard'
import PageHeader from '../../components/PageHeader'
import UserAvatar from '../../components/UserAvatar'
import SunlightBadge from '../../components/SunlightBadge'
import reviewerAvatar from '../../assets/mypage/reviewer-avatar.svg'
import { useDB } from '../../store/db'
import {
  currentCountOf,
  fundingsOf,
  getCurrentUser,
  getUser,
  isClosed,
  isExpired,
  isMatched,
  logout,
  participantNamesOf,
  reviewsReceivedBy,
  syncMeFromServer,
  syncUserReviewsFromServer,
  wishlistOf,
} from '../../store/actions'
import {
  sunlightTier,
  sunlightTierIndex,
  SUNLIGHT_PREVIEW_SCORES,
  SUNLIGHT_TIERS,
} from '../../lib/sunlight'
import { TEST_ACCOUNTS } from '../../store/schema'

const TEST_EMAILS = new Set(Object.values(TEST_ACCOUNTS))

type Tab = 'review' | 'history' | 'wishlist' | 'stats'

const tabs: { key: Tab; label: string }[] = [
  { key: 'review', label: '받은 리뷰' },
  { key: 'history', label: '참여 기록' },
  { key: 'wishlist', label: '찜 목록' },
  { key: 'stats', label: '활동 통계' },
]

export default function MyPage() {
  const navigate = useNavigate()
  useDB()
  const me = getCurrentUser()
  const [tab, setTab] = useState<Tab>('review')
  /** 테스트 계정 전용: 햇살 단계 미리보기 인덱스 (null이면 실제 점수) */
  const [sunPreviewIndex, setSunPreviewIndex] = useState<number | null>(null)

  useEffect(() => {
    void syncMeFromServer().then(() => {
      const email = getCurrentUser()?.email
      if (email) void syncUserReviewsFromServer(email)
    })
  }, [])

  useEffect(() => {
    setSunPreviewIndex(null)
  }, [me?.email])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!me) return null

  const isTestAccount = TEST_EMAILS.has(me.email)
  const realTier = sunlightTierIndex(me.sunlightScore)
  const activeTierIndex = isTestAccount ? (sunPreviewIndex ?? realTier) : realTier
  const displayScore = isTestAccount
    ? sunPreviewIndex == null
      ? me.sunlightScore
      : SUNLIGHT_PREVIEW_SCORES[sunPreviewIndex]
    : me.sunlightScore
  const displayTierLabel = sunlightTier(displayScore)
  const tierPalette = SUNLIGHT_TIERS[activeTierIndex]

  function cycleSunPreview(delta: number) {
    if (!isTestAccount) return
    setSunPreviewIndex((prev) => {
      const base = prev ?? realTier
      return (base + delta + SUNLIGHT_PREVIEW_SCORES.length) % SUNLIGHT_PREVIEW_SCORES.length
    })
  }

  const reviews = reviewsReceivedBy(me.email)
  const history = fundingsOf(me.email)
  const wishlist = wishlistOf(me.email)

  const categoryCounts = history.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] ?? 0) + 1
    return acc
  }, {})
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const crossCampusCount = history.filter((f) => getUser(f.hostEmail)?.campus !== me.campus).length
  const crossCampusRatio = history.length > 0 ? Math.round((crossCampusCount / history.length) * 100) : 0

  const stats = [
    { value: me.participationCount, label: '참여한 펀딩' },
    { value: reviews.length, label: '받은 리뷰' },
    { value: me.noShowCount, label: '노쇼 횟수' },
  ]

  const activityStats = [
    { label: '이번 달 참여', value: `${history.length}건` },
    { label: '가장 많이 한 활동', value: topCategory },
    { label: '캠퍼스 간 교류 비율', value: `${crossCampusRatio}%` },
    { label: '햇살지수', value: `${me.sunlightScore}점 · ${sunlightTier(me.sunlightScore)}` },
  ]

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="마이페이지" />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-[13px] border-b border-[var(--hairline)] px-[17px] pt-[26px] pb-[17px]">
          <UserAvatar user={me} size={77} />
          <p className="text-[21px] font-bold text-[var(--heading)]">{me.name}</p>
          <span className="rounded-[12px] bg-[var(--primary-tint)] px-[11px] py-[4px] text-[11px] font-bold text-[var(--primary-deep)]">
            {me.campus} · {me.age}살
          </span>

          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => navigate('/profile-setup/edit')}
              className="rounded-full border border-[var(--border-card)] bg-white px-[14px] py-[6px] text-[12px] font-medium text-[var(--heading)]"
            >
              프로필 수정하기
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[var(--border-card)] bg-white px-[14px] py-[6px] text-[12px] font-medium text-[var(--label)]"
            >
              로그아웃
            </button>
          </div>

          <div className="flex w-full items-center gap-[10px] p-[4px]">
            {isTestAccount && (
              <button
                type="button"
                aria-label="이전 햇살 단계 미리보기"
                onClick={() => cycleSunPreview(-1)}
                className="flex size-[28px] shrink-0 items-center justify-center rounded-full border border-[var(--border-card)] bg-white text-[16px] font-bold text-[var(--primary-deep)] shadow-sm"
              >
                ‹
              </button>
            )}
            <SunlightBadge
              score={displayScore}
              size={60}
              tierOverride={isTestAccount ? (activeTierIndex as 0 | 1 | 2 | 3) : undefined}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
              <div className="flex flex-wrap items-center gap-[9px]">
                <p className="text-[15px] font-bold text-[var(--heading)]">햇살지수</p>
                <span className="rounded-[12px] bg-[var(--primary-tint)] px-[9px] py-[2px] text-[12px] font-bold text-[var(--primary-deep)]">
                  {displayTierLabel}
                </span>
              </div>
              <div className="h-[9px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, displayScore))}%`,
                    background: tierPalette.bar,
                  }}
                />
              </div>
              <p className="text-[13px] text-[var(--label)]">
                {displayScore} / 100 · 노쇼 {me.noShowCount}회
                {isTestAccount && sunPreviewIndex != null && (
                  <span className="text-[var(--border)]">
                    {' '}
                    · 미리보기 {sunPreviewIndex + 1}/{SUNLIGHT_PREVIEW_SCORES.length}
                    {displayScore !== me.sunlightScore ? ' (실제와 다름)' : ''}
                  </span>
                )}
              </p>
            </div>
            {isTestAccount && (
              <button
                type="button"
                aria-label="다음 햇살 단계 미리보기"
                onClick={() => cycleSunPreview(1)}
                className="flex size-[28px] shrink-0 items-center justify-center rounded-full border border-[var(--border-card)] bg-white text-[16px] font-bold text-[var(--primary-deep)] shadow-sm"
              >
                ›
              </button>
            )}
          </div>

          <div className="flex w-full items-center">
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center">
                {i > 0 && <div className="h-[34px] w-[1px] shrink-0 bg-[var(--hairline)]" />}
                <div className="flex flex-1 flex-col items-center gap-[2px]">
                  <p className="text-[19px] font-bold text-[var(--heading)]">{s.value}</p>
                  <p className="text-[13px] text-[var(--label)]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full border-b border-[var(--hairline)]">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 py-[13px] text-[14px] ${
                tab === t.key
                  ? 'border-b-2 border-[var(--primary-deep)] font-bold text-[var(--primary-deep)]'
                  : 'font-medium text-[var(--label)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'review' && (
          <>
            {reviews.length === 0 && (
              <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
                아직 받은 리뷰가 없어요
              </p>
            )}
            {reviews.map((r) => {
              const writer = getUser(r.writerEmail)
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-[9px] border-b border-[var(--hairline)] p-[17px]"
                >
                  <div className="flex items-center gap-[11px]">
                    <img src={reviewerAvatar} alt="" className="size-[34px]" />
                    <div className="flex items-center gap-[6px]">
                      <p className="text-[15px] font-bold text-[var(--heading)]">{writer?.name}</p>
                      <span className="rounded-[12px] bg-[var(--blue-tint,#ebf4ff)] px-[9px] py-[2px] text-[12px] font-bold text-[var(--blue-deep,#116ad4)]">
                        {writer?.campus} · {writer?.age}살
                      </span>
                    </div>
                  </div>
                  {r.noShow ? (
                    <span className="w-fit rounded-[12px] bg-[#FFF1EF] px-[11px] py-[4px] text-[12px] font-bold text-[var(--red)]">
                      노쇼로 신고됨
                    </span>
                  ) : (
                    <>
                      {r.checklist.length > 0 && (
                        <div className="flex flex-wrap gap-[6px]">
                          {r.checklist.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-[12px] bg-[var(--primary-tint)] px-[11px] py-[4px] text-[12px] font-bold text-[var(--primary-deep)]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.content && <p className="text-[15px] text-black">{r.content}</p>}
                    </>
                  )}
                </div>
              )
            })}
          </>
        )}

        {tab === 'history' && (
          <div className="flex flex-col gap-[10px] px-[17px] py-[17px]">
            {history.length === 0 && (
              <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
                아직 참여한 펀딩이 없어요
              </p>
            )}
            {history.map((h) => {
              const matched = isMatched(h)
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-[8px] rounded-[4px] border border-[var(--border-card)] p-[13px]"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                    <p className="truncate text-[15px] font-bold text-[var(--heading)]">{h.title}</p>
                    <p className="text-[12px] text-[var(--border)]">{h.meetTimeText}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-[6px]">
                    <span
                      className={`rounded-[11px] px-[10px] py-[4px] text-[12px] font-bold ${
                        matched
                          ? 'bg-[var(--blue-tint)] text-[var(--blue-deep)]'
                          : 'bg-[var(--primary-tint)] text-[var(--primary-deep)]'
                      }`}
                    >
                      {matched ? '완료' : '참여중'}
                    </span>
                    {matched && (
                      <Link
                        to={`/review/new/${h.id}`}
                        className="text-[11px] font-bold text-[var(--primary-deep)]"
                      >
                        후기 작성하기
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'wishlist' && (
          <div className="flex flex-col gap-[13px] px-[17px] py-[17px]">
            {wishlist.length === 0 && (
              <p className="py-[24px] text-center text-[14px] text-[var(--border)]">찜한 펀딩이 없어요</p>
            )}
            {wishlist.map((g) => {
              const current = currentCountOf(g)
              return (
                <GigCard
                  key={g.id}
                  gig={{
                    id: g.id,
                    category: g.category,
                    title: g.title,
                    hostName: getUser(g.hostEmail)?.name ?? '알 수 없음',
                    meetTimeText: g.meetTimeText,
                    locationName: g.locationName,
                    progress: Math.round((current / g.targetCount) * 100),
                    participantNames: participantNamesOf(g),
                    participantEmails: g.participants,
                    foot: `${current}/${g.targetCount}명 참여`,
                    best: g.best,
                    expired: isExpired(g) || isClosed(g),
                    coverImage: g.coverImage,
                    lat: g.lat,
                    lng: g.lng,
                  }}
                  to={`/funding/${g.id}`}
                />
              )
            })}
          </div>
        )}

        {tab === 'stats' && (
          <div className="grid grid-cols-2 gap-[10px] px-[17px] py-[17px]">
            {activityStats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-[6px] rounded-[4px] border border-[var(--border-card)] p-[15px]"
              >
                <p className="text-[13px] text-[var(--label)]">{s.label}</p>
                <p className="text-[19px] font-bold text-[var(--heading)]">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav active="mypage" />
    </div>
  )
}
