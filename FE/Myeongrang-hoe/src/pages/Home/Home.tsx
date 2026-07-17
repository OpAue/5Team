import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { Link } from 'react-router-dom'
import { Map, CustomOverlayMap, MapMarker, ZoomControl } from 'react-kakao-maps-sdk'
import BottomNav from '../../components/BottomNav'
import GigCard from '../../components/GigCard'
import PageHeader from '../../components/PageHeader'
import pin from '../../assets/home/pin.svg'
import locateBtn from '../../assets/home/locate-btn.svg'
import nudgeIcon from '../../assets/home/nudge-icon.svg'
import { CAMPUS_CENTER } from '../../store/schema'
import { useDB } from '../../store/db'
import {
  currentCountOf,
  getCurrentUser,
  getUser,
  isClosed,
  isExpired,
  isMatched,
  participantNamesOf,
  syncFundingsFromServer,
  syncMeFromServer,
  syncNudgeMessage,
  updateLastLocation,
} from '../../store/actions'
import { distanceKm, type LatLng } from '../../lib/geo'
import { formatKakaoError, relayoutMap, useKakao } from '../../lib/kakao'
import { filterBlockedFundingHost } from '../../store/moderation'
import { pushableNotifications, wishlistAlmostFullItems } from '../../store/notifications'
import { showToast } from '../../store/ui'
import { notifyBrowser, requestNotificationPermission, notificationPermission } from '../../lib/browserNotify'
import { clusterPoints } from '../../lib/mapCluster'
import type { FundingRecord } from '../../store/schema'

const MAP_HEIGHT = 343

type RadiusMode = '1' | '3' | 'all'

const RADIUS_OPTIONS: { key: RadiusMode; label: string; km: number }[] = [
  { key: '1', label: '1km', km: 1 },
  { key: '3', label: '3km', km: 3 },
  { key: 'all', label: '전체', km: 100 },
]

export default function Home() {
  const db = useDB()
  const me = getCurrentUser()
  const [kakaoLoading, kakaoError] = useKakao()
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const [mapLevel, setMapLevel] = useState(6)
  const [myLocation, setMyLocation] = useState<LatLng | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [locating, setLocating] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [radiusMode, setRadiusMode] = useState<RadiusMode>('3')
  const [tourPlaying, setTourPlaying] = useState(false)
  const [interestPage, setInterestPage] = useState(0)
  const toastedWishlist = useRef(new Set<string>())
  const tourTimer = useRef<number | null>(null)
  const tourIndex = useRef(0)
  const interestTouchStartX = useRef<number | null>(null)

  function locate() {
    setLocating(true)
    setRefreshTick((n) => n + 1)
  }

  useEffect(() => {
    void syncMeFromServer()
  }, [])

  // 찜 성사 임박 토스트 + 브라우저 알림
  useEffect(() => {
    if (!me) return
    const items = wishlistAlmostFullItems(me.email)
    for (const n of items) {
      if (toastedWishlist.current.has(n.id)) continue
      toastedWishlist.current.add(n.id)
      showToast(n.title + ' · ' + n.body, 'info')
      notifyBrowser(n.id, n.title, n.body, n.to)
      break
    }
    for (const n of pushableNotifications(me.email)) {
      if (n.kind === 'wishlist-almost') continue
      notifyBrowser(n.id, n.title, n.body, n.to)
    }
  }, [me?.email, db.fundings, db.wishlist, db.reviews])

  useEffect(() => {
    void syncFundingsFromServer(
      myLocation
        ? { lat: myLocation.lat, lng: myLocation.lng, radiusKm: 100 }
        : { lat: CAMPUS_CENTER.lat, lng: CAMPUS_CENTER.lng, radiusKm: 100 },
    )
  }, [myLocation?.lat, myLocation?.lng, refreshTick])

  useEffect(() => {
    let cancelled = false

    function apply(loc: LatLng, fallback: boolean) {
      if (cancelled) return
      setMyLocation(loc)
      setUsingFallback(fallback)
      setLocating(false)
      if (me) updateLastLocation(me.email, loc.lat, loc.lng)
    }

    if (!navigator.geolocation) {
      Promise.resolve().then(() => apply(CAMPUS_CENTER, true))
      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (distanceKm(coords, CAMPUS_CENTER) > 5) {
          apply(CAMPUS_CENTER, true)
        } else {
          apply(coords, false)
        }
      },
      () => apply(CAMPUS_CENTER, true),
      { timeout: 5000 },
    )

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick])

  const center = myLocation ?? CAMPUS_CENTER
  const radiusKm = RADIUS_OPTIONS.find((r) => r.key === radiusMode)?.km ?? 3

  const sorted = useMemo(() => {
    return filterBlockedFundingHost(db.fundings)
      .filter((f) => !isExpired(f) && !isClosed(f))
      .map((f) => ({
        ...f,
        distanceKm: distanceKm(center, { lat: f.lat, lng: f.lng }),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [center.lat, center.lng, db.fundings])

  const nearbyFundings = useMemo(() => {
    if (radiusMode === 'all') return sorted
    return sorted.filter((f) => f.distanceKm <= radiusKm)
  }, [sorted, radiusKm, radiusMode])

  // 관심사 맞춤
  const interestFundings = useMemo(() => {
    if (!me?.interests?.length) return []
    return filterBlockedFundingHost(db.fundings)
      .filter((f) => me.interests.includes(f.category) && !isExpired(f) && !isClosed(f))
      .slice(0, 12)
  }, [db.fundings, me?.interests])

  const INTEREST_PAGE_SIZE = 2
  const interestPages = useMemo(() => {
    const pages: (typeof interestFundings)[] = []
    for (let i = 0; i < interestFundings.length; i += INTEREST_PAGE_SIZE) {
      pages.push(interestFundings.slice(i, i + INTEREST_PAGE_SIZE))
    }
    return pages
  }, [interestFundings])

  const interestPageIndex = Math.min(interestPage, Math.max(0, interestPages.length - 1))

  function goInterestPrev() {
    setInterestPage((p) => Math.max(0, p - 1))
  }
  function goInterestNext() {
    setInterestPage((p) => Math.min(interestPages.length - 1, p + 1))
  }
  function handleInterestTouchStart(e: TouchEvent) {
    interestTouchStartX.current = e.touches[0]?.clientX ?? null
  }
  function handleInterestTouchEnd(e: TouchEvent) {
    const startX = interestTouchStartX.current
    interestTouchStartX.current = null
    if (startX == null) return
    const deltaX = (e.changedTouches[0]?.clientX ?? startX) - startX
    if (Math.abs(deltaX) < 40) return
    if (deltaX < 0) goInterestNext()
    else goInterestPrev()
  }

  const clusters = useMemo(() => {
    return clusterPoints(
      nearbyFundings.map((f) => ({ lat: f.lat, lng: f.lng, data: f })),
      mapLevel,
    )
  }, [nearbyFundings, mapLevel])

  useEffect(() => {
    if (!mapInstance || kakaoLoading || kakaoError) return
    relayoutMap(mapInstance)
    const bounds = new kakao.maps.LatLngBounds()
    bounds.extend(new kakao.maps.LatLng(center.lat, center.lng))
    const pts = nearbyFundings.length > 0 ? nearbyFundings : sorted
    pts.slice(0, 40).forEach((f) => bounds.extend(new kakao.maps.LatLng(f.lat, f.lng)))
    mapInstance.setBounds(bounds, 80, 40, 40, 40)
    // setBounds는 마커를 모두 포함하도록 중심을 옮길 수 있어, 사용자 위치가 항상 중앙에 오도록 다시 맞춘다
    mapInstance.setCenter(new kakao.maps.LatLng(center.lat, center.lng))
  }, [nearbyFundings, sorted, center, kakaoLoading, kakaoError, mapInstance, radiusMode])

  useEffect(() => {
    if (!mapInstance || !myLocation) return
    mapInstance.setCenter(new kakao.maps.LatLng(myLocation.lat, myLocation.lng))
    relayoutMap(mapInstance)
  }, [mapInstance, myLocation?.lat, myLocation?.lng])

  // 재생(투어) 정리
  useEffect(() => {
    return () => {
      if (tourTimer.current) window.clearInterval(tourTimer.current)
    }
  }, [])

  function toggleTour() {
    if (!mapInstance) return
    if (tourPlaying) {
      if (tourTimer.current) window.clearInterval(tourTimer.current)
      tourTimer.current = null
      setTourPlaying(false)
      return
    }
    const list = nearbyFundings.length > 0 ? nearbyFundings : sorted
    if (list.length === 0) {
      showToast('둘러볼 펀딩이 없어요', 'info')
      return
    }
    setTourPlaying(true)
    tourIndex.current = 0
    const step = () => {
      const f = list[tourIndex.current % list.length]
      tourIndex.current += 1
      mapInstance.setLevel(4)
      mapInstance.panTo(new kakao.maps.LatLng(f.lat, f.lng))
      setSelectedId(f.id)
    }
    step()
    tourTimer.current = window.setInterval(step, 2200)
  }

  const almostThere = nearbyFundings.find(
    (f) => !isMatched(f) && !isClosed(f) && f.targetCount - currentCountOf(f) === 1,
  )

  // 성사 임박 문구는 서버(RiskAnalysisService)가 생성한 걸 우선 쓴다
  useEffect(() => {
    if (!almostThere || almostThere.nudgeMessage) return
    void syncNudgeMessage(almostThere.id)
  }, [almostThere?.id, almostThere?.nudgeMessage])

  const selected = sorted.find((f) => f.id === selectedId)
  const showSdkLoading = kakaoLoading
  const showMapError = !kakaoLoading && !!kakaoError
  const listItems = nearbyFundings.length > 0 ? nearbyFundings : sorted
  const zoomPosition =
    typeof kakao !== 'undefined' && kakao?.maps?.ControlPosition
      ? kakao.maps.ControlPosition.RIGHT
      : undefined
  const perm = notificationPermission()

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="명랑회" />

      <main className="flex-1 overflow-y-auto">
        <div
          className="relative overflow-hidden bg-[var(--primary-tint)]"
          style={{ height: MAP_HEIGHT, minHeight: MAP_HEIGHT }}
        >
          {showSdkLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--primary-tint)]">
              <p className="text-[13px] font-medium text-[var(--label)]">지도를 불러오는 중...</p>
            </div>
          )}

          {!kakaoError && (
            <Map
              id="home-kakao-map"
              center={center}
              isPanto
              level={6}
              style={{ width: '100%', height: '100%' }}
              onCreate={(map) => {
                setMapInstance(map)
                setMapLevel(map.getLevel())
                requestAnimationFrame(() => {
                  relayoutMap(map)
                  window.setTimeout(() => relayoutMap(map), 100)
                })
              }}
              onZoomChanged={(map) => setMapLevel(map.getLevel())}
            >
              {zoomPosition != null && <ZoomControl position={zoomPosition} />}

              <CustomOverlayMap position={center} yAnchor={0.5} xAnchor={0.5}>
                <div className="size-[16px] rounded-full border-2 border-white bg-[var(--blue-deep)] shadow-[0px_0px_0px_6px_rgba(17,106,212,0.2)]" />
              </CustomOverlayMap>

              {clusters.map((c, i) => {
                if (c.type === 'cluster') {
                  return (
                    <CustomOverlayMap key={`c-${i}`} position={{ lat: c.lat, lng: c.lng }} yAnchor={0.5} xAnchor={0.5}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!mapInstance) return
                          mapInstance.setLevel(Math.max(1, mapInstance.getLevel() - 2))
                          mapInstance.panTo(new kakao.maps.LatLng(c.lat, c.lng))
                        }}
                        className="flex size-[40px] items-center justify-center rounded-full border-2 border-white bg-[var(--primary-deep)] text-[13px] font-bold text-white shadow-md"
                      >
                        {c.count}
                      </button>
                    </CustomOverlayMap>
                  )
                }
                const f = c.item as FundingRecord & { distanceKm?: number }
                return (
                  <MapMarker
                    key={f.id}
                    position={{ lat: c.lat, lng: c.lng }}
                    image={{ src: pin, size: { width: 32, height: 32 } }}
                    onClick={() => setSelectedId(f.id)}
                  />
                )
              })}
            </Map>
          )}

          {showMapError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--primary-tint)] px-[24px] text-center">
              <p className="text-[14px] font-semibold text-[var(--heading)]">카카오맵을 불러오지 못했습니다</p>
              <p className="mt-[8px] text-[12px] leading-[18px] text-[var(--label)]">
                {formatKakaoError(kakaoError)}
              </p>
            </div>
          )}

          {/* 위치 버튼 */}
          <button
            type="button"
            aria-label="내 위치로 이동"
            onClick={locate}
            className="absolute right-[18px] bottom-[68px] z-10 flex size-[47px] items-center justify-center"
          >
            <img src={locateBtn} alt="" className="absolute inset-0 size-full" />
            {/* locate-btn.svg는 하단 그림자 여백 때문에 원이 뷰박스 중앙보다 위쪽에 있어, 아이콘을 그만큼 올려 맞춘다 */}
            <svg viewBox="0 0 24 24" fill="none" className="relative -translate-y-[2.8px] size-[22px]">
              <circle cx="12" cy="12" r="3.2" stroke="var(--primary-deep)" strokeWidth="2" />
              <path
                d="M12 2v3.2M12 18.8V22M22 12h-3.2M5.2 12H2"
                stroke="var(--primary-deep)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* 재생(주변 펀딩 투어) 버튼 — 흰 원 + 삼각형 */}
          <button
            type="button"
            aria-label={tourPlaying ? '투어 중지' : '주변 펀딩 둘러보기'}
            onClick={toggleTour}
            className="absolute right-[18px] bottom-[16px] z-10 flex size-[47px] items-center justify-center rounded-full bg-white shadow-[0px_2px_10px_rgba(0,0,0,0.15)]"
          >
            {tourPlaying ? (
              <span className="flex gap-[3px]">
                <span className="h-[14px] w-[4px] rounded-sm bg-[var(--primary-deep)]" />
                <span className="h-[14px] w-[4px] rounded-sm bg-[var(--primary-deep)]" />
              </span>
            ) : (
              <span
                className="ml-[3px] block"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderLeft: '13px solid var(--primary-deep)',
                }}
              />
            )}
          </button>

          {locating && !kakaoError && (
            <span className="absolute left-[17px] top-[13px] z-10 rounded-full bg-white/90 px-[11px] py-[5px] text-[11px] font-bold text-[var(--label)]">
              위치 확인 중...
            </span>
          )}

          {usingFallback && !locating && !kakaoError && (
            <span className="absolute left-[17px] top-[13px] z-10 rounded-full bg-white/90 px-[11px] py-[5px] text-[11px] font-bold text-[var(--label)]">
              기준 위치: 명지대 인문캠퍼스
            </span>
          )}

          {selected && (
            <div className="absolute bottom-[16px] left-[17px] right-[75px] z-10 rounded-[4px] bg-white p-[13px] shadow-[0px_4px_13px_rgba(0,0,0,0.15)]">
              <p className="truncate text-[14px] font-bold text-[var(--heading)]">{selected.title}</p>
              <p className="text-[12px] text-[var(--label)]">
                {(selected.distanceKm ?? 0) < 1
                  ? `${Math.round((selected.distanceKm ?? 0) * 1000)}m`
                  : `${(selected.distanceKm ?? 0).toFixed(1)}km`}{' '}
                · {currentCountOf(selected)}/{selected.targetCount}명
              </p>
              <Link
                to={`/funding/${selected.id}`}
                className="mt-[6px] inline-block text-[12px] font-bold text-[var(--primary-deep)]"
              >
                상세보기 ›
              </Link>
            </div>
          )}
        </div>

        <div className="flex h-[21px] items-center justify-center bg-white">
          <div className="h-[4px] w-[39px] rounded-full bg-[var(--border)]" />
        </div>

        <div className="flex flex-col gap-[13px] px-[17px] pt-[13px] pb-[17px]">
          {/* 거리 필터 */}
          <div className="flex flex-wrap gap-[8px]">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRadiusMode(r.key)}
                className={`rounded-full px-[12px] py-[7px] text-[12px] ${
                  radiusMode === r.key
                    ? 'bg-[var(--primary-deep)] font-bold text-white'
                    : 'bg-[var(--hairline)] font-medium text-[var(--label)]'
                }`}
              >
                {r.label}
              </button>
            ))}
            {perm !== 'unsupported' && perm !== 'granted' && (
              <button
                type="button"
                onClick={() => void requestNotificationPermission()}
                className="rounded-full border border-[var(--primary-deep)] px-[12px] py-[7px] text-[12px] font-bold text-[var(--primary-deep)]"
              >
                알림 켜기
              </button>
            )}
          </div>

          {/* 관심사 맞춤 페이지형 카드 */}
          {me && (
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-bold text-[var(--heading)]">내 관심사</p>
                {interestPages.length > 1 && (
                  <div className="flex items-center gap-[6px]">
                    <button
                      type="button"
                      aria-label="이전 관심사 펀딩"
                      onClick={goInterestPrev}
                      disabled={interestPageIndex === 0}
                      className="flex size-[22px] items-center justify-center rounded-full bg-[var(--hairline)] text-[11px] font-bold text-[var(--label)] disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="다음 관심사 펀딩"
                      onClick={goInterestNext}
                      disabled={interestPageIndex === interestPages.length - 1}
                      className="flex size-[22px] items-center justify-center rounded-full bg-[var(--hairline)] text-[11px] font-bold text-[var(--label)] disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {!me.interests?.length ? (
                <Link
                  to="/profile-setup/edit"
                  className="rounded-[8px] border border-dashed border-[var(--border-card)] px-[16px] py-[18px] text-center text-[13px] font-medium text-[var(--label)]"
                >
                  관심사를 등록해주세요
                </Link>
              ) : interestPages.length === 0 ? (
                <p className="rounded-[8px] border border-[var(--border-card)] px-[16px] py-[18px] text-center text-[13px] text-[var(--border)]">
                  관심사에 맞는 글이 없어요
                </p>
              ) : (
                <>
                  <div
                    className="-mx-[17px] overflow-hidden px-[17px]"
                    onTouchStart={handleInterestTouchStart}
                    onTouchEnd={handleInterestTouchEnd}
                  >
                    <div
                      className="flex transition-transform duration-300 ease-out"
                      style={{ transform: `translateX(-${interestPageIndex * 100}%)` }}
                    >
                      {interestPages.map((page, pageIdx) => (
                        <div key={pageIdx} className="flex w-full shrink-0 gap-[10px] pb-[4px]">
                          {page.map((g) => {
                            const current = currentCountOf(g)
                            return (
                              <Link
                                key={g.id}
                                to={`/funding/${g.id}`}
                                className="w-[calc((100%-10px)/2)] shrink-0 rounded-[8px] border border-[var(--border-card)] bg-white p-[12px] shadow-[0px_2px_8px_rgba(0,0,0,0.06)]"
                              >
                                <span className="text-[11px] font-bold text-[var(--primary-deep)]">
                                  {g.category}
                                </span>
                                <p className="mt-[4px] line-clamp-2 text-[14px] font-bold text-[var(--heading)]">
                                  {g.title}
                                </p>
                                <p className="mt-[6px] truncate text-[11px] text-[var(--label)]">
                                  {g.locationName} · {current}/{g.targetCount}명
                                </p>
                              </Link>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  {interestPages.length > 1 && (
                    <div className="flex items-center justify-center gap-[5px]">
                      {interestPages.map((page, i) => (
                        <span
                          key={page[0]?.id ?? i}
                          className={`size-[5px] rounded-full transition-colors ${
                            i === interestPageIndex ? 'bg-[var(--primary-deep)]' : 'bg-[var(--hairline)]'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-[4px]">
            <p className="text-[21px] font-bold text-[var(--heading)]">
              내 주변 펀딩 {listItems.length > 0 ? `(${listItems.length})` : ''}
            </p>
            <p className="text-[12px] text-[var(--label)]">
              {radiusMode === 'all'
                ? '전체 펀딩을 가까운 순으로 보여줍니다.'
                : `기준 위치 ${radiusKm}km 이내 · 가까운 순`}
            </p>
          </div>

          {almostThere && (
            <div className="flex items-center gap-[11px] rounded-[4px] border border-[var(--primary-deep)] bg-[var(--primary-tint)] px-[15px] py-[13px]">
              <img src={nudgeIcon} alt="" className="size-[21px] shrink-0" />
              <p className="flex-1 text-[14px] font-bold text-[var(--heading)]">
                {almostThere.nudgeMessage ??
                  `딱 한 명만 더 모이면 "${almostThere.title}"가 바로 출발해요!`}
              </p>
            </div>
          )}

          {listItems.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
              아직 진행 중인 펀딩이 없어요
            </p>
          )}

          {nearbyFundings.length === 0 && sorted.length > 0 && radiusMode !== 'all' && (
            <p className="text-[13px] text-[var(--label)]">
              반경 안에는 아직 펀딩이 없어서, 가까운 순으로 전체 펀딩을 보여드려요.
            </p>
          )}

          {(nearbyFundings.length > 0 ? nearbyFundings : sorted).map((g) => {
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
                  foot:
                    !isMatched(g) && !isClosed(g) && g.targetCount - current === 1
                      ? `${current}/${g.targetCount}명 · 목표 달성 임박`
                      : `${current}/${g.targetCount}명 참여`,
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
      </main>

      <BottomNav active="home" />
    </div>
  )
}
