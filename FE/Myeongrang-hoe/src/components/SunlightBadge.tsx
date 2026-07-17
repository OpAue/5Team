import { sunlightTierIndex, SUNLIGHT_TIERS } from '../lib/sunlight'

/** 햇살지수 원형 배지 — 새싹/묘목/나무/큰 나무 단계에 맞는 식물 그림과 배경색을 그린다 */
export default function SunlightBadge({ score, size }: { score: number; size: number }) {
  const tier = sunlightTierIndex(score)
  const { label, bg, trunk, canopyDark, canopyLight } = SUNLIGHT_TIERS[tier]

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="shrink-0"
    >
      <circle cx="24" cy="24" r="24" fill={bg} />

      {tier === 0 && (
        <g>
          <path d="M24 34V27" stroke={trunk} strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M24 29c0 0-6-1-8-6c0 0 7-1 8 4"
            fill={canopyLight}
            stroke={trunk}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M24 27c0 0 6-1 8-6c0 0-7-1-8 4"
            fill={canopyDark}
            stroke={trunk}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <ellipse cx="24" cy="34" rx="6" ry="1.6" fill={canopyLight} opacity="0.6" />
        </g>
      )}

      {tier === 1 && (
        <g>
          <path d="M24 35V22" stroke={trunk} strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M24 27c0 0-7-1-9-6c0 0 8-1.5 9 4.5"
            fill={canopyLight}
            stroke={trunk}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M24 25c0 0 7-1 9-6c0 0-8-1.5-9 4.5"
            fill={canopyDark}
            stroke={trunk}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M24 31c0 0-5 0-6.5-4c0 0 5.5-1 6.5 3"
            fill={canopyLight}
            stroke={trunk}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M24 30c0 0 5 0 6.5-4c0 0-5.5-1-6.5 3"
            fill={canopyDark}
            stroke={trunk}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <ellipse cx="24" cy="35" rx="7" ry="1.8" fill={canopyLight} opacity="0.6" />
        </g>
      )}

      {tier === 2 && (
        <g>
          <rect x="22" y="27" width="4" height="9" rx="1.5" fill={trunk} />
          <circle cx="24" cy="21" r="10" fill={canopyDark} />
          <circle cx="19" cy="18" r="5" fill={canopyLight} opacity="0.85" />
          <ellipse cx="24" cy="36" rx="8" ry="1.8" fill={canopyLight} opacity="0.5" />
        </g>
      )}

      {tier === 3 && (
        <g>
          <rect x="21" y="26" width="6" height="11" rx="2" fill={trunk} />
          <circle cx="24" cy="18" r="12" fill={canopyDark} />
          <circle cx="17" cy="15" r="6" fill={canopyLight} opacity="0.9" />
          <circle cx="31" cy="14" r="5" fill={canopyLight} opacity="0.7" />
          <ellipse cx="24" cy="37" rx="9" ry="2" fill={canopyLight} opacity="0.5" />
        </g>
      )}
    </svg>
  )
}
