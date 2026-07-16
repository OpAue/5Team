import { useEffect, useMemo, useState } from 'react'
import BottomNav from '../../components/BottomNav'
import GigCard from '../../components/GigCard'
import PageHeader from '../../components/PageHeader'
import { useDB } from '../../store/db'
import {
  currentCountOf,
  getUser,
  isExpired,
  isMatched,
  participantNamesOf,
  syncFundingsFromServer,
} from '../../store/actions'
import { CAMPUS_CENTER } from '../../store/schema'
import { filterBlockedFundingHost } from '../../store/moderation'
import { distanceKm } from '../../lib/geo'

const CATEGORIES = ['전체', '맛집', '교류', '산책', '스터디', '스포츠', '봉사'] as const
type CategoryFilter = (typeof CATEGORIES)[number]
type SortKey = 'latest' | 'almost' | 'nearby' | 'popular'

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}

export default function FundingList() {
  const db = useDB()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('전체')
  const [sort, setSort] = useState<SortKey>('latest')
  const [hideExpired, setHideExpired] = useState(true)
  const [hideMatched, setHideMatched] = useState(false)
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

  const filtered = useMemo(() => {
    const q = normalize(search)
    const tokens = q ? q.split(/[,\s|/]+/).filter(Boolean) : []
    let list = filterBlockedFundingHost(db.fundings)

    if (category !== '전체') {
      list = list.filter((g) => g.category === category)
    }

    if (hideExpired) {
      list = list.filter((g) => !isExpired(g))
    }
    if (hideMatched) {
      list = list.filter((g) => !isMatched(g))
    }

    if (tokens.length > 0) {
      list = list.filter((g) => {
        const hostName = getUser(g.hostEmail)?.name ?? ''
        const hay = normalize(
          [g.title, g.category, g.locationName, g.address, g.description, hostName, g.meetTimeText].join(
            ' ',
          ),
        )
        // 모든 토큰이 포함되어야 함 (AND 검색)
        return tokens.every((t) => hay.includes(t))
      })
    }

    const withMeta = list.map((g) => {
      const current = currentCountOf(g)
      const remaining = Math.max(0, g.targetCount - current)
      const dist = distanceKm(CAMPUS_CENTER, { lat: g.lat, lng: g.lng })
      return { g, current, remaining, dist }
    })

    withMeta.sort((a, b) => {
      switch (sort) {
        case 'almost':
          // 성사 임박 우선 (남은 인원 적음 → 진행률 높음)
          if (a.remaining !== b.remaining) return a.remaining - b.remaining
          return b.current / b.g.targetCount - a.current / a.g.targetCount
        case 'nearby':
          return a.dist - b.dist
        case 'popular':
          if ((b.g.best ? 1 : 0) !== (a.g.best ? 1 : 0)) return (b.g.best ? 1 : 0) - (a.g.best ? 1 : 0)
          return b.current - a.current
        case 'latest':
        default:
          return b.g.createdAt - a.g.createdAt
      }
    })

    return withMeta
  }, [db.fundings, search, category, sort, hideExpired, hideMatched])

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
              placeholder="제목·장소·카테고리·개최자 (띄어쓰기로 AND)"
              className="w-full text-[14px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="shrink-0 text-[12px] text-[var(--label)]"
              >
                지우기
              </button>
            )}
          </div>

          {/* 카테고리 칩 */}
          <div className="-mx-[17px] overflow-x-auto px-[17px]">
            <div className="flex w-max gap-[8px] pb-[2px]">
              {CATEGORIES.map((c) => {
                const active = category === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-[14px] py-[8px] text-[13px] ${
                      active
                        ? 'bg-[var(--primary-deep)] font-bold text-white'
                        : 'bg-[var(--hairline)] font-medium text-[var(--label)]'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 정렬 + 필터 토글 */}
          <div className="flex flex-wrap items-center gap-[8px]">
            {(
              [
                { key: 'latest' as const, label: '최신' },
                { key: 'almost' as const, label: '성사임박' },
                { key: 'nearby' as const, label: '가까운순' },
                { key: 'popular' as const, label: '인기' },
              ] as const
            ).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                className={`rounded-[4px] border px-[10px] py-[6px] text-[12px] ${
                  sort === s.key
                    ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                    : 'border-[var(--border-card)] text-[var(--label)]'
                }`}
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setHideExpired((v) => !v)}
              className={`rounded-[4px] border px-[10px] py-[6px] text-[12px] ${
                hideExpired
                  ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                  : 'border-[var(--border-card)] text-[var(--label)]'
              }`}
            >
              마감 제외
            </button>
            <button
              type="button"
              onClick={() => setHideMatched((v) => !v)}
              className={`rounded-[4px] border px-[10px] py-[6px] text-[12px] ${
                hideMatched
                  ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                  : 'border-[var(--border-card)] text-[var(--label)]'
              }`}
            >
              모집완료 제외
            </button>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-[21px] font-bold text-[var(--heading)]">
              {category === '전체' ? '모든 약속' : `${category} 약속`}
            </p>
            <p className="text-[13px] text-[var(--label)]">{filtered.length}건</p>
          </div>

          {loading && filtered.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">불러오는 중...</p>
          )}

          {!loading && filtered.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
              {search || category !== '전체' ? '조건에 맞는 펀딩이 없어요' : '아직 등록된 펀딩이 없어요'}
            </p>
          )}

          {filtered.map(({ g, current }) => (
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
                foot:
                  g.targetCount - current === 1
                    ? `${current}/${g.targetCount}명 · 목표 달성 임박`
                    : `${current}/${g.targetCount}명 참여`,
                best: g.best,
                expired: isExpired(g),
                coverImage: g.coverImage,
                lat: g.lat,
                lng: g.lng,
              }}
              to={`/funding/${g.id}`}
            />
          ))}
        </div>
      </main>

      <BottomNav active="list" />
    </div>
  )
}
