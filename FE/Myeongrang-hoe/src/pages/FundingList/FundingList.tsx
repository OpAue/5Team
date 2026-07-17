import { useEffect, useMemo, useState } from 'react'
import BottomNav from '../../components/BottomNav'
import GigCard from '../../components/GigCard'
import PageHeader from '../../components/PageHeader'
import { useDB } from '../../store/db'
import {
  currentCountOf,
  getUser,
  isClosed,
  isExpired,
  isMatched,
  participantNamesOf,
  syncFundingsFromServer,
} from '../../store/actions'
import { CAMPUS_CENTER, FUNDING_CATEGORIES } from '../../store/schema'
import { filterBlockedFundingHost } from '../../store/moderation'
import { distanceKm } from '../../lib/geo'

const CATEGORIES = ['전체', ...FUNDING_CATEGORIES] as const
type CategoryFilter = (typeof CATEGORIES)[number]
type SortKey = 'latest' | 'almost' | 'nearby' | 'popular'
type DateFilter = 'all' | 'today' | 'week'
type RadiusFilter = 'all' | '1' | '3'
type StatusFilter = 'expired' | 'none' | 'matched' | 'both'

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: '날짜 전체' },
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
]

const RADIUS_OPTIONS: { value: RadiusFilter; label: string }[] = [
  { value: 'all', label: '거리 전체' },
  { value: '1', label: '1km 이내' },
  { value: '3', label: '3km 이내' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'almost', label: '성사임박순' },
  { value: 'nearby', label: '가까운순' },
  { value: 'popular', label: '인기순' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'expired', label: '마감 제외' },
  { value: 'none', label: '전체 보기' },
  { value: 'matched', label: '모집완료 제외' },
  { value: 'both', label: '마감 + 모집완료 제외' },
]

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="relative flex-1">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none rounded-[4px] border border-[var(--border-card)] bg-white px-[12px] py-[9px] pr-[28px] text-[13px] font-medium text-[var(--heading)] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[9px] text-[var(--border)]">
        ▼
      </span>
    </div>
  )
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x.getTime()
}

export default function FundingList() {
  const db = useDB()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('전체')
  const [sort, setSort] = useState<SortKey>('latest')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [radiusFilter, setRadiusFilter] = useState<RadiusFilter>('all')
  const [freeOnly, setFreeOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('expired')
  const hideExpired = statusFilter === 'expired' || statusFilter === 'both'
  const hideMatched = statusFilter === 'matched' || statusFilter === 'both'
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
    if (hideExpired) list = list.filter((g) => !isExpired(g) && !isClosed(g))
    if (hideMatched) list = list.filter((g) => !isMatched(g))
    if (freeOnly) list = list.filter((g) => (g.fee ?? 0) === 0)

    // 날짜 필터 (만남일 기준, 없으면 생성일)
    if (dateFilter !== 'all') {
      const now = new Date()
      const todayStart = startOfDay(now)
      const todayEnd = endOfDay(now)
      const weekEnd = todayStart + 7 * 24 * 60 * 60 * 1000
      list = list.filter((g) => {
        const t = g.meetAt ? new Date(g.meetAt).getTime() : g.createdAt
        if (Number.isNaN(t)) return false
        if (dateFilter === 'today') return t >= todayStart && t <= todayEnd
        return t >= todayStart && t < weekEnd
      })
    }

    // 거리
    const radiusKm = radiusFilter === '1' ? 1 : radiusFilter === '3' ? 3 : null
    if (radiusKm != null) {
      list = list.filter(
        (g) => distanceKm(CAMPUS_CENTER, { lat: g.lat, lng: g.lng }) <= radiusKm,
      )
    }

    if (tokens.length > 0) {
      list = list.filter((g) => {
        const hostName = getUser(g.hostEmail)?.name ?? ''
        const hay = normalize(
          [g.title, g.category, g.locationName, g.address, g.description, hostName, g.meetTimeText].join(
            ' ',
          ),
        )
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
  }, [
    db.fundings,
    search,
    category,
    sort,
    dateFilter,
    radiusFilter,
    freeOnly,
    hideExpired,
    hideMatched,
  ])

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

          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryFilter)}
              className="w-full appearance-none rounded-[4px] border border-[var(--border-card)] bg-white px-[14px] py-[11px] pr-[36px] text-[14px] font-medium text-[var(--heading)] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === '전체' ? '전체 카테고리' : c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[10px] text-[var(--border)]">
              ▼
            </span>
          </div>

          {/* 날짜 · 요금 */}
          <div className="flex items-center gap-[8px]">
            <FilterSelect label="날짜" value={dateFilter} onChange={setDateFilter} options={DATE_OPTIONS} />
            <button
              type="button"
              onClick={() => setFreeOnly((v) => !v)}
              className={`shrink-0 rounded-[4px] border px-[12px] py-[9px] text-[13px] ${
                freeOnly
                  ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                  : 'border-[var(--border-card)] font-medium text-[var(--label)]'
              }`}
            >
              무료만
            </button>
          </div>

          {/* 거리 · 정렬 */}
          <div className="flex items-center gap-[8px]">
            <FilterSelect label="거리" value={radiusFilter} onChange={setRadiusFilter} options={RADIUS_OPTIONS} />
            <FilterSelect label="정렬" value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>

          {/* 상태 */}
          <FilterSelect label="상태" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />

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
              {search || category !== '전체' || freeOnly || dateFilter !== 'all'
                ? '조건에 맞는 펀딩이 없어요'
                : '아직 등록된 펀딩이 없어요'}
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
                  !isMatched(g) && !isClosed(g) && g.targetCount - current === 1
                    ? `${current}/${g.targetCount}명 · 목표 달성 임박`
                    : `${current}/${g.targetCount}명 참여${g.fee === 0 ? ' · 무료' : ''}`,
                best: g.best,
                expired: isExpired(g) || isClosed(g),
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
