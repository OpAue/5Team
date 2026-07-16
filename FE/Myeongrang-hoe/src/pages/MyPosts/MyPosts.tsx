import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import FundingCover from '../../components/FundingCover'
import { useDB } from '../../store/db'
import {
  currentCountOf,
  getCurrentUser,
  hostedBy,
  isMatched,
  syncFundingsFromServer,
} from '../../store/actions'
import { CAMPUS_CENTER } from '../../store/schema'

export default function MyPosts() {
  useDB()
  const navigate = useNavigate()
  const me = getCurrentUser()
  const posts = me ? hostedBy(me.email) : []
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void syncFundingsFromServer({
      lat: CAMPUS_CENTER.lat,
      lng: CAMPUS_CENTER.lng,
      radiusKm: 100,
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="내가 쓴 글" />

      <main className="relative flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[12px] px-[16px] pt-[16px] pb-[24px]">
          <p className="text-[20px] font-bold text-[var(--heading)]">내가 만든 펀딩</p>

          {loading && posts.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">불러오는 중...</p>
          )}

          {!loading && posts.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
              아직 만든 펀딩이 없어요
            </p>
          )}

          {posts.map((p) => {
            const current = currentCountOf(p)
            const matched = isMatched(p)
            return (
              <div
                key={p.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/funding/${p.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/funding/${p.id}`)}
                className="flex w-full cursor-pointer gap-[12px] rounded-[4px] border border-[var(--border-card)] p-[12px] shadow-[0px_4px_6px_rgba(0,0,0,0.08)]"
              >
                <FundingCover
                  source={p}
                  size="thumb"
                  className="size-[76px] shrink-0 rounded-[4px]"
                  imgClassName="h-full w-full object-cover"
                  alt={p.locationName}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                  <span
                    className={`w-fit rounded-[11px] px-[8px] py-[3px] text-[11px] font-bold ${
                      matched
                        ? 'bg-[var(--blue-tint)] text-[var(--blue-deep)]'
                        : 'bg-[var(--primary-tint)] text-[var(--primary-deep)]'
                    }`}
                  >
                    {matched ? '성사' : '모집 중'}
                  </span>
                  <p className="truncate text-[16px] font-bold text-[var(--heading)]">{p.title}</p>
                  <p className="text-[13px] text-[var(--label)]">
                    {p.locationName} · {current}/{p.targetCount}명
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <button
        type="button"
        onClick={() => navigate('/funding/new')}
        className="absolute bottom-[101px] right-[16px] flex size-[56px] items-center justify-center rounded-full bg-[var(--primary)] shadow-[0px_4px_12px_rgba(39,119,231,0.35)]"
        aria-label="펀딩 만들기"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-[26px]">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>

      <BottomNav active="myposts" />
    </div>
  )
}
