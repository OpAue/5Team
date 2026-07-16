import { API_BASE_URL } from './api'

export type CoverSource = {
  coverImage?: string | null
  lat: number
  lng: number
}

/** 브라우저에서 직접 쓸 수 있는 OSM 타일 (키 불필요, BE 실패 시 폴백) */
export function getOsmTileUrl(lat: number, lng: number, zoom = 15): string {
  const n = 2 ** zoom
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  )
  const xx = ((x % n) + n) % n
  const yy = Math.min(Math.max(y, 0), n - 1)
  return `https://tile.openstreetmap.org/${zoom}/${xx}/${yy}.png`
}

/**
 * 대표(메인) 이미지 URL 우선순위
 * 1) 사용자가 올린 coverImage
 * 2) 서버 프록시 정적 지도 (카카오 REST → OSM 타일)
 *    (img onError 시 OSM 직접 타일로 재시도는 FundingCover 에서 처리)
 */
export function getFundingCoverSrc(
  source: CoverSource,
  size: 'hero' | 'card' | 'thumb' = 'card',
): string {
  const uploaded = source.coverImage?.trim()
  if (uploaded) return uploaded

  const dims =
    size === 'hero'
      ? { width: 720, height: 360 }
      : size === 'thumb'
        ? { width: 160, height: 160 }
        : { width: 240, height: 240 }

  const qs = new URLSearchParams({
    lat: String(source.lat),
    lng: String(source.lng),
    width: String(dims.width),
    height: String(dims.height),
    zoom: size === 'hero' ? '15' : '16',
  })
  return `${API_BASE_URL}/api/geo/static-map?${qs.toString()}`
}

export function hasUserCoverImage(coverImage?: string | null): boolean {
  return !!coverImage?.trim()
}
