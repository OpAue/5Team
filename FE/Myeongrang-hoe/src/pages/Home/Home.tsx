import { useEffect, useMemo, useRef, useState } from 'react'
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
  isExpired,
  participantNamesOf,
  syncFundingsFromServer,
  syncMeFromServer,
  updateLastLocation,
} from '../../store/actions'
import { distanceKm, type LatLng } from '../../lib/geo'
import { formatKakaoError, relayoutMap, useKakao } from '../../lib/kakao'
import { filterBlockedFundingHost } from '../../store/moderation'
import { wishlistAlmostFullItems } from '../../store/notifications'
import { showToast } from '../../store/ui'

const MAP_HEIGHT = 343

export default function Home() {
  const db = useDB()
  const me = getCurrentUser()
  const [kakaoLoading, kakaoError] = useKakao()
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const [myLocation, setMyLocation] = useState<LatLng | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [locating, setLocating] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const toastedWishlist = useRef(new Set<string>())

  function locate() {
    setLocating(true)
    setRefreshTick((n) => n + 1)
  }

  useEffect(() => {
    void syncMeFromServer()
  }, [])

  // 찜한 펀딩 성사 임박 시 1회 토스트
  useEffect(() => {
    if (!me) return
    const items = wishlistAlmostFullItems(me.email)
    for (const n of items) {
      if (toastedWishlist.current.has(n.id)) continue
      toastedWishlist.current.add(n.id)
      showToast(n.title + ' · ' + n.body, 'info')
      break // 한 번에 하나만
    }
  }, [me?.email, db.fundings, db.wishlist])

  useEffect(() => {
    void syncFundingsFromServer(
      myLocation
        ? { lat: myLocation.lat, lng: myLocation.lng, radiusKm: 50 }
        : { lat: CAMPUS_CENTER.lat, lng: CAMPUS_CENTER.lng, radiusKm: 50 },
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
        // 데모용 더미 펀딩이 명지대 인문캠퍼스 주변에 고정되어 있어,
        // 실제 위치가 캠퍼스에서 너무 멀면 기준 좌표로 대체한다.
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

  const sorted = useMemo(() => {
    return filterBlockedFundingHost(db.fundings)
      .map((f) => ({ ...f, distanceKm: distanceKm(center, { lat: f.lat, lng: f.lng }) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [center, db.fundings])

  const nearbyRadiusKm = 5
  const nearbyFundings = useMemo(() => {
    return sorted.filter((f) => f.distanceKm <= nearbyRadiusKm)
  }, [sorted])

  // 지도에는 전체 펀딩이 보이도록 bounds 맞춤.
  // mapInstance 는 onCreate 이후에만 채워지므로 state 로 보관한다.
  useEffect(() => {
    if (!mapInstance || kakaoLoading || kakaoError) return
    relayoutMap(mapInstance)
    const bounds = new kakao.maps.LatLngBounds()
    bounds.extend(new kakao.maps.LatLng(center.lat, center.lng))
    sorted.forEach((f) => bounds.extend(new kakao.maps.LatLng(f.lat, f.lng)))
    mapInstance.setBounds(bounds, 80, 40, 40, 40)
  }, [sorted, center, kakaoLoading, kakaoError, mapInstance])

  // 위치 갱신 시 중심 이동
  useEffect(() => {
    if (!mapInstance || !myLocation) return
    mapInstance.setCenter(new kakao.maps.LatLng(myLocation.lat, myLocation.lng))
    relayoutMap(mapInstance)
  }, [mapInstance, myLocation?.lat, myLocation?.lng])

  const almostThere = sorted.find((f) => f.targetCount - currentCountOf(f) === 1)
  const selected = sorted.find((f) => f.id === selectedId)
  // 위치 수신 때문에 지도를 숨기지 않는다. SDK 로딩만 오버레이.
  const showSdkLoading = kakaoLoading
  const showMapError = !kakaoLoading && !!kakaoError
  const listItems = nearbyFundings.length > 0 ? nearbyFundings : sorted
  const zoomPosition =
    typeof kakao !== 'undefined' && kakao?.maps?.ControlPosition
      ? kakao.maps.ControlPosition.RIGHT
      : undefined

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

          {/* SDK 준비되면 즉시 렌더 (위치 대기와 분리 — 빈 화면/타일 깨짐 방지) */}
          {!kakaoError && (
            <Map
              id="home-kakao-map"
              center={center}
              isPanto
              level={6}
              style={{ width: '100%', height: '100%' }}
              onCreate={(map) => {
                setMapInstance(map)
                // 컨테이너 크기가 잡힌 뒤 타일 다시 그리기
                requestAnimationFrame(() => {
                  relayoutMap(map)
                  window.setTimeout(() => relayoutMap(map), 100)
                })
              }}
            >
              {zoomPosition != null && <ZoomControl position={zoomPosition} />}

              <CustomOverlayMap position={center} yAnchor={0.5} xAnchor={0.5}>
                <div className="size-[16px] rounded-full border-2 border-white bg-[var(--blue-deep)] shadow-[0px_0px_0px_6px_rgba(17,106,212,0.2)]" />
              </CustomOverlayMap>

              {sorted.map((f) => (
                <MapMarker
                  key={f.id}
                  position={{ lat: f.lat, lng: f.lng }}
                  image={{ src: pin, size: { width: 32, height: 32 } }}
                  onClick={() => setSelectedId(f.id)}
                />
              ))}
            </Map>
          )}

          {showMapError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--primary-tint)] px-[24px] text-center">
              <p className="text-[14px] font-semibold text-[var(--heading)]">카카오맵을 불러오지 못했습니다</p>
              <p className="mt-[8px] text-[12px] leading-[18px] text-[var(--label)]">
                {formatKakaoError(kakaoError)}
              </p>
              <p className="mt-[10px] text-[11px] leading-[16px] text-[var(--border)]">
                Kakao Developers → 내 애플리케이션 → 앱 키(JavaScript 키) · 플랫폼에
                localhost, 127.0.0.1 등록 후 확인하세요.
              </p>
            </div>
          )}

          <button
            type="button"
            aria-label="내 위치로 이동"
            onClick={locate}
            className="absolute right-[18px] bottom-[16px] z-10"
          >
            <img src={locateBtn} alt="" className="size-[47px]" />
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
                {selected.distanceKm < 1
                  ? `${Math.round(selected.distanceKm * 1000)}m`
                  : `${selected.distanceKm.toFixed(1)}km`}{' '}
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
          <div className="flex flex-col gap-[4px]">
            <p className="text-[21px] font-bold text-[var(--heading)]">
              내 주변 펀딩 {listItems.length > 0 ? `(${listItems.length})` : ''}
            </p>
            <p className="text-[12px] text-[var(--label)]">
              내 위치 기준 {nearbyRadiusKm}km 이내 펀딩을 가까운 순으로 정렬해 보여줍니다.
            </p>
          </div>

          {almostThere && (
            <div className="flex items-center gap-[11px] rounded-[4px] border border-[var(--primary-deep)] bg-[var(--primary-tint)] px-[15px] py-[13px]">
              <img src={nudgeIcon} alt="" className="size-[21px] shrink-0" />
              <p className="flex-1 text-[14px] font-bold text-[var(--heading)]">
                딱 한 명만 더 모이면 "{almostThere.title}"가 오늘 저녁 바로 출발해요!
              </p>
            </div>
          )}

          {listItems.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
              아직 진행 중인 펀딩이 없어요
            </p>
          )}

          {nearbyFundings.length === 0 && sorted.length > 0 && (
            <p className="text-[13px] text-[var(--label)]">
              {nearbyRadiusKm}km 안에는 아직 펀딩이 없어서, 가까운 순으로 전체 펀딩을 보여드려요.
            </p>
          )}

          {listItems.map((g) => {
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
            )
          })}
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  )
}
