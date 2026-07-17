import {
  sunlightTierIndex,
  SUNLIGHT_TIERS,
  type SunlightTierIndex,
} from '../lib/sunlight'

type Props = {
  score: number
  size: number
  /** 테스트 미리보기 등에서 단계 강제 */
  tierOverride?: SunlightTierIndex
}

/**
 * 햇살지수 원형 배지
 * 참고 이미지(새싹 → 묘목 → 나무) 실루엣을 기반으로 단계별 식물 진화 + 채도 상승.
 * 큰 나무 단계는 진한 그라데이션 원 배경을 사용한다.
 */
export default function SunlightBadge({ score, size, tierOverride }: Props) {
  const tier = tierOverride ?? sunlightTierIndex(score)
  const t = SUNLIGHT_TIERS[tier]
  const gradId = `sun-bg-${tier}-${size}`

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={t.label}
      className="shrink-0 drop-shadow-sm"
    >
      <defs>
        {tier === 3 ? (
          <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFF6D0" />
            <stop offset="45%" stopColor="#F0C84A" />
            <stop offset="100%" stopColor="#1F8A38" />
          </radialGradient>
        ) : (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.bg} />
            <stop offset="100%" stopColor={t.bgEnd} />
          </linearGradient>
        )}
      </defs>

      {/* 원형 배경 — 큰 나무는 진한 라디얼 그라데이션 */}
      <circle cx="32" cy="32" r="30" fill={`url(#${gradId})`} />
      {tier === 3 && (
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.2"
        />
      )}

      {/* ── 0: 새싹 (두 잎) ── */}
      {tier === 0 && (
        <g fill={t.plant}>
          <path d="M32 46V34" stroke={t.plant} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="32" cy="47.5" rx="11" ry="3.2" fill={t.soil} opacity="0.85" />
          {/* 왼 잎 */}
          <path d="M31.5 39c-1.2-5.5-6.5-8.2-10.5-8.5c1.2 5.2 5.8 8.8 10.5 9.2z" fill={t.plantLight} />
          <path d="M31.5 39c-1.2-5.5-6.5-8.2-10.5-8.5c1.2 5.2 5.8 8.8 10.5 9.2z" fill={t.plant} opacity="0.35" />
          {/* 오른 잎 */}
          <path d="M32.5 38c1.5-6.2 7.2-9.5 11.8-9.2c-1.5 5.8-6.5 9.5-11.8 10z" fill={t.plant} />
          {/* 잎맥 힌트 */}
          <path
            d="M31.2 38.2c-1.8-3.2-4.8-5-7.5-5.5"
            stroke={t.plant}
            strokeWidth="0.7"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
          <path
            d="M32.8 37.2c2-3.8 5.5-5.8 8.5-6"
            stroke={t.plantLight}
            strokeWidth="0.7"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </g>
      )}

      {/* ── 1: 묘목 (여러 잎) ── */}
      {tier === 1 && (
        <g>
          <ellipse cx="32" cy="48" rx="12" ry="3.4" fill={t.soil} opacity="0.9" />
          <path
            d="M32 47C32 47 30.5 36 32 28"
            stroke={t.plant}
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          {/* 하단 좌우 잎 */}
          <path d="M31 40c-2-5-7.5-6.5-11-6c1.5 5 6.5 7.5 11 7z" fill={t.plantLight} />
          <path d="M33 39.5c2.2-5.2 8-7 11.5-6.2c-1.8 5.2-6.8 7.5-11.5 7z" fill={t.plant} />
          {/* 중간 좌 잎 */}
          <path d="M31 34c-1.8-4.5-6.5-6-9.5-5.5c1.2 4.2 5.5 6.5 9.5 6.2z" fill={t.plant} />
          {/* 상단 중심 잎 3장 */}
          <path d="M32 30c-0.5-6 2.5-10 5.5-11c-0.2 5-2.5 9-5.5 11z" fill={t.plantLight} />
          <path d="M32 29.5c0.8-6.5-2-11-5.2-12c0.5 5.2 2.8 9.5 5.2 12z" fill={t.plant} />
          <path d="M32 28.5c-0.2-5.5 1.2-9.5 3.5-11.5c-0.8 4-1.8 8-3.5 11.5z" fill={t.plantLight} opacity="0.9" />
        </g>
      )}

      {/* ── 2: 나무 (가지 + 잎 무리) ── */}
      {tier === 2 && (
        <g>
          <ellipse cx="32" cy="49" rx="13" ry="3.6" fill={t.soil} opacity="0.9" />
          {/* 줄기가 갈라지는 Y자 */}
          <path
            d="M32 49C32 49 31 40 32 34C28 28 24 24 22 20"
            stroke={t.plant}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 36C36 30 40 25 42 20"
            stroke={t.plant}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 33C32 28 33 24 34 20"
            stroke={t.plant}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* 잎 클러스터 (타원형 잎들) */}
          {[
            [22, 18, 3.2, -35],
            [26, 15, 3.4, -10],
            [31, 13, 3.6, 5],
            [36, 15, 3.3, 25],
            [40, 18, 3.1, 40],
            [24, 22, 2.8, -20],
            [29, 20, 3, 0],
            [34, 19, 2.9, 15],
            [38, 22, 2.7, 35],
            [27, 25, 2.5, -5],
            [33, 24, 2.6, 12],
            [20, 22, 2.4, -45],
            [42, 22, 2.4, 48],
          ].map(([cx, cy, r, rot], i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={r as number}
              ry={(r as number) * 1.55}
              fill={i % 2 === 0 ? t.plant : t.plantLight}
              transform={`rotate(${rot} ${cx} ${cy})`}
              opacity={i % 3 === 0 ? 0.92 : 1}
            />
          ))}
        </g>
      )}

      {/* ── 3: 큰 나무 (더 풍성 + 그라데이션 배경) ── */}
      {tier === 3 && (
        <g>
          <ellipse cx="32" cy="50" rx="14" ry="3.8" fill={t.soil} opacity="0.95" />
          <path
            d="M32 50C32 50 30.5 40 32 33C27 26 22 21 19 16"
            stroke={t.plant}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 35C37 28 42 22 45 16"
            stroke={t.plant}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 32C33 26 34 21 35 15"
            stroke={t.plant}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 38C28 32 25 28 23 24"
            stroke={t.plant}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {[
            [19, 14, 3.4, -40],
            [24, 11, 3.6, -15],
            [30, 9, 3.8, 0],
            [36, 11, 3.5, 20],
            [42, 14, 3.3, 40],
            [46, 18, 3, 55],
            [16, 18, 3, -50],
            [21, 18, 3.1, -25],
            [27, 16, 3.2, -5],
            [33, 15, 3.3, 10],
            [39, 17, 3.1, 30],
            [44, 21, 2.8, 45],
            [18, 22, 2.7, -35],
            [24, 21, 2.9, -10],
            [30, 20, 3, 5],
            [36, 21, 2.9, 22],
            [41, 24, 2.6, 40],
            [26, 25, 2.5, 0],
            [32, 24, 2.7, 12],
            [22, 25, 2.4, -20],
          ].map(([cx, cy, r, rot], i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={r as number}
              ry={(r as number) * 1.5}
              fill={i % 2 === 0 ? t.plant : t.plantLight}
              transform={`rotate(${rot} ${cx} ${cy})`}
              opacity={0.95}
            />
          ))}
          {/* 하이라이트 잎 */}
          <ellipse cx="28" cy="12" rx="2.2" ry="3.2" fill="#C8F0C8" opacity="0.55" transform="rotate(-8 28 12)" />
          <ellipse cx="38" cy="14" rx="2" ry="3" fill="#C8F0C8" opacity="0.4" transform="rotate(18 38 14)" />
        </g>
      )}
    </svg>
  )
}
