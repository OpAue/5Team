import { useEffect, useMemo, useState } from 'react'
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
  updateLastLocation,
} from '../../store/actions'
import { distanceKm, type LatLng } from '../../lib/geo'
import { useKakao } from '../../lib/kakao'

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

  function locate() {
    setLocating(true)
    setRefreshTick((n) => n + 1)
  }

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
    return db.fundings
      .map((f) => ({ ...f, distanceKm: distanceKm(center, { lat: f.lat, lng: f.lng }) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [center, db.fundings])

  // 지도에는 항상 전체 펀딩이 다 보이도록 영역을 맞춘다 (하나라도 화면 밖으로 누락되지 않게)
  // mapInstance는 <Map>의 onCreate가 비동기로 호출된 뒤에야 채워지므로, state로 두어야
  // 맵이 준비된 시점에 이 effect가 다시 실행된다 (ref로는 재실행이 안 돼 마커 누락 버그가 났었음).
  useEffect(() => {
    if (!mapInstance || kakaoLoading || locating) return
    const bounds = new kakao.maps.LatLngBounds()
    bounds.extend(new kakao.maps.LatLng(center.lat, center.lng))
    sorted.forEach((f) => bounds.extend(new kakao.maps.LatLng(f.lat, f.lng)))
    mapInstance.setBounds(bounds, 80, 40, 40, 40)
  }, [sorted, center, kakaoLoading, locating, mapInstance])

  const almostThere = sorted.find((f) => f.targetCount - currentCountOf(f) === 1)
  const selected = sorted.find((f) => f.id === selectedId)
  const showLoading = locating || kakaoLoading

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="명랑회" />

      <main className="flex-1 overflow-y-auto">
        <div
          className="relative overflow-hidden bg-[var(--primary-tint)]"
          style={{ height: MAP_HEIGHT }}
        >
          {showLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--primary-tint)]">
              <p className="text-[13px] font-medium text-[var(--label)]">
                {kakaoError ? '지도를 불러오지 못했어요' : '내 위치와 지도를 불러오는 중...'}
              </p>
            </div>
          )}

          {!showLoading && !kakaoError && (
            <Map
              center={center}
              level={6}
              style={{ width: '100%', height: '100%' }}
              onCreate={setMapInstance}
            >
              <ZoomControl position={kakao.maps.ControlPosition.RIGHT} />

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

          <button
            type="button"
            aria-label="내 위치로 이동"
            onClick={locate}
            className="absolute right-[18px] bottom-[16px] z-10"
          >
            <img src={locateBtn} alt="" className="size-[47px]" />
          </button>

          {usingFallback && !showLoading && (
            <span className="absolute left-[17px] top-[13px] z-10 rounded-full bg-white/90 px-[11px] py-[5px] text-[11px] font-bold text-[var(--label)]">
              데모 위치: 명지대 인문캠퍼스
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
          <p className="text-[21px] font-bold text-[var(--heading)]">
            내 주변 펀딩 {sorted.length > 0 && `(${sorted.length})`}
          </p>

          {almostThere && (
            <div className="flex items-center gap-[11px] rounded-[4px] border border-[var(--primary-deep)] bg-[var(--primary-tint)] px-[15px] py-[13px]">
              <img src={nudgeIcon} alt="" className="size-[21px] shrink-0" />
              <p className="flex-1 text-[14px] font-bold text-[var(--heading)]">
                딱 한 명만 더 모이면 "{almostThere.title}"가 오늘 저녁 바로 출발해요!
              </p>
            </div>
          )}

          {sorted.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
              아직 진행 중인 펀딩이 없어요
            </p>
          )}

          {sorted.map((g) => {
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
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  )
}
