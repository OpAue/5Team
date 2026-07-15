import { useState } from 'react'
import BottomNav from '../../components/BottomNav'
import GigCard from '../../components/GigCard'
import PageHeader from '../../components/PageHeader'
import { useDB } from '../../store/db'
import { currentCountOf, getUser, isExpired, participantNamesOf } from '../../store/actions'

export default function FundingList() {
  const db = useDB()
  const [search, setSearch] = useState('')

  const filtered = db.fundings.filter(
    (g) =>
      g.title.includes(search) || g.category.includes(search) || g.locationName.includes(search),
  )

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="전체 펀딩 목록" />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[13px] px-[17px] pt-[17px] pb-[26px]">
          <div className="flex items-center gap-[8px] rounded-[4px] border border-[var(--border-card)] px-[13px] py-[11px]">
            <span className="text-[15px] text-[var(--border)]">⌕</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="펀딩, 장소, 카테고리로 검색"
              className="w-full text-[14px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
            />
          </div>

          <p className="text-[21px] font-bold text-[var(--heading)]">모든 약속</p>
          {filtered.map((g) => {
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
                  foot:
                    g.targetCount - current === 1
                      ? `${current}/${g.targetCount}명 · 목표 달성 임박`
                      : `${current}/${g.targetCount}명 참여`,
                  best: g.best,
                  expired: isExpired(g),
                }}
                to={`/funding/${g.id}`}
              />
            )
          })}
          {filtered.length === 0 && (
            <p className="pt-[24px] text-center text-[14px] text-[var(--border)]">
              검색 결과가 없어요
            </p>
          )}
        </div>
      </main>

      <BottomNav active="list" />
    </div>
  )
}
