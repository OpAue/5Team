export type SunlightTierIndex = 0 | 1 | 2 | 3

export function sunlightTier(score: number): string {
  return SUNLIGHT_TIERS[sunlightTierIndex(score)].label
}

export function sunlightTierIndex(score: number): SunlightTierIndex {
  if (score <= 30) return 0
  if (score <= 60) return 1
  if (score <= 90) return 2
  return 3
}

/**
 * 햇살지수 단계 팔레트
 * - 새싹: 채도 낮은 연녹
 * - 묘목: 중간 채도
 * - 나무: 진한 채도
 * - 큰 나무: 가장 진한 색 + 그라데이션(배지에서 처리)
 */
export const SUNLIGHT_TIERS = [
  {
    label: '새싹 단계',
    /** 미리보기용 대표 점수 */
    previewScore: 15,
    /** 원형 배경 (낮은 채도) */
    bg: '#E8EEF0',
    bgEnd: '#DDE6E9',
    plant: '#8FA99A',
    plantLight: '#B5C9BC',
    soil: '#A8B8AE',
    bar: '#A3B8AD',
  },
  {
    label: '묘목 단계',
    previewScore: 45,
    bg: '#D9EBDD',
    bgEnd: '#C5E0CB',
    plant: '#5BA56A',
    plantLight: '#8FCB98',
    soil: '#7A9B7F',
    bar: '#5BA56A',
  },
  {
    label: '나무 단계',
    previewScore: 75,
    bg: '#C5E8CC',
    bgEnd: '#9FD6AA',
    plant: '#2F8F42',
    plantLight: '#55B866',
    soil: '#5A8A48',
    bar: '#2F8F42',
  },
  {
    label: '큰 나무 단계',
    previewScore: 95,
    bg: '#FFE9A8',
    bgEnd: '#3DAA52',
    plant: '#1F7A32',
    plantLight: '#4CB85C',
    soil: '#6B4A28',
    bar: 'linear-gradient(90deg, #F5C542 0%, #2F8F42 55%, #1A6B2C 100%)',
  },
] as const

/** 테스트 계정 미리보기: 4단계 대표 점수 */
export const SUNLIGHT_PREVIEW_SCORES = SUNLIGHT_TIERS.map((t) => t.previewScore)
