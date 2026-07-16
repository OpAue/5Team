import { useState, type ReactNode } from 'react'
import { getFundingCoverSrc, getOsmTileUrl, type CoverSource } from '../lib/coverImage'

type Props = {
  source: CoverSource
  size?: 'hero' | 'card' | 'thumb'
  className?: string
  imgClassName?: string
  alt?: string
  children?: ReactNode
}

/**
 * 사용자 사진이 있으면 그 사진을, 없으면 위치 기반 지도 이미지를 보여줍니다.
 * 서버 지도 실패 시 OSM 타일 → 그라데이션 순으로 폴백합니다.
 */
export default function FundingCover({
  source,
  size = 'card',
  className = '',
  imgClassName = 'absolute inset-0 h-full w-full object-cover',
  alt = '',
  children,
}: Props) {
  const uploaded = !!source.coverImage?.trim()
  const [stage, setStage] = useState<'primary' | 'osm' | 'fallback'>(
    uploaded ? 'primary' : 'primary',
  )

  const src =
    stage === 'osm'
      ? getOsmTileUrl(source.lat, source.lng, size === 'hero' ? 15 : 16)
      : getFundingCoverSrc(source, size)

  return (
    <div
      className={`relative overflow-hidden bg-[var(--hairline)] ${className}`}
      style={
        stage === 'fallback'
          ? { backgroundImage: 'linear-gradient(149.6deg, #72abfa 0%, #2777e7 71.4%)' }
          : undefined
      }
    >
      {stage !== 'fallback' && (
        <img
          key={src}
          src={src}
          alt={alt}
          className={imgClassName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (uploaded) {
              // 업로드 이미지 깨짐 → 위치 지도로
              setStage('osm')
              return
            }
            if (stage === 'primary') setStage('osm')
            else setStage('fallback')
          }}
        />
      )}
      {children}
    </div>
  )
}
